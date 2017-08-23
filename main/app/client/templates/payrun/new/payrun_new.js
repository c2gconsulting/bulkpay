/*****************************************************************************/
/* PayrunNew: Event Handlers */
/*****************************************************************************/

// import _ from 'underscore';

let ReportUtils = {}



ReportUtils.getPayTypeHeaders2 = function(employeePayments) {
    let payTypeHeaders = ['EMP ID', 'Employee'] 
 
    let payGrade =  null
    let firstUserId = employeePayments[0].employeeId
    let firstUser = Meteor.users.findOne(firstUserId)
    if(firstUser) {
        let payGradeId = firstUser.employeeProfile.employment.paygrade
        if(payGradeId) {
            payGrade = PayGrades.findOne(payGradeId)
        }
    }
 
     let numPaytypesBeforeSuppl = 0
    // Supplementary payments are payments like netpay, 
    // pension employee contrib and pension employer contrib

    let numberOfPayments = 0
    if(payGrade) {
        if(payGrade.payTypePositionIds && payGrade.payTypePositionIds.length > 0) {
            numberOfPayments = payGrade.payTypePositionIds.length
        } else {
            numberOfPayments = employeePayments[0].payment.length
        }
        numPaytypesBeforeSuppl = numberOfPayments
    } else {
        numberOfPayments = employeePayments[0].payment.length
        numPaytypesBeforeSuppl = payTypeHeaders.length - 2  // EMP ID, Employee
    }
 
    // 5 === 2 for employee id and employee column PLUS 2 for deductions and net pay
    // PLUS 2 for pension employee and pension employer
    let headerColumnSlots = _.range(numberOfPayments - 5).map(x => {
        return {}
    })
 
    payTypeHeaders.push(...headerColumnSlots)
    //-- 
    let localCurrency = Core.getTenantBaseCurrency().iso;

    let netPayCurrencyAllocation_Headers = []

    employeePayments.forEach(anEmployeeData => {
        anEmployeeData.payment.forEach((anEmployeePayType, empPayTypeIndex) => {
            if(anEmployeePayType.id) {
                let doesPayTypeHeaderExist = _.find(payTypeHeaders, function(aPayType) {
                    return aPayType.id && (aPayType.id === anEmployeePayType.id && aPayType.code === anEmployeePayType.code)
                })
                if(!doesPayTypeHeaderExist) {
                    if(payGrade) {
                        let payGradePaytypeDetails = _.find(payGrade.payTypePositionIds, function(payGradePaytype) {
                            return payGradePaytype.paytype === anEmployeePayType.id
                        })
                        if(payGradePaytypeDetails) {// Adding '2' cos of the first 'EMP ID' and 'Employee' columns
                            if(payGradePaytypeDetails.hasOwnProperty("paySlipPositionId")) {
                                payTypeHeaders[payGradePaytypeDetails.paySlipPositionId + 2] = {
                                    id: anEmployeePayType.id,
                                    code: anEmployeePayType.code,
                                    description: anEmployeePayType.description
                                }
                            }
                        } else {
                            payTypeHeaders.splice(numPaytypesBeforeSuppl - 3, 0, {
                                id: anEmployeePayType.id,
                                code: anEmployeePayType.code,
                                description: anEmployeePayType.description
                            })
                        }
                    }
                }
            }
        })
        //--
        let anEmployeeFullData = Meteor.users.findOne(anEmployeeData.employeeId)
        
        if(anEmployeeFullData) {
            let netPayAllocation = anEmployeeFullData.employeeProfile.employment.netPayAllocation
            if(netPayAllocation) {
                if(netPayAllocation.hasNetPayAllocation) {
                    if(netPayCurrencyAllocation_Headers.length < 1) {
                        netPayCurrencyAllocation_Headers.push({
                            id: 'netPayCurrencyAllocation_' + localCurrency,
                            code: 'netPayCurrencyAllocation_' + localCurrency,
                            currency: localCurrency,
                            description: localCurrency + ' NetPay Currency Allocation'
                        })
                        netPayCurrencyAllocation_Headers.push({
                            id: 'netPayCurrencyAllocation_' + netPayAllocation.foreignCurrency,
                            code: 'netPayCurrencyAllocation_' + netPayAllocation.foreignCurrency,
                            currency: netPayAllocation.foreignCurrency,
                            description: netPayAllocation.foreignCurrency + ' NetPay Currency Allocation'
                        })
                    }
                }
            }
        }
    })
    
    payTypeHeaders = _.without(payTypeHeaders, null, undefined)

    let supplementaryPayTypeHeaders = []

    if(payGrade) {
        if(payGrade.netPayAlternativeCurrency && payGrade.netPayAlternativeCurrency !== localCurrency) {
            supplementaryPayTypeHeaders.push({
                id: 'totalBenefit_' + localCurrency,
                code: 'totalBenefit_' + localCurrency,
                description: localCurrency + ' Total Benefit'
            })
            supplementaryPayTypeHeaders.push({
                id: 'totalDeduction_' + localCurrency,
                code: 'totalDeduction_' + localCurrency,
                description: localCurrency + ' Total Deduction'
            })
            supplementaryPayTypeHeaders.push({
                id: 'netPay_' + localCurrency,
                code: 'netPay_' + localCurrency,
                description: localCurrency + ' Net Pay'
            })
            //--
            let netPayAlternativeCurrency = payGrade.netPayAlternativeCurrency

            supplementaryPayTypeHeaders.push({
                id: 'tax_' + localCurrency,
                code: 'tax_' + localCurrency,
                description: localCurrency + ' Tax'
            })
            supplementaryPayTypeHeaders.push({
                id: 'tax_' + netPayAlternativeCurrency,
                code: 'tax_' + netPayAlternativeCurrency,
                description: netPayAlternativeCurrency + ' Tax'
            })
            //--
            supplementaryPayTypeHeaders.push({
                id: 'totalBenefit_' + netPayAlternativeCurrency,
                code: 'totalBenefit_' + netPayAlternativeCurrency,
                description: netPayAlternativeCurrency + ' Total Benefit'
            })
            supplementaryPayTypeHeaders.push({
                id: 'totalDeduction_' + netPayAlternativeCurrency,
                code: 'totalDeduction_' + netPayAlternativeCurrency,
                description: netPayAlternativeCurrency + ' Total Deduction'
            })
            supplementaryPayTypeHeaders.push({
                id: 'netPay_' + netPayAlternativeCurrency,
                code: 'netPay_' + netPayAlternativeCurrency,
                description: netPayAlternativeCurrency + ' Net Pay'
            })
        } else {
            supplementaryPayTypeHeaders.push({
                id: 'totalDeduction',
                code: 'totalDeduction',
                description: 'Total Deduction'
            })
            supplementaryPayTypeHeaders.push({
                id: 'netPay',
                code: 'netPay',
                description: 'Net Pay'
            })            
        }
    }

    payTypeHeaders.push(...supplementaryPayTypeHeaders)
    payTypeHeaders.push(...netPayCurrencyAllocation_Headers)
    
    return {payTypeHeaders}
}

