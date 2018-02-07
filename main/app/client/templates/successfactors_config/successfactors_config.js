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
    },
    'blur #tab4-data-body tr input': (e, tmpl) => {
        let domElem = e.currentTarget;
        let unitId = domElem.getAttribute('id')
        let unitGlAccountCode = domElem.value || ""

        let units = Template.instance().units.get()

        let currentUnit = _.find(units, function (o) {
            return o._id === unitId;
        })
        currentUnit.costCenterCode = unitGlAccountCode

        Template.instance().units.set(units);
    },
    'click [name="includeSfPayComponent"]': (e, tmpl) => {
        let selected = $(e.target).is(":checked");
        let selectedSfPaytypes = Template.instance().selectedSfPaytypes.get()

        let dataset = e.currentTarget.dataset;
        const businessId = Session.get('context')

        let frequency = dataset.frequencycode
        if(frequency === 'MON' || frequency === 'Monthly') {
            frequency = "Monthly"
        } else if(frequency === 'ANN') {
            frequency = "Annually"
        }

        const sfPaytype = {
            code: dataset.externalcode,
            title: dataset.name,
            frequencyCode: frequency,
            currency: dataset.currency,
            businessId: businessId,
            addToTotal: true,
            editablePerEmployee: true,
            isTimeWritingDependent: false,
            includeWithSapIntegration: false,
            type: 'Benefit',
            status: "Active"
        }

        selectedSfPaytypes[sfPaytype.code] = sfPaytype

        Template.instance().selectedSfPaytypes.set(selectedSfPaytypes)
    },
    'click [name="includeSfPayGrade"]': (e, tmpl) => {
        let selected = $(e.target).is(":checked");
        let selectedSfPaygrades = Template.instance().selectedSfPaygrades.get()

        let dataset = e.currentTarget.dataset;
        const businessId = Session.get('context')

        const sfPaygrade = {
            code: dataset.externalcode,
            description: dataset.name,
            positions: [],
            payGroups: [],
            businessId: businessId,
            payTypes: [],
            status: 'Active'
        }

        selectedSfPaygrades[sfPaygrade.code] = sfPaygrade

        Template.instance().selectedSfPaygrades.set(selectedSfPaygrades)
    },
    'click #savePaytypes': (e, tmpl) => {
        let selectedSfPaytypes = Template.instance().selectedSfPaytypes.get()
        
        Meteor.call('paytype/createFromSuccessfactors', selectedSfPaytypes, (err, res) => {
            if (!err) {
                swal('Success', 'Paytypes saved!', 'success')
            } else {
                swal("Server error", `Please try again at a later time`, "error");
            }
        });
    },
    'click #savePayGrades': (e, tmpl) => {
        let selectedSfPaygrades = Template.instance().selectedSfPaygrades.get()
        
        Meteor.call('paygrade/createFromSuccessfactors', selectedSfPaygrades, (err, res) => {
            if (!err) {
                swal('Success', 'Paygrades saved!', 'success')
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
    'sfPayGrades': function() {
        return Template.instance().sfPayGrades.get()
    },
    'sfCostCenters': function() {
        return Template.instance().sfCostCenters.get()
    },
    'costCenters': function () {
        return Template.instance().units.get()
    },
    'isFetchingPayTypes': function() {
        return Template.instance().isFetchingPayTypes.get()
    },
    'isFetchingPayGrades': function() {
        return Template.instance().isFetchingPayGrades.get()
    },
    "getCostCenterOrgChartParents": (unit) => {
        return Template.instance().getParentsText(unit)
    }
});

/*****************************************************************************/
/* SuccessFactorsConfig: Lifecycle Hooks */
/*****************************************************************************/
Template.SuccessFactorsConfig.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');

    self.subscribe('SuccessFactorsIntegrationConfigs', businessUnitId);
    self.subscribe("PayTypes", businessUnitId);
    self.subscribe('getCostElement', businessUnitId);

    self.successFactorsConfig = new ReactiveVar()
    self.sfPayTypes = new ReactiveVar()
    self.sfPayGrades = new ReactiveVar()
    self.sfCostCenters = new ReactiveVar()

    self.isFetchingPayTypes = new ReactiveVar(false)
    self.isFetchingPayGrades = new ReactiveVar(false)
    self.isFetchingCostCenters = new ReactiveVar(false)

    self.units = new ReactiveVar()

    self.selectedSfPaytypes = new ReactiveVar({})
    self.selectedSfPaygrades = new ReactiveVar({})

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
            self.successFactorsConfig.set(config)

            self.units.set(EntityObjects.find({otype: 'Unit'}).fetch().map(unit => {
                if(config) {
                    let currentUnit = _.find(config.units, function (oldUnit) {
                        return oldUnit.unitId === unit._id;
                    })
                    if(currentUnit) {
                        _.extend(unit, currentUnit)
                    }
                }
                unit.unitId = unit._id
                return unit
            }));

            if(config) {
                self.isFetchingPayTypes.set(true)

                Meteor.call('successfactors/fetchPaytypes', businessUnitId, (err, sfPaytypes) => {
                    console.log(`err: `, err)
                    self.isFetchingPayTypes.set(false)

                    if (!err) {
                        // let completePaytypes = []
                        // let bpPaytypes = PayTypes.find({}).fetch() || []
                        
                        // bpPaytypes.forEach(payType => {
                        //     let foundBpPaytype = _.find(sfPaytypes, function (sfPt) {
                        //         return sfPt.externalCode === payType.code;
                        //     })
                        //     if(foundBpPaytype) {
                        //         _.extend(payType, currentPayType)
                        //     } else {

                        //     }
                        // });

                        self.sfPayTypes.set(sfPaytypes)
                    } else {
                        swal("Server error", `Please try again at a later time`, "error");
                    }
                });
                //--
                self.isFetchingPayGrades.set(true)
                Meteor.call('successfactors/fetchPayGrades', businessUnitId, (err, sfPayGrades) => {
                    console.log(`err: `, err)
                    self.isFetchingPayGrades.set(false)

                    if (!err) {
                        self.sfPayGrades.set(sfPayGrades)
                    } else {
                        swal("Server error", `Please try again at a later time`, "error");
                    }
                });
                //--
                self.isFetchingCostCenters.set(true)
                Meteor.call('successfactors/fetchCostCenters', businessUnitId, (err, sfCostCenters) => {
                    console.log(`err: `, err)
                    self.isFetchingCostCenters.set(false)

                    if (!err) {
                        self.sfCostCenters.set(sfCostCenters)
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
