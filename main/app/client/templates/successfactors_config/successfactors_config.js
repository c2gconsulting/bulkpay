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
    },
    'sfPayTypes': function() {
        return Template.instance().sfPayTypes.get()
    },
    'isFetchingPayTypes': function() {
        return Template.instance().isFetchingPayTypes.get()
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
    self.sfPayTypes = new ReactiveVar()
    self.isFetchingPayTypes = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
            self.successFactorsConfig.set(config)

            if(config) {
                self.isFetchingPayTypes.set(true)
                Meteor.call('successfactors/fetchPaytypes', businessUnitId, (err, res) => {
                    console.log(`err: `, err)
                    self.isFetchingPayTypes.set(false)

                    if (!err) {
                        self.sfPayTypes.set(res)
                    } else {
                        swal("Server error", `Please try again at a later time`, "error");
                    }
                });
            }
        }
    });
});

Template.SuccessFactorsConfig.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");

    var self = this;
    var oldIndex, newIndex;
    // fix a little rendering bug by clicking on step 1
    $('#step1').click();
    $('#progress-wizard-new').bootstrapWizard({
        onTabShow: function (tab, navigation, index) {
            tab.prevAll().addClass('done');
            tab.nextAll().removeClass('done');
            tab.removeClass('done');

            var $total = navigation.find('li').length;
            var $current = index + 1;

            if ($current >= $total) {
                $('#progress-wizard-new').find('.wizard .next').addClass('hide');
                $('#progress-wizard-new').find('.wizard .finish').removeClass('hide');
            } else {
                $('#progress-wizard-new').find('.wizard .next').removeClass('hide');
                $('#progress-wizard-new').find('.wizard .finish').addClass('hide');
            }

            var $percent = ($current / $total) * 100;
            $('#progress-wizard-new').find('.progress-bar').css('width', $percent + '%');
        },
        onTabClick: function (tab, navigation, index) {
            return true;
        }
    });
});

Template.SuccessFactorsConfig.onDestroyed(function () {
});
