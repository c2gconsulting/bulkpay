/*****************************************************************************/
/* SupplementaryLeaveCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore';

Template.SupplementaryLeaveCreate.events({
    'click #TaxButton': (e, tmpl) => {
        event.preventDefault();
        let newTaxRuleName = $('[name="name"]').val();

        if(!newTaxRuleName || newTaxRuleName.trim().length < 1) {
            swal("Validation error", `Please enter a valid name`, "error");
            return;
        }
        let businessId = Session.get('context')
        //--
        let l = Ladda.create(tmpl.$('#TaxButton')[0]);
        l.start();
        //--
        let numberOfLeaveDays =  $('[name="numberOfLeaveDays"]').val()
        let numberOfLeaveDaysAsNumber = parseFloat(numberOfLeaveDays)

        let details = {
            businessId: businessId,
            name: $('[name="name"]').val(),
            numberOfLeaveDays: !isNaN(numberOfLeaveDaysAsNumber) ? numberOfLeaveDaysAsNumber : 0,
            employees: Core.returnSelection($('[name="employee"]')),
        };

        if(tmpl.data){//edit action for updating tax
            const tId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("supplementaryLeave/update", tId, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot update Leave Balance`, "error");
                } else {
                    swal("Successful Update!", `Leave Balance was updated successfully`, "success");
                    Modal.hide("TaxCreate");
                }
            });
        } else{ //New Action for creating paytype}
            Meteor.call('supplementaryLeave/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('SupplementaryLeaveCreate');
                    swal({
                        title: "Success",
                        text: `Leave Balance created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    err = JSON.parse(err.details);

                    _.each(err, (obj) => {
                        $('[name=' + obj.name +']').addClass('errorValidation');
                        $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);
                    })
                }
            });
        }
    },
    'click #deleteTax': (e, tmpl) => {
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover from this",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            //call backend method to delete the tax
            const ptId = tmpl.data._id;

            Meteor.call('supplementaryLeave/delete', ptId, (err, res) => {
                if(!err){
                    swal("Deleted!", `Delete successful`, "success");
                    Modal.hide("SupplementaryLeaveCreate");
                }
            });

        });
    }
});

/*****************************************************************************/
/* SupplementaryLeaveCreate: Helpers */
/*****************************************************************************/
Template.registerHelper('equals',(a,b)=>{
  return a == b;
});

Template.SupplementaryLeaveCreate.helpers({
    selected(context, val) {
        if(Template.instance().data){
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    },
    isSelected(context, val) {
        if(Template.instance().data){
            return Template.instance().data[context] === val ? true : false;
        }
    },
    selectedObj: function (x) {
        if(Template.instance().data){
            let self = this;
            let selected;
            let prop = Template.instance().data[x];
            selected = _.find(prop, function(r) {
                return r ===  self._id;
            });
            if (selected){
                return "selected"
            }
        }
    },
    modalHeaderTitle: function() {
      return Template.instance().data.modalHeaderTitle || "New Leave Balance";
    },
    edit() {
        return Template.instance().data ? true : false
    },
    employees: () => {
        return Meteor.users.find({"employee": true});
    }
});

/*****************************************************************************/
/* SupplementaryLeaveCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.SupplementaryLeaveCreate.onCreated(function () {
    let self = this
    let businessUnitId = Session.get('context');

    self.subscribe("allEmployees", businessUnitId);
    //--
    this.dict = new ReactiveDict();

    //--
    if(self.data){

    } else {

    }

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            self.paytypes.set(PayTypes.find({'status': 'Active'}).fetch())
        }
    })
});

Template.SupplementaryLeaveCreate.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();
});

Template.SupplementaryLeaveCreate.onDestroyed(function () {
});