ReportUtils.getPayTypeValues = function(employeePayments, detailedPayrunResults, payTypeHeaders) {
    let payTypeValues = []
    // console.log(`detailedPayrunResults: `, JSON.stringify(detailedPayrunResults))
    console.log(`payTypeHeaders: `, payTypeHeaders)
    
    let payGrade =  null
    let firstUserId = employeePayments[0].employeeId
    let firstUser = Meteor.users.findOne(firstUserId)
    if(firstUser) {
        let payGradeId = firstUser.employeeProfile.employment.paygrade
        if(payGradeId) {
            payGrade = PayGrades.findOne(payGradeId)
        }
    }
    //--
    let localCurrency = Core.getTenantBaseCurrency().iso;
    let netPayAlternativeCurrency = ''
    if(payGrade) {
        if(payGrade.netPayAlternativeCurrency) {
            netPayAlternativeCurrency = payGrade.netPayAlternativeCurrency
        }
    }

    employeePayments.forEach(anEmployeeData => {
        let aRowOfPayTypeValues = []
        let netPaymentInBaseCurrency = 0

        payTypeHeaders.forEach(aPaytypeHeader => {
            if(aPaytypeHeader === 'EMP ID') {
                let employee = Meteor.users.findOne({_id: anEmployeeData.employeeId});
                aRowOfPayTypeValues.push(employee.employeeProfile.employeeId)
                return
            }
            if(aPaytypeHeader === 'Employee') {
                let employee = Meteor.users.findOne({_id: anEmployeeData.employeeId});
                aRowOfPayTypeValues.push(employee.profile.fullName)
                return
            }
            //--
            let payDetails = _.find(anEmployeeData.payment, function(aPayType) {
                return aPayType.id && (aPaytypeHeader.id === aPayType.id && aPaytypeHeader.code === aPayType.code)
            })
            if(payDetails) {
                let payAmount = payDetails.amountLC

                if(netPayAlternativeCurrency && netPayAlternativeCurrency !== localCurrency) {

                } else {
                    if(payDetails.reference !== 'Tax' && payDetails.amountLC != payDetails.amountPC) {
                        payAmount = payDetails.amountPC
                    }
                }
                if(payDetails.type === 'Deduction') {
                    if(payAmount > 0) {
                        payAmount *= -1
                    }
                }
                aRowOfPayTypeValues.push(payAmount)
            } else if(aPaytypeHeader.id === 'netPay') {

                let netPay = _.find(anEmployeeData.payment, function(aPayType) {
                    return (aPayType.code === 'NMP')
                })
                if(netPay) {
                    let payAmount = netPay.amountLC
                    if(netPay.amountLC != netPay.amountPC) {
                        payAmount = netPay.amountPC
                    }
                    netPaymentInBaseCurrency = payAmount

                    aRowOfPayTypeValues.push(payAmount)
                }
            } else if(aPaytypeHeader.id === 'totalDeduction') {
                let totalDeduction = _.find(anEmployeeData.payment, function(aPayType) {
                    return (aPayType.code === 'TDEDUCT')    
                })
                if(totalDeduction) {
                    let payAmount = totalDeduction.amountLC
                    if(totalDeduction.amountLC != totalDeduction.amountPC) {
                        payAmount = totalDeduction.amountPC
                    }                    
                    aRowOfPayTypeValues.push(payAmount)
                }
            } else {
                if(aPaytypeHeader.id === 'totalBenefit_' + localCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })
                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        aRowOfPayTypeValues.push(payslipWithCurrencyDelineation.benefit[localCurrency].total)
                    }
                } else if(aPaytypeHeader.id === 'totalDeduction_' + localCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })
                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        aRowOfPayTypeValues.push(payslipWithCurrencyDelineation.deduction[localCurrency].total)
                    }
                } else if(aPaytypeHeader.id === 'netPay_' + localCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })
                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        let totalBenefit = payslipWithCurrencyDelineation.benefit[localCurrency].total || 0
                        let totalDeduction = payslipWithCurrencyDelineation.deduction[localCurrency].total || 0

                        aRowOfPayTypeValues.push(totalBenefit + totalDeduction)
                    }
                } else if(aPaytypeHeader.id === 'totalBenefit_' + netPayAlternativeCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })
                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        aRowOfPayTypeValues.push(payslipWithCurrencyDelineation.benefit[netPayAlternativeCurrency].total)
                    }
                } else if(aPaytypeHeader.id === 'totalDeduction_' + netPayAlternativeCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })
                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        aRowOfPayTypeValues.push(payslipWithCurrencyDelineation.deduction[netPayAlternativeCurrency].total)
                    }
                } else if(aPaytypeHeader.id === 'netPay_' + netPayAlternativeCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })
                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        let totalBenefit = payslipWithCurrencyDelineation.benefit[netPayAlternativeCurrency].total || 0
                        let totalDeduction = payslipWithCurrencyDelineation.deduction[netPayAlternativeCurrency].total || 0

                        aRowOfPayTypeValues.push(totalBenefit + totalDeduction)
                    }
                } else if(aPaytypeHeader.id === 'tax_' + localCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })

                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        let deductions = payslipWithCurrencyDelineation.deduction[localCurrency].payments || []

                        let foundTax = _.find(deductions, aDeduction => {
                            return aDeduction.reference === 'Tax'
                        })
                        if(foundTax) {
                            aRowOfPayTypeValues.push(foundTax.value)
                        } else {
                            aRowOfPayTypeValues.push("---")
                        }
                    }
                } else if(aPaytypeHeader.id === 'tax_' + netPayAlternativeCurrency) {
                    let found = _.find(detailedPayrunResults, aDetailPayrunResult => {
                        let employeeData = aDetailPayrunResult.payslipWithCurrencyDelineation.employee

                        return (anEmployeeData.employeeId === employeeData.employeeUserId)
                    })

                    if(found) {
                        let payslipWithCurrencyDelineation = found.payslipWithCurrencyDelineation
                        let deductions = payslipWithCurrencyDelineation.deduction[netPayAlternativeCurrency].payments || []

                        let foundTax = _.find(deductions, aDeduction => {
                            return aDeduction.reference === 'Tax'
                        })
                        if(foundTax) {
                            aRowOfPayTypeValues.push(foundTax.value)
                        } else {
                            aRowOfPayTypeValues.push("---")
                        }
                    }
                } else if(aPaytypeHeader.id && aPaytypeHeader.id.startsWith('netPayCurrencyAllocation_')) {
                    let currency = aPaytypeHeader.currency
                    let employee = Meteor.users.findOne({_id: anEmployeeData.employeeId});
                    let allocation = ''
                    if(currency === localCurrency) {
                        allocation = ReportUtils.getNetPayInBaseCurrencyIfNetPayCurrencyAllocationExists(employee, netPaymentInBaseCurrency)
                    } else {
                        allocation = ReportUtils.getNetPayInForeignCurrencyIfNetPayCurrencyAllocationExists(employee, netPaymentInBaseCurrency)
                    }
                    aRowOfPayTypeValues.push(allocation)
                } else {
                    aRowOfPayTypeValues.push("---")
                }
            }
        })
        payTypeValues.push(aRowOfPayTypeValues)
    })
    //--

    //--
    return payTypeValues
}

