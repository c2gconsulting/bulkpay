
import _ from 'underscore';
import moment from 'moment';


let PayrunHelpers = {

  getActiveEmployees: (employeeIds, paygradeIds, period, businessId, businessUnitConfig) => {
    check(paygrade, Array);

    const DateLimit = new Date(`${period.month}-01-${period.year} GMT`);

    let queryWithResumptionCheck = {
      'employeeProfile.employment.status': 'Active',
      $and: [
        {'employeeProfile.employment.hireDate': {$lt: DateLimit}},
        {$or: [
          {'employeeProfile.employment.terminationDate': {$gt: DateLimit}},
          {'employeeProfile.employment.terminationDate': null},
          {'employeeProfile.employment.terminationDate' : { $exists : false } }
        ]}
      ],
      'employeeProfile.employment.paygrade': {$in: paygradeIds},
      'businessIds': businessId,
      'employee': true
    }
    if(employeeIds && employeeIds.length > 0) {
      queryWithResumptionCheck._id = {$in: employeeIds}
    }
    if(paygradeIds && paygradeIds.length > 0) {
      queryWithResumptionCheck['employeeProfile.employment.paygrade'] = {$in: paygradeIds}
    }


    let queryWithoutResumptionCheck = {
      'employeeProfile.employment.status': 'Active',
      $or: [
        {'employeeProfile.employment.terminationDate': {$gt: DateLimit}},
        {'employeeProfile.employment.terminationDate': null},
        {'employeeProfile.employment.terminationDate' : { $exists : false } }
      ],
      'employeeProfile.employment.paygrade': {$in: paygradeIds},
      'businessIds': businessId,
      'employee': true
    }
    if(employeeIds && employeeIds.length > 0) {
      queryWithoutResumptionCheck['_id'] = {$in: employeeIds}
    }
    if(paygradeIds && paygradeIds.length > 0) {
      queryWithoutResumptionCheck['employeeProfile.employment.paygrade'] = {$in: paygradeIds}
    }

    if(businessUnitConfig) {
      if(businessUnitConfig.checkEmployeeResumptionForPayroll) {
        return Meteor.users.find(queryWithResumptionCheck).fetch();
      } else {
        return Meteor.users.find(queryWithoutResumptionCheck).fetch();
      }
    } else {
      return Meteor.users.find(queryWithoutResumptionCheck).fetch();
    }
  },
  garnishPaytypesWithAdditionalPayments: (paytypes, businessId, employeeId, periodFormat) => {
    const addPay = AdditionalPayments.find({
      businessId: businessId, 
      employee: employeeId, 
      period: periodFormat
    }).fetch();

    if(addPay && addPay.length > 0) {
      let formattedPay = getPaytypeIdandValue(addPay, businessId) || [];

      if(formattedPay && formattedPay.length > 0) {
        formattedPay.forEach(x => {
          let index = _.findLastIndex(paytypes, {_id: x._id});

          if (index > -1) { //found
            paytypes[index].value = x.value;
            paytypes[index].additionalPay = true; //add additional pay flag to skip monthly division
          }
        });
      }
    }

    return paytypes
  },
  savePayrunResultIfLive: (runtype, payObj) => {
    if (runtype === 'LiveRun' && payObj.error.length === 0){
      try {
        payObj.payrun.forEach(x => {
            Payruns.insert(x);
        })
      } catch (e){
        console.log(e);
      }
    } else {
      console.log("Payrun errors: " + JSON.stringify(payObj.error));
    }
  }
}


/**
 *  Payruns Methods
 */
