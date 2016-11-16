/*****************************************************************************/
/* EntityCreate: Event Handlers */
/*****************************************************************************/
Template.EntityCreate.events({
    'click #createEntity': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayType')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            name: $('[name="name"]').val(),
            parentId: getParent($('[name="level"]').val()),
            otype: $('[name="otype"]').val(),
            status: $('[name="status"]').val()
        };
        function getParent(val){
            switch (val){
                case "sibling":
                    return "same parent";
                case  "child":
                    return "self as parent";
            }
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
    }
});

/*****************************************************************************/
/* EntityCreate: Helpers */
/*****************************************************************************/
Template.EntityCreate.helpers({
    'disabled': () => {
        //checks form and enable button when all is complete
        let condition = false;
        if(condition)
            return "disabled";
        return "";
    },
    'edit': () => {
        return Template.instance().data.action == "edit";
        //use ReactiveVar or reactivedict instead of sessions..
    }
});

/*****************************************************************************/
/* EntityCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EntityCreate.onCreated(function () {
    console.log("checking data context");
    console.log(this);
});

Template.EntityCreate.onRendered(function () {
    console.log(this.data);
});

Template.EntityCreate.onDestroyed(function () {
});
