/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.BudgetCreate.events({
    'click #new-budget-close': (e, tmpl) => {
      Modal.hide('BudgetCreate');
    },
    'click #save': (e, tmpl) => {
      let code = $('[name=code]').val();
      let name = $('[name=name]').val();
     
      let employee =  $('[name="employee"]').val()
  
     // employees: Core.returnSelection($('[name="employee"]')),
 
  
    //   if (!budgetCode || budgetCode.trim().length === 0) {
    //     Template.instance().errorMessage.set("Please enter the budget code");
    //   } else if(!budgetName || budgetName.trim().length === 0) {
    //       Template.instance().errorMessage.set("Please enter the budget name");
    //   } 
    //   else {
        Template.instance().errorMessage.set(null);
  
        let newBudget = {
          businessId: Session.get('context'),
          code : code,
          name : name,
          employeeId :employee
         // employeeId :budgetEmployee

        };

        // let budgetContext = Core.Schemas.Budget.namedContext("budgetForm");
        // budgetContext.validate(newBudget);
        // if (budgetContext.isValid()) {
        //     console.log('Hotel is Valid!');
        // } else {
        //     console.log('Hotel is not Valid!');
        // }
        // console.log(budgetContext._invalidKeys);
  
        Meteor.call('budget/create', newBudget, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New Budget Holder added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('BudgetCreate');
            } else {
                console.log(err);
            }
        });
      
    },
  });
  
  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.BudgetCreate.helpers({  
    'checked': (prop) => {
        if(Template.instance().data)
            return Template.instance().data[prop];
        return false;
    },
    'isEqual': (a, b) => {
        return a === b;
    },

    'employees': () => {
        return Meteor.users.find({"employee": true});
    },

   selected(context,val) {
    let self = this;

    if(Template.instance().data){
        //get value of the option element
        //check and return selected if the template instce of data.context == self._id matches
        if(val){
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
        return Template.instance().data[context] === self._id ? selected="selected" : '';
    }
},
    'errorMessage': function() {
      return Template.instance().errorMessage.get()
    }
  });
  
  /*****************************************************************************/
  /* HotelCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.BudgetCreate.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)

  self.subscribe("allEmployees", businessUnitId);
  });
  
  Template.BudgetCreate.onRendered(function () {
  });
  
  Template.BudgetCreate.onDestroyed(function () {
  });
  