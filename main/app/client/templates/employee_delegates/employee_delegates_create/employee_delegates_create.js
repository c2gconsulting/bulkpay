/*****************************************************************************/
/* EmployeeDelegateCreate: Event Handlers */
/*****************************************************************************/
Template.EmployeeDelegateCreate.events({
    'click #new-employeedelegate-close': (e, tmpl) => {
      Modal.hide('EmployeeDelegateCreate');
    },
    'click #save': (e, tmpl) => {
 
      let employeedelegateId = $('[name=employeedelegate-name]').val();
      let employeedelegateStartDate = $('[name=employeedelegate-startDate]').val();
      let employeedelegateEndDate= $('[name=employeedelegate-endDate]').val();

      let employeedelegateName = Template.EmployeeDelegateCreate.__helpers.get("getEmployeeFullName").call(this, employeedelegateId);

     if(!employeedelegateId || employeedelegateId.trim().length === 0) {
          Template.instance().errorMessage.set("Please select the Delegate");
      }
      else {
        Template.instance().errorMessage.set(null);

        let newEmployeeDelegate = {
          businessId: Session.get('context'),

          name: employeedelegateName,
          userId : employeedelegateId,
          createdBy: Meteor.user()._id,
          startDate :  new Date(employeedelegateStartDate),
          endDate : new Date(employeedelegateEndDate)
          
        };


        console.log('newEmployeeDelegate', JSON.stringify(newEmployeeDelegate));

        Meteor.call('employeedelegate/create', newEmployeeDelegate, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New Email Setting added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('EmployeeDelegateCreate');
            } else {
                console.log(err);
            }
        });
      }
    },
  });

  /*****************************************************************************/
  /* EmployeeDelegateCreate: Helpers */
  /*****************************************************************************/
  Template.EmployeeDelegateCreate.helpers({
    'getEmployeeFullName': function(employeeId) {
      console.log('employeeId', employeeId)
      let employee = Meteor.users.findOne({_id: employeeId});
      if(employee)
      return employee.profile.fullName;
      else
      return "Select Employee"
    },
    formatDate(dateVal){
        return moment(dateVal).format('YYYY-MM-DD');
    },
    formatDate2(dateVal){
        return moment(dateVal).format('DD MMM YYYY');
    },
    'employees': () => {
      return Meteor.users.find({employee: true});
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
  /* EmployeeDelegateCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.EmployeeDelegateCreate.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("allEmployees", Router.current().params._id);
    self.subscribe("employeedelagates", businessUnitId, Meteor.user()._id);
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)


  });

  Template.EmployeeDelegateCreate.onRendered(function () {
  });

  Template.EmployeeDelegateCreate.onDestroyed(function () {
  });
