/*****************************************************************************/
/* selfpayslips: Event Handlers */
/*****************************************************************************/

Template.selfpayslips.events({
    'click #get-employee-payslip': (e, tmpl) => {
        let paymentPeriodMonth = $('[name="paymentPeriodMonth"]').val();
        let paymentPeriodYear = $('[name="paymentPeriodYear"]').val();

        let period = paymentPeriodMonth + paymentPeriodYear;
        let businessUnitId = Session.get('context')

        Meteor.call('Payslip/getSelfPayslipForPeriod', businessUnitId, period, Meteor.userId(), function(err, res) {
            if(!err) {
                tmpl.errorMsg.set(null);
                let selfPayrun = res.selfPayrun
                let selfPayResults = res.selfPayResults

                let payLoadForPayslip = {
                    payrun: selfPayrun,
                    payslip: selfPayResults.payslip, 
                    payslipWithCurrencyDelineation: selfPayResults.payslipWithCurrencyDelineation,
                    displayAllPaymentsUnconditionally: false
                }

                Session.set('currentPayrunPeriod', {month: paymentPeriodMonth, year: paymentPeriodYear})

                Session.set('currentSelectedPaySlip', payLoadForPayslip)
        
                // Modal.show('Payslip', payLoadForPayslip);
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
    },
    getSelectedPaySlipData: function() {
        return Session.get('currentSelectedPaySlip')
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
});

Template.selfpayslips.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
    Session.set('currentSelectedPaySlip', null)
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