ReportUtils.getNetPayInBaseCurrencyIfNetPayCurrencyAllocationExists = function(user, netPaymentInBaseCurrency) {
    if(user) {
        let netPayAllocation = user.employeeProfile.employment.netPayAllocation
        if(netPayAllocation && (netPayAllocation.hasNetPayAllocation === true)) {
            let foreignCurrency = netPayAllocation.foreignCurrency
            let rateToBaseCurrency = netPayAllocation.rateToBaseCurrency

            if(rateToBaseCurrency) {
                let foreignCurrencyToBase = (netPayAllocation.foreignCurrencyAmount * rateToBaseCurrency)
                
                let netPayRemainderInLocalCurrency = netPaymentInBaseCurrency - foreignCurrencyToBase
                if(netPayRemainderInLocalCurrency < 0) {
                    return '---'
                } else {
                    return netPayRemainderInLocalCurrency
                }
            }
        }
    }
    return '---'
}

ReportUtils.getNetPayInForeignCurrencyIfNetPayCurrencyAllocationExists = function(user, netPaymentInBaseCurrency) {
    if(user) {
        let netPayAllocation = user.employeeProfile.employment.netPayAllocation
        if(netPayAllocation && (netPayAllocation.hasNetPayAllocation === true)) {
            let foreignCurrency = netPayAllocation.foreignCurrency
            let rateToBaseCurrency = netPayAllocation.rateToBaseCurrency
            if(rateToBaseCurrency) {
                let foreignCurrencyToBase = (netPayAllocation.foreignCurrencyAmount * rateToBaseCurrency)
                
                let netPayinLocalCurrency = netPaymentInBaseCurrency - foreignCurrencyToBase
                if(netPayinLocalCurrency < 0) {
                    return (netPaymentInBaseCurrency / rateToBaseCurrency)
                } else {
                    return netPayAllocation.foreignCurrencyAmount
                }
            }
        }
    }
    return "---"
}

