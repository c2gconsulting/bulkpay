/*****************************************************************************/
/* SapB1Config: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.SapB1Config.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var sapServerIpAddress = $('#sapServerIpAddress').val();
        var sapCompanyDatabaseName = $('#sapServerCompanyDatabaseName').val();
        var protocol = $('#protocol').val();

        if(sapServerIpAddress.length < 1) {
            swal("Validation error", `Please enter the I.P address of your SAP BusinessOne server`, "error");
            return
        } else if(sapServerCompanyDatabaseName.length < 1) {
            swal("Validation error", `Please enter the database name of your company on your SAP BusinessOne server`, "error");
            return
        }
        //--
        let sapConfig = {
            ipAddress : sapServerIpAddress,
            sapCompanyDatabaseName : sapCompanyDatabaseName,
            protocol : protocol
        }

        let businessUnitId = Session.get('context')
        Meteor.call('sapB1integration/testConnection', businessUnitId, sapConfig, (err, res) => {
            if (!err){
                console.log(`Test connection response: ${res}`)
                let responseAsObj = JSON.parse(res)
                console.log(responseAsObj)

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
        console.log(`PayType id: ${payTypeId}`)

        // let payTypeGlAccountCodes = Template.instance().paytypes.get(payTypeId) || {}
        // payTypeGlAccountCodes.creditGlAccountCode = payTypeGlAccountCode

        //Template.instance().paytypes.set(payTypeId, payTypeGlAccountCodes);
    },
    'blur #tab4-data-body tr input[name=payTypeDebitGlAccountCode]': (e, tmpl) => {
        let domElem = e.currentTarget;
        let payTypeGlAccountCode = domElem.value

        let domElemAsJqueryElem = $(domElem)
        let payTypeId = domElemAsJqueryElem.closest('tr').attr('id')
        console.log(`PayType id: ${payTypeId}`)

        // let payTypeGlAccountCodes = Template.instance().paytypes.get(payTypeId) || {}
        // payTypeGlAccountCodes.debitGlAccountCode = payTypeGlAccountCode

        //Template.instance().paytypes.set(payTypeId, payTypeGlAccountCodes);
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
            } else{
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

    }
});

/*****************************************************************************/
/* SapB1Config: Helpers */
/*****************************************************************************/
Template.SapB1Config.helpers({
    'costCenters': function () {
        let allUnits = EntityObjects.find({otype: 'Unit'}).fetch()
        let sapBusinessUnitConfig = Template.instance().sapBusinessUnitConfig.get()

        if(sapBusinessUnitConfig) {
            return allUnits.map(unit => {
                let currentUnit = _.find(sapBusinessUnitConfig.units, function (o) {
                    return o.unitId === unit._id;
                })
                if(currentUnit) {
                    return {label: unit.name, value: unit._id, costCenterCode: currentUnit.costCenterCode};
                } else {
                    return {label: unit.name, value: unit._id};
                }
            });
        } else {
            return allUnits.map(x => {
                return {label: x.name, value: x._id};
            })
        }
    },
    'projects': function () {
        let allProjects = Projects.find().fetch()

        let sapBusinessUnitConfig = Template.instance().sapBusinessUnitConfig.get()

        if(sapBusinessUnitConfig) {
            return allProjects.map(project => {
                let currentProject = _.find(sapBusinessUnitConfig.projects, function (o) {
                    return o.projectId === project._id;
                })
                if(currentProject) {
                    return {label: project.name, value: project._id, projectCode: currentProject.projectCode};
                } else {
                    return {label: project.name, value: project._id};
                }
            });
        } else {
            return allProjects.map(x => {
                return {label: x.name, value: x._id};
            })
        }
    },
    "paytype": () => {
        return PayTypes.find({'status': 'Active'}).fetch()
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

    //self.errorMsg = new ReactiveVar();
    self.sapBusinessUnitConfig = new ReactiveVar()
    self.units = new ReactiveVar()
    self.projects = new ReactiveVar()
    self.paytypes = new ReactiveVar()

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let sapBizUnitConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId})
            if(sapBizUnitConfig) {
                self.sapBusinessUnitConfig.set(sapBizUnitConfig)
            }

            self.units.set(EntityObjects.find({otype: 'Unit'}).fetch().map(x => {
                return {unitId: x._id, costCenterCode: ""};
            }));

            self.projects.set(Projects.find().fetch().map(x => {
                return {projectId: x._id, projectCode: ""};
            }));

            self.paytypes.set(PayTypes.find({'status': 'Active'}).fetch())
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