Meteor.methods({
    "payrun2/process": function (obj, businessId) {
      if (!this.userId && Core.hasPayrollAccess(this.userId)) {
        throw new Meteor.Error(401, "Unauthorized");
      }
      let userId = Meteor.userId();
      this.unblock();
      console.log(obj);

      let employees = obj.employees;
      const paygrades = obj.paygrades;
      const period = obj.period;
      const runtype = obj.type;
      const annuals = obj.annuals;

      check(employees, Array);
      check(period, Object);
      check(runtype, String);
      check(paygrades, Array);

      let payObj = {};

      let businessUnitConfig = BusinessUnitCustomConfigs.findOne({businessId: businessId})
      let validEmployees = null

      if (employees.length === 0 && paygrades.length > 0) {
        validEmployees = PayrunHelpers.getActiveEmployees([], paygrades, period, businessId, businessUnitConfig);
      } else if (employees.length > 0) {
        validEmployees = PayrunHelpers.getActiveEmployees(employees, [], period, businessId, businessUnitConfig);
      }

      if (validEmployees && validEmployees.length > 0) {
        payObj = processPayroll(Meteor.userId(), validEmployees, annuals, businessId, period, businessUnitConfig);
      }

      PayrunHelpers.savePayrunResultIfLive(runtype, payObj)
      return {payObj, runtype, period};
    }
});


function processPayroll(currentUserId, employees, includedAnnualPayments, businessId, period, businessUnitConfig) {
  let paygradesCache = [];  // Optimization! To prevent unnecessary db calls
  let payresult = [];       // holds result that will be sent to client
  let payrun = [];          // holds payrun for storing if not simulation
  
  let processingError = [];

  const periodFormat = `${period.month}${period.year}`;
  let currencyRatesForPeriod = Currencies.find({businessId: businessId, period: periodFormat}).fetch()

  let tenantId = Core.getTenantId(currentUserId)
  let tenant = Tenants.findOne(tenantId)

  let numOfEmployees = employees.length

  for(let employeeIndex = 0; employeeIndex < numOfEmployees; i++) {
    let employeeData = employees[employeeIndex]

    let {payrunLogsAndPayslipInfo, payrunResultForStorage, paygradesCache, hardException} =  
      processPayrollForEmployee(employeeData, businessId, tenant, includedAnnualPayments, 
        period, currencyRatesForPeriod, businessUnitConfig, paygradesCache)
    
    if(hardException) {
      processingError.push(hardException);
    } else {



    }
  }
};

function processPayrollForEmployee(employeeData, businessId, tenant, includedAnnuals, 
    period, currencyRatesForPeriod, businessUnitConfig, paygradesCache) {
  let payrunLogsAndPayslipInfo = {}
  let payrunResultForStorage = {}
  let hardException = null
  
  const periodFormat = `${period.month}${period.year}`;

  let doesPayExistForPeriod = Payruns.findOne({
    employeeId: employeeData._id, 
    period: periodFormat, 
    businessId: businessId
  });

  if(doesPayExistForPeriod) {
    hardException = {
      employee: `${employeeData.employeeProfile.employeeId} - ${employeeData.profile.fullName}`,
      reason: `Payment exists for period: ${periodFormat}`,
      details: `Cannot Process Payroll for Employee ... as Payment for this period exists. To run payroll, Contact Admin to cross-check and delete previous payment data if neccessary`
    };
  } else {
    const employeeResult = {
      businessId: businessId, 
      employeeId: employeeData._id, 
      period: periodFormat, 
      payment : []
    };

    const employeePaygradeId = employeeData.employeeProfile.employment.paygrade;
    let employeeSpecificPayments = employeeData.employeeProfile.employment.paytypes;
    //--
    let grade, pgp;  //grade(paygrade) && pgp(paygroup);

    const gradeIndex = _.findLastIndex(paygradesCache, {_id: employeePaygradeId});
    let empSpecificType;  //contains employee payments derived from paygrade
    if (gradeIndex !== -1) {
      grade = paygradesCache[gradeIndex];
      empSpecificType = determineRule(employeeSpecificPayments, grade);
    } else {
      grade = getEmployeeGrade(pg);
      if (grade) {
        paygradesCache.push(grade);
        empSpecificType = determineRule(employeeSpecificPayments, grade);
      }
    }

    if (grade && grade.hasOwnProperty('payGroups') && grade.payGroups.length > 0) {
      pgp = grade.payGroups[0];
    }

    let paytypes = empSpecificType.map(x => {
      let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
      delete x.paytype;
      _.extend(x, ptype);

      return x;
    });
    //--
    paytypes = PayrunHelpers.garnishPaytypesWithAdditionalPayments(paytypes, businessId, employeeData._id, periodFormat)

    let rules = new ruleJS();
    rules.init();

    const {tax, pension} = getPaygroup(pgp);
    //--
    const firsDayOfPeriod = `${period.month}-01-${period.year} GMT`;
    const firsDayOfPeriodAsDate = new Date(firsDayOfPeriod);

    let numDaysEmployeeCanWorkInMonth = getDaysEmployeeCanWorkInMonth(x, firsDayOfPeriodAsDate)
    let totalNumWeekDaysInMonth = getWeekDays(firsDayOfPeriodAsDate, moment(firsDayOfPeriodAsDate).endOf('month').toDate()).length

    //--Time recording things
    const projectsPayDetails = 
        getFractionForCalcProjectsPayValue(businessId, period.month, period.year, x._id)
    
    const costCentersPayDetails = 
        getFractionForCalcCostCentersPayValue(businessId, period.month, period.year, x._id)

    let totalHoursWorkedInPeriod = projectsPayDetails.duration + costCentersPayDetails.duration
    //--
    let processingResult = processEmployeePayments(employeeData, paytypes, rules, tax, pension)
  }

  return {payrunLogsAndPayslipInfo, payrunResultForStorage, hardException}
}

