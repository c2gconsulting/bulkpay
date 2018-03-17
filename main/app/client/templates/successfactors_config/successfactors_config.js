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
    'blur #tab4-data-body tr select': (e, tmpl) => {
        let domElem = e.currentTarget;
        const dataset = domElem.dataset;
        let unitId = dataset.unitid
        let sfCostCenterCode = domElem.value
        console.log(`sfCostCenterCode: `, sfCostCenterCode)

        let selectedUnits = Template.instance().selectedUnits.get()
        selectedUnits[unitId] = {
            unitId: unitId,
            costCenterCode: sfCostCenterCode
        }

        Template.instance().selectedUnits.set(selectedUnits);
    },
    'click [name="includeSfPayComponent"]': (e, tmpl) => {
        let selected = $(e.target).is(":checked");
        let selectedSfPaytypes = Template.instance().selectedSfPaytypes.get()

        let dataset = e.currentTarget.dataset;
        const businessId = Session.get('context')

        if(selected) {
            let frequency = dataset.frequency
            if(frequency === 'MON' || frequency === 'Monthly') {
                frequency = "Monthly"
            } else if(frequency === 'ANN') {
                frequency = "Annually"
            }
    
            const sfPaytype = {
                code: dataset.externalcode,
                title: dataset.name,
                frequencyCode: frequency,
                currency: dataset.currency || "NGN",
                businessId: businessId,
                addToTotal: true,
                editablePerEmployee: true,
                isTimeWritingDependent: false,
                includeWithSapIntegration: false,
                successFactors: {
                  externalCode: dataset.externalcode
                },
                type: 'Benefit',
                status: "Active"
            }
            selectedSfPaytypes[sfPaytype.code] = sfPaytype    
        } else {
            if(selectedSfPaytypes[dataset.externalcode]) {
                delete selectedSfPaytypes[dataset.externalcode]
            }
        }

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
            successFactors: {
              externalCode: dataset.externalcode
            },
            payTypes: [],
            status: 'Active'
        }

        selectedSfPaygrades[sfPaygrade.code] = sfPaygrade

        Template.instance().selectedSfPaygrades.set(selectedSfPaygrades)
    },
    'click [name="includeSfProject"]': (e, tmpl) => {
        let selected = $(e.target).is(":checked");
        let selectedSfProjects = Template.instance().selectedSfProjects.get()

        let dataset = e.currentTarget.dataset;
        const businessId = Session.get('context')
        let description = dataset.description;
        if(!description || description.length === 0) {
            description = dataset.externalcode
        }

        if(selected) {
            const sfProject = {
                name: dataset.externalcode,
                description: description,
                positionIds: [],
                activities: [],
                businessId: businessId,
                successFactors: {
                  externalCode: dataset.externalcode
                },
                status: 'Active'
            }
            selectedSfProjects[sfProject.name] = sfProject
        } else {
            if(selectedSfProjects[dataset.externalcode]) {
                delete selectedSfProjects[dataset.externalcode]               
            }
        }
        Template.instance().selectedSfProjects.set(selectedSfProjects)
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
    },
    'click #saveCostCenterCodes': (e, tmpl) => {
        e.preventDefault();
        let businessUnitId = Session.get('context')
        let theUnits = Template.instance().selectedUnits.get()

        Meteor.call("successfactors/setSfCostCenterOnUnits", businessUnitId, theUnits, (err, res) => {
            if(res) {
                swal('Success', 'Cost center codes were successfully updated', 'success')
            } else {
                console.log(err);
                swal('Error', err.reason, 'error')
            }
        })
    },
    'click #saveProjects': (e, tmpl) => {
        e.preventDefault();
        let businessUnitId = Session.get('context')
        let theProjects = Template.instance().selectedSfProjects.get()

        Meteor.call("project/createFromSuccessfactors", theProjects, (err, res) => {
            if(res) {
                swal('Success', 'Projects were successfully added!', 'success')
            } else {
                console.log(err);
                swal('Error', err.reason, 'error')
            }
        })
    },
    'click #fetchPositions': (e, tmpl) => {
        e.preventDefault();
        let businessUnitId = Session.get('context')
        tmpl.isFetchingSfPositions.set(true)

        Meteor.call("successfactors/fetchOrgChart", businessUnitId, (err, res) => {
            tmpl.isFetchingSfPositions.set(false)

            if(res) {
                swal('Success', 'Positions were successfully synced!', 'success')
                tmpl.sfPositions.set(res)
            } else {
                console.log(err);
                swal('Error', err.reason, 'error')
            }
        })
    },
    'change [name="periodMonth"]': function(e, tmpl){
        let selectedMonth = e.currentTarget.value;
        console.log("Selected month: " + selectedMonth);

        Template.instance().selectedMonth.set(selectedMonth);

        Template.instance().selectedMonth.set(selectedMonth);
        let selectedYear = Template.instance().selectedYear.get();
      
        let businessUnitId = Session.get('context')
        if(selectedMonth && selectedYear) {
            tmpl.isFetchingTimeSheet.set(true)
            Meteor.call("successfactors/savedEmployeeTimeSheets", businessUnitId, selectedMonth, selectedYear, function(err, res) {
                tmpl.isFetchingTimeSheet.set(false)
                if(!res) {
                    swal('Error', err.reason, 'error')
                } else {
                    tmpl.sfTimeSheets.set(res)
                }
            })
        }
    },
    'change [name="periodYear"]': function(e, tmpl){
      let selectedYear = e.currentTarget.value;
      console.log("Selected year: " + selectedYear);

      Template.instance().selectedYear.set(selectedYear);
      let selectedMonth = Template.instance().selectedMonth.get();
      
      let businessUnitId = Session.get('context')
      if(selectedMonth && selectedYear) {
          tmpl.isFetchingTimeSheet.set(true)
          Meteor.call("successfactors/savedEmployeeTimeSheets", businessUnitId, selectedMonth, selectedYear, function(err, res) {
              tmpl.isFetchingTimeSheet.set(false)
              if(!res) {
                  swal('Error', err.reason, 'error')
              } else {
                  console.log(`res: `, res)
                  tmpl.sfTimeSheets.set(res)
              }
          })
      }
    },
    'click #syncEmployeeTimeSheets': (e, tmpl) => {
        e.preventDefault();
        let businessUnitId = Session.get('context')

        const month = $('[name="periodMonth"]').val();
        const year = $('[name="periodYear"]').val();
        if(month && year) {
            tmpl.isFetchingTimeSheet.set(true)
            
            Meteor.call("successfactors/syncEmployeeTimeSheets", businessUnitId, month, year, function(err, res) {
                console.log(`Res: `, res)
                tmpl.isFetchingTimeSheet.set(false)

                if(!res) {
                    console.log(err);
                    swal('Error', err.reason, 'error')
                } else {
                    tmpl.sfTimeSheets.set(res)
                }
            })
        }
    }
});

