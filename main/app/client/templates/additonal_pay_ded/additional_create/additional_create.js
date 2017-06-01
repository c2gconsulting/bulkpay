/*****************************************************************************/
/* AdditionalPayCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.AdditionalPayCreate.events({
    'click #createAdditionalPay': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#createAdditionalPay')[0]);
        l.start();
        //--
        let businessId = Session.get('context')
        const details = {
            businessId: businessId,
            paytype: $('[name="paytype"]').val(),
            employee: $('[name="employee"]').val(),
            period: `${$('[name="paymentPeriod.month"]').val() + $('[name="paymentPeriod.year"]').val()}`,
            amount: $('[name="amount"]').val()
        };

        if(tmpl.data) {
            Meteor.call("additionalPay/update", tmpl.data._id, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update additional pay ${err.reason}`, "error");
                } else {
                    swal("Success!", `Update successful`, "success");
                    Modal.hide("AdditionalPayCreate");
                }
            });
        } else{ //New Action for creating paytype}
            Meteor.call('additionalPay/create', details, Session.get('context'), (err, res) => {
                l.stop();
                console.log(err,res);
                if (res){
                    Modal.hide('AdditionalPayCreate');
                    swal({
                        title: "Success",
                        text: `Addtional Pay / deduction created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    console.log('got to the error part');
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
    'click #deleteAdditionalPay': (e, tmpl) => {
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to undo this",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            Meteor.call('additionalPay/delete', tmpl.data._id, (err, res) => {
                if(!err){
                    swal("Deleted!", `Additional pay has been deleted.`, "success");
                    Modal.hide("AdditionalPayCreate");
                }
            });
        });
    }
});

/*****************************************************************************/
/* Oneoff: Helpers */
/*****************************************************************************/
Template.AdditionalPayCreate.helpers({
    'paytypes': function(){
        return PayTypes.find();
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    'month': () => {
        return Core.months()
    },
    'years': () => {
        return Core.years();
    },
    'isEqual': (a, b) => {
        return a === b;
    },
    'edit': () => {
        return Template.instance().data ? true:false;
    },
    'periodMonth': () => {
        if(Template.instance().data) {
            let monthAndYear = Template.instance().data.period
            return monthAndYear.substring(0, 2)
        }
    },
    'periodYear': () => {
        if(Template.instance().data) {
            let monthAndYear = Template.instance().data.period
            return monthAndYear.substring(2)
        }
    },
    'checked': (prop) => {
        if(Template.instance().data)
            return Template.instance().data[prop];
        return false;
    }
});

/*****************************************************************************/
/* Oneoff: Lifecycle Hooks */
/*****************************************************************************/
Template.AdditionalPayCreate.onCreated(function () {
    let self = this;
    self.subscribe("activeEmployees", Session.get('context'));
    self.subscribe("PayTypes", Session.get('context'));
});

Template.AdditionalPayCreate.onRendered(function () {
});

Template.AdditionalPayCreate.onDestroyed(function () {
});
