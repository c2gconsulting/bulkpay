
/*****************************************************************************/
/* PayrunApproval: Event Handlers */
/*****************************************************************************/

let littleHelpers = {
    paddArrayWithZeros: function(array, fullLengthWithZeros) {
        let lengthOfArray = array.length
        for(let i = 0; i < fullLengthWithZeros - lengthOfArray; i++) {
            array.push(0)
        }
    }
}


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
              if(res) {
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
       
       let headersAndNetPayData = tmpl.netPayReportResults.get()
       let netPayData = headersAndNetPayData.data       

       if(netPayData && netPayData.length > 0) {
           let userIds = []
           let employeePayments = _.reduce(netPayData, function(employeePaysSoFar, item ) {
               if(item[2] === bank) {
                   userIds.push(item[0])

                   return employeePaysSoFar.concat({
                        userId: item[0],
                        fullName: item[1],
                        amount: item[4]
                    })
               } else {
                   return employeePaysSoFar
               }
            }, [])
            let selectedMonth = tmpl.selectedMonth.get()
            let selectedYear = tmpl.selectedYear.get()

            Modal.show('PayrunApprovalEmployees', {
                bankName: bank, 
                userIds: userIds, 
                periodFormat: `${selectedMonth}${selectedYear}`, 
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
    'header': () => {
        let rawData = Template.instance().netPayReportResults.get();
        let headers = rawData.headers
        console.log(`headers: `, headers)
        
        let arrayToReturn = []

        for(let i = 0; i < headers.length; i++) {
            if(i > 0 && i !== 1) {
                arrayToReturn.push(headers[i])
            }
        }
        return arrayToReturn
    },
    'processedNetPayResults': function() {
        return Template.instance().processedNetPayResults.get() || [];
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
    'splice': (array, index) => {
        if(array && array.length > 1) {
            return array.splice(index)
        }
    },
    'isGreaterThan': (a, b) => {
        return a > b
    },
    'arrayLength': (array) => {
        if(array) {
            return array.length
        }
        return 0
    },
    'add': (a, b) => {
        return a + b
    },
    'subtract': (a, b) => {
        return a - b
    },
    getItemAtArrayIndex: (array, index) => {
        return array[index]
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
    'doesCurrentUserApprovalExist': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig) {
            let currentPayrun = Template.instance().currentPayrun.get() || []
            let firstOne = currentPayrun[0]

            if(firstOne) {
                if(firstOne.approvals && firstOne.approvals.length > 0) {
                    return _.find(firstOne.approvals, anApproval => {
                        return anApproval.approvedBy === Meteor.userId()
                    })
                }
            }
        }
    },
    'doesPayrunExistForPeriod': function() {
        let selectedMonth = Template.instance().selectedMonth.get()
        let selectedYear = Template.instance().selectedYear.get()

        const currentPayrunPeriod = selectedMonth + selectedYear

        if(currentPayrunPeriod) {
            return Payruns.find({period: currentPayrunPeriod}).count() > 0;
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
        self.netPayReportResults.set(netPayResultsData)

        let groupedByBank = _.groupBy(netPayResultsData.data, '2');

        let banks = Object.keys(groupedByBank)
        let numBanks = banks.length;        

        let processedNetPayResults = []

        for(let i = 0; i < numBanks; i++) {
            let bankName = banks[i]
            let employeePayments = groupedByBank[bankName]
            let maxNumNetPaysSoFar = 0
            let totalNetPays = []

            employeePayments.forEach(anEmployeeNetPayData => {
                let netPaysInDiffCurrencies = anEmployeeNetPayData.splice(4)
                let numNetPays = netPaysInDiffCurrencies.length
                littleHelpers.paddArrayWithZeros(totalNetPays, numNetPays)

                // if(numNetPays > maxNumNetPaysSoFar) {
                //     let numExtraSlots = numNetPays - maxNumNetPaysSoFar
                //     for(let k = 0; k < numExtraSlots; k++) {
                //         totalNetPays.push(0)
                //     }
                //     maxNumNetPaysSoFar = numNetPays                    
                // }
                netPaysInDiffCurrencies.forEach((aNetPay, netPayIndex) => {
                    totalNetPays[netPayIndex] += aNetPay || 0
                })
            })
            let bankData = [bankName]
            totalNetPays.forEach(aNetPay => {
                bankData.push(aNetPay)
            })
            processedNetPayResults.push(bankData)

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
                if(res) {
                    self.processNetPayResultsData(res)
                } else {
                    self.netPayReportResults.set(null);
                    self.processedNetPayResults.set(null)
                }
            });
        }
    }

    self.autorun(() => {
        let selectedMonth = self.selectedMonth.get()
        let selectedYear = self.selectedYear.get()

        const currentPayrunPeriod = selectedMonth + selectedYear

        let payrunSubs = self.subscribe("Payruns", currentPayrunPeriod, Session.get('context'));
        let payrunApprovalConfigSubs = self.subscribe('PayrollApprovalConfigs', Session.get('context'));

        if (payrunSubs.ready() && payrunApprovalConfigSubs.ready()) {  
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
    
    $("html, body").animate({ scrollTop: 0 }, "slow");

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