/*****************************************************************************/
/* SuccessFactorsConfig: Helpers */
/*****************************************************************************/
Template.SuccessFactorsConfig.helpers({
    'companyConnectionInfo': function() {
        return Template.instance().successFactorsConfig.get()
    },
    'sfPositions': function() {
        return Template.instance().sfPositions.get()
    },
    'sfPayTypes': function() {
        return Template.instance().sfPayTypes.get()
    },
    'sfPayGrades': function() {
        return Template.instance().sfPayGrades.get()
    },
    'sfCostCenters': function() {
        const sfCostCenters = Template.instance().sfCostCenters.get()
        if(sfCostCenters && sfCostCenters.length > 0) {
            return _.filter(sfCostCenters, cCenter => {
                return (cCenter.externalCode.match(/^\d/)) 
            })
        }
    },
    'sfProjects': function() {
        const sfCostCenters = Template.instance().sfCostCenters.get()
        if(sfCostCenters && sfCostCenters.length > 0) {
            return _.filter(sfCostCenters, cCenter => {
                return (cCenter.externalCode.match(/^[A-Z]/i)) 
            })
        }
    },
    'sfCustProjects': function() {
        return Template.instance().sfCustProjects.get()
    },
    'timeWritingRecords': function() {
        return Template.instance().sfTimeSheets.get()
    },
    'costCenters': function () {
        return Template.instance().units.get()
    },
    'isFetchingSfPositions': function() {
        return Template.instance().isFetchingSfPositions.get()
    },
    'isFetchingPayTypes': function() {
        return Template.instance().isFetchingPayTypes.get()
    },
    'isFetchingPayGrades': function() {
        return Template.instance().isFetchingPayGrades.get()
    },
    'isFetchingCostCenters': function() {
        return Template.instance().isFetchingCostCenters.get()
    },
    'isFetchingCustProjects': function() {
        return Template.instance().isFetchingCustProjects.get()
    },
    'isFetchingTimeSheet': function() {
        return Template.instance().isFetchingTimeSheet.get()
    },
    "getCostCenterOrgChartParents": (unit) => {
        return Template.instance().getParentsText(unit)
    },
    // selectedCostCenter: function (context, val) {
    //     if(Template.instance().units.get()){
    //         // let units = Template.instance().units.get();
    //         units.code === val ? selected="selected" : '';
    //     }
    // },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear() - 10; x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    'getEmployeeFullName': (userId) => {
        let user = Meteor.users.findOne({_id: userId})
        if(user && user.profile) {
            return `${user.profile.firstname} ${user.profile.lastname}`
        } 
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
    self.subscribe('allEmployees', businessUnitId)

    self.successFactorsConfig = new ReactiveVar()
    self.sfPositions = new ReactiveVar()
    self.sfPayTypes = new ReactiveVar()
    self.sfPayGrades = new ReactiveVar()
    self.sfCostCenters = new ReactiveVar()
    self.sfCustProjects = new ReactiveVar()
    self.sfTimeSheets = new ReactiveVar()

    self.isFetchingSfPositions = new ReactiveVar(false)
    self.isFetchingPayTypes = new ReactiveVar(false)
    self.isFetchingPayGrades = new ReactiveVar(false)
    self.isFetchingCostCenters = new ReactiveVar(false)
    self.isFetchingCustProjects = new ReactiveVar(false)
    self.isFetchingTimeSheet = new ReactiveVar(false)

    self.units = new ReactiveVar()

    self.selectedSfPaytypes = new ReactiveVar({})
    self.selectedSfPaygrades = new ReactiveVar({})
    self.selectedUnits = new ReactiveVar({})
    self.selectedSfProjects = new ReactiveVar({})
    self.selectedMonth = new ReactiveVar()
    self.selectedYear = new ReactiveVar()

    self.getParentsText = (unit) => {// We need parents 2 levels up
        let parentsText = ''
        if(unit.parentId) {
            let possibleParent = EntityObjects.findOne({_id: unit.parentId})
            if(possibleParent) {
                parentsText += possibleParent.name

                if(possibleParent.parentId) {
                    let possibleParent2 = EntityObjects.findOne({_id: possibleParent.parentId})
                    if(possibleParent2) {
                        parentsText += ' >> ' + possibleParent2.name
                        return parentsText
                    } return ''
                } else return parentsText
            } else return ''
        } else return ''
    }

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
        }
    })

    // self.isFetchingPayTypes.set(true)
    // Meteor.call('successfactors/fetchPaytypes', businessUnitId, (err, sfPaytypes) => {
    //     console.log(`err: `, err)
    //     self.isFetchingPayTypes.set(false)

    //     if (!err) {
    //         self.sfPayTypes.set(sfPaytypes)
    //     } else {
    //         swal("Server error", `Please try again at a later time`, "error");
    //     }
    // });
    // //--
    // self.isFetchingPayGrades.set(true)
    // Meteor.call('successfactors/fetchPayGrades', businessUnitId, (err, sfPayGrades) => {
    //     console.log(`err: `, err)
    //     self.isFetchingPayGrades.set(false)

    //     if (!err) {
    //         self.sfPayGrades.set(sfPayGrades)
    //     } else {
    //         swal("Server error", `Please try again at a later time`, "error");
    //     }
    // });
    // //--
    // self.isFetchingCostCenters.set(true)
    // Meteor.call('successfactors/fetchCostCenters', businessUnitId, (err, sfCostCenters) => {
    //     self.isFetchingCostCenters.set(false)
    //     if (!err) {
    //         console.log(`err: `, err)
    //         self.sfCostCenters.set(sfCostCenters)
    //     } else {
    //         swal("Server error", `Please try again at a later time`, "error");
    //     }
    // });

    self.isFetchingCustProjects.set(true)
    Meteor.call('successfactors/fetchSfCustProjects', businessUnitId, (err, sfCustProjects) => {
        self.isFetchingCustProjects.set(false)
        if (!err) {
            console.log(`err: `, err)
            self.sfCustProjects.set(sfCustProjects)
        } else {
            swal("Server error", `Please try again at a later time`, "error");
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