//----------

Template.PayrunNew.events({
    'click #startProcessing': (e,tmpl) => {
        let payrunRunType = tmpl.payrunRunType.get()
        if(!payrunRunType) {
            swal("Validation Error", "Please select a runtype", "error");
            return
        }

        let payGrades = function(){
            let selected = [];
            $("input[name=paygrades]:checked").each(function () {
                selected.push($(this).attr("id"));
            });
            return selected;
        };
        let annualPay = function(){
            let selected = [];
            $("input:checkbox[name=selectAnnual]:checked").each(function () {
                selected.push($(this).attr("id"));
            });
            return selected;
        };
        let retroactivePayrun = $('[name="retroactivePayrun"]:checked').val()


        var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        const params = {
            employees: Core.returnSelection($('[name="employee"]')),
            paygrades: payGrades(),
            period: {
                month: $('[name="paymentPeriod.month"]').val(),
                year: $('[name="paymentPeriod.year"]').val(),

            },
            type: payrunRunType,
            annuals: annualPay(),
            retroactivePayrun: retroactivePayrun,
        };
        //check if any valid selection is made
        if (params.employees.length > 0 || params.paygrades.length > 0){
            Meteor.call("payrun/process",  params, Session.get('context'), (err, res) => {
                if(res){
                    // console.log(`Payrun results: ${JSON.stringify(res)}`);
                    Session.set('currentPayrunPeriod', res.period);

                    //set result as reactive dict payResult
                    tmpl.dict.set("payResult", res);
                } else{
                    console.log(err);
                }
                Blaze.remove(view);
            })
        } else {
            Blaze.remove(view);
            swal("Validation Error", "Please select a paygrade or some employees", "error");
        }
    },
    'change [name="annualPay"]': (e, tmpl) => {
        tmpl.includePay.set($(e.target).is(':checked'));

    },
    'change [name="runtype"]': (e, tmpl) => {
        tmpl.payrunRunType.set($(e.target).val());
    },
    'change [name="employee"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        selected.length > 0 ? tmpl.showPayGrade.set(false):tmpl.showPayGrade.set(true);
        //add employee paygrades
        let employeeGrade = selected.map(x => {
            return Meteor.users.findOne({_id: x, 'employee': true}).employeeProfile.employment.paygrade;
        });
        tmpl.grades.set(employeeGrade);
    },
    'change [name="paygrades"]': (e, tmpl) => {
        let selected = [];
        $("input:checkbox[name=paygrades]:checked").each(function () {
            selected.push($(this).attr("id"));
        });
        tmpl.grades.set(selected);
    },
    'change [name="paymentPeriod.month"]': (e, tmpl) => {
        tmpl.selectedMonth.set($(e.target).val());
    },
    'change [name="paymentPeriod.year"]': (e, tmpl) => {
        tmpl.selectedYear.set($(e.target).val());
    },
    'hover .table tbody tr': (e,tmpl) => {
        console.log('hover called');
    },
    selectedMonth: function (val) {
        if(Template.instance().selectedMonth.get()) {
            return Template.instance().selectedMonth.get() === val ? selected="selected" : '';
        }
    },
    selectedYear: function (val) {
        if(Template.instance().selectedYear.get()) {
            return Template.instance().selectedYear.get() === val ? selected="selected" : '';
        }
    },
    'click #export-to-csv': (e,tmpl) => {
        const payResult = Template.instance().dict.get('payResult');
        if (payResult) {
            // console.log(`payResult(exportToCsv): `, payResult)

            let payTypeHeaders = ReportUtils.getPayTypeHeaders2(payResult.payObj.payrun)

            let detailedPayrunResults = payResult.payObj.result
            // let paymentsWithCurrencyDelineation = _.pluck(detailedPayrunResults, "payslipWithCurrencyDelineation")

            // let payTypeHeaders = ReportUtils.getPayTypeHeadersStrategy3(paymentsWithCurrencyDelineation)

            let formattedHeader = payTypeHeaders.payTypeHeaders.map(aHeader => {
                return aHeader.description || aHeader
            })
            //--
            let reportData = ReportUtils.getPayTypeValues(payResult.payObj.payrun, 
                detailedPayrunResults, payTypeHeaders.payTypeHeaders)

            BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData}, 
                `Payrun results export`);
        } else {
            swal('Error', 'No payrun results', 'error')
        }
    },
    'click #send-for-approval': (e, tmpl) => {
        let selectedMonth = tmpl.selectedMonth.get()
        let selectedYear = tmpl.selectedYear.get()

        var view = Blaze.render(Template.Loading, document.getElementById('spinner'));

        Meteor.call("payrollApprovalConfig/sendPayrunApproveEmails", Session.get('context'), 
            selectedMonth, selectedYear, (err, res) => {
            if(res) {
                swal("Success", "Notification emails were successfully sent!", "success");
            } else {
                console.log(`err: `, err)
                swal("Error", err.reason, "error");
            }
            Blaze.remove(view);
        })
    }
});

