/*****************************************************************************/
/* payruns: Event Handlers */
/*****************************************************************************/
import Ladda from "ladda";

Template.payruns.events({
    'click #PayGroupButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayGroupButton')[0]);
        l.start();
    },
    'click #get-employee-payresults': (e, tmpl) => {
        let paymentPeriodMonth = $('[name="paymentPeriodMonth"]').val();
        let paymentPeriodYear = $('[name="paymentPeriodYear"]').val();

        let period = paymentPeriodMonth + paymentPeriodYear;

        Template.instance().currentPayrunPeriod.set(period);
    },
    'click .excel': (e, tmpl) => {
        e.preventDefault();
        const month = $('[name="paymentPeriodMonth"]').val();
        const year = $('[name="paymentPeriodYear"]').val();
        if(month && year) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);


            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }


            let resetButton = function() {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('.excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('.excel').text(' Export to CSV');
                // Add back glyphicon
                $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('.excel').removeAttr('disabled');
            };

            const period = month + year;
            Meteor.call('exportPaymentsforPeriod', Session.get('context'), period, function(err, res){
                console.log(res);
                if(res){
                    //call the export fo
                    BulkpayExplorer.exportAllData(res, "Payment Report");
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select Period', 'error');
        }
    },
    'click #postToSap': (e,tmpl) => {
        let currentPayrun = Template.instance().currentPayrun.get();
        console.log("currentPayrun:")
        console.log(currentPayrun)

        if(currentPayrun) {
            tmpl.$('#postToSap').text('Please wait ... ');
            tmpl.$('#postToSap').attr('disabled', true);
            //--
            let resetButton = function() {
                tmpl.$('#postToSap').text('Post results to SAP');
                tmpl.$('#postToSap').removeAttr('disabled');
            };
            //--
            const month = $('[name="paymentPeriodMonth"]').val();
            const year = $('[name="paymentPeriodYear"]').val();
            let period = `${month}${year}`
            
            Meteor.call("sapB1integration/postPayrunResults", Session.get('context'), period, (err, res) => {
                resetButton()
                console.log(`res: ${JSON.stringify(res)}`)
                if (!err) {
                    if(res) {
                        let responseAsObj = JSON.parse(res)
                        if(responseAsObj.status === true) {
                            swal("Payrun Post Status", responseAsObj["message"], "success");
                        } else {
                            if(responseAsObj.errors) {
                                let errors = responseAsObj.errors
                                console.log(`Errors: ${JSON.stringify(errors)}`)
                                Modal.show('PayrunResultsPostToSapErrors', errors)
                            } else if(responseAsObj.message) {
                                swal("Payrun Post Status", responseAsObj.message, "error");
                            } else {
                                swal("Payrun Post Status", "A server error occurred. Please try again later", "error");
                            }
                        }
                    } else {
                        swal("Payrun Post Status", "A server error occurred. Please try again later", "error");
                    }
                } else {
                    swal("Payrun Post Status", err.message, "error");
                }
            })
        }
    },
    'click #postToSapHana': (e,tmpl) => {
        let currentPayrun = Template.instance().currentPayrun.get();

        if(currentPayrun) {
            tmpl.$('#postToSapHana').text('Please wait ... ');
            tmpl.$('#postToSapHana').attr('disabled', true);
            //--
            let resetButton = function() {
                tmpl.$('#postToSapHana').text('Post to SAP HANA');
                tmpl.$('#postToSapHana').removeAttr('disabled');
            };
            //--
            const month = $('[name="paymentPeriodMonth"]').val();
            const year = $('[name="paymentPeriodYear"]').val();
            let period = `${month}${year}`

            Meteor.call("hanaIntegration/postPayrunResults", Session.get('context'), period, month, year, (err, res) => {
                resetButton()
                console.log(`err: `, err)
                console.log(`res: `, res)

                if (!err) {
                    if(res.status === false) {
                        if(res.errors) {
                            let errors = res.errors
                            Modal.show('PayrunResultsPostToSapErrors', errors)
                        } else if(res.message) {
                            swal("Payrun Post Status", res.message, "error");
                        } else {
                            swal("Payrun Post Status", "A server error occurred. Please try again later", "error");
                        }
                    } else if(res.statusCode === 500) {
                        swal("Payrun Post Status", 'Severe post error.', "error");
                    } else if(res.statusCode === 503) {
                        swal("Payrun Post Status", 'The HANA server is down at the moment. \nPlease try again later.', "error");
                    } else {
                        if(res.Return && res.Return.item && res.Return.item.length > 0) {
                            const returnMessage = res.Return.item[0].Message
                            console.log(`returnMessage: `, returnMessage)

                            if(returnMessage.indexOf('successfully') > 0) {
                                swal("Payrun Post Status", returnMessage, "success");
                            } else {
                                let items = res.Return.item
                                let errorMsg = ''
                                items.forEach((item, index) => {
                                    errorMsg += "\n" + item.Message
                                })
                                swal("Payrun Post Status", errorMsg, "error");
                            }
                        }
                    }
                } else {
                    swal("Payrun Post Status", err.message, "error");
                }
            })
        }
    },
    'click #payrunDelete': function(e, tmpl) {
        e.preventDefault();

        const month = $('[name="paymentPeriodMonth"]').val();
        const year = $('[name="paymentPeriodYear"]').val();
        let period = `${month}${year}`
        let businessId = Session.get('context')

        swal({
            title: "Are you sure?",
            text: "You will not be able to undo this",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, () => {
            Meteor.call('payrun/delete', period, businessId, function(err, res) {
                if(!err){
                    swal("Deleted!", `Payrun deleted successfully.`, "success");
                }
            })
        });
    }
});

/*****************************************************************************/
/* payruns: Helpers */
/*****************************************************************************/
Template.payruns.helpers({
    'getEmployeeFullName': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.profile.fullName;
        else
        return ""
    },
    'approvalState': (approval) => {
        if(approval === true) {
            return 'Approved';
        } else if(approval === false) {
            return 'Rejected';
        } else {
            return ''
        }
    },
    'increment': (index) => {
        return index += 1;
    },
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
    'payrun': function(){
        return Template.instance().currentPayrun.get();
    },

    'errorMsg': function() {
        return Template.instance().errorMsg.get();
    },
    'payrunResultsPostToSapErrors': function() {
        return Template.instance().payrunResultsPostToSapErrors.get();
    },
    'approvals': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig) {
            let currentPayrun = Template.instance().currentPayrun.get() || []
            let firstOne = currentPayrun[0]

            if(firstOne) {
                return firstOne.approvals
            }
        }
    },
    'doesRequirePayrunApproval': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()

        if(payrollApprovalConfig) {
            return payrollApprovalConfig.requirePayrollApproval
        } else {
            return false
        }
    },
    'showPayrunDeleteButton': function() {
        let currentPayrun = Template.instance().currentPayrun.get()

        return (currentPayrun !== null) && Core.hasPayrollAccess(Meteor.userId())
    },
    'canPostToSAP': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig && payrollApprovalConfig.requirePayrollApproval) {
            let currentPayrun = Template.instance().currentPayrun.get() || []
            let firstOne = currentPayrun[0]

            if(firstOne) {
                let isApproved = true
                _.each(firstOne.approvals, anApproval => {
                    if(!anApproval.isApproved) {
                        isApproved = false
                    }
                })
                if(isApproved) {
                    return true
                }
            }
        } else {
            return true
        }
    },
    isSapBusinessOneEnabled: () => {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSapBusinessOneIntegrationEnabled
        } else {
            return true
        }
    },
    isSapHanaEnabled: () => {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSapHanaIntegrationEnabled
        } else {
            return true
        }
    }
});

