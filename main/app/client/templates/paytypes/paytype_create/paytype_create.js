/*****************************************************************************/
/* PaytypeCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda'
Template.PaytypeCreate.events({
    'click #PayType': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayType')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            code: $('[name="code"]').val(),
            title: $('[name="title"]').val(),
            type: $('[name="type"]').val(),
            derivative: $('[name="derivative"]').val(),
            frequency: $('[name="frequency"]').val(),
            taxable: returnBool($('[name="taxable"]').val()),
            currency: $('[name="currency"]').val(),
            status: $('[name="status"]').val(),
            editablePerEmployee: returnBool($('[name="editablePerEmployee"]').val()),
            isBase: $('[name="isBase"]').is(':checked') ? true : false
        };
        function returnBool(val){
            if(val === "Yes") return true;
            return false;
        };
        if(tmpl.data){//edit action for updating paytype
            const ptId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("paytype/update", tmpl.data._id, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update paytype ${code}`, "error");
                } else {
                    swal("Successful Update!", `Succesffully update paytype ${code}`, "success");
                    Modal.hide("PaytypeCreate");
                }
            });

        } else{ //New Action for creating paytype}
            Meteor.call('paytype/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('PaytypeCreate');
                    swal({
                        title: "Success",
                        text: `Company Created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    err = JSON.parse(err.details);
                    // add necessary handler on error
                    //use details from schema.key to locate html tag and error handler
                    _.each(err, (obj) => {
                        $('[name=' + obj.name +']').addClass('errorValidation');
                        $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);

                    })
                }
            });
        }
    },
    'click #deletePaytype': (e, tmpl) => {
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Paytype",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            //call backend method to delete the paytype
            const ptId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call('paytype/delete', ptId, (err, res) => {
                if(!err){
                    swal("Deleted!", `Paytype ${code} has been deleted.`, "success");
                    Modal.hide("PaytypeCreate");
                }
            });

        });
    }
});

/*****************************************************************************/
/* PaytypeCreate: Helpers */
/*****************************************************************************/
Template.PaytypeCreate.helpers({
    'edit': () => {
        return Template.instance().data ? true:false;
        //use ReactiveVar or reactivedict instead of sessions..
    },
    'paytype': () => {
        return Template.instance().data.code;
    },
    'checked': () => {
        if(Template.instance().data)
            return Template.instance().data.isBase ? true:false;
        return false;
    },
    selected: function (context, val) {
        if(Template.instance().data){
            //get value of the option element
            //check and return selected if the template instce of data.val matches
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    },
    'currencies': () => {
        return Core.currencies();
    }
});

/*****************************************************************************/
/* PaytypeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.PaytypeCreate.onCreated(function () {

});

Template.PaytypeCreate.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();
    //if the data context of template.instance().data is empty then the action is new as template.instance.data will be undefined
    //change id of save button to update and populate input/select domobjects with required value
    //also pass a button for delete.


});

Template.PaytypeCreate.onDestroyed(function () {
});
