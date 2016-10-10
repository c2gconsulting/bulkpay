import Ladda from 'ladda';
/*****************************************************************************/
/* PensionCreate: Event Handlers */
/*****************************************************************************/
Template.PensionCreate.events({
    'click #Pension': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#Pension')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            code: $('[name="code"]').val(),
            name: $('[name="name"]').val(),
            payTypes: returnSelection($('[name="payTypes"]')),
            employerContributionRate: +$('[name="employerContributionRate"]').val(),// converts empty string to 0
            employeeContributionRate: +$('[name="employeeContributionRate"]').val(),// converts empty string to 0
            status: $('[name="status"]').val()
        };

        function returnSelection(selection){
            let options = [];
            let selected = selection.find("option:selected");
            _.each(selected, function(select){
                options.push(select.value)
            });
            return _.uniq(options);
        };

        if(tmpl.data){//edit action for updating paytype
            const penId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("pension/update", tmpl.data._id, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update pension ${code}`, "error");
                } else {
                    swal("Successful Update!", `Succesffully update pension ${code}`, "success");
                    Modal.hide("PensionCreate");
                }
            });

        } else{ //New Action for creating paytype}
            Meteor.call('pension/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('PensionCreate');
                    swal({
                        title: "Success",
                        text: `Pension Rule Created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    console.log(err);
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
    'click #deletePension': (e, tmpl) => {
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Pension Rule",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            //call backend method to delete the paytype
            const psId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call('pension/delete', psId, (err, res) => {
                if(!err){
                    swal("Deleted!", `Pension ${code} has been deleted.`, "success");
                    Modal.hide("PensionCreate");
                }
            });

        });
    }

});

/*****************************************************************************/
/* PensionCreate: Helpers */
/*****************************************************************************/
Template.PensionCreate.helpers({
    paytypes: function(){
        return PayTypes.find();
    },
    selectedPaytypes: function () {
        let self = this;
        let selected;
        let payTypes = Template.instance().data.payTypes;
        selected = _.some(payTypes, function(r) {
            return r ===  self._id;
        });
        if (selected){
            return "selected"
        }
    },
    selected: function (context, val) {
        if(Template.instance().data){
            //get value of the option element
            //check and return selected if the template instce of data.val matches
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    },
    edit: function(){
        return Template.instance().data ? true : false;
    }
});

/*****************************************************************************/
/* PensionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionCreate.onCreated(function () {
    var self = this;
    //get all paytypes defined for the business
    self.subscribe("PayTypes", Session.get('context'));
});

Template.PensionCreate.onRendered(function () {
    self.$('select.dropdown').dropdown();
});

Template.PensionCreate.onDestroyed(function () {
});
