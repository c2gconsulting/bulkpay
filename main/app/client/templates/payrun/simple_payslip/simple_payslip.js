import _ from 'underscore';

/*****************************************************************************/
/* SimplePayslip: Event Handlers */
/*****************************************************************************/
Template.SimplePayslip.events({
    'click #PayslipPrint': function(e, tmpl) {
        e.preventDefault()

        let modalContent = tmpl.$("#SimplePayslipModal").html()
        let currentBodyContent = document.getElementsByTagName('body')[0].innerHTML

        document.getElementsByTagName('body')[0].innerHTML = modalContent; 
        window.print()
        // document.getElementsByTagName('body')[0].innerHTML = currentBodyContent
        
        let displayAllPaymentsUnconditionally = Template.instance().displayAllPaymentsUnconditionally
        if(!displayAllPaymentsUnconditionally) {
            window.location.reload()
        }
    }
});

/*****************************************************************************/
/* SimplePayslip: Helpers */
/*****************************************************************************/
Template.SimplePayslip.helpers({
    'bank': function() {
        return Template.instance().employeeData.get().bank;
    },
    'accountNumber': function() {
        return Template.instance().employeeData.get().accountNumber;
    },
    'businessUnitName': function() {
        return Template.instance().businessUnitName.get()
    },
    'payrunPeriod': function() {
        return Template.instance().payrunPeriod.get()
    },
    'currency': () => {
        return Core.getTenantBaseCurrency().iso;
    },
    'isPaymentCurrencySameAsTenants': (payment) => {
        if(payment && payment.currency) {
            let tenantCurrency = Core.getTenantBaseCurrency().iso
            return payment.currency === tenantCurrency
        }
    },
    'getNetPayAlternateCurrency': function() {
        let self = Template.instance()
        if(self.data.payslip && self.data.payslip.employee && self.data.payslip.employee.gradeId) {
            let employeePayGradeId = self.data.payslip.employee.gradeId
            let payGrade = PayGrades.findOne(employeePayGradeId)

            if(payGrade) {
                let netPayAlternativeCurrency = payGrade.netPayAlternativeCurrency
                return netPayAlternativeCurrency
            }
        }
    },
    'getNetPayAlternateCurrencyRateToBase': function() {
        let self = Template.instance()
        let period = self.data.payslip.period
        let formattedPeriod = `${self.data.payslip.period.month}${self.data.payslip.period.year}`
        
        let employeePayGradeId = Template.instance().data.payslip.employee.gradeId
        let payGrade = PayGrades.findOne(employeePayGradeId)

        if(payGrade) {
            let netPayAlternativeCurrency = payGrade.netPayAlternativeCurrency

            let currencyInPeriod = Currencies.findOne({period: formattedPeriod, code: netPayAlternativeCurrency})

            if(currencyInPeriod) {
                let rateToBaseCurrency = currencyInPeriod.rateToBaseCurrency
                return rateToBaseCurrency
            }
        }
    },
    netPayCurrencyAllocation: function() {
        let self = Template.instance()
        let employeeUserId = self.data.payslip.employee.employeeUserId
        let user = Meteor.users.findOne(employeeUserId)

        if(user) {
            let netPayAllocation = user.employeeProfile.employment.netPayAllocation
            if(netPayAllocation && (netPayAllocation.hasNetPayAllocation === true)) {
                return netPayAllocation
            }
        }
    },
    getNetPayInForeignCurrencyIfNetPayCurrencyAllocationExists: function(netPaymentInBaseCurrency) {
        let self = Template.instance()
        let employeeUserId = self.data.payslip.employee.employeeUserId

        let period = self.data.payslip.period
        let formattedPeriod = `${self.data.payslip.period.month}${self.data.payslip.period.year}`
        
        let user = Meteor.users.findOne(employeeUserId)

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

                // let currencyInPeriod = Currencies.findOne({period: formattedPeriod, code: foreignCurrency})
                // if(currencyInPeriod) {
                //     let rateToBaseCurrency = currencyInPeriod.rateToBaseCurrency
                //     let foreignCurrencyToBase = (netPayAllocation.foreignCurrencyAmount * rateToBaseCurrency)
                    
                //     let netPayinLocalCurrency = netPaymentInBaseCurrency - foreignCurrencyToBase
                //     if(netPayinLocalCurrency < 0) {
                //         return (netPaymentInBaseCurrency / rateToBaseCurrency)
                //     } else {
                //         return netPayAllocation.foreignCurrencyAmount
                //     }
                // }
            }
        }
    },
    getNetPayInBaseCurrencyIfNetPayCurrencyAllocationExists: function(netPaymentInBaseCurrency) {
        let self = Template.instance()
        let employeeUserId = self.data.payslip.employee.employeeUserId

        let period = self.data.payslip.period
        let formattedPeriod = `${self.data.payslip.period.month}${self.data.payslip.period.year}`
        
        let user = Meteor.users.findOne(employeeUserId)

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
                // let currencyInPeriod = Currencies.findOne({period: formattedPeriod, code: foreignCurrency})
                // if(currencyInPeriod) {
                //     let rateToBaseCurrency = currencyInPeriod.rateToBaseCurrency
                //     let foreignCurrencyToBase = (netPayAllocation.foreignCurrencyAmount * rateToBaseCurrency)
                    
                //     let netPayRemainderInLocalCurrency = netPaymentInBaseCurrency - foreignCurrencyToBase
                //     if(netPayRemainderInLocalCurrency < 0) {
                //         return '---'
                //     } else {
                //         return netPayRemainderInLocalCurrency
                //     }
                // }
            }
        }
    },
    multiply: function(a, b) {
        return a * b
    },
    division: function(numerator, denominator) {
        if(denominator > 0) {
            return (numerator / denominator).toFixed(2)
        } else {
            return '---'
        }
    },
    subtract: function(a, b) {
        return a - b
    },
    addition: function(a, b) {
        return a + b
    },
    eq: function(a, b) {
        return a === b
    },
    or: function(a, b) {
        return a || b
    },
    totalBenefitForCurrency: function(currency) {
        let self = Template.instance()

        let payslipWithCurrencyDelineation = self.data.payslipWithCurrencyDelineation

        if(payslipWithCurrencyDelineation) {
            let currencyPayments = payslipWithCurrencyDelineation.benefit[currency]
            if(currencyPayments) {
                return currencyPayments.total
            }
        }
    },
    totalDeductionForCurrency: function(currency) {
        let self = Template.instance()

        let payslipWithCurrencyDelineation = self.data.payslipWithCurrencyDelineation

        if(payslipWithCurrencyDelineation) {
            let currencyPayments = payslipWithCurrencyDelineation.deduction[currency]
            if(currencyPayments) {
                return currencyPayments.total
            }
        }
    },
    paySlipBusinessLogoUrl: function() {
        let businessUnitLogoUrl = Template.instance().businessUnitLogoUrl.get()
        return (businessUnitLogoUrl) ? businessUnitLogoUrl : null
    },
    shouldDisplayPaymentInPayslip: function(paySlipPayType) {
        let displayAllPaymentsUnconditionally = Template.instance().displayAllPaymentsUnconditionally
        if(displayAllPaymentsUnconditionally) {
            return true
        } else {
            let payrun = Template.instance().data.payrun

            let foundPayType = _.find(payrun.payment, (aPayType) => {
                return (aPayType.reference === 'Tax' || aPayType.reference === 'Pension') && aPayType.description === paySlipPayType.code
            })
            if(foundPayType) {
                if(foundPayType.reference === 'Tax' || foundPayType.reference === 'Pension') {
                    return true
                }
            }

            let employeePayGrade = Template.instance().employeePayGrade.get()
            let allPayTypes = Template.instance().allPayTypes.get()
    
            if(employeePayGrade && allPayTypes) {
                let payGradePaytypes = employeePayGrade.payTypePositionIds
    
                let foundPayTypeInPayGrade = _.find(payGradePaytypes, (aPayTypeInPaygrade) => {
                    if(aPayTypeInPaygrade) {
                        let foundPayType = _.find(allPayTypes, (aPayType) => {
                            return aPayType._id === aPayTypeInPaygrade.paytype
                        })
                        if(foundPayType) {
                            return foundPayType.code === paySlipPayType.code
                        }
                    }
                })
                if(foundPayTypeInPayGrade) {
                    return foundPayTypeInPayGrade.displayInPayslip
                }
            }
        }
    },
    shouldShowPrintButton: function() {
        let displayAllPaymentsUnconditionally = Template.instance().displayAllPaymentsUnconditionally
        if(!displayAllPaymentsUnconditionally) {
            return true
        }
    }
});

