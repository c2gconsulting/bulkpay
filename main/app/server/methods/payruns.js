import _ from 'underscore';
/**
 *  Payruns Methods
 */
Meteor.methods({

    /* Payment run
     */

    "payrun/process": function (obj, businessId) {
        //check if user is in businessId
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
        let res;
        let payObj = {};
        //get all selected employees --Condition-- if employees selected, ideally there should be no paygrade
        if (employees.length === 0 && paygrades.length > 0) {
            console.log("getting active employees");
            res = getActiveEmployees(paygrades, period, businessId);
            //res contains employees ready for payment processing

            if (res && res.length > 0) {
                payObj.result = processEmployeePay(res, annuals, businessId);
            }
        } else if (employees.length > 0) {
            //get all employees specified
            //return empoloyee and reason why payroll cannot be run for such employee if any
            const users = Meteor.users.find({_id: {$in: employees},
                $or: [
                    {'employeeProfile.employment.terminationDate': {$gt: DateLimit}},
                    {'employeeProfile.employment.terminationDate': null},
                    {'employeeProfile.employment.terminationDate' : { $exists : false } }
                ],
                'employeeProfile.employment.status': 'Active',
                'businessIds': businessId, }).fetch();
            payObj.result = users && processEmployeePay(users, annuals, businessId);
        }

        //just return something for now .... testing
        return {payObj};
    }

});
// use oop
// instantiate payment object for employee with props for all methods required
function processEmployeePay(employees, includedAnnuals, businessId) {
    console.log("Employees to Process are: ", employees);
    let paygrades = [];
    let payresult = [];
    let specifiedAsProcess = function (paytype) {
        return _.indexOf(includedAnnuals, paytype) !== -1 ? true : false;
    };

    let count = 0;

    let runPayrun = (counter) => {
        let x = employees[counter];
        if (x) {
            const pg = x.employeeProfile.employment.paygrade;  //paygrade
            let pt = x.employeeProfile.employment.paytypes;  //paytype

            let grade, pgp;  //grade(paygrade) && pgp(paygroup);
            const gradeIndex = _.findLastIndex(paygrades, {_id: pg});
            let empSpecificType;  //contains employee payments derived from paygrade
            if (gradeIndex !== -1) {
                grade = paygrades[gradeIndex];
                empSpecificType = determineRule(pt, grade);
            } else {
                //get paygrade and update paygrades
                grade = getEmployeeGrade(pg);
                if (grade) {
                    paygrades.push(grade);
                    empSpecificType = determineRule(pt, grade);
                }
            }

            // console.log(empSpecificType[0].value, '\n ------------')

            if (grade && grade.hasOwnProperty('payGroups') && grade.payGroups.length > 0) {
                pgp = grade.payGroups[0]; //first element of paygroup// {review}
            }
            //payElemnts derivation;
            const {tax, pension} = getPaygroup(pgp);

            let defaultTaxBucket = 0, pensionBucket = 0, log = [];  //check if pagrade uses default tax bucket
            let assignedTaxBucket, grossIncomeBucket = 0, totalsBucket = 0, reliefBucket = 0;
            let empDerivedPayElements = [];
            let benefit = [], deduction = [], others = [];
            let rules = new ruleJS();

            rules.init();
            try {
                //let formular = x.value
                let paytypes = empSpecificType.map(x => {    //changes paygrades of currently processed employee to include paytypes
                    let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
                    delete x.paytype;
                    _.extend(x, ptype);

                    return x;
                });
                paytypes.forEach((x, index) => {
                    //skip processing of Annual non selected annual paytypes
                    //revisit this to factor in all payment frequency and create a logic on how processing is made
                    if (x.frequency !== 'Annually' || (x.frequency === 'Annually' && specifiedAsProcess(x._id))) {
                        let input = [], processing = [];

                        let boundary = [...paytypes]; //available types as at current processing
                        boundary.length = index + 1;
                        //format boundary for display in log
                        let clone = boundary.map(x => {
                            let b = {};
                            b.code = x.code;
                            b.value = x.value;
                            return b;
                        });
                        input = input.concat(clone);

                        let formula = x.value;
                        let old = formula;
                        if (formula) {
                            //replace all wagetypes with values
                            for (var i = 0; i < index; i++) {
                                const code = paytypes[i].code ? paytypes[i].code.toUpperCase() : paytypes[i].code;
                                const pattern = `\\b${code}\\b`;
                                const regex = new RegExp(pattern, "g");
                                formula = formula.replace(regex, paytypes[i].value);

                            }
                            //do the same for all contansts and replace the values
                            //will find a better way of doing this... NOTE
                            let k = Constants.find({'businessId': businessId, 'status': 'Active'}).fetch();  //limit constant to only Bu constant
                            k.forEach(c => {
                                const code = c.code ? c.code.toUpperCase() : c.code;
                                const pattern = `\\b${code}\\b`;
                                const regex = new RegExp(pattern, "g");
                                formula = formula.replace(regex, c.value);

                            });
                            processing.push({code: x.code, previous: old, derived: formula});
                            var parsed = rules.parse(formula, '');

                            if (parsed.result !== null) {
                                x.parsedValue = x.type === 'Deduction' ? parsed.result.toFixed(2) * -1 : parsed.result.toFixed(2);  //defaulting to 2 dp ... Make configurable;
                                processing.push({code: x.code, derived: x.parsedValue});
                                //negate value if paytype is deduction.
                                //if add to total, add wt to totalsBucket
                                totalsBucket += x.addToTotal ? parseFloat(x.parsedValue) : 0;
                                //add parsed value to defaultTax bucket if paytype is taxable
                                defaultTaxBucket += x.taxable ? parseFloat(x.parsedValue) : 0;
                                //for reliefs add to relief bucket
                                reliefBucket += x.reliefFromTax ? parseFloat(x.parsedValue) : 0;
                                //assigned bucket if one of the paytype is selected as tax bucket
                                assignedTaxBucket = x._id === tax.bucket ? parseFloat(x.parsedValue) : null;
                                processing.push({code: x.code, taxBucket: defaultTaxBucket});
                                //if paytype in pension then add to default pension buket
                                const ptIndex = pension && _.indexOf(pension.payTypes, x._id);
                                pensionBucket += ptIndex !== -1 ? parseFloat(x.parsedValue) : 0; // add parsed value to pension bucket if paytype is found
                                //gross income for pension relief;
                                grossIncomeBucket += tax.grossIncomeBucket === x._id ? parseFloat(x.parsedValue) : 0;
                                processing.push({code: x.code, pensionBucket: pensionBucket});

                                //check if payment or deduction and add to corresponding payslip state
                                switch (x.type) {
                                    case 'Benefit':
                                        //add to payslip benefit if display in payslip
                                        if (x.displayInPayslip && x.addToTotal) {
                                            benefit.push({
                                                title: x.title,
                                                code: x.code,
                                                value: parseFloat(x.parsedValue)
                                            });
                                        } else if(x.displayInPayslip && !x.addToTotal){
                                            others.push({
                                                title: x.title,
                                                code: x.code,
                                                value: parseFloat(x.parsedValue)
                                            });
                                        }
                                        break;
                                    case 'Deduction':
                                        if (x.displayInPayslip && x.addToTotal){
                                            deduction.push({
                                                title: x.title,
                                                code: x.code,
                                                value: parseFloat(x.parsedValue)
                                            });
                                        } else if(x.displayInPayslip && !x.addToTotal){
                                            others.push({
                                                title: x.title,
                                                code: x.code,
                                                value: parseFloat(x.parsedValue)
                                            });
                                        }
                                }
                            } else {
                                //when there is an error, stop processing this employee and move to the next one
                                processing.push(parsed);
                            }
                            log.push({paytype: x.code, input: input, processing: processing});
                            empDerivedPayElements.push(x);
                            //
                        }
                    }
                })
            } catch (e) {
                console.log(e);
            }

            //further process after evaluation of all paytypes pension calculation and tax calculation

            //get employee and employer contribution
            const {employerPenContrib, employeePenContrib} = getPensionContribution(pensionBucket, pension);  //@@technicalPaytype
            //add employee to relief Bucket
            reliefBucket += (employeePenContrib * -1); //nagate employee Pension contribution and add to relief bucket

            //get tax;
            const taxBucket = assignedTaxBucket || defaultTaxBucket; //automatically use default tax bucket if tax bucket not found
            const netTax = calculateTax(reliefBucket, taxBucket, grossIncomeBucket, tax);  //@@technicalPaytype
            //collate results and populate paySlip; and push to payresult
            let final = {};
            final.log = log;
            final.payslip = {benefit: benefit, deduction: deduction}; //pension and tax are also deduction
            final.payslip.deduction.push({title: tax.code , code: tax.name, value: netTax * -1}); // negate add tax to deduction
            if(pension) {
                final.payslip.deduction.push({title: `${pension.code}_EE`, code: pension.name, value: employeePenContrib * -1});
                if(pension.displayEmployerInPayslip) final.payslip.others = others.concat([{title: `${pension.code}_ER`, code: `${pension.name} Employer`, value: employerPenContrib}]); //if employer contribution (displayEmployerInPayslip) add to other payments

            }
            //calculate net payment as payment - deductions;
            // negate and add pension to deduction
            const totalPayment = sumPayments(final.payslip.benefit);
            const totalDeduction = sumPayments(final.payslip.deduction);
            const netPayment = totalPayment + totalDeduction;    //@@technicalPaytype
            final.payslip.totalPayment = totalPayment;
            final.payslip.totalDeduction = totalDeduction;
            final.payslip.netPayment = netPayment;


            //Add currently process employee details to final.payslip.employee
            const employee = getDetailsInPayslip(x);
            final.payslip.employee = employee;

            //payement will also be sent to result for factoring and storage;
            payresult.push(final);

            //factor payments for storage if not simulation



            //map default buckets and paytypes used to assigned in config.
            count++;
            runPayrun(count);
        } else {
            // end of recursion

        }

    };

    runPayrun(count);
    //after the recurssion return result to calling function;
    return payresult;
};

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
        // console.log(index, '\n-------------')
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
        const eerate = pension.employeeContributionRate;
        const errate = pension.employerContributionRate;
        const employee = (eerate / 100) * pensionBucket;
        const employer = (errate / 100) * pensionBucket;
        return {employeePenContrib: parseFloat(employee).toFixed(2), employerPenContrib: parseFloat(employer).toFixed(2)};
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
    const grossIncomeRelief = (tax.grossIncomeRelief / 100) * grossIncomeBucket;
    const consolidatedRelief = tax.consolidatedRelief;
    const totalRelief = grossIncomeRelief + consolidatedRelief + relief;
    let taxableIncome = taxBucket - totalRelief;
    let totalTax = 0;
    //apply tax rules on taxable income
    const rules = [...tax.rules];
    //add log for debugging
    //deduct upper limit from taxable income
    //no need to calcuate tax if taxable income-
    if (taxableIncome >= rules[0].upperLimit) {
        for (let i = 0; i < rules.length; i++) {
            let x = rules[i];
            if (x.range !== 'Over') {
                if (taxableIncome >= x.upperLimit) {
                    taxableIncome -= x.upperLimit;
                    totalTax += x.rate * (x.upperLimit / 100);
                } else {
                    totalTax += x.rate * (taxableIncome / 100);
                    break;
                }
            } else {
                totalTax += x.rate * (taxableIncome / 100);
            }
        }
    }

    return parseFloat(totalTax).toFixed(2);
}

/*
Sum payments in groups
@import array
 */

function sumPayments(payments){
    const newPay = [...payments];
    const sum = newPay.reduce(function(total, val) {
        return total + val.value;
    }, 0);
    return sum;
}

/*
import employee doc.
return {} object containing employee details to be displayed on payslip
 */
function getDetailsInPayslip(employee){
    let details = {};
    details.employeeId = employee.employeeProfile.employeeId;
    details.fullname = employee.profile.fullName;
    // add other details

    return details;
}