import _ from 'underscore';

let TravelRequestHelper = {
    sendRequisitionCreated: function( approvalsPageUrl) {
        try {
            SSR.compileTemplate("travelRequestNotification", Assets.getText("emailTemplates/travelRequestNotification.html"));
            Email.send({
                to: "zekerizekkerriyya@gmail.com",
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                subject: "Travel Request created!",
                html: SSR.render("travelRequestNotification", {


                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    sendRequisitionNeedsTreatment: function(supervisorFullName, supervisorEmail, createdByFullName,
        currentTravelRequest, approvalsPageUrl) {
            try {
                SSR.compileTemplate("travelRequisitionNotificationForTreatment", Assets.getText("emailTemplates/travelRequisitionNotificationForTreatment.html"));

                Email.send({
                    to: supervisorEmail,
                    from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                    subject: "Travel Request approved and needs to be treated",
                    html: SSR.render("travelRequisitionNotificationForTreatment", {
                        user: supervisorFullName,
                        createdBy: createdByFullName,
                        currentTravelRequest,
                        approvalsPageUrl: approvalsPageUrl
                    })
                });
                return true
            } catch(e) {
                throw new Meteor.Error(401, e.message);
            }
        }
    }


    /**
    *  Travel Request Methods
    */
    Meteor.methods({

        "TravelRequest2/create": function(currentTravelRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentTravelRequest.businessId, String);
            this.unblock()

            currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
            if (budgetCode){
                currentTravelRequest.budgetHolderId = budgetCode.employeeId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentTravelRequest._id){

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
                
                //approvalsPageUrl =  'http://localhost:3000/business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + result
                //TravelRequestHelper.sendRequisitionCreated(approvalsPageUrl)
            }

            return true;
        },
        "TravelRequest2/retire": function(currentTravelRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentTravelRequest.businessId, String);
            this.unblock()

            currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
            if (budgetCode){
                currentTravelRequest.budgetHolderId = budgetCode.employeeId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentTravelRequest._id){

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
            }

            return true;
        },
        "TravelRequest2/supervisorApprovals": function(currentTravelRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentTravelRequest.businessId, String);
            this.unblock()

            currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
            if (budgetCode){
                currentTravelRequest.budgetHolderId = budgetCode.employeeId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentTravelRequest._id){

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
            }

            return true;
        },
        "TravelRequest2/supervisorRetirements": function(currentTravelRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentTravelRequest.businessId, String);
            this.unblock()

            currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
            if (budgetCode){
                currentTravelRequest.budgetHolderId = budgetCode.employeeId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentTravelRequest._id){

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
            }

            return true;
        },
        "TravelRequest2/budgetHolderApprovals": function(currentTravelRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentTravelRequest.businessId, String);
            this.unblock()

            currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
            if (budgetCode){
                currentTravelRequest.budgetHolderId = budgetCode.employeeId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentTravelRequest._id){

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
            }

            return true;
        },
        "TravelRequest2/budgetHolderRetirements": function(currentTravelRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentTravelRequest.businessId, String);
            this.unblock()

            currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
            if (budgetCode){
                currentTravelRequest.budgetHolderId = budgetCode.employeeId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentTravelRequest._id){

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
            }

            return true;
        },

    });