/*****************************************************************************/
/* PayrunNew: Helpers */
/*****************************************************************************/
Template.PayrunNew.helpers({
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'paygrades': () => {
       return PayGrades.find();
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    "showPayGrade": () => {
        return Template.instance().showPayGrade.get();
    },
    "showAnnualPay": () => {
        return Template.instance().includePay.get();
    },
    'annualPay': () => {
        return PayTypes.find({
            frequency: 'Annually'
        }).fetch();
    },
    'checkInitial': (index) => {
        return index === 0 ? 'checked': null;
    },
    'nopayresult': () =>{
        const payresult = Template.instance().dict.get('payResult');
        if (!payresult) return true;
        return false;
    },
    'employeeResult': () => {
        const payResult = Template.instance().dict.get('payResult');
        if (payResult) {
            console.log(`pay result`, payResult.payObj.result)
            return payResult.payObj.result;
        }
    },
    'processingError': () => {
        const payresult = Template.instance().dict.get('payResult');
        let errors = payresult.payObj.error || []
        
        return errors.length;
    },
    selectedMonth: function (val) {
        if(Template.instance().selectedMonth.get()) {
            return Template.instance().selectedMonth.get() === val ? selected="selected" : '';
        }
    },
    selectedYear: function (val) {
        if(Template.instance().selectedYear.get()) {
            return Template.instance().selectedYear.get() === val ? selected="selected" : '';
        }
    },
    showSendForApprovalButton: function() {
        const payresult = Template.instance().dict.get('payResult');
        let errors = payresult.payObj.error || []

        if(!errors.length) {
            let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
            let payrunRunType = Template.instance().payrunRunType.get()

            return (payrunRunType === 'LiveRun' && payrollApprovalConfig && payrollApprovalConfig.requirePayrollApproval)
        }
    }
});

/*****************************************************************************/
/* Payments: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunNew.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.subscribe("paygrades", businessUnitId);
    self.subscribe("activeEmployees", businessUnitId);
    self.subscribe('PayrollApprovalConfigs', businessUnitId);
    self.subscribe("PayTypes", businessUnitId);

    self.dict = new ReactiveDict();
    self.showPayGrade = new ReactiveVar(true);
    self.grades = new ReactiveVar([]);
    self.includePay = new ReactiveVar(false);
    // if annual payment included, subscribe to all annual pay.

    //--
    self.selectedMonth = new ReactiveVar();
    self.selectedYear = new ReactiveVar();
    //--
    let theMoment = moment();
    self.selectedMonth.set(theMoment.format('MM'))
    self.selectedYear.set(theMoment.format('YYYY'))
    //--
    self.payrunRunType = new ReactiveVar()
    self.payrollApprovalConfig = new ReactiveVar()

    self.autorun(function(){
        let includeType = self.includePay.get();
        let selectedGrade = self.grades.get();
        if (includeType)
            self.subscribe("AdditionalPayTypes", selectedGrade, Session.get('context'));
        
        if (Template.instance().subscriptionsReady()) {
            let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: businessUnitId})
            self.payrollApprovalConfig.set(payrollApprovalConfig)
        }
    })
});

Template.PayrunNew.onRendered(function () {
     $('select.dropdown').dropdown();
});

Template.PayrunNew.onDestroyed(function () {
});
