import _ from 'underscore';


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
                    return aPayType && aPayType.id && (aPayType.id === anEmployeePayType.id && aPayType.code === anEmployeePayType.code)
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

/*****************************************************************************/
/* PayrunApprovalEmployees: Event Handlers */
/*****************************************************************************/
Template.PayrunApprovalEmployees.events({
});

/*****************************************************************************/
/* PayrunApprovalEmployees: Helpers */
/*****************************************************************************/
Template.PayrunApprovalEmployees.helpers({
    'header': () => {
        let employeePayrunForPeriod = Template.instance().employeePayrunForPeriod.get()

        if(employeePayrunForPeriod && employeePayrunForPeriod.length > 0) {
            let payTypeHeaders = ReportUtils.getPayTypeHeaders2(employeePayrunForPeriod)
            let formattedHeader = payTypeHeaders.payTypeHeaders.map(aHeader => {
                return aHeader.description || aHeader
            })
            return formattedHeader
        }
    },
    'payrollData': () => {
        let employeePayrunForPeriod = Template.instance().employeePayrunForPeriod.get()
        let detailedPayrunResults = Template.instance().detailedPayrunResults.get()

        if(employeePayrunForPeriod && employeePayrunForPeriod.length > 0) {
            let payTypeHeaders = ReportUtils.getPayTypeHeaders2(employeePayrunForPeriod)

            let reportData = ReportUtils.getPayTypeValues(employeePayrunForPeriod, 
                detailedPayrunResults, payTypeHeaders.payTypeHeaders)
            
            return reportData        
        }
    },
    'isEqual': (a, b) => {
        return a === b
    },
    'isGreaterThan': (a, b) => {
        return a > b
    },
    'or': (a, b) => {
        return a || b
    },
    'isNumber': (value) => {
        return !isNaN(value)
    },
    'isStillFetchingData': () => {
        return Template.instance().stillLoading.get()
    }
});

/*****************************************************************************/
/* PayrunApprovalEmployees: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunApprovalEmployees.onCreated(function () {
    let self = this;

    self.employeePayrunForPeriod = new ReactiveVar()
    self.detailedPayrunResults = new ReactiveVar()
    self.stillLoading = new ReactiveVar(true)

    self.autorun(() => {        
        let modalData = self.data
        let userIds = modalData.userIds
        let periodFormat = modalData.periodFormat
        let businessId = Session.get('context')
        self.subscribe("paygrades", businessId);

        Meteor.call('PayResults/getEmployeesPayrunAndPayresults', businessId, userIds, periodFormat, function(err, res){
            if(res) {
                self.employeePayrunForPeriod.set(res.payRuns)
                self.detailedPayrunResults.set(res.payResults)
            } else {   
            }
            self.stillLoading.set(false)
        });
    });
});

Template.PayrunApprovalEmployees.onRendered(function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.PayrunApprovalEmployees.onDestroyed(function () {

});
