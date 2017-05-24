import _ from 'underscore';
/**
 *  Payruns Methods
 */
Meteor.methods({

    /* Get net monthly pay amount NMP

     */
    'exportPaymentsforPeriod': (businessId, period) => {
        //get all payroll result for specified period if employee is authorized
        check(period, String);
        check(businessId, String);
            const result =  Payruns.find({businessId: businessId, period: period}).fetch();
            const paytypes = [], export_header = ["Full Name", "Employee Number", "Period"];
            //for every header, loop at employee payment and populate value
            result.forEach(x => {
                let payments = x.payment;
                // for every payment, push value if it exists or 0.00 into result
                payments.forEach(p => {
                        const header = {code: p.code , reference: p.reference};
                        const index = _.findLastIndex(paytypes, header);
                        if(index === -1) {
                            paytypes.push(header);
                            export_header.push(p.code);
                        }

                    });
                });
            //header population complete now use header index and fill each employee data
            // review this method
            const data = [];
            result.forEach(x => {
                // for every payment, push value if it exists or 0.00 into result
                //get personnel details first
                let employee = Meteor.users.findOne({_id: x.employeeId});
                if (employee) {

                    //push employee name, employeeId and period
                    const employeePay = [];
                    employeePay.push(employee.profile.fullName);
                    employeePay.push(employee.employeeProfile.employeeId);
                    employeePay.push(x.period);

                    paytypes.forEach(p => {
                        const payments = x.payment;
                        const index = _.findLastIndex(payments, p);
                        if(index > -1) {
                            employeePay.push(payments[index].amountPC);
                        } else {
                            employeePay.push(0.00);
                        }

                    });
                    data.push(employeePay);
                }
            });
            let exportData = {fields: export_header, data: data};
            return exportData   ;
    },

    /* Get net monthly pay amount NMP

     */
    'ExportNetPayResult': (businessId, period) => {
        //get all payroll result for specified period if employee is authorized
        check(period, String);
        check(businessId, String);
        if(Core.hasPayrollAccess(this.userid)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            const result =  Payruns.find({businessId: businessId, period: period}).fetch();
            const netpay = result.map(x => {
                const netPayIndex = _.findLastIndex(x.payment, {code: 'NMP'}); //get amount in paytype currency for standard paytype NMP(Net monthly pay)
                if(netPayIndex > -1) {
                    const amountPC = x.payment[netPayIndex].amountPC;
                    //get employee details
                    let employee = Meteor.users.findOne({_id: x.employeeId});
                    if(employee){
                        return [
                            employee.profile.fullName,
                            employee.employeeProfile.payment.bank,
                            employee.employeeProfile.payment.accountNumber,
                            amountPC
                        ];
                    }
                }
            });
            const header = [
                "Full Name",
                "Bank",
                "Account Number",
                "Amount"
            ];
            return {fields: header, data: netpay};
        }
    },


    /* Get net monthly pay amount NMP

     */
    'getnetPayResult': (businessId, period) => {
        //get all payroll result for specified period if employee is authorized
        check(period, String);
        check(businessId, String);
        if(Core.hasPayrollAccess(this.userid)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            const result =  Payruns.find({businessId: businessId, period: period}).fetch();
            const netpay = result.map(x => {
                const netPayIndex = _.findLastIndex(x.payment, {code: 'NMP'}); //get amount in paytype currency for standard paytype NMP(Net monthly pay)
                if(netPayIndex > -1) {
                    const amountPC = x.payment[netPayIndex].amountPC;
                    //get employee details
                    let employee = Meteor.users.findOne({_id: x.employeeId});
                    if(employee){
                        const info = {
                            fullName: employee.profile.fullName,
                            bank: employee.employeeProfile.payment.bank,
                            accountNumber: employee.employeeProfile.payment.accountNumber,
                            amount: amountPC
                        };
                        return info;
                    }
                }
            });
            return netpay;
        }
    },

    /* Export Tax payment
     */
    'exportTaxResult': (businessId, period) => {
        //get all payroll result for specified period if employee is authorized
        check(period, String);
        check(businessId, String);
        if(Core.hasPayrollAccess(this.userid)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            const result =  Payruns.find({businessId: businessId, period: period, 'payment.reference': 'Tax'}).fetch();
            const tax = result.map(x => {
                const taxIndex = _.findLastIndex(x.payment, {reference: 'Tax'}); //get amount in paytype currency for standard paytype NMP(Net monthly pay)
                if(taxIndex > -1) {
                    const amountLC = x.payment[taxIndex].amountLC;
                    //get employee details
                    let employee = Meteor.users.findOne({_id: x.employeeId});
                    if(employee){
                        return [
                            employee.profile.fullName,
                            employee.employeeProfile.state,
                            employee.employeeProfile.payment.taxPayerId,
                            amountLC
                        ];
                    }
                }
            });
            const header = [
                "Full Name",
                "Resident State",
                "Tax Payer ID",
                "Amount"
            ];
            return {fields: header, data: tax};
        }
    },


    /* Get Tax pay
     */
    'getTaxResult': (businessId, period) => {
        //get all payroll result for specified period if employee is authorized
        check(period, String);
        check(businessId, String);
        if(Core.hasPayrollAccess(this.userid)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            const result =  Payruns.find({businessId: businessId, period: period, 'payment.reference': 'Tax'}).fetch();
            const tax = result.map(x => {
                const taxIndex = _.findLastIndex(x.payment, {reference: 'Tax'}); //get amount in paytype currency for standard paytype NMP(Net monthly pay)
                if(taxIndex > -1) {
                    const amountLC = x.payment[taxIndex].amountLC;
                    //get employee details
                    let employee = Meteor.users.findOne({_id: x.employeeId});
                    if(employee){
                        const info = {
                            fullName: employee.profile.fullName,
                            state: employee.employeeProfile.state,
                            taxPayerId: employee.employeeProfile.payment.taxPayerId,
                            amount: amountLC
                        };
                        return info;
                    }
                }
            });
            return tax;
        }
    },

    'exportPensionResult': (businessId, period) => {
        //get all payroll result for specified period if employee is authorized
        check(period, String);
        check(businessId, String);
        if(Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            const result =  Payruns.find({businessId: businessId, period: period, 'payment.reference': 'Pension'}).fetch();
            const pension = result.map(x => {
                const pensionsContribution = _.where(x.payment, {reference: 'Pension'}); //get all pension pay)
                if(pensionsContribution.length) {
                    const pensionAmount = {};
                    let pensionDescription;
                    pensionsContribution.forEach(x => {
                        //pension is always suffixed with _EE or _ER
                        const pensionLength = x.code.length;
                        if (!pensionDescription)
                            pensionDescription = x.description;
                        const type = x.code.substring(pensionLength, pensionLength - 3); //returns _EE or _ER
                        if(type === '_EE')
                            pensionAmount.employeeContribution  = x.amountPC;
                        if(type === '_ER')
                            pensionAmount.employerContribution = x.amountPC;
                    });
                    //get employee details
                    let employee = Meteor.users.findOne({_id: x.employeeId});
                    if(employee){
                        return [
                            employee.profile.fullName,
                            employee.employeeProfile.payment.pensionmanager,
                            employee.employeeProfile.payment.RSAPin,
                            pensionAmount.employeeContribution,
                            pensionAmount.employerContribution
                        ]
                    }
                }
            });
            const header = [
                "Full Name",
                "Pension Fund Administrator",
                "RSA PIN",
                "Employee Contribution",
                "Employer Contribution"
            ];
            return {fields: header, data: pension};
        }
    },

    'getPensionResult': (businessId, period) => {
        //get all payroll result for specified period if employee is authorized
        check(period, String);
        check(businessId, String);
        if(Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            const result =  Payruns.find({businessId: businessId, period: period, 'payment.reference': 'Pension'}).fetch();
            const pension = result.map(x => {
                const pensionsContribution = _.where(x.payment, {reference: 'Pension'}); //get all pension pay)
                if(pensionsContribution.length) {
                    const pensionAmount = {};
                    let pensionDescription;
                    pensionsContribution.forEach(x => {
                       //pension is always suffixed with _EE or _ER
                        const pensionLength = x.code.length;
                        if (!pensionDescription)
                            pensionDescription = x.description;
                        const type = x.code.substring(pensionLength, pensionLength - 3); //returns _EE or _ER
                        if(type === '_EE')
                            pensionAmount.employeeContribution  = x.amountPC;
                        if(type === '_ER')
                            pensionAmount.employerContribution = x.amountPC;
                    });
                    //get employee details
                    let employee = Meteor.users.findOne({_id: x.employeeId});
                    if(employee){
                        const info = {
                            fullName: employee.profile.fullName,
                            pensionManager: employee.employeeProfile.payment.pensionmanager,
                            pin: employee.employeeProfile.payment.RSAPin,
                            employeeContribution: pensionAmount.employeeContribution,
                            employerContribution: pensionAmount.employerContribution
                        }
                        return info;
                    }
                }
            });
            return pension;
        }
    },
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
            res = getActiveEmployees(paygrades, period, businessId);
            //res contains employees ready for payment processing

            if (res && res.length > 0) {
                payObj = processEmployeePay(res, annuals, businessId, period);
            }
        } else if (employees.length > 0) {
            const year = period.year;
            const month = period.month;
            const firsDayOfPeriod = `01-${month}-${year} GMT`;
            const DateLimit = new Date(firsDayOfPeriod);
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
            payObj = users && processEmployeePay(users, annuals, businessId, period);
        }

        //if live run and no error then save result
        if (runtype === 'LiveRun' && payObj.error.length === 0){
            //store result in Payrun Collection.
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

        //just return something for now .... testing
        return {payObj, runtype, period};
    }

});
// use oop
// instantiate payment object for employee with props for all methods required
function processEmployeePay(employees, includedAnnuals, businessId, period) {
    let paygrades = [];
    let payresult = [];  // holds result that will be sent to client
    let payrun = [];  //holds payrun for storing if not simulation
    let specifiedAsProcess = function (paytype) {
        return _.indexOf(includedAnnuals, paytype) !== -1 ? true : false;
    };
    processingError = [];

    let count = 0;

    let runPayrun = (counter) => {
        let x = employees[counter];
        if (x) {
            //first check if result exist for employee for that period and if not, continue processing.
            const periodFormat = period.month + period.year;// format is 012017 ex.
            result = Payruns.findOne({employeeId: x._id, period: periodFormat, businessId: businessId});
            if (result){
                //add relevant errors
                const error  = {};
                error.employee = `${x.employeeProfile.employeeId} - ${x.profile.fullName}`;
                error.reason = `Payment Exists for Period ${periodFormat}`;
                error.details = `Cannot Process Payroll for Employee ... as Payment for this period exists. To run payroll, Contact Admin to cross-check and delete previous payment data if neccessary`;
                processingError.push(error);

            } else {
                const employeeResult = {businessId: businessId, employeeId: x._id, period: periodFormat, payment : []}; //holds every payment to be saved for employee in payrun

                const projectsPayDetails = 
                    getFractionForCalcProjectsPayValue(businessId, period.month, period.year, x._id)
                console.log(`projectsPayDetails`, projectsPayDetails)
                
                const costCentersPayDetails = 
                    getFractionForCalcCostCentersPayValue(businessId, period.month, period.year, x._id)
                console.log(`costCentersPayDetails`, costCentersPayDetails)
                //--
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
                let skipToNextEmployee = false;
                try {
                    //let formular = x.value
                    let paytypes = empSpecificType.map(x => {    //changes paygrades of currently processed employee to include paytypes
                        let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
                        delete x.paytype;
                        _.extend(x, ptype);

                        return x;
                    });

                    //import additonal pay and duduction value based on employeeProfile.employeeId for period in collection AdditionalPayments.
                    const addPay = AdditionalPayments.find({businessId: businessId, employee: x.employeeProfile.employeeId, period: periodFormat}).fetch();
                    //include additional pay to match paytype values
                    if(addPay && addPay.length > 0){
                        let formattedPay = getPaytypeIdandValue(addPay, businessId) || [];
                        if(formattedPay && formattedPay.length > 0) {
                            formattedPay.forEach(x => {
                                let index = _.findLastIndex(paytypes, {_id: x._id});
                                if (index > -1) { //found
                                    paytypes[index].value = x.value;
                                    paytypes[index].additionalPay = true;
                                    //add additional pay flag to skip monthly division
                                }

                            });
                        }
                    }

                    paytypes.forEach((x, index) => {
                        //skip processing of Annual non selected annual paytypes
                        //revisit this to factor in all payment frequency and create a logic on how processing is made
                        if (x.frequency !== 'Annually' || (x.frequency === 'Annually' && specifiedAsProcess(x._id))) {
                            let input = [], processing = [];

                            input.push({
                                code: 'Hours worked on projects in month',
                                value: projectsPayDetails.duration
                            })
                            input.push({
                                code: 'Hours worked on cost centers in month',
                                value: costCentersPayDetails.duration
                            })
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

                                if (parsed.result !== null && !isNaN(parsed.result)) {
                                    x.parsedValue = x.type === 'Deduction' ? parsed.result.toFixed(2) * -1 : parsed.result.toFixed(2);  //defaulting to 2 dp ... Make configurable;
                                    processing.push({code: x.code, derived: x.parsedValue});
                                    //negate value if paytype is deduction.

                                    let netPayTypeAmount; //net amount used if payment type is monthly
                                    if(x.frequency === 'Monthly' && !x.additionalPay){
                                        netPayTypeAmount = (x.parsedValue / 12).toFixed(2);
                                        processing.push({code: `${x.code} - Monthly(NET)`, derived: netPayTypeAmount});
                                    }


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
                                    //set value
                                    const value = netPayTypeAmount || parseFloat(x.parsedValue);
                                    //check if payment or deduction and add to corresponding payslip state
                                    switch (x.type) {
                                        case 'Benefit':
                                            //add to payslip benefit if display in payslip
                                            if (x.displayInPayslip && x.addToTotal) {
                                                benefit.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    value
                                                });
                                            } else if(x.displayInPayslip && !x.addToTotal){
                                                others.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    value
                                                });
                                            }
                                            break;
                                        case 'Deduction':
                                            if (x.displayInPayslip && x.addToTotal){
                                                deduction.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    value
                                                });
                                            } else if(x.displayInPayslip && !x.addToTotal){
                                                others.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    value
                                                });
                                            }
                                    }
                                    //add value to result
                                    employeeResult.payment.push({id: x._id, reference: 'Paytype', amountLC: value, amountPC: value, code: x.code, description: x.title, type: (x.displayInPayslip && !x.addToTotal) ? 'Others': x.type });
                                    log.push({paytype: x.code, input: input, processing: processing});
                                } else {
                                    //when there is an error, stop processing this employee and move to the next one
                                    processing.push({code: x.code, derived: `Unable to handle Paytype Derivative ${formula}  = ${parsed}`});
                                    log.push({paytype: x.code, input: input, processing: processing});
                                    throw new PaytypeException('Unable to handle Paytype Derivative', `${formula}  = ${parsed.error}`);
                                }
                                empDerivedPayElements.push(x);
                                //
                            }
                        }
                    })
                } catch (e) {
                    const error  = {};
                    error.employee = `${x.employeeProfile.employeeId} - ${x.profile.fullName}`;
                    error.reason = e.message;
                    error.details = e.paytype;
                    processingError.push(error);
                    //set processing to false and do not save result.
                    skipToNextEmployee = true

                }
                if(!skipToNextEmployee) {
                    //further process after evaluation of all paytypes pension calculation and tax calculation

                    //get employee and employer contribution
                    const {employerPenContrib, employeePenContrib, grossPension, pensionLog} = getPensionContribution(pensionBucket, pension);  //@@technicalPaytype
                    //populate result for employee and employer pension contribution
                    if(pension){
                        employeeResult.payment.push({id: pension._id, reference: 'Pension', amountLC: employeePenContrib, amountPC: employeePenContrib, code: pension.code + '_EE', description: pension.name + ' Employee', type: 'Deduction'});
                        employeeResult.payment.push({id: pension._id, reference: 'Pension', amountLC: employerPenContrib, amountPC: employerPenContrib, code: pension.code + '_ER', description: pension.name + ' Employer', type: 'Others'});

                    }
                   if(pensionLog)    //add pension calculation log
                        log.push(pensionLog);
                    //add employee to relief Bucket
                    reliefBucket += (grossPension); //nagate employee Pension contribution and add to relief bucket

                    //get tax;
                    const taxBucket = assignedTaxBucket || defaultTaxBucket; //automatically use default tax bucket if tax bucket not found
                    const {netTax, taxLog} = calculateTax(reliefBucket, taxBucket, grossIncomeBucket, tax);  //@@technicalPaytype

                    //populate result for tax
                    employeeResult.payment.push({id: tax._id, reference: 'Tax', amountLC: netTax, amountPC: netTax, code: tax.code, description: tax.name, type: 'Deduction'  });

                    if(taxLog)
                        log.push(taxLog);
                    //collate results and populate paySlip; and push to payresult
                    let final = {};
                    final.log = log; //payrun processing log
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
                    const netPayment = parseFloat(totalPayment) + parseFloat(totalDeduction);    //@@technicalPaytype

                    //populate result for net payment
                    employeeResult.payment.push({reference: 'Standard', amountLC: netPayment, amountPC: netPayment, code: 'NMP', description: 'Net Payment', type: 'netPayment' });


                    final.payslip.totalPayment = totalPayment;
                    final.payslip.totalDeduction = totalDeduction;
                    final.payslip.netPayment = netPayment;


                    //Add currently process employee details to final.payslip.employee
                    const employee = getDetailsInPayslip(x);
                    final.payslip.employee = employee;
                    final.payslip.employee.grade = grade.code;

                    //payement will also be sent to result for factoring and storage;
                    payresult.push(final);
                    // also push employee result
                    payrun.push(employeeResult);

                    //factor payments for storage if not simulation



                    //map default buckets and paytypes used to assigned in config.
                } else {
                    //when there is an exception
                    let final = {};
                    final.log = log; //payrun processing log
                    final.payslip = {benefit: [], deduction: []};

                    //Add currently process employee details to final.payslip.employee
                    const employee = getDetailsInPayslip(x);
                    final.payslip.employee = employee;
                    final.payslip.employee.grade = grade.code;
                    final.error = true;

                    //payement will also be sent to result for factoring and storage;
                    payresult.push(final);
                }
            }

            count++;
            runPayrun(count);
        } else {
            // end of recursion

        }

    };

    runPayrun(count);
    //after the recurssion return result to calling function;
    return {result: payresult, error:processingError, payrun};
};



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

    // let allProjectTimesInMonth = TimeWritings.find(queryObj).fetch()

    let allProjectTimesInMonth = TimeWritings.aggregate([
        { $match: queryObj},
        { $group: {_id: "$employeeId", duration: { $sum: "$duration" }}}
    ]);
    //--
    let totalWorkHoursInYear = 2080
    let numberOfMonthsInYear = 12

    if(allProjectTimesInMonth) {
        if(allProjectTimesInMonth.length === 1) {
            const duration = allProjectTimesInMonth[0].duration
            const fraction = duration * numberOfMonthsInYear / totalWorkHoursInYear
            return {duration, fraction}
        } else {
            return {duration: 0, fraction: 0}
        }
    } else {
        return {duration: 0, fraction: 0}
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
