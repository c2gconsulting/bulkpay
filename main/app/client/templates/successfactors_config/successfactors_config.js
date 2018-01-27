/*****************************************************************************/
/* SuccessFactorsConfig: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.SuccessFactorsConfig.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var odataDataCenterUrl = $('#odataDataCenterUrl').val();
        var protocol = $("[name='protocol']:checked").val();

        var companyId = $('#companyId').val();
        var username = $('#username').val();
        var password = $('#password').val();

        if(odataDataCenterUrl.length < 1) {
            swal("Validation error", `Please enter the URL for your successfactors OData data center`, "error");
            return
        } else if(companyId.length < 1) {
            swal("Validation error", `Please enter the Successfactors Company ID`, "error");
            return
        } else if(username.length < 1) {
            swal("Validation error", `Please enter the Successfactors username`, "error");
            return
        } else if(password.length < 1) {
            swal("Validation error", `Please enter the Successfactors password`, "error");
            return
        }
        //--
        let businessUnitId = Session.get('context')

        let successFactorsConfig = {
            odataDataCenterUrl : odataDataCenterUrl,
            protocol : protocol,
            businessId: businessUnitId,
            companyId : companyId,
            username : username,
            password : password,
        }

        tmpl.$('#testConnection').text('Connecting ... ');
        tmpl.$('#testConnection').attr('disabled', true);
        //--
        Meteor.call('successfactorsIntegration/testConnection', businessUnitId, successFactorsConfig, (err, res) => {
            tmpl.$('#testConnection').text('Test Connection');
            tmpl.$('#testConnection').removeAttr('disabled');

            if (!err){
                let responseAsObj = JSON.parse(res)

                let dialogType = (responseAsObj.status === true) ? "success" : "error"
                swal("Connection Status", responseAsObj.message, dialogType);
            } else {
                swal("Server error", `Please try again at a later time`, "error");
            }
        });
    }
});

/*****************************************************************************/
/* SuccessFactorsConfig: Helpers */
/*****************************************************************************/
Template.SuccessFactorsConfig.helpers({
    'companyConnectionInfo': function() {
        return Template.instance().successFactorsConfig.get()
    }
});

/*****************************************************************************/
/* SuccessFactorsConfig: Lifecycle Hooks */
/*****************************************************************************/
Template.SuccessFactorsConfig.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context');

    self.subscribe('SuccessFactorsIntegrationConfigs', businessUnitId);
    
    self.successFactorsConfig = new ReactiveVar()

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
            self.successFactorsConfig.set(config)
        }
    });
});

Template.SuccessFactorsConfig.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.SuccessFactorsConfig.onDestroyed(function () {
});
