/*****************************************************************************/
/* EmployeeDelegateIndex: Event Handlers */
/*****************************************************************************/
Template.EmployeeDelegateIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('EmployeeDelegateCreate');
    },
    'click #editEmployeeDelegate': (e,tmpl) => {
        e.preventDefault();

        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'

        Modal.show('EmployeeDelegateEdit', invokeReason);
    }
});

/*****************************************************************************/
/* EmployeeDelegates: Helpers */
/***************************************************************************/
Template.EmployeeDelegateIndex.helpers({
    'pfas': function(){
      let allPfas = EmployeeDelegates.find({ createdBy: Meteor.user()._id });
      return allPfas;
    },
    'pfaCount': function(){
        return EmployeeDelegates.find({ createdBy: Meteor.user()._id }).count();
    }

});

/*****************************************************************************/
/* EmployeeDelegates: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeDelegateIndex.onCreated(function () {
    let self = this;
    self.subscribe("employeedelegates", Session.get('context'));
});

Template.EmployeeDelegateIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.EmployeeDelegateIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleEmployeeDelegate: Helpers */
/*****************************************************************************/
Template.singleEmployeeDelegate.events({
    'click #deleteEmployeeDelegate': function(e, tmpl) {
        event.preventDefault();
        let self = this;

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Delegate",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            const emailsettingId = self.data._id;
            const code = self.data.name;

            Meteor.call('employeedelegate/delete', emailsettingId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Delegate: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})

Template.singleEmployeeDelegate.helpers({
    formatDate2(dateVal){
        return moment(dateVal).format('DD MMM YYYY');
    },
});
