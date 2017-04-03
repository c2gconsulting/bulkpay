/*****************************************************************************/
/* PaygroupCreate: Event Handlers */
/*****************************************************************************/
import Ladda from "ladda";

Template.PaygroupCreate.events({
    'click #PayGroupButton': (e, tmpl) => {
        event.preventDefault();
        let payGroupCode = $('[name="code"]').val()
        let payGroupName = $('[name="name"]').val()
        let payGroupTax =  $('[name="tax"]').val()

        if(payGroupCode.length < 1) {
            swal("Validation error", `Please enter the code for this paygroup`, "error");
            return
        } else if(payGroupName.length < 1) {
            swal("Validation error", `Please enter the name for this paygroup`, "error");
            return
        } else if(payGroupTax.length < 1) {
            swal("Validation error", `Please choose a tax rule for this paygroup`, "error");
            return
        }

        let l = Ladda.create(tmpl.$('#PayGroupButton')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            code: $('[name="code"]').val(),
            name: $('[name="name"]').val(),
            tax: $('[name="tax"]').val(),
            pension: $('[name="pension"]').val(),
            status: $('[name="status"]').val()
        };
        if(tmpl.data){//edit action for updating tax
            const pgId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("payGroup/update", pgId, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update Pay Group ${code}`, "error");
                } else {
                    swal("Successful Update!", `Succesffully update Pay Group ${code}`, "success");
                    Modal.hide("PaygroupCreate");
                }
            });

        } else{ //New Action for creating paytype}
            Meteor.call('payGroup/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('TaxCreate');
                    swal({
                        title: "Success",
                        text: `Pay Group Created`,
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
    'click #deletePayGroup': (e, tmpl) => {
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this pay group",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            //call backend method to delete the tax
            const pgId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call('payGroup/delete', pgId, (err, res) => {
                if(!err){
                    swal("Deleted!", `tax ${code} has been deleted.`, "success");
                    Modal.hide("PaygroupCreate");
                }
            });

        });
    }
});

/*****************************************************************************/
/* PaygroupCreate: Helpers */
/*****************************************************************************/
Template.PaygroupCreate.helpers({
    pensionList() {
        return Pensions.find();
    },
    taxList(){
        return Tax.find();
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
    }
});

/*****************************************************************************/
/* PaygroupCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.PaygroupCreate.onCreated(function () {
    let self = this;
    self.subscribe("taxes", Session.get('context')); //subscribe to taxes pubs
    self.subscribe("pensions", Session.get('context'));
});

Template.PaygroupCreate.onRendered(function () {
    self.$('select.dropdown').dropdown();
});

Template.PaygroupCreate.onDestroyed(function () {
});
