/*****************************************************************************/
/* SapHanaConfig: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.SapHanaConfig.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var serverHostUrl = $('#serverHostUrl').val();
        var protocol = $("[name='protocol']:checked").val();
        var username = $('#username').val();
        var password = $('#password').val();

        if(serverHostUrl.length < 1) {
            swal("Validation error", `Please enter the URL for your successfactors OData data center`, "error");
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

        let hanaConfig = {
            serverHostUrl : serverHostUrl,
            protocol : protocol,
            businessId: businessUnitId,
            username : username,
            password : password,
        }

        tmpl.$('#testConnection').text('Connecting ... ');
        tmpl.$('#testConnection').attr('disabled', true);
        //--
        Meteor.call('successfactorsIntegration/testConnection', businessUnitId, hanaConfig, (err, res) => {
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
    },
    'blur #tab2-data-body tr input': (e, tmpl) => {
        let domElem = e.currentTarget;
        let paytypeId = domElem.getAttribute('id')
        let creditGlAccountCode = domElem.value || ""

        let payTypes = Template.instance().payTypes.get()

        let currentPaytype = _.find(payTypes, function (o) {
            return o._id === paytypeId;
        })
        currentPaytype.creditGLAccountCode = creditGlAccountCode

        Template.instance().payTypes.set(payTypes);
    },
    'click #savePaytypes': (e, tmpl) => {
        let businessUnitId = Session.get('context')

        let theUnits = Template.instance().units.get()

        Meteor.call("sapB1integration/updateUnitCostCenters", businessUnitId, theUnits, (err, res) => {
            if(res) {
                swal('Success', 'Cost center codes were successfully updated', 'success')
            } else {
                console.log(err);
                swal('Error', err.reason, 'error')
            }
        })
    },
});

/*****************************************************************************/
/* SapHanaConfig: Helpers */
/*****************************************************************************/
Template.SapHanaConfig.helpers({
    'companyConnectionInfo': function() {
        return Template.instance().sapHanaConfig.get()
    },
    'payTypes': function () {
        return Template.instance().payTypes.get()
    },
    'hanaGlAccounts': function() {
        return Template.instance().hanaGlAccounts.get()
    },
    'isFetchingPayTypes': function() {
        return Template.instance().isFetchingPayTypes.get()
    },
    'isFetchingHanaGlAccounts': function() {
        return Template.instance().isFetchingSapHanaGlAccounts.get()
    },
    // selectedCostCenter: function (context, val) {
    //     if(Template.instance().units.get()){
    //         // let units = Template.instance().units.get();
    //         units.code === val ? selected="selected" : '';
    //     }
    // },
});

/*****************************************************************************/
/* SapHanaConfig: Lifecycle Hooks */
/*****************************************************************************/
Template.SapHanaConfig.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');

    self.subscribe('SapHanaIntegrationConfigs', businessUnitId);
    self.subscribe("PayTypes", businessUnitId);
    
    self.sapHanaConfig = new ReactiveVar()
    self.sfPayTypes = new ReactiveVar()
    self.hanaGlAccounts = new ReactiveVar()

    self.isFetchingPayTypes = new ReactiveVar(false)
    self.isFetchingSapHanaGlAccounts = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})
            self.sapHanaConfig.set(config)

            self.payTypes.set(PayTypes.find({
                businessId: businessUnitId
            }).fetch())
        }
    });
});

Template.SapHanaConfig.onRendered(function () {
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

Template.SapHanaConfig.onDestroyed(function () {
});