function processEmployeePayments(employeeData, paytypes, rules, tax, pension) {
  let defaultTaxBucket = 0, pensionBucket = 0, log = [];  //check if pagrade uses default tax bucket
  let assignedTaxBucket, grossIncomeBucket = 0, totalsBucket = 0, reliefBucket = 0;
  let empDerivedPayElements = [];
  let benefit = [], deduction = [], others = [];

  //--
  let paymentsAccountingForCurrency = {benefit: {}, deduction: {}, others: {}}
  // Each key in each of the above keys will be a currency code
  // Each object for each currency code will be an array of payments
  //--


  try {

  } catch(e) {

  }
}



function getDaysEmployeeCanWorkInMonth(employee, firstDayOfMonthDateObj) {
    let employeeResumption = employee.employeeProfile.employment.hireDate
    // console.log(`\n employee id: `, employee._id)

    if(!employeeResumption || employeeResumption === '') {
        employeeResumption = firstDayOfMonthDateObj
    }
    let employeeResumptionMoment = moment(employeeResumption)

    let monthDateMoment = moment(firstDayOfMonthDateObj)
    let endOfMonthDate = moment(firstDayOfMonthDateObj).endOf('month').toDate()

    let numDaysToWorkInMonth = 0

    if(employeeResumptionMoment.year() === monthDateMoment.year()) {
        if (employeeResumptionMoment.month() === monthDateMoment.month()) {
            numDaysToWorkInMonth = getWeekDays(employeeResumption, endOfMonthDate).length
        } else if(employeeResumptionMoment.month() > monthDateMoment.month()) {
            numDaysToWorkInMonth = 0
        } else {
            numDaysToWorkInMonth = getWeekDays(firstDayOfMonthDateObj, endOfMonthDate).length
        }
    } else if(employeeResumptionMoment.year() > monthDateMoment.year()) {
        numDaysToWorkInMonth = 0
    } else if(employeeResumptionMoment.year() < monthDateMoment.year()) {
        numDaysToWorkInMonth = getWeekDays(firstDayOfMonthDateObj, endOfMonthDate).length
    }

    return numDaysToWorkInMonth
}

function getWeekDays(startDate, endDate) {
    let startDateMoment = moment(startDate)
    let endDateMoment = moment(endDate)

    let numberOfDays = endDateMoment.diff(startDateMoment, 'days') + 1

    let startDateMomentClone = moment(startDateMoment); // use a clone
    let weekDates = []

    while (numberOfDays > 0) {
        if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
            weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
        }
        startDateMomentClone.add(1, 'days');
        numberOfDays -= 1;
    }
    return weekDates
}

