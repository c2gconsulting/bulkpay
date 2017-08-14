
/*****************************************************************************/
/* EmployeeEditEmploymentPayrollModal: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

import _ from 'underscore';
import moment from 'moment';


Template.EmployeeEditEmploymentPayrollModal.events({
  'click #saveEmployment': (e, tmpl) => {
    let user = Template.instance().getEditUser();

    let hireDate = $('[data-field="employmentHireDate"]').val()
    console.log(`hireDate: `, hireDate)

    if(hireDate) {
        hireDate = moment(hireDate).utcOffset(0, true).toDate().toUTCString()
    }
    console.log(`hireDate: `, hireDate)

    let confirmationDate = $('[data-field="employmentConfirmationDate"]').val()
    if(confirmationDate) {
        confirmationDate = moment(confirmationDate).utcOffset(0, true).toDate().toUTCString()
    }
    let terminationDate = $('[data-field="employmentTerminationDate"]').val()
    if(terminationDate) {
        terminationDate = moment(terminationDate).utcOffset(0, true).toDate().toUTCString()
    }

    user.employeeProfile.employment.hireDate = hireDate;
    user.employeeProfile.employment.confirmationDate = confirmationDate;
    user.employeeProfile.employment.terminationDate = terminationDate;
    Template.instance().setEditUser(user);
    //--
    Meteor.call('account/updateEmploymentData', user, user._id, (err, res) => {
        if (res){
            Session.set('employeesList_selectedEmployee', user);
            swal({
                title: "Success",
                text: `Employee employment data updated`,
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
            Modal.hide('EmployeeEditEmploymentPayrollModal');
        } else {
            console.log(err);
        }
    });
  },
  'click #saveEmployeePayrollPaytypes': (e, tmpl) => {
    let user = Template.instance().getEditUser();
    let payTypesArray = tmpl.getPaytypes();

    Meteor.call('account/updatePayTypesData', payTypesArray, user._id, (err, res) => {
        if (res){
            swal({
                title: "Success",
                text: `Employee pay types updated`,
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
            Modal.hide('EmployeeEditEmploymentPayrollModal');
        } else {
            console.log(err);
        }
    });
  },
  'click #saveEmployeeNetPayAllocation': (e, tmpl) => {
    let user = Template.instance().getEditUser();

    let hasNetPayAllocation = $('[name="hasNetPayAllocation"]').val() ? $('[name="hasNetPayAllocation"]').val() : null;
    let foreignCurrencyCode = $('[name="foreignCurrencyCode"]').val() ? $('[name="foreignCurrencyCode"]').val() : null;
    let rateToBaseCurrency = $('[name="rateToBaseCurrency"]').val() ? $('[name="rateToBaseCurrency"]').val() : null;
    let foreignCurrencyAmount = $('[name="foreignCurrencyAmount"]').val() ? $('[name="foreignCurrencyAmount"]').val() : null;

    if(!hasNetPayAllocation || hasNetPayAllocation.trim().length === 0) {
        swal('Validation error', 'Please set if this employee has net pay currency allocation', 'error')
        return
    }
    if(!foreignCurrencyCode || foreignCurrencyCode.trim().length === 0) {
        swal('Validation error', 'Please choose the currency', 'error')
        return
    }
    if(!rateToBaseCurrency || rateToBaseCurrency.trim().length === 0) {
        swal('Validation error', 'Please specify the currency exchange rate', 'error')
        return
    }

    if(!foreignCurrencyAmount || foreignCurrencyAmount.trim().length === 0) {
        swal('Validation error', 'Please specify the amount for net pay allocation', 'error')
        return
    }
    //--
    try {
        let hasNetPayAllocationAsBoolean = (hasNetPayAllocation === "true")
        let amountAsNumber = parseFloat(foreignCurrencyAmount)

        Meteor.call('account/netPayAllocation', user._id, hasNetPayAllocationAsBoolean, 
            foreignCurrencyCode, rateToBaseCurrency, amountAsNumber, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `Employee Net Pay Allocation details saved`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('EmployeeEditEmploymentPayrollModal');
            } else {
                console.log(err);
            }
        });
    } catch(e) {
        swal('Validation error', 'Amount specified is not a number', 'error')
    }
  },
  'change [name=employmentPosition]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.position = value;

      tmpl.selectedPosition.set(value);
    }
    Template.instance().setEditUser(user);
  },
  'change [name=employmentPayGrade]': function(e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.employment = user.employeeProfile.employment || {};
        user.employeeProfile.employment.paygrade = value;

        tmpl.selectedGrade.set(value);
      }
      Template.instance().setEditUser(user);
  },
  'blur [name=employmentHireDate]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.hireDate = value;
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=employmentConfirmationDate]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.confirmationDate = value;
    }
    Template.instance().setEditUser(user);
  },
  'change [name=employmentStatus]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.status = value;
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=employmentTerminationDate]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.terminationDate = value;
    }
    Template.instance().setEditUser(user);
  },
  'blur .payAmount': (e,tmpl) => {
      let entered = $(e.target).val();
      let id = $(e.target).attr('id');
      let assigned = tmpl.assignedTypes.get();
      if(assigned){
          let index = _.findIndex(assigned, {_id: id});
          if(index !== -1){
              assigned[index].inputed = entered;
              tmpl.assignedTypes.set(assigned);
          }
      }

      if(entered){
         if(isNaN(entered)){
             $(e.target).addClass('errorValidation');
         } else {
             $(e.target).removeClass('errorValidation');
         }
      }
  }
});

/*****************************************************************************/
/* EmployeeEditEmploymentPayrollModal: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MM-DD-YYYY');
});

Template.EmployeeEditEmploymentPayrollModal.helpers({
  "selectedEmployee": function() {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      return [selectedEmployee];
  },
  positions: () => {
      return EntityObjects.find();
  },
  isEqual: (a, b) => {
    return a === b;
  },
  'states': () => {
      return Core.states();
  },
  'countries': () => {
      return Core.IsoCountries();
  },
  'defaultCountry': (ccode) => {
      return ccode === Core.country ? selected="selected":"";
  },
  'selectedPosition': () => {
      return Template.instance().selectedPosition.get();
  },
  'grades': () => {
      let thePayGrades = PayGrades.find();
      if(thePayGrades.count() == 1) {
        Template.instance().selectedGrade.set(thePayGrades.fetch()[0]._id);
      }
      return thePayGrades;
  },
  'assignable': () => {
     return Template.instance().assignedTypes.get();
  },
  'increment': (index) => {
      return index += 1;
  },
  'disabled': (id) => {
      let paytype = PayTypes.findOne({_id: id});
      if(paytype){
          return paytype.editablePerEmployee? '':'disabled';
      }
  },
  'allCurrencies': () => {
      return Core.currencies();
  },

    'baseCurrency': function() {
        return Core.getTenantBaseCurrency().iso;
    },
    selectedNetPayAllocation: function(currency) {
        let user = Template.instance().getEditUser();
        if(user) {
            return user.employeeProfile.employment.netPayAllocation
        }
    },
    hasNetPayAllocation: function() {
        let user = Template.instance().getEditUser();
        if(user) {
            let netPayAllocation = user.employeeProfile.employment.netPayAllocation
            if(netPayAllocation) {
                return (netPayAllocation.hasNetPayAllocation === true) ? "selected" : ''   
            }
        }
    },
    hasNetPayAllocationCurrency: function(currency) {
        let user = Template.instance().getEditUser();
        if(user) {
            let netPayAllocation = user.employeeProfile.employment.netPayAllocation
            if(netPayAllocation) {
                return (netPayAllocation.foreignCurrency === currency) ? "selected" : ''   
            }
        }
    },
    netPayAllocationRateToBaseCurrency: function() {
        let user = Template.instance().getEditUser();
        if(user) {
            let netPayAllocation = user.employeeProfile.employment.netPayAllocation
            if(netPayAllocation) {
                return (netPayAllocation.rateToBaseCurrency) || ''
            }
        }
    },
    hasNetPayAllocationAmount: function() {
        let user = Template.instance().getEditUser();
        if(user) {
            let netPayAllocation = user.employeeProfile.employment.netPayAllocation
            if(netPayAllocation) {
                return (netPayAllocation.foreignCurrencyAmount) || ''
            }
        }
    }
});

/*****************************************************************************/
/* EmployeeEditEmploymentPayrollModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEditEmploymentPayrollModal.onCreated(function () {
  var self = this;

  self.getEditUser = () => {
    return Session.get('employeeEmploymentDetailsData');
  }

  self.setEditUser = (editUser) => {
    Session.set('employeeEmploymentDetailsData', editUser);
  }

  self.getPaytypes = () => {
      let assigned = Template.instance().assignedTypes.get();
      if(assigned){
          let wage = assigned.map(x => {
              return {paytype: x.paytype, value: x.inputed}
          });
        return wage;
      }
  };

  let selectedEmployee = Session.get('employeesList_selectedEmployee')
  self.setEditUser(selectedEmployee);
  //--
  self.selectedPosition = new ReactiveVar();
  self.selectedPosition.set(selectedEmployee.employeeProfile.employment.position);

  self.selectedGrade = new ReactiveVar();
  self.selectedGrade.set(selectedEmployee.employeeProfile.employment.paygrade);

  self.assignedTypes = new ReactiveVar();

  self.subscribe("getPositions", Session.get('context'));
  self.subscribe("getbuconstants", Session.get('context'));
  self.subscribe("PayTypes", Session.get('context'));

  self.changePayTypesForSelectedPayGrade = (selectedGrade) => {
    let grade = PayGrades.findOne({_id: selectedGrade});

    if (grade){
        let paytypes = null;
        let paytypeIds = grade.payTypes.map(x => {
            return x.paytype;
        });
        //--
        let selectedEmployee = Session.get('employeesList_selectedEmployee')

        if(selectedEmployee.employeeProfile.employment.paygrade === selectedGrade 
            && (selectedEmployee.employeeProfile.employment.paytypes)) {
          paytypes = selectedEmployee.employeeProfile.employment.paytypes;

          let paytypesFromPayGrade = grade.payTypes.map(x => {
              return x;
          });

          paytypes = paytypes.map(x => {
            let pt = PayTypes.findOne({_id: x.paytype});
            if(pt) {
              if(x.value) {
                  pt.inputed = x.value;
              } else {
                  let foundPayType = _.find(paytypesFromPayGrade, function(aPatype) {
                      return (aPatype.paytype === x.paytype)
                  })
                  if(foundPayType) {
                      x.value = foundPayType.value
                  }
              }
              _.extend(x, pt);
              return x;
            }
          });
        } else {
          paytypes = grade.payTypes.map(x => {
              return x;
          });

          paytypes = paytypes.map(x => {
            let pt = PayTypes.findOne({_id: x.paytype});
            if(pt) {
              //This is necessary so that x still has the 'value' key
              _.extend(x, pt);
            }
            return x;
          });
        }
        Template.instance().assignedTypes.set(paytypes);
    }
  }

  self.autorun(function(){
      let position = Template.instance().selectedPosition.get();
      if(position) {
        self.subscribe("assignedGrades", position);

        let selectedGrade = Template.instance().selectedGrade.get();

        if(selectedGrade) {
          let payGradeSubscription = self.subscribe("paygrade", selectedGrade);

          if(payGradeSubscription.ready()) {
            self.changePayTypesForSelectedPayGrade(selectedGrade);
          } else {
          }
        }
      }
  });
});

Template.EmployeeEditEmploymentPayrollModal.onRendered(function () {
  let selectedEmployee = Session.get('employeesList_selectedEmployee');

  $('[name="employmentPosition"]').val(selectedEmployee.employeeProfile.employment.position);
  $('[name="employmentStatus"]').val(selectedEmployee.employeeProfile.employment.status);

  $('select.dropdown').dropdown();

  let self = this;
  let rules = new ruleJS('calc');
  rules.init();

  self.autorun(function(){
      //rerun computation if assigned value changes
      let assigned = self.assignedTypes.get();

      let input = $('input[type=text]');
      if(assigned){
          assigned.forEach((x,index) => {
              let formula = x.inputed || x.value;
              if(formula){
                  //replace all wagetypes with values
                  for (var i = 0; i < index; i++) {
                      if(assigned[i].code){
                          const code = assigned[i].code? assigned[i].code.toUpperCase():assigned[i].code;
                          const regex = getPayRegex(code);
                          formula = formula.replace(regex, assigned[i].parsedValue);
                      }
                  }
                  //do the same for all contansts and replace the values
                  //will find a better way of doing this... NOTE
                  let k = Constants.find().fetch();
                  k.forEach(c => {
                      const code = c.code? c.code.toUpperCase():c.code;
                      const regex = getPayRegex(code);
                      formula = formula.replace(regex, c.value);
                  });
                  var parsed = rules.parse(formula, input);
                  if (!isNaN(parsed.result)) {
                      if(parsed.result) {
                        x.parsedValue = parsed.result.toFixed(2);
                        x.monthly = (parsed.result / 12).toFixed(2);
                        //set default inputed as parsed value if not editable per employee
                      } else {
                        console.log("[Autorun] x.parsed.result is NULL");
                        x.parsedValue = 0;
                        x.monthly = 0;
                      }
                  }
                  //
                  if (parsed.error) {
                      x.parsedValue = parsed.error;
                      x.monthly = ""

                  }
              } else {
                  x.parsedValue = "";
                  x.monthly = "";
              }
          });
      }
    });
});

Template.EmployeeEditEmploymentPayrollModal.onDestroyed(function () {
});
