

let PayrollApprovalHelper = {
    sendPayrunApprovalSummons: function(approverFullName, approverEmail, 
        payrunPeriod, approvalsPageUrl) {
        try {
            SSR.compileTemplate("payrunApprovalNotification", Assets.getText("emailTemplates/payrunApprovalNotification.html"));
            Email.send({
                to: approverEmail,
                from: "OILSERV TRIPS™ Team <eariaroo@c2gconsulting.com>",
                subject: "Payrun for Approval!",
                html: SSR.render("payrunApprovalNotification", {
                    user: approverFullName,
                    payrunPeriod,
                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    }
}

Meteor.methods({

    "payrollApprovalConfig/save": function(businessUnitId, approvalConfigDoc) {
        if (!this.userId && !Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let userId = Meteor.userId();

        try {
            check(payrollApprovalConfig, Core.Schemas.PayrollApprovalConfigs);

            let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: businessUnitId});
            if(payrollApprovalConfig) {
                PayrollApprovalConfigs.update(payrollApprovalConfig._id, {$set : approvalConfigDoc});
            } else {
                PayrollApprovalConfigs.insert(approvalConfigDoc)
            }
            return true
        } catch (e) {
            throw new Meteor.Error(401, "There's invalid data in the config data sent. Please correct and retry");
        }
    },
    "payrollApprovalConfig/sendPayrunApproveEmails": function(businessUnitId, periodMonth, periodYear) {
        if (!this.userId && !Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: businessUnitId});

        if(payrollApprovalConfig) {
            const periodFormat = periodMonth + periodYear;
            let payrunResult = Payruns.findOne({period: periodFormat, businessId: businessUnitId});

            let payrunPeriod = moment(new Date(`${periodMonth}-01-${periodYear}`)).format('MMMM YYYY')

            if(payrollApprovalConfig.requirePayrollApproval) {
                let approvers = payrollApprovalConfig.approvers || []
                let numApprovers = approvers.length
                const period = periodMonth + '-' + periodYear;
                
                let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/payrun/approval/${period}`

                for(let i = 0; i < numApprovers; i++) {
                    let approverUserId = approvers[i]
                    if(approverUserId) {
                        let approver = Meteor.users.findOne(approverUserId)
                        if(approver) {
                            if(approver.emails && approver.emails.length > 0 && approver.emails[0].address) {
                                let approverEmail = approver.emails[0].address;

                                PayrollApprovalHelper.sendPayrunApprovalSummons(
                                    approver.profile.fullName, 
                                    approverEmail, payrunPeriod, approvalsPageUrl)
                            } else {
                                console.log(`Approver with id: ${approverUserId} has no email address`)
                            }
                        }
                    }
                }
            }
            return true
        }
        throw new Meteor.Error(401, "Your company does not have any payroll approval configuration");
    }
});