function getPayAmountInForeignCurrency(payTypeDetails, amountInLocalCurrency, currencyRatesForPeriod) {
    let amountInForeignCurrency = null

    let currencyRateForPayType = _.find(currencyRatesForPeriod, (aCurrency) => {
        return aCurrency.code === payTypeDetails.currency
    })
    if(currencyRateForPayType) {
        if(!isNaN(currencyRateForPayType.rateToBaseCurrency)) {
            amountInForeignCurrency = amountInLocalCurrency * currencyRateForPayType.rateToBaseCurrency
        }
    }
    return amountInForeignCurrency
}

/*
    This function can also be used for the total deduction
 */
function getNetPayInForeignCurrency(amountInLocalCurrency, payGrade, currencyRatesForPeriod) {
    if(payGrade) {
        let netPayAlternativeCurrency = payGrade.netPayAlternativeCurrency
    
        let currencyInPeriod = _.find(currencyRatesForPeriod, (aCurrency) => {
            return aCurrency.code === netPayAlternativeCurrency
        })

        if(currencyInPeriod) {
            let rateToBaseCurrency = currencyInPeriod.rateToBaseCurrency
            return (rateToBaseCurrency > 0) ? (amountInLocalCurrency / rateToBaseCurrency).toFixed(2) : amountInLocalCurrency
        } else {
            return amountInLocalCurrency
        }
    } else {
        return amountInLocalCurrency
    }
}

function getFractionForCalcProjectsPayValue(businessId, periodMonth, periodYear, employeeUserId) {
    const firsDayOfPeriod = `${periodMonth}-01-${periodYear} GMT`;

    const startDate = moment(new Date(firsDayOfPeriod)).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();

    let queryObj = {
        businessId: businessId, 
        project: {$exists : true},
        day: {$gte: startDate, $lt: endDate},
        employeeId: employeeUserId,
        status: 'Approved'
    }

    let allProjectTimesInMonth = TimeWritings.aggregate([
        { $match: queryObj},
        { $group: {
          _id: {
            "empUserId": "$employeeId",
            "project": "$project"
          }, 
          duration: { $sum: "$duration" }
        } }
    ]);
    //--
    let totalWorkHoursInYear = 2080
    let numberOfMonthsInYear = 12

    if(allProjectTimesInMonth) {
        if(allProjectTimesInMonth.length > 0) {
            // console.log(`allProjectTimesInMonth: `, allProjectTimesInMonth)
            let projectDurations = []

            let totalProjectsDuration = 0
            allProjectTimesInMonth.forEach(aProjectTime => {
                totalProjectsDuration += aProjectTime.duration
                projectDurations.push({
                    project: aProjectTime._id.project, 
                    duration: aProjectTime.duration
                })
            })
            const fraction = totalProjectsDuration * numberOfMonthsInYear / totalWorkHoursInYear
            return {duration: totalProjectsDuration, fraction, projectDurations}
        } else {
            return {duration: 0, fraction: 0, projectDurations: []}
        }
    } else {
        return {duration: 0, fraction: 0, projectDurations: []}
    }
}

function getFractionForCalcCostCentersPayValue(businessId, periodMonth, periodYear, employeeUserId) {
    const firsDayOfPeriod = `${periodMonth}-01-${periodYear} GMT`;

    const startDate = moment(new Date(firsDayOfPeriod)).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();

    let queryObj = {
        businessId: businessId, 
        costCenter: {$exists : true},
        day: {$gte: startDate, $lt: endDate},
        employeeId: employeeUserId,
        status: 'Approved'
    }

    let allCostCenterTimesInMonth = TimeWritings.aggregate([
        { $match: queryObj},
        { $group: {_id: "$employeeId", duration: { $sum: "$duration" }}}
    ]);
    //--
    let totalWorkHoursInYear = 2080
    let numberOfMonthsInYear = 12

    if(allCostCenterTimesInMonth) {
        if(allCostCenterTimesInMonth.length === 1) {
            const duration = allCostCenterTimesInMonth[0].duration
            const fraction = duration * numberOfMonthsInYear / totalWorkHoursInYear
            return {duration, fraction}
        } else {
            return {duration: 0, fraction: 0}
        }
    } else {
        return {duration: 0, fraction: 0}
    }
}


