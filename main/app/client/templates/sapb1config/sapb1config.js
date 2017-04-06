/*****************************************************************************/
/* SapB1Config: Event Handlers */
/*****************************************************************************/

Template.SapB1Config.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var sapServerIpAddress = $('#sapServerIpAddress').val();
        var sapServerCompanyDatabaseName = $('#sapServerCompanyDatabaseName').val();

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
            companyDatabaseName : sapServerCompanyDatabaseName
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
        let unitGlAccountCode = domElem.value

        //Template.instance().units(unitId, unitGlAccountCode);
    },
    'blur #tab3-data-body tr input': (e, tmpl) => {
        let domElem = e.currentTarget;
        let projectId = domElem.getAttribute('id')
        let projectGlAccountCode = domElem.value

        //Template.instance().projects(projectId, projectGlAccountCode);
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
    'click #saveUnitsGlAccounts': (e, tmpl) => {
        console.log(`units gl account button clicked`)

    },
    'click #saveProjectsGlAccounts': (e, tmpl) => {
        console.log(`projects gl account button clicked`)

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
        return Template.instance().units.get()
    },
    'projects': function () {
        let allProjects = Projects.find().fetch().map(x => {
                return {label: x.name, value: x._id};
        });
        console.log(`projects: ${JSON.stringify(allProjects)}`)

        return allProjects;
    },
    "paytype": () => {
        return Template.instance().paytypes.get();
    },
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
            let sapBizUnitConfig = SapBusinessUnitConfigs.find().fetch()
            if(sapBizUnitConfig) {
                self.sapBusinessUnitConfig.set(sapBizUnitConfig)
            }

            // self.data.payTypes.forEach(x=>{
            //     let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
            //     delete ptype.paytype;
            //     _.extend(x, ptype);
            //     return x;
            // });

            self.units.set(EntityObjects.find({otype: 'Unit'}).fetch().map(x => {
                return {label: x.name, value: x._id};
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