/*****************************************************************************/
/* payruns: Lifecycle Hooks */
/*****************************************************************************/
Template.payruns.onCreated(function () {
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));

    self.currentPayrun = new ReactiveVar();
    self.currentPayrun.set(false);

    self.currentPayrunPeriod = new ReactiveVar();
    self.currentPayrunPeriod.set(null);

    self.errorMsg = new ReactiveVar();
    //self.errorMsg.set("No Payrun available");

    let businessUnitId = Session.get('context');
    self.payrollApprovalConfig = new ReactiveVar()

    let businessId = Session.get('context')
    self.businessUnitCustomConfig = new ReactiveVar()


    self.autorun(() => {
        let currentPayrunPeriod = Template.instance().currentPayrunPeriod.get();
        self.subscribe("Payruns", currentPayrunPeriod, businessId);
        self.subscribe('PayrollApprovalConfigs', businessId);

        if (self.subscriptionsReady()) {
            let payRun = Payruns.find({period: currentPayrunPeriod, businessId}).fetch();

            let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId})
            self.payrollApprovalConfig.set(payrollApprovalConfig)

            if(payRun && payRun.length > 0)
            Template.instance().currentPayrun.set(payRun);
            else
            Template.instance().currentPayrun.set(null);
            Template.instance().errorMsg.set("No Payrun available for that time period");
        }

        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
            if(!err) {
                // console.log()
                self.businessUnitCustomConfig.set(res)
            }
        })
    });
});

