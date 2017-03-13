/*****************************************************************************/
/* payruns: Event Handlers */
/*****************************************************************************/
import Ladda from "ladda";

Template.payruns.events({
    'click #PayGroupButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayGroupButton')[0]);
        l.start();
    },
    'click #get-employee-payresults': (e, tmpl) => {
        let selectedEmployeeId = $('[name="employees"]').val();
        let paymentPeriodMonth = $('[name="paymentPeriodMonth"]').val();
        let paymentPeriodYear = $('[name="paymentPeriodYear"]').val();

        if(selectedEmployeeId && selectedEmployeeId.trim().length > 0) {
            let period = paymentPeriodMonth + paymentPeriodYear;

            Template.instance().currentPayrunEmployeeId.set(selectedEmployeeId);
            Template.instance().currentPayrunPeriod.set(period);
        } else {
            Template.instance().currentPayrun.set(null);
            Template.instance().errorMsg.set("Please select an employee");
        }
    }
});

/*****************************************************************************/
/* payruns: Helpers */
/*****************************************************************************/
Template.payruns.helpers({
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
    'payrun': function(){
        return Template.instance().currentPayrun.get();
    },
    'errorMsg': function() {
      return Template.instance().errorMsg.get();
    }
});

/*****************************************************************************/
/* payruns: Lifecycle Hooks */
/*****************************************************************************/
Template.payruns.onCreated(function () {
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));

    self.currentPayrun = new ReactiveVar();
    self.currentPayrun.set(false);

    self.currentPayrunEmployeeId = new ReactiveVar();
    self.currentPayrunEmployeeId.set(null);

    self.currentPayrunPeriod = new ReactiveVar();
    self.currentPayrunPeriod.set(null);

    self.errorMsg = new ReactiveVar();
    self.errorMsg.set("No Payrun available");

    self.autorun(() => {
      let currentPayrunEmployeeId = Template.instance().currentPayrunEmployeeId.get();
      let currentPayrunPeriod = Template.instance().currentPayrunPeriod.get();

      if(currentPayrunEmployeeId && currentPayrunEmployeeId.trim().length > 0) {
        self.subscribe("Payruns", currentPayrunEmployeeId, currentPayrunPeriod);

        if (self.subscriptionsReady()) {
          console.log("payrun called. currentPayrunEmployeeId: " + currentPayrunEmployeeId);
          console.log("currentPayrunPeriod: " + currentPayrunPeriod);

          let payRun = Payruns.find({employeeId: currentPayrunEmployeeId, period: currentPayrunPeriod});
          if(payRun && payRun.count() > 0)
            Template.instance().currentPayrun.set(payRun);
          else
            Template.instance().currentPayrun.set(null);
            Template.instance().errorMsg.set("No Payrun available for that employee for that time period");
        }
      }
  });
});

Template.payruns.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.payruns.onDestroyed(function () {
});