function derivePayElement(person) {
    let gradePaytypes = PayGrades.find({_id: person.employeeProfile.employment.paygrade});

    return "done";
    //get employee pay grade
}

function getEmployeeGrade(gradeId) {
    return PayGrades.findOne({_id: gradeId, status: 'Active'});
}

function determineRule(paytype, grade) {
    //grade contains processing rules while paytypes contains personal employee rules
    let pt = [...grade.payTypes];
    const empGrade = pt.map(x => {
        const newX = {...x}
        let index = _.findLastIndex(paytype, {'paytype': x.paytype});
        if (index !== -1) {
            //derive rule based on employee assigned if no value assinged, use grade derivative
            if (paytype[index].value) {
                newX.value = paytype[index].value;
            }
        }
        //return same rule
        return newX;
    });

    return empGrade;
}
function getPaygroup(paygrade) {
    const pg = PayGroups.findOne({_id: paygrade, status: 'Active'});
    const penTax = {};
    if (pg) {
        if (pg.tax) {
            const tax = Tax.findOne({_id: pg.tax, status: 'Active'});
            tax ? penTax.tax = tax : null;
        }
        if (pg.pension) {
            const pension = Pensions.findOne({_id: pg.pension, status: 'Active'});
            pension ? penTax.pension = pension : null;
        }
    }
    return penTax;

}


//return employer and employee contribution
function getPensionContribution(pensionBucket, pension) {
    //@import pension bucket float, pension doc.
    //all elements of pension already derived into pensionBucket
    //calculate employer and employee contribution
    if (pension) {
        const input = [{code: 'Pension Bucket', value: pensionBucket}];
        const processing = [];
        const eerate = pension.employeeContributionRate;
        const errate = pension.employerContributionRate;
        const employee = (eerate / 100) * pensionBucket;
        processing.push({code: `Employee rate`, derived: `(${eerate} / 100) * ${pensionBucket}` });
        processing.push({code: `Employee rate`, derived: employee });
        const employer = (errate / 100) * pensionBucket;
        processing.push({code: `Employer rate`, derived: `(${errate} / 100) * ${pensionBucket}` });
        processing.push({code: `Employer rate`, derived: employer });
        const netee = employee / 12;
        const neter = employer / 12;
        //log for net employee contribution
        processing.push({code: `Employer rate`, derived: `(${employer} / 12) ` });
        processing.push({code: `Employer Net Rate`, derived: neter });

        //log for net employee contribution
        processing.push({code: `Employee rate`, derived: `(${employee} / 12) ` });
        processing.push({code: `Employee Net Rate`, derived: netee });

        const log = {paytype: pension.code, input: input, processing: processing};
        return {employeePenContrib: parseFloat(netee).toFixed(2), employerPenContrib: parseFloat(neter).toFixed(2), grossPension: employee, pensionLog: log};
    } else {
        return {employeePenContrib: null, employerPenContrib: null}
    }

}

