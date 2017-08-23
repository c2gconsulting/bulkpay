/*****************************************************************************/
/* selfpayslips: Event Handlers */
/*****************************************************************************/

Template.selfpayslips.events({
    'click #get-employee-payslip': (e, tmpl) => {
        let paymentPeriodMonth = $('[name="paymentPeriodMonth"]').val();
        let paymentPeriodYear = $('[name="paymentPeriodYear"]').val();

        let period = paymentPeriodMonth + paymentPeriodYear;
        let businessUnitId = Session.get('context')

        Meteor.call('Payslip/getSelfPayslipForPeriod', businessUnitId, period, function(err, res) {
            if(!err) {
                tmpl.errorMsg.set(null);
                let selfPayrun = res.selfPayrun
                let selfPayResults = res.selfPayResults
                
                let processedPayslipData = tmpl.processSelfPayslipData(selfPayrun)
                // console.log(`processedPayslipData: ${JSON.stringify(processedPayslipData)}`)

                if(processedPayslipData) {
                    processedPayslipData.period = {
                        month: paymentPeriodMonth,
                        year: paymentPeriodYear
                    }
                }

                let payLoadForPayslip = {
                    payslip: processedPayslipData, 
                    payslipWithCurrencyDelineation: selfPayResults.payslipWithCurrencyDelineation
                }

                Session.set('currentPayrunPeriod', {month: paymentPeriodMonth, year: paymentPeriodYear})
                // Modal.show('Payslip', processedPayslipData);

                Modal.show('Payslip', payLoadForPayslip);
            } else {
                tmpl.errorMsg.set(err.message);
            }
        })
    }
});

/*****************************************************************************/
/* selfpayslips: Helpers */
/*****************************************************************************/
Template.selfpayslips.helpers({
    'employees': function(){
        return Meteor.users.find({"employee": true});
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear() - 10; x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    'currentPayrun': function(){
        return Template.instance().currentPayrun.get();
    },
    'errorMsg': function() {
        return Template.instance().errorMsg.get();
    }
});

/*****************************************************************************/
/* payruns: Lifecycle Hooks */
/*****************************************************************************/
Template.selfpayslips.onCreated(function () {
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("paygrades", Session.get('context'));
    self.subscribe("PayTypes", Session.get('context'));

    self.errorMsg = new ReactiveVar();

    self.sumPaymentsForPaySlip = (payments) => {
        const newPay = [...payments];
        const sum = newPay.reduce(function(total, val) {
            return total + parseFloat(val.value);
        }, 0);
        return parseFloat(sum).toFixed(2) ;
    }

    self.processSelfPayslipData = (payrunData) => {
        let benefit = []
        let deduction = []
        let others = []
        let totalPayment = 0
        let totalDeduction = 0
        let netPayment = 0
        //--
        let user = Meteor.user()
        let userPayGrade = PayGrades.findOne({_id: user.employeeProfile.employment.paygrade})
        let allPayTypes = PayTypes.find({'status': 'Active'}).fetch();

        payrunData.payment.forEach(aPayrunPaytype => {
            let foundPaygradePaytype = _.find(userPayGrade.payTypes, (aPaygradePaytype) => {
                return aPaygradePaytype.paytype === aPayrunPaytype.id
            })
            if(foundPaygradePaytype) {
                _.extend(aPayrunPaytype, {
                    displayInPayslip : foundPaygradePaytype.displayInPayslip
                })
            }
            //--
            let foundGeneralPaytype = _.find(allPayTypes, (aGeneralPaytype) => {
                return aGeneralPaytype._id === aPayrunPaytype.id
            })
            if(foundGeneralPaytype) {
                _.extend(aPayrunPaytype, {
                    addToTotal : foundGeneralPaytype.addToTotal
                })
            }
        })
        // console.log(`payrunData.payment: ${JSON.stringify(payrunData.payment)}`)


        for(var aPayment of payrunData.payment) {
            if(aPayment.type === 'Benefit') {
                if(aPayment.displayInPayslip && aPayment.addToTotal) {
                    benefit.push({
                        title: aPayment.description,
                        code: aPayment.code,
                        value: aPayment.amountLC,
                        valueInForeignCurrency: aPayment.amountPC
                    })
                }
            } else if(aPayment.type === 'Deduction') {
                // if(aPayment.displayInPayslip && aPayment.addToTotal) {
                    deduction.push({
                        title: aPayment.description,
                        code: aPayment.code,
                        value: aPayment.amountLC,
                        valueInForeignCurrency: aPayment.amountPC
                    })
                // }
            } else if(aPayment.type === 'Others') {
                // if(aPayment.displayInPayslip && aPayment.addToTotal) {
                    others.push({
                        title: aPayment.description,
                        code: aPayment.code,
                        value: aPayment.amountLC,
                        valueInForeignCurrency: aPayment.amountPC
                    })
                // }
            } else if(aPayment.type === 'netPayment') {
                netPayment = aPayment.amountLC
            }
        }
        totalPayment = self.sumPaymentsForPaySlip(benefit)
        totalDeduction = self.sumPaymentsForPaySlip(deduction)
        //--
        let employee = {
            employeeId: user.employeeProfile.employeeId,
            fullname: user.profile.fullName,
            accountNumber: user.employeeProfile.payment.accountNumber || "",
            bank: user.employeeProfile.payment.bank || "",
            grade: userPayGrade.description
        }
        return {benefit, deduction, others, totalPayment, totalDeduction, netPayment, employee}
    }
});

Template.selfpayslips.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.selfpayslips.onDestroyed(function () {
});


//----------

// Template.singlePaySlipResult.helpers({
//   'getEmployeeFullName': function(employeeId) {
//     let employee = Meteor.users.findOne({_id: employeeId});
//     if(employee)
//         return employee.profile.fullName;
//     else
//         return ""
//   },
//   'getPeriodText': function(period) {
//     let monthId = period.substring(0,2);
//     console.log("Month id: " + monthId);
//
//     let monthName = "";
//     let months = Core.months();
//     months.forEach((aMonth) => {
//       if(aMonth.period === monthId) {
//         monthName = aMonth.name;
//         return;
//       }
//     })
//
//     return `${monthName} / ${period.substring(2)}`
//   },
//   'getEmployeeRealId': function(employeeId) {
//     let employee = Meteor.users.findOne({_id: employeeId});
//     if(employee)
//       return employee.employeeProfile.employeeId;
//     else
//       return ""
//   }
// });

// Template.singlePaySlipResult.events({
//     'click .anEmployeePayResult': (e, tmpl) => {
//         //console.log("Self payslip. Selected payslip context: \n" + JSON.stringify(Template.parentData()));
//         //Modal.show('Payslip', Template.parentData());
//     }
// });
