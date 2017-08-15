
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
                  tmpl.processedNetPayResults.set([])
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
   },
   'click .bankTotalNetPay': (e, tmpl) => {
       let bank = $(e.currentTarget).attr('data-bank')
       console.log(`selected bank: `, bank)
       
       let netPayReportResults = tmpl.netPayReportResults.get()
       if(netPayReportResults && netPayReportResults.length > 0) {
           let employeePayments = _.reduce(netPayReportResults, function(employeePaysSoFar, item ) {
               console.log(`item[1]: `, item)

               if(item[1] === bank) {
                   return employeePaysSoFar.concat({
                       fullName: item[0],
                       amount: item[3]})
               } else {
                   return employeePaysSoFar
               }
            }, [])
            console.log(`employeePayments: `, employeePayments)
            
            Modal.show('PayrunApprovalEmployees', {
                bankName: bank,
                payments: employeePayments
            });
       }
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
        let rawData = Template.instance().processedNetPayResults.get() || [];
        let arrayToReturn = []

        for(let i = 0; i < rawData.length; i++) {
            if(i > 0) {
                arrayToReturn.push(rawData[i])
            }
        }

        return arrayToReturn
    },
    'getEmployeeFullName': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.profile.fullName;
        else
        return ""
    },
    'approvalState': (approval) => {
        if(approval === true) {
            return 'Approved';
        } else if(approval === false) {
            return 'Rejected';
        } else {
            return ''
        }
    },
    'increment': (index) => {
        return index += 1;
    },
    'approvals': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig) {
            let currentPayrun = Template.instance().currentPayrun.get() || []
            let firstOne = currentPayrun[0]

            if(firstOne) {
                return firstOne.approvals
            }
        }
    },
    'doesRequirePayrunApproval': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        
        if(payrollApprovalConfig) {
            return payrollApprovalConfig.requirePayrollApproval
        } else {
            return false
        }
    },
});

/*****************************************************************************/
/* PayrunApproval: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunApproval.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context')
        
    self.netPayReportResults = new ReactiveVar();
    self.processedNetPayResults = new ReactiveVar([])

    self.currentPayrun = new ReactiveVar();
    self.currentPayrun.set(false);

    self.errorMsg = new ReactiveVar();
    //self.errorMsg.set("No Payrun available");

    self.selectedMonth = new ReactiveVar()
    self.selectedYear = new ReactiveVar()

    self.payrollApprovalConfig = new ReactiveVar()

    self.processNetPayResultsData = function(netPayResultsData) {
        netPayResultsData = netPayResultsData || []
        self.netPayReportResults.set(netPayResultsData)

        let groupedByBank = _.groupBy(netPayResultsData, '1');

        let banks = Object.keys(groupedByBank)
        let numBanks = banks.length;        

        let processedNetPayResults = []

        for(let i = 0; i < numBanks; i++) {
            let bankName = banks[i]
            let employeePayments = groupedByBank[bankName]

            var totalNetPay = _.reduce(employeePayments, function(totalNetPaySoFar, item ) {
                return totalNetPaySoFar + item[3]
            }, 0)
            //--
            processedNetPayResults.push({
                bank: bankName,
                totalNetPay: totalNetPay
            })
            self.processedNetPayResults.set(processedNetPayResults)
        }
    }


    let payrunPeriod = Router.current().params.payrunPeriod
    if(payrunPeriod) {
        let monthAndYear = payrunPeriod.split('-')

        if(monthAndYear && monthAndYear.length === 2) {
            let selecedMonth = monthAndYear[0]
            let selectedYear = monthAndYear[1]

            self.selectedMonth.set(selecedMonth)
            self.selectedYear.set(selectedYear)

            const period = selecedMonth + selectedYear;

            Meteor.call('getnetPayResult', Session.get('context'), period, function(err, res){
                if(res && res.length){
                    self.netPayReportResults.set(res);

                    self.processNetPayResultsData(res)
                } else {
                    self.netPayReportResults.set(null);
                }
            });
        }
    }

    self.autorun(() => {
        let selectedMonth = self.selectedMonth.get()
        let selectedYear = self.selectedYear.get()

        const currentPayrunPeriod = selectedMonth + selectedYear

        if(currentPayrunPeriod) {
            self.subscribe("Payruns", currentPayrunPeriod);
        }

        self.subscribe('PayrollApprovalConfigs', Session.get('context'));

        if (self.subscriptionsReady()) {  
          let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: Session.get('context')})
          self.payrollApprovalConfig.set(payrollApprovalConfig)

          let payRun = Payruns.find({period: currentPayrunPeriod}).fetch();

          if(payRun && payRun.length > 0)
            Template.instance().currentPayrun.set(payRun);
          else {
            Template.instance().currentPayrun.set(null);
            Template.instance().errorMsg.set("No Payrun available for that time period");
          }
        }
    });
});

Template.PayrunApproval.onRendered(function () {
  	let self = this
    
    self.autorun(function() {
        let selectedMonth = self.selectedMonth.get()
        let selectedYear = self.selectedYear.get()

        if(selectedMonth && selectedYear) {
            $("[name='paymentPeriod.month']").val(selectedMonth)
            $("[name='paymentPeriod.year']").val(selectedYear)
        }
    })
});

Template.PayrunApproval.onDestroyed(function () {
});
