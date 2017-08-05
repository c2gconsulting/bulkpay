
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
    }
});