/*****************************************************************************/
/* SimplePayslip: Lifecycle Hooks */
/*****************************************************************************/
Template.SimplePayslip.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context')

    self.employeeData = new ReactiveVar();

    self.businessUnitName = new ReactiveVar()
    self.businessUnitLogoUrl = new ReactiveVar()

    self.payrunPeriod = new ReactiveVar();

    self.employeePayGrade = new ReactiveVar()
    self.allPayTypes = new ReactiveVar()

    if(self.data) {
        self.displayAllPaymentsUnconditionally = self.data.displayAllPaymentsUnconditionally    
        self.employeeData.set(self.data.payslip.employee);

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let payGradesSubs = self.subscribe("paygrades", Session.get('context'));
        // console.log(`payments: `, self.data)
    
        let payTypesSubs = self.subscribe("PayTypes", Session.get('context'));
    
        let formattedPeriod = `${self.data.payslip.period.month}${self.data.payslip.period.year}`
        self.subscribe('currenciesForPeriod', formattedPeriod);
    
        let months = {
            '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May',
            '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October',
            '11': 'November', '12': 'December'
        }
        // let payrunPeriod = Session.get('currentPayrunPeriod')
    
        // if(payrunPeriod.month) {
            self.payrunPeriod.set(`${months[self.data.payslip.period.month]} ${self.data.payslip.period.year}`)
        // }
    
        self.autorun(function(){
            if(businessUnitSubscription.ready()) {
                let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
                self.businessUnitName.set(businessUnit.name)
                self.businessUnitLogoUrl.set(businessUnit.logoUrl)
            }
            if(payTypesSubs.ready() && payGradesSubs.ready()) {
                let employeePayGradeId = self.data.payslip.employee.gradeId
    
                self.employeePayGrade.set(PayGrades.findOne({
                    _id: employeePayGradeId
                }))
                self.allPayTypes.set(PayTypes.find({businessId: businessUnitId}).fetch())
            }
        })
    }
});

Template.SimplePayslip.onRendered(function () {
    // console.log(`Pay slip data: \n${JSON.stringify(Template.instance().data)}`);
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.SimplePayslip.onDestroyed(function () {
    Session.get('currentPayrunPeriod', null)
    Session.set('currentSelectedPaySlip', null)
});
