/*****************************************************************************/
/* EmployeePayrollDetailsDataEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeePayrollDetailsDataEntry.events({
    'click #save-close': (e, tmpl) => {
      Modal.hide('EmployeePayrollDetailsDataEntry');
    },
    'click #save': (e, tmpl) => {
      Modal.hide('EmployeePayrollDetailsDataEntry');
    }
});

/*****************************************************************************/
/* EmployeePayrollDetailsDataEntry: Helpers */
/*****************************************************************************/
Template.EmployeePayrollDetailsDataEntry.helpers({
    'employees': function(){
        return Meteor.users.find({"employee": true});
    },
    positions: () => {
        return EntityObjects.find();
    },
    'assignable': () => {
      return Session.set("selectedEmployee_employmentDetails_assignedPayTypes");
    },
});

/*****************************************************************************/
/* EmployeePayrollDetailsDataEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePayrollDetailsDataEntry.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeePayrollDetailsDataEntry.onRendered(function () {
  $('select.dropdown').dropdown();
  let self = this;
  let rules = new ruleJS('calc');
  rules.init();
  self.autorun(function(){
      //rerun computation if assigned value changes
      var parentTmplInstance = self.view.parentView.templateInstance();
      this.assignedTypes = parentTmplInstance.assignedTypes;

      let assigned = assignedTypes.get();
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
                      x.parsedValue = parsed.result.toFixed(2);
                      x.monthly = (parsed.result / 12).toFixed(2);
                      //set default inputed as parsed value if not editable per employee
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
    })
});

Template.EmployeePayrollDetailsDataEntry.onDestroyed(function () {
});
