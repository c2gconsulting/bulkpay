/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda'
Template.BudgetCreate.events({
    'click #new-budget-close': (e, tmpl) => {
      Modal.hide('BudgetCreate');
    },
    'click #Budget': (e, tmpl) => {
      let code = $('[name=code]').val();
      let name = $('[name=name]').val();

      let employeeId =  $('[name="employeeId"]').val();
      let financeApproverId =  $('[name="financeApproverId"]').val();
      let externalNotificationEmail = $('[name="externalNotificationEmail"]').val();

     // employees: Core.returnSelection($('[name="employee"]')),


    //   if (!budgetCode || budgetCode.trim().length === 0) {
    //     Template.instance().errorMessage.set("Please enter the budget code");
    //   } else if(!budgetName || budgetName.trim().length === 0) {
    //       Template.instance().errorMessage.set("Please enter the budget name");
    //   }
    //   else {
        Template.instance().errorMessage.set(null);

        e.preventDefault();
        let l = Ladda.create(tmpl.$('#Budget')[0]);
        l.start();

        let newBudget = {
          businessId: Session.get('context'),
          code: code,
          name: name,
          employeeId: employeeId,
          financeApproverId:financeApproverId,
          externalNotificationEmail: externalNotificationEmail

        };
        if(tmpl.data){//edit action for updating paytype
            const ptId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("budget/update", tmpl.data._id, newBudget, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update Budget Holder ${code}`, "error");
                } else {
                    swal("Successful Update!", `Successfully update Budget Holder ${code}`, "success");
                    Modal.hide("BudgetCreate");
                }
            });

        } else{

        // let budgetContext = Core.Schemas.Budget.namedContext("budgetForm");
        // budgetContext.validate(newBudget);
        // if (budgetContext.isValid()) {
        //     console.log('Hotel is Valid!');
        // } else {
        //     console.log('Hotel is not Valid!');
        // }
        // console.log(budgetContext._invalidKeys);

        Meteor.call('budget/create', newBudget, (err, res) => {
            l.stop();
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
                swal("Save Failed", "Cannot Create Budget Holder", "error");
            }
        });
    }
    },
  });

  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.BudgetCreate.helpers({
    'edit': () => {
        return Template.instance().data ? true:false;
        //use ReactiveVar or reactivedict instead of sessions..
    },
    'budget': () => {
        return Template.instance().data.code;
    },
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
    let self = this;
    self.$('select.dropdown').dropdown();
    //if the data context of template.instance().data is empty then the action is new as template.instance.data will be undefined
    //change id of save button to update and populate input/select domobjects with required value
    //also pass a button for delete.

  });

  Template.BudgetCreate.onDestroyed(function () {
  });
