
Meteor.methods({

    "payrollApproval/approveOrReject": function(businessUnitId, periodMonth, periodYear, approveOrReject) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let userId = Meteor.userId();

        try {
            const periodFormat = periodMonth + periodYear;
            let periodPayrun = Payruns.find({period: periodFormat, businessId: businessUnitId}).fetch();
            if(periodPayrun && periodPayrun.length > 0) {

              let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: businessUnitId});
              if(payrollApprovalConfig) {
                let approvers = payrollApprovalConfig.approvers
                let isUserAnApprover = _.find(approvers, anApproverUserId => {
                  return anApproverUserId === userId
                })
 
                if(isUserAnApprover) {
                  let approvals = periodPayrun[0].approvals

                  let doesUserApprovalExist = _.find(approvals, anApproval => {
                    return anApproval.approvedBy === userId
                  })
                  if(doesUserApprovalExist) {
                    doesUserApprovalExist.isApproved = approveOrReject
                  } else {
                    approvals.push({
                      approvedBy: userId,
                      isApproved: approveOrReject
                    })
                  }

                  Payruns.update({
                    period: periodFormat, 
                    businessId: businessUnitId
                  }, {$set: {approvals: approvals}},
                  {multi: true})

                  return true
                } else {
                  throw new Meteor.Error(401, 'You are not allowed to approve or reject a payrun')
                }
              } else {
                throw new Meteor.Error(401, 'No payrun approval config exists')
              }
            } else {
              throw new Meteor.Error(401, 'No payrun exists for the selected period')
            }
        } catch (e) {
            throw new Meteor.Error(401, e.message)
        }
    }
});

