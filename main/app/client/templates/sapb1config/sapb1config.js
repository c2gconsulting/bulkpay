/*****************************************************************************/
/* SapB1Config: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.SapB1Config.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var sapServerIpAddress = $('#sapServerIpAddress').val();
        var protocol = $("[name='protocol']:checked").val();
        console.log(`Protocol: ${protocol}`)

        var sapServername = $('#sapServername').val();
        var sapUsername = $('#sapUsername').val();
        var sapUserPassword = $('#sapUserPassword').val();

        var sapCompanyDatabaseName = $('#sapServerCompanyDatabaseName').val();
        var sapDatabaseUsername = $('#sapDatabaseUsername').val();
        var sapDatabasePassword = $('#sapDatabasePassword').val();


        if(sapServerIpAddress.length < 1) {
            swal("Validation error", `Please enter the I.P address of your SAP BusinessOne server`, "error");
            return
        } else if(sapServername.length < 1) {
            swal("Validation error", `Please enter the computer name of your SAP BusinessOne server`, "error");
            return
        } else if(sapUsername.length < 1) {
            swal("Validation error", `Please enter the SAP BusinessOne username`, "error");
            return
        } else if(sapUserPassword.length < 1) {
            swal("Validation error", `Please enter the SAP BusinessOne user password`, "error");
            return
        } else if(sapCompanyDatabaseName.length < 1) {
            swal("Validation error", `Please enter the database name of your company on your SAP BusinessOne server`, "error");
            return
        } else if(sapDatabaseUsername.length < 1) {
            swal("Validation error", `Please enter the database username`, "error");
            return
        } else if(sapDatabasePassword.length < 1) {
            swal("Validation error", `Please enter the database password`, "error");
            return
        }
        //--
        let sapConfig = {
            ipAddress : sapServerIpAddress,
            protocol : protocol,

            sapServername : sapServername,
            sapUsername : sapUsername,
            sapUserPassword : sapUserPassword,
            sapCompanyDatabaseName : sapCompanyDatabaseName,
            sapDatabaseUsername : sapDatabaseUsername,
            sapDatabasePassword : sapDatabasePassword,
        }

        tmpl.$('#testConnection').text('Connecting ... ');
        tmpl.$('#testConnection').attr('disabled', true);
        //--
        let businessUnitId = Session.get('context')
        Meteor.call('sapB1integration/testConnection', businessUnitId, sapConfig, (err, res) => {
            tmpl.$('#testConnection').text('Test Connection');
            tmpl.$('#testConnection').removeAttr('disabled');

            if (!err){
                console.log(`Test connection response: ${res}`)
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
        let unitId = domElem.getAttribute('id')
        let unitGlAccountCode = domElem.value || ""
        console.log(`unitGlAccountCode: ${unitGlAccountCode}`)

        let units = Template.instance().units.get()

        let currentUnit = _.find(units, function (o) {
            return o.unitId === unitId;
        })
        currentUnit.costCenterCode = unitGlAccountCode

        Template.instance().units.set(units);
    },
    'blur #tab3-data-body tr input': (e, tmpl) => {
        let domElem = e.currentTarget;
        let projectId = domElem.getAttribute('id')
        let projectCode = domElem.value

        let projects = Template.instance().projects.get()

        let currentProject = _.find(projects, function (o) {
            return o.projectId === projectId;
        })
        currentProject.projectCode = projectCode
        Template.instance().projects.set(projects);
    },
    'blur #tab4-data-body tr input[name=payTypeCreditGlAccountCode]': (e, tmpl) => {
        let domElem = e.currentTarget;
        let payTypeGlAccountCode = domElem.value

        let domElemAsJqueryElem = $(domElem)
        let payTypeId = domElemAsJqueryElem.closest('tr').attr('id')

        let payTypes = Template.instance().paytypes.get() || []
        let currentPayType = _.find(payTypes, function (o) {
            return o.payTypeId === payTypeId;
        })
        currentPayType.payTypeCreditAccountCode = payTypeGlAccountCode
        Template.instance().paytypes.set(payTypes);
    },
    'blur #tab4-data-body tr input[name=payTypeDebitGlAccountCode]': (e, tmpl) => {
        let domElem = e.currentTarget;
        let payTypeGlAccountCode = domElem.value

        let domElemAsJqueryElem = $(domElem)
        let payTypeId = domElemAsJqueryElem.closest('tr').attr('id')

        let payTypes = Template.instance().paytypes.get() || []

        let currentPayType = _.find(payTypes, function (o) {
            return o.payTypeId === payTypeId;
        })
        currentPayType.payTypeDebitAccountCode = payTypeGlAccountCode
        Template.instance().paytypes.set(payTypes);
    },
    'click #saveSapCostCenterCodes': (e, tmpl) => {
        console.log(`units gl account button clicked`)
        let businessUnitId = Session.get('context')

        let theUnits = Template.instance().units.get()
        console.log(`The units: ${JSON.stringify(theUnits)}`)

        Meteor.call("sapB1integration/updateUnitCostCenters", businessUnitId, theUnits, (err, res) => {
            if(res) {
                console.log(JSON.stringify(res));
                swal('Success', 'Cost center codes were successfully updated', 'success')
            } else {
                console.log(err);
            }
        })
    },
    'click #saveSapProjectCodes': (e, tmpl) => {
        let businessUnitId = Session.get('context')

        let theProjects = Template.instance().projects.get()
        console.log(`The projects: ${JSON.stringify(theProjects)}`)

        Meteor.call("sapB1integration/updateProjectCodes", businessUnitId, theProjects, (err, res) => {
            if(res) {
                console.log(JSON.stringify(res));
                swal('Success', 'Project codes were successfully updated', 'success')
            } else{
                console.log(err);
            }
        })
    },
    'click #savePayTypesGlAccounts': (e, tmpl) => {
        console.log(`paytypes gl account button clicked`)
        let businessUnitId = Session.get('context')

        let thePayTypes = Template.instance().paytypes.get()
        console.log(`The thePayTypes: ${JSON.stringify(thePayTypes)}`)

        Meteor.call("sapB1integration/updatePayTypeGlAccountCodes", businessUnitId, thePayTypes, (err, res) => {
            if(res) {
                console.log(JSON.stringify(res));
                swal('Success', 'Pay type account codes were successfully updated', 'success')
            } else{
                console.log(err);
            }
        })
    }
});

/*****************************************************************************/
/* SapB1Config: Helpers */
/*****************************************************************************/
Template.SapB1Config.helpers({
    'companyConnectionInfo': function() {
        let sapBusinessUnitConfig = Template.instance().sapBusinessUnitConfig.get()
        return sapBusinessUnitConfig
    },
    'costCenters': function () {
        return Template.instance().units.get()
    },
    'projects': function () {
        return Template.instance().projects.get()
    },
    "paytype": () => {
        return Template.instance().paytypes.get()
    }
});

