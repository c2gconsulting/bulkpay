/*****************************************************************************/
/* Payslip: Event Handlers */
/*****************************************************************************/
Template.Payslip.events({

});

/*****************************************************************************/
/* Payslip: Helpers */
/*****************************************************************************/
Template.Payslip.helpers({
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
        console.log(`payslipWithCurrencyDelineation: `, payslipWithCurrencyDelineation)

        if(payslipWithCurrencyDelineation) {
            let currencyPayments = payslipWithCurrencyDelineation.deduction[currency]
            if(currencyPayments) {
                return currencyPayments.total
            }
        }
    }
});

/*****************************************************************************/
/* Payslip: Lifecycle Hooks */
/*****************************************************************************/
Template.Payslip.onCreated(function () {
    let self = this;

    self.employeeData = new ReactiveVar();
    self.employeeData.set(self.data.payslip.employee);

    self.businessUnitName = new ReactiveVar()

    self.payrunPeriod = new ReactiveVar();


    let businessUnitId = Session.get('context')

    let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
    self.subscribe("paygrades", Session.get('context'));
    // console.log(`payments: `, self.data)

    let formattedPeriod = `${self.data.payslip.period.month}${self.data.payslip.period.year}`
    self.subscribe('currenciesForPeriod', formattedPeriod);

    let months = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May',
        '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October',
        '11': 'November', '12': 'December'
    }
    let payrunPeriod = Session.get('currentPayrunPeriod')

    if(payrunPeriod.month) {
        self.payrunPeriod.set(`${months[payrunPeriod.month]} ${payrunPeriod.year}`)
    }

    self.autorun(function(){
        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitName.set(businessUnit.name)
        }
    })
});

Template.Payslip.onRendered(function () {
    // console.log(`Pay slip data: \n${JSON.stringify(Template.instance().data)}`);

});

Template.Payslip.onDestroyed(function () {
    Session.get('currentPayrunPeriod', null)
});