//from taxable income calculate tax and return value
function calculateTax(relief, taxBucket, grossIncomeBucket, tax) {
    //@import taxBucket (defualt tax bucket or valuated passed bucket)
    //@import tax (tax doc configured )
    //calculate reliefs
    //no checks done yet exceptions NAN undefined checkes
    //return result {finalTax: log[] }
    const input = [{code: 'Relief', value: relief}, {code: 'TaxBucket', value: taxBucket}, {code: 'GrossIncomeBucket', value: grossIncomeBucket}];
    const processing = [];
    const grossIncomeRelief = (tax.grossIncomeRelief / 100) * grossIncomeBucket;
    processing.push({code: 'Gross Income Relief', derived: '(grossIncomeRelief / 100) * grossIncomeBucket'});
    processing.push({code: 'Gross Income Relief', derived: grossIncomeRelief });

    const consolidatedRelief = tax.consolidatedRelief;
    processing.push({code: `Consolidated Relief defined in ${tax.code}`, derived: consolidatedRelief });
    
    const totalRelief = grossIncomeRelief + consolidatedRelief + relief;
    processing.push({code: `Total Relief`, derived: 'grossIncomeRelief + consolidatedRelief + relief' });
    processing.push({code: `Total Relief`, derived: totalRelief });
    
    let taxableIncome = taxBucket - totalRelief;
    processing.push({code: `Taxable Income`, derived: 'taxBucket - totalRelief' });
    processing.push({code: `Taxable Income`, derived: taxableIncome });

    let totalTax = 0;
    //apply tax rules on taxable income
    const rules = [...tax.rules];

    let isTaxableIncomeLessThanFirstUpperLimit =  false

    //add log for debugging
    //deduct upper limit from taxable income
    //no need to calcuate tax if taxable income-
    if (taxableIncome >= rules[0].upperLimit) {
        for (let i = 0; i < rules.length; i++) {
            let x = rules[i];
            if (x.range !== 'Over') {
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: `${x.rate} * (${taxableIncome} - ${x.upperLimit}) / 100` });
                if (taxableIncome >= x.upperLimit) {
                    taxableIncome -= x.upperLimit;
                    totalTax += x.rate * (x.upperLimit / 100);
                } else {
                    totalTax += x.rate * (taxableIncome / 100);
                    break;
                }
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: totalTax });
            } else {
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: `${x.rate} * (${taxableIncome}) / 100` });
                totalTax += x.rate * (taxableIncome / 100);
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: totalTax });
            }
        }
    } else {
        isTaxableIncomeLessThanFirstUpperLimit = true
    }
    const netTax = totalTax / 12;
    if(isTaxableIncomeLessThanFirstUpperLimit) {
        processing.push({code: `Net Tax(Total Tax / 12 ) - {Fail! Taxable income is less than first upper limit of tax rule}`, derived: `${totalTax}` / 12 });
        processing.push({code: `Net Tax - {Fail! Taxable income is less than first upper limit of tax rule}`, derived: netTax });
    } else {
        processing.push({code: `Net Tax(Total Tax / 12 )`, derived: `${totalTax}` / 12 });
        processing.push({code: `Net Tax`, derived: netTax });
    }
    const log = {paytype: tax.code, input: input, processing: processing};

    return {netTax: parseFloat(netTax).toFixed(2), taxLog: log};
}

/*
Sum payments in groups
@import array
 */

function sumPayments(payments){
    const newPay = [...payments];
    const sum = newPay.reduce(function(total, val) {
        return total + parseFloat(val.value);
    }, 0);
    return parseFloat(sum).toFixed(2) ;
}

/*
import employee doc.
return {} object containing employee details to be displayed on payslip
 */
function getDetailsInPayslip(employee){
    let details = {};
    details.employeeUserId = employee._id;
    details.employeeId = employee.employeeProfile.employeeId;
    details.fullname = employee.profile.fullName;
    details.accountNumber = employee.employeeProfile.payment.accountNumber || "";
    details.bank = employee.employeeProfile.payment.bank || "";
    // add other details

    return details;
}

function getPaytypeIdandValue(additionalPay, businessId) {
    let newAddPay = [...additionalPay];
    let paytypes = []; //lazyload paytypes to reduce number of database query.
    newAddPay.forEach(x => {
        const paytype = PayTypes.findOne({code: x.paytype, businessId: businessId, status: 'Active'});
        if(paytype)
            paytype.value = x.amount.toString();   // add the value as additional pay value
            paytypes.push(paytype);
    });
    return paytypes;
}

function PaytypeException(message, paytype) {
    this.message = message;
    this.name = 'PaytypeEvaluationException';
    this.paytype = paytype;
}