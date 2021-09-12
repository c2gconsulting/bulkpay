
let PayrollApprovalHelper = {
  payrollApproved: function(employeeFullName, employeeEmail, 
    payrunPeriod, payslipPageUrl) {
    try {
      SSR.compileTemplate("employeePayrollApprovedNotification", Assets.getText("emailTemplates/employeePayrollApprovedNotification.html"));
      Email.send({
        to: employeeEmail,
        from: "Hub825Travel™ Team <eariaroo@c2gconsulting.com>",
        subject: "Payroll approved!",
        html: SSR.render("employeePayrollApprovedNotification", {
          user: employeeFullName,
          payrunPeriod,
          payslipPageUrl: payslipPageUrl
        })
      });
      return true
    } catch(e) {
        throw new Meteor.Error(401, e.message);
    }
  }
};

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
              let businessConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId});

              if(payrollApprovalConfig) {
                let approvers = payrollApprovalConfig.approvers || []
                let isUserAnApprover = _.find(approvers, anApproverUserId => {
                  return anApproverUserId === userId
                })
 
                if(isUserAnApprover) {
                  let approvals = periodPayrun[0].approvals || []

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
                  //--
                  if(approveOrReject) {
                    console.log(`Payroll approved! Will send emails to employees`)

                    if(businessConfig) {
                      if(businessConfig.notifyEmployeesOnPayrollApproval) {
                        let payrunPeriod = moment(new Date(`${periodMonth}-01-${periodYear}`)).format('MMMM YYYY')

                        let payrun = Payruns.find({period: periodFormat}).fetch() || []
                        let employeeIds = _.pluck(payrun, 'employeeId') || []
                        const period = periodMonth + '-' + periodYear;

                        let payslipPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/payslip/${period}`
                        
                        let users = Meteor.users.find({_id: {$in: employeeIds}}).fetch() || [];
                        users.forEach(user => {
                          if(user && user.emails && user.emails.length > 0 && user.emails[0].address) {
                            try {
                              let userFullName = ''
                              if(user.profile && user.profile.fullName) {
                                userFullName = user.profile.fullName;
                              }
                              console.log(`fullName: `, userFullName)
                              console.log(`user.emails[0].address: `, user.emails[0].address)
                              console.log(`payrunPeriod: `, payrunPeriod)
                              console.log(`payslipPageUrl: `, payslipPageUrl)
                              
                              PayrollApprovalHelper.payrollApproved(userFullName, user.emails[0].address, 
                                payrunPeriod, payslipPageUrl)
                            } catch(e) {
                              console.log(`Error sending payroll approved email to employee! `, e.message)
                            }
                          }
                        })                        
                      }
                    }
                  }
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