/*****************************************************************************/
/* SapB1Config: Lifecycle Hooks */
/*****************************************************************************/
Template.SapB1Config.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context');

    self.subscribe('SapBusinessUnitConfigs', businessUnitId);
    self.subscribe('getCostElement', businessUnitId);
    self.subscribe("PayTypes", businessUnitId);
    self.subscribe('employeeprojects', businessUnitId);

    self.sapBusinessUnitConfig = new ReactiveVar()
    self.units = new ReactiveVar()
    self.projects = new ReactiveVar()
    self.paytypes = new ReactiveVar()

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let sapBizUnitConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId})
            self.sapBusinessUnitConfig.set(sapBizUnitConfig)

            self.units.set(EntityObjects.find({otype: 'Unit'}).fetch().map(unit => {
                if(sapBizUnitConfig) {
                    let currentUnit = _.find(sapBizUnitConfig.units, function (oldUnit) {
                        return oldUnit.unitId === unit._id;
                    })
                    if(currentUnit) {
                        _.extend(unit, currentUnit)
                    }
                }
                return unit
            }));

            self.projects.set(Projects.find().fetch().map(project => {
                if(sapBizUnitConfig) {
                    let currentProject = _.find(sapBizUnitConfig.projects, function (oldProject) {
                        return oldProject.projectId === project._id;
                    })
                    if(currentProject) {
                        _.extend(project, currentProject)
                    }
                }
                return project
            }));

            self.paytypes.set(PayTypes.find({'status': 'Active'}).fetch().map(payType => {
                if(sapBizUnitConfig) {
                    let currentPayType = _.find(sapBizUnitConfig.payTypes, function (oldPayType) {
                        return oldPayType.payTypeId === payType._id;
                    })
                    if(currentPayType) {
                        _.extend(payType, currentPayType)
                    }
                }
                return payType
            }));
        }
    });
});

Template.SapB1Config.onRendered(function () {
    $('select.dropdown').dropdown();

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

Template.SapB1Config.onDestroyed(function () {
});
