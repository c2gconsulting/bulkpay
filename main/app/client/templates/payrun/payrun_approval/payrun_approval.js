
/*****************************************************************************/
/* PayrunApproval: Event Handlers */
/*****************************************************************************/
Template.PayrunApproval.events({
  'change [name="paymentPeriod.month"]': function (e, tmpl) {
    let value = e.currentTarget.value;

    if (value && value.trim().length > 0) {
        tmpl.selectedMonth.set(value)
    }
  },
  'change [name="paymentPeriod.year"]': function (e, tmpl) {
    let value = e.currentTarget.value;

    if (value && value.trim().length > 0) {
        tmpl.selectedYear.set(value)
    }
  },
   'click .getResult': (e, tmpl) => {
      const month = $('[name="paymentPeriod.month"]').val();
      const year = $('[name="paymentPeriod.year"]').val();

      if(month && year) {
          const period = month + year;

          Meteor.call('getnetPayResult', Session.get('context'), period, function(err, res){
              if(res && res.length){
                  tmpl.netPayReportResults.set(res);

                  tmpl.processNetPayResultsData(res)
              } else {
                  tmpl.netPayReportResults.set(null);
              }
          });
      } else {
          swal('Error', 'Please select Period', 'error');
      }
   },
   'click #approve': (e, tmpl) => {
        let businessUnitId = Session.get('context')
    
        let selecedMonth = tmpl.selectedMonth.get()
        let selectedYear = tmpl.selectedYear.get()

       Meteor.call("payrollApproval/approveOrReject", businessUnitId, selecedMonth, selectedYear, true, (err, res) => {
            if(res) {
                swal('Success', 'Payrun Approved!', 'success')
            } else {
                console.log(err);
                swal("Server Error", err.message || 'An error occurred in approving the payrun', "error");
            }
        })
   },
   'click #reject': (e, tmpl) => {
        let businessUnitId = Session.get('context')
    
        let selecedMonth = tmpl.selectedMonth.get()
        let selectedYear = tmpl.selectedYear.get()

       Meteor.call("payrollApproval/approveOrReject", businessUnitId, selecedMonth, selectedYear, false, (err, res) => {
            if(res) {
                swal('Success', 'Payrun Rejected!', 'success')
            } else {
                console.log(err);
                swal("Error", err.message || 'An error occurred in rejecting the payrun', "error");
            }
        })
   }
});

/*****************************************************************************/
/* PayrunApproval: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
    return moment(date).format('MMYYYY');
});

Template.PayrunApproval.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'result': () => {
        return Template.instance().netPayReportResults.get();
    },
    'processedNetPayResults': function() {
        return Template.instance().processedNetPayResults.get();
    }
});

/*****************************************************************************/
/* PayrunApproval: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunApproval.onCreated(function () {
    let self = this;
    self.netPayReportResults = new ReactiveVar();
    self.processedNetPayResults = new ReactiveVar([])

    self.selectedMonth = new ReactiveVar()
    self.selectedYear = new ReactiveVar()

    self.processNetPayResultsData = function(netPayResultsData) {
        netPayResultsData = netPayResultsData || []

        let groupedByBank = _.groupBy(netPayResultsData, 'bank');

        let banks = Object.keys(groupedByBank)
        let numBanks = banks.length;        

        for(let i = 0; i < numBanks; i++) {
            let bankName = banks[i]
            let employeePayments = groupedByBank[bankName]

            var totalNetPay = _.reduce(employeePayments, function(totalNetPaySoFar, item ) {
                return totalNetPaySoFar + item.amount
            }, 0)
            //--
            let processedNetPayResults = self.processedNetPayResults.get()

            processedNetPayResults.push({
                bank: bankName,
                totalNetPay: totalNetPay
            })
            self.processedNetPayResults.set(processedNetPayResults)
        }
    }
});

Template.PayrunApproval.onRendered(function () {
  	self.$('select.dropdown').dropdown();
});

Template.PayrunApproval.onDestroyed(function () {
});
