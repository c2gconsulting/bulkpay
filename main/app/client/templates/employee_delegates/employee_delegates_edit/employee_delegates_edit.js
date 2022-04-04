/*****************************************************************************/
/* EmployeeDelegateEdit: Event Handlers */
/*****************************************************************************/
Template.EmployeeDelegateEdit.events({
    'click #new-employeedelegate-close': (e, tmpl) => {
      Modal.hide('EmployeeDelegateEdit');
    },
    'click #save': (e, tmpl) => {
 
      
      let employeedelegateId = $('[name=employeedelegate-name]').val();
      let employeedelegateStartDate = $('[name=employeedelegate-startDate]').val();
      let employeedelegateEndDate= $('[name=employeedelegate-endDate]').val();

      let employeedelegateName = Template.EmployeeDelegateEdit.__helpers.get("getEmployeeFullName").call(this, employeedelegateId);

     

     if(!employeedelegateName || employeedelegateName.trim().length === 0) {
          Template.instance().errorMessage.set("Please select the Delegate");
      } else {
        Template.instance().errorMessage.set(null);

        const employeedelegate = Template.instance().employeedelegate.get()

        let newEmployeeDelegate = {
          ...employeedelegate,
          businessId: Session.get('context'),
   
          name: employeedelegateName,
          userId : employeedelegateId,
          startDate :  new Date(employeedelegateStartDate),
          endDate : new Date(employeedelegateEndDate)
          
        };

   
        const { _id } = employeedelegate;
        Meteor.call('employeedelegate/update', _id, newEmployeeDelegate, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `Delegate Editted`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('EmployeeDelegateEdit');
            } else {
                console.log(err);
            }
        });
      }
    },
  });

  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.EmployeeDelegateEdit.helpers({
    'getEmployeeFullName': function(employeeId) {
      console.log('employeeId', employeeId)
      let employee = Meteor.users.findOne({_id: employeeId});
      if(employee) return employee.profile.fullName;
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
    selectedUser(val) {
       let self = this;
       const { employeedelegate } = Template.instance();
 
       if(employeedelegate){
         //get value of the option element
         //check and return selected if the template instce of data.context == self._id matches
         if(val){
             return employeedelegate.userId === val ? selected="selected" : '';
         }
         return employeedelegate.userId === self._id ? selected="selected" : '';
       }
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
    'employeedelegate': function() {
      return Template.instance().employeedelegate.get()
    },
    'errorMessage': function() {
      return Template.instance().errorMessage.get()
    }
  });

  /*****************************************************************************/
  /* HotelCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.EmployeeDelegateEdit.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');


    self.employeedelegate = new ReactiveVar()
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)


    let invokeReason = self.data;

    self.autorun(function(){

      if (invokeReason){
        let employeeDelegatesSub = self.subscribe('employeedelegate', invokeReason.requisitionId);

        // console.log('employeeDelegateDetails 333', employeeDelegatesSub.ready())
        if(employeeDelegatesSub.ready()) {
          let employeeDelegateDetails = EmployeeDelegates.findOne({_id: invokeReason.requisitionId});

          console.log('employeeDelegateDetails 444', employeeDelegateDetails)

          /* End of Pre-selection */
            self.employeedelegate.set(employeeDelegateDetails)
        }
      }
    })
  });

  Template.EmployeeDelegateEdit.onRendered(function () {
    // $('select.dropdown').dropdown('update');
  });

  Template.EmployeeDelegateEdit.onDestroyed(function () {
  });

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }