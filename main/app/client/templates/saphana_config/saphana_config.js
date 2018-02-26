/*****************************************************************************/
/* SapHanaConfig: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.SapHanaConfig.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var serverHostUrl = $('#serverHostUrl').val();
        var protocol = $("[name='protocol']:checked").val();
        var companyId = $('#companyId').val();
        var username = $('#username').val();
        var password = $('#password').val();

        if(serverHostUrl.length < 1) {
            swal("Validation error", `Please enter the IP Address & Port of your SAP HANA instance`, "error");
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
            companyId : companyId,
            businessId: businessUnitId,
            username : username,
            password : password,
        }

        tmpl.$('#testConnection').text('Connecting ... ');
        tmpl.$('#testConnection').attr('disabled', true);
        //--
        Meteor.call('hanaIntegration/testConnection', businessUnitId, hanaConfig, (err, res) => {
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
    'blur #tab1-data-body tr input': (e, tmpl) => {
        let domElem = e.currentTarget;
        let unitId = domElem.getAttribute('id')
        let unitGlAccountCode = domElem.value || ""

        let units = Template.instance().units.get()

        let currentUnit = _.find(units, function (o) {
            return o._id === unitId;
        })
        // currentUnit.costCenterCode = unitGlAccountCode
        currentUnit.successFactors = currentUnit.successFactors || {}
        currentUnit.successFactors.costCenter = currentUnit.successFactors.costCenter || {}
        currentUnit.successFactors.costCenter.code = unitGlAccountCode
        
        Template.instance().units.set(units);

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
    'click #saveSapCostCenterCodes': (e, tmpl) => {
        let businessUnitId = Session.get('context')

        let theUnits = Template.instance().units.get()

        Meteor.call("hanaIntegration/updateUnitCostCenters", businessUnitId, theUnits, (err, res) => {
            if(res) {
                swal('Success', 'Cost center codes were successfully updated', 'success')
            } else {
                console.log(err);
                swal('Error', err.reason, 'error')
            }
        })
    },
    // 'click #savePaytypes': (e, tmpl) => {
    //     let businessUnitId = Session.get('context')

    //     let theUnits = Template.instance().units.get()

    //     Meteor.call("sapB1integration/updateUnitCostCenters", businessUnitId, theUnits, (err, res) => {
    //         if(res) {
    //             swal('Success', 'Cost center codes were successfully updated', 'success')
    //         } else {
    //             console.log(err);
    //             swal('Error', err.reason, 'error')
    //         }
    //     })
    // },
    'click #savePayTypesGlAccounts': (e, tmpl) => {
        let businessUnitId = Session.get('context')

        let payTypeCreditGlAccountCode = []
        let payTypeDebitGlAccountCode = []
        // let payTypeProjectDebitAccountCode = []
        // let payTypeProjectCreditAccountCode = []

        $('input[name=payTypeCreditGlAccountCode]').each(function(anInput) {
            payTypeCreditGlAccountCode.push($(this).val())
        })
        $('input[name=payTypeDebitGlAccountCode]').each(function(anInput) {
            payTypeDebitGlAccountCode.push($(this).val())
        })
        // $('input[name=payTypeProjectDebitAccountCode]').each(function(anInput) {
        //     payTypeProjectDebitAccountCode.push($(this).val())
        // })
        // $('input[name=payTypeProjectCreditAccountCode]').each(function(anInput) {
        //     payTypeProjectCreditAccountCode.push($(this).val())
        // })

        let thePayTypes = Template.instance().payTypes.get().map((aPayType, index) => {
            return {
                payTypeId: aPayType.payTypeId,
                payTypeCreditAccountCode: payTypeCreditGlAccountCode[index],
                payTypeDebitAccountCode: payTypeDebitGlAccountCode[index],
                // payTypeProjectCreditAccountCode: payTypeProjectCreditAccountCode[index],
                // payTypeProjectDebitAccountCode: payTypeProjectDebitAccountCode[index]
            }
        })
        // console.log(`The thePayTypes: ${JSON.stringify(thePayTypes)}`)
        //--
        let taxesCreditGlAccountCode = []
        let taxesDebitGlAccountCode = []
        $('input[name=taxesCreditGlAccountCode]').each(function(anInput) {
            taxesCreditGlAccountCode.push($(this).val())
        })
        $('input[name=taxesDebitGlAccountCode]').each(function(anInput) {
            taxesDebitGlAccountCode.push($(this).val())
        })
        let theTaxes = Template.instance().taxes.get().map((aPayType, index) => {
            return {
                payTypeId: aPayType.payTypeId,
                payTypeCreditAccountCode: taxesCreditGlAccountCode[index],
                payTypeDebitAccountCode: taxesDebitGlAccountCode[index],
            }
        })
        //--
        let pensionsCreditGlAccountCode = []
        let pensionsDebitGlAccountCode = []
        $('input[name=pensionsCreditGlAccountCode]').each(function(anInput) {
            pensionsCreditGlAccountCode.push($(this).val())
        })
        $('input[name=pensionsDebitGlAccountCode]').each(function(anInput) {
            pensionsDebitGlAccountCode.push($(this).val())
        })
        
        let thePensions = []
        Template.instance().pensions.get().forEach((aPension, index) => {
            const sapPensionPaymentConfig = {
                pensionId: aPension.pensionId,
                pensionCode: aPension.pensionCode,
                payTypeCreditAccountCode: pensionsCreditGlAccountCode[index],
                payTypeDebitAccountCode: pensionsDebitGlAccountCode[index],
            }
            thePensions.push(sapPensionPaymentConfig)
        })

        Meteor.call("hanaIntegration/updatePayTypeGlAccountCodes", businessUnitId, thePayTypes, theTaxes, thePensions, (err, res) => {
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
/* SapHanaConfig: Helpers */
/*****************************************************************************/
Template.SapHanaConfig.helpers({
    'companyConnectionInfo': function() {
        return Template.instance().sapHanaConfig.get()
    },
    'costCenters': function () {
        return Template.instance().units.get()
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
    // "paytype": () => {
    //     return Template.instance().paytypes.get()
    // },
    "taxes": () => {
        return Template.instance().taxes.get()
    },
    "pensions": () => {
        return Template.instance().pensions.get()
    },
    "getCostCenterOrgChartParents": (unit) => {
        return Template.instance().getParentsText(unit)
    }
    // 'isFetchingHanaGlAccounts': function() {
    //     return Template.instance().isFetchingSapHanaGlAccounts.get()
    // },
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
    self.subscribe('getCostElement', businessUnitId);
    self.subscribe("PayTypes", businessUnitId);
    self.subscribe('taxes', businessUnitId)
    self.subscribe('pensions', businessUnitId)
    
    self.sapHanaConfig = new ReactiveVar()
    self.units = new ReactiveVar()
    self.payTypes = new ReactiveVar()
    self.taxes = new ReactiveVar()
    self.pensions = new ReactiveVar()
    self.hanaGlAccounts = new ReactiveVar()

    self.isFetchingPayTypes = new ReactiveVar(false)
    self.isFetchingSapHanaGlAccounts = new ReactiveVar(false)

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

    // self.autorun(function() {
    //     if (Template.instance().subscriptionsReady()){
    //         let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})
    //         self.sapHanaConfig.set(config)

    //         self.payTypes.set(PayTypes.find({
    //             businessId: businessUnitId
    //         }).fetch())

    //         if(config) {
    //             self.isFetchingSapHanaGlAccounts.set(true)

    //             Meteor.call('hanaIntegration/fetchGlAccounts', businessUnitId, (err, glAccounts) => {
    //                 console.log(`err: `, err)
    //                 self.isFetchingSapHanaGlAccounts.set(false)

    //                 if (!err) {
    //                     self.hanaGlAccounts.set(glAccounts)
    //                 } else {
    //                     swal("Server error", `Please try again at a later time`, "error");
    //                 }
    //             });
    //         }
    //     }
    // });

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})
            self.sapHanaConfig.set(config)

            self.units.set(EntityObjects.find({otype: 'Unit'}).fetch());

            self.payTypes.set(PayTypes.find({'status': 'Active'}).fetch().map(payType => {
                if(config) {
                    let currentPayType = _.find(config.payTypes, function (oldPayType) {
                        return oldPayType.payTypeId === payType._id;
                    })
                    if(currentPayType) {
                        _.extend(payType, currentPayType)
                    }
                } else {
                }
                payType.payTypeId = payType._id
                return payType
            }));

            self.taxes.set(Tax.find({}).fetch().map(payType => {
                if(config) {
                    let currentPayType = _.find(config.taxes, function (oldPayType) {
                        return oldPayType.payTypeId === payType._id;
                    })
                    if(currentPayType) {
                        _.extend(payType, currentPayType)
                    }
                } else {
                }
                payType.payTypeId = payType._id
                return payType
            }));

            let thePensions = []
            Pensions.find({}).fetch().forEach(aPension => {
                if(config) {
                    let sapEmployeePensionPayment = _.find(config.pensions, function (oldPayType) {
                        return oldPayType.pensionId === aPension._id && oldPayType.pensionCode === aPension.code + "_EE";
                    })
                    let employeePension = {...aPension}
                    if(sapEmployeePensionPayment) {
                        _.extend(employeePension, sapEmployeePensionPayment)
                    }
                    employeePension.pensionId = aPension._id
                    employeePension.pensionCode = aPension.code + "_EE"                    
                    thePensions.push(employeePension)
                    //--
                    let employerPension = {...aPension}
                    let sapEmployerPensionPayment = _.find(config.pensions, function (oldPayType) {
                        return oldPayType.pensionId === aPension._id && oldPayType.pensionCode === aPension.code + "_ER";
                    })
                    if(sapEmployerPensionPayment) {
                        _.extend(employerPension, sapEmployerPensionPayment)
                    }
                    employerPension.pensionId = aPension._id
                    employerPension.pensionCode = aPension.code + "_ER"                    
                    thePensions.push(employerPension)                    
                }
            });
            self.pensions.set(thePensions)
        }
    })
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