Template.payruns.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.payruns.onDestroyed(function () {
});


//----------

Template.singlePayrunResult.helpers({
    'getEmployeeFullName': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.profile.fullName;
        else
        return ""
    },
    'getEmployeeRealId': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.employeeProfile.employeeId;
        else
        return ""
    },
});

Template.singlePayrunResult.onCreated(function () {
    let self = this;
    self.subscribe("paygrades", Session.get('context'));
})

Template.singlePayrunResult.events({
    'click .anEmployeePayResult': (e, tmpl) => {
        //console.log("this context: " + JSON.stringify(Template.parentData()));
        let thisContext = Template.parentData();

        let businessUnitId = Session.get('context')

        Meteor.call('Payslip/getSelfPayslipForPeriod', businessUnitId, thisContext.period, thisContext.employeeId, function(err, res) {
            if(!err) {
                let selfPayrun = res.selfPayrun
                let selfPayResults = res.selfPayResults

                let payLoadForPayslip = {
                    payrun: selfPayrun,
                    payslip: selfPayResults.payslip,
                    payslipWithCurrencyDelineation: selfPayResults.payslipWithCurrencyDelineation,
                    displayAllPaymentsUnconditionally: true
                }

                console.log(payLoadForPayslip);
                let findObjectByKey = function (array, key, value) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i][key] === value) {
                            return array[i];
                        }
                    }
                    return null;
                };

                const paygrade = PayGrades.findOne({_id: payLoadForPayslip.payslip.employee.gradeId})
                if(paygrade) {
                    //console.log(paygrade.payTypePositionIds);
                    if (payLoadForPayslip.payslip.benefit){
                        payLoadForPayslip.payslip.benefit.sort(function(a, b){
                            let aa = findObjectByKey(paygrade.payTypePositionIds, "paytype", a.payTypeId);
                            let aaPosition = 99;
                            if (aa){
                                aaPosition = parseInt(aa.paySlipPositionId);
                            }

                            let bb = findObjectByKey(paygrade.payTypePositionIds, "paytype", b.payTypeId);

                            let bbPosition = 99;
                            if (bb){
                                bbPosition = parseInt(bb.paySlipPositionId);
                            }

                            return aaPosition - bbPosition;
                        });
                    }

                    if (payLoadForPayslip.payslip.deduction){
                        payLoadForPayslip.payslip.deduction.sort(function(a, b){
                            let aa = findObjectByKey(paygrade.payTypePositionIds, "paytype", a.payTypeId);
                            let aaPosition = 99;
                            if (aa){
                                aaPosition = parseInt(aa.paySlipPositionId);
                            }

                            let bb = findObjectByKey(paygrade.payTypePositionIds, "paytype", b.payTypeId);

                            let bbPosition = 99;
                            if (bb){
                                bbPosition = parseInt(bb.paySlipPositionId);
                            }

                            return aaPosition - bbPosition;
                        });
                    }

                    if (payLoadForPayslip.payslip.others){
                        payLoadForPayslip.payslip.others.sort(function(a, b){
                            let aa = findObjectByKey(paygrade.payTypePositionIds, "paytype", a.payTypeId);
                            let aaPosition = 99;
                            if (aa){
                                aaPosition = parseInt(aa.paySlipPositionId);
                            }

                            let bb = findObjectByKey(paygrade.payTypePositionIds, "paytype", b.payTypeId);

                            let bbPosition = 99;
                            if (bb){
                                bbPosition = parseInt(bb.paySlipPositionId);
                            }

                            return aaPosition - bbPosition;
                        });

                    }
                }

                Modal.show('Payslip', payLoadForPayslip);
            } else {
                tmpl.errorMsg.set(err.message);
            }
        })
    }
});


/*****************************************************************************/
/* PayrunResultsPostToSapErrors: Helpers */
/*****************************************************************************/
Template.PayrunResultsPostToSapErrors.helpers({
    'payrunResultsPostToSapErrors': function() {
        return Template.instance().payrunResultsPostToSapErrors.get();
    }
});

/*****************************************************************************/
/* PayrunResultsPostToSapErrors: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunResultsPostToSapErrors.onCreated(function () {
    let self = this;
    self.payrunResultsPostToSapErrors = new ReactiveVar()
    self.payrunResultsPostToSapErrors.set(self.data);
});

Template.PayrunResultsPostToSapErrors.onDestroyed(function () {
    Modal.hide('PayrunResultsPostToSapErrors')
});
