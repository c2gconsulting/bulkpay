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
        let paymentPeriodMonth = $('[name="paymentPeriodMonth"]').val();
        let paymentPeriodYear = $('[name="paymentPeriodYear"]').val();

        let period = paymentPeriodMonth + paymentPeriodYear;

        Template.instance().currentPayrunPeriod.set(period);
    },
    'click .excel': (e, tmpl) => {
        e.preventDefault();
        const month = $('[name="paymentPeriodMonth"]').val();
        const year = $('[name="paymentPeriodYear"]').val();
        if(month && year) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);


            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }


            let resetButton = function() {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('.excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('.excel').text(' Export to CSV');
                // Add back glyphicon
                $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('.excel').removeAttr('disabled');
            };

            const period = month + year;
            Meteor.call('exportPaymentsforPeriod', Session.get('context'), period, function(err, res){
                console.log(res);
                if(res){
                    //call the export fo
                    BulkpayExplorer.exportAllData(res, "Payment Report");
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select Period', 'error');
        }

    }
});

/*****************************************************************************/
/* payruns: Helpers */
/*****************************************************************************/
Template.payruns.helpers({
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

    self.currentPayrunPeriod = new ReactiveVar();
    self.currentPayrunPeriod.set(null);

    self.errorMsg = new ReactiveVar();
    //self.errorMsg.set("No Payrun available");

    self.autorun(() => {
        let currentPayrunPeriod = Template.instance().currentPayrunPeriod.get();

        self.subscribe("Payruns", currentPayrunPeriod);

        if (self.subscriptionsReady()) {
          let payRun = Payruns.find({period: currentPayrunPeriod});

          if(payRun && payRun.count() > 0)
            Template.instance().currentPayrun.set(payRun);
          else
            Template.instance().currentPayrun.set(null);
            Template.instance().errorMsg.set("No Payrun available for that time period");
        }
    });
});

Template.payruns.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.payruns.onDestroyed(function () {
});


//----------

Template.singlePayrunResult.helpers({
  'getEmployeeFullName': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
      return employee.profile.fullName;
    else
      return ""
  },
  'getEmployeeRealId': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
      return employee.employeeProfile.employeeId;
    else
      return ""
  }
});

Template.singlePayrunResult.events({
    'click .anEmployeePayResult': (e, tmpl) => {
      //console.log("this context: " + JSON.stringify(Template.parentData()));
      let thisContext = Template.parentData();

      let employee = Meteor.users.findOne({_id: thisContext.employeeId});
      let employeeFullName = "";
      if(employee)
        employeeFullName = employee.profile.fullName;
      else
        employeeFullName = null;
      //--
      let monthId = thisContext.period.substring(0,2);
      console.log("Month id: " + monthId);

      let monthName = "";
      let months = Core.months();
      months.forEach((aMonth) => {
        if(aMonth.period === monthId) {
          monthName = aMonth.name;
          return;
        }
      })
      thisContext.monthName = monthName;
      //--
      thisContext.employeeFullName = employeeFullName;
      thisContext.periodAsWords = thisContext.monthName + " " + thisContext.period.substring(2);

      Modal.show("PayRunResultModal", thisContext);
    }
});
