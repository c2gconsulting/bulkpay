/*****************************************************************************/
/* AdditionalPayCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.AdditionalPayCreate.events({
    'click #createAdditionalPay': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#createAdditionalPay')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            paytype: $('[name="paytype"]').val(),
            employee: $('[name="employee"]').val(),
            period: `${$('[name="paymentPeriod.month"]').val() + $('[name="paymentPeriod.year"]').val()}`,
            amount: $('[name="amount"]').val()
        };
        if(tmpl.data){//edit action for updating paytype
            // const ptId = tmpl.data._id;
            // const code = tmpl.data.code;
            // Meteor.call("paytype/update", tmpl.data._id, details, (err, res) => {
            //     l.stop();
            //     if(err){
            //         swal("Update Failed", `Cannot Update paytype ${code}`, "error");
            //     } else {
            //         swal("Successful Update!", `Succesffully update paytype ${code}`, "success");
            //         Modal.hide("PaytypeCreate");
            //     }
            // });
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
