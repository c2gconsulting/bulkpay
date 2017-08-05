
Meteor.methods({

    "payrollApprovalConfig/save": function(payrollApprovalConfig) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let userId = Meteor.userId();

        try {
            check(payrollApprovalConfig, Core.Schemas.PayrollApprovalConfigs);
        } catch (e) {
            throw new Meteor.Error(401, "There's invalid data in the config data sent. Please correct and retry");
        }

        PayrollApprovalConfigs.insert(payrollApprovalConfig);
        return true
    }
});

