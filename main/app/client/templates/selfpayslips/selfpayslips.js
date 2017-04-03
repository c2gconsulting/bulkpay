/*****************************************************************************/
/* selfpayslips: Event Handlers */
/*****************************************************************************/

Template.selfpayslips.events({
});

/*****************************************************************************/
/* selfpayslips: Helpers */
/*****************************************************************************/
Template.selfpayslips.helpers({
    'employees': function(){
        return Meteor.users.find({"employee": true});
    },
    // 'month': function(){
    //     return Core.months()
    // },
    // 'year': function(){
    //     let years = [];
    //     for (let x = new Date().getFullYear() - 10; x < new Date().getFullYear() + 50; x++) {
    //         years.push(String(x));
    //     }
    //     return years;
    // },
    'myPaySlips': function(){
        return Template.instance().myPaySlips.get();
    },
    'errorMsg': function() {
      return Template.instance().errorMsg.get();
    }
});

/*****************************************************************************/
/* payruns: Lifecycle Hooks */
/*****************************************************************************/
Template.selfpayslips.onCreated(function () {
    console.log('Inside onCreated')
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));

    self.myPaySlips = new ReactiveVar();

    self.errorMsg = new ReactiveVar();
    //self.errorMsg.set("You have no payslips");

    self.autorun(() => {
        self.subscribe("SelfPayruns", Meteor.userId());

        if (self.subscriptionsReady()) {
            let payRun = Payruns.find({employeeId: Meteor.userId()}).fetch();
            console.log(`payRun: ${JSON.stringify(payRun)}`)

            if(payRun && payRun.length > 0) {
                self.myPaySlips.set(payRun)
                self.errorMsg.set(null);
            } else {
                self.myPaySlips.set(null);
                self.errorMsg.set("You have no payslips");
            }
        }
    });
});

Template.selfpayslips.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.selfpayslips.onDestroyed(function () {
});


//----------

Template.singlePaySlipResult.helpers({
  'getEmployeeFullName': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
        return employee.profile.fullName;
    else
        return ""
  },
  'getPeriodText': function(period) {
    let monthId = period.substring(0,2);
    console.log("Month id: " + monthId);

    let monthName = "";
    let months = Core.months();
    months.forEach((aMonth) => {
      if(aMonth.period === monthId) {
        monthName = aMonth.name;
        return;
      }
    })

    return `${monthName} / ${period.substring(2)}`
  },
  'getEmployeeRealId': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
      return employee.employeeProfile.employeeId;
    else
      return ""
  }
});

Template.singlePaySlipResult.events({
    'click .anEmployeePayResult': (e, tmpl) => {
        //console.log("Self payslip. Selected payslip context: \n" + JSON.stringify(Template.parentData()));
        //Modal.show('Payslip', Template.parentData());
    }
});
