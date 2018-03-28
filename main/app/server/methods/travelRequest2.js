import _ from 'underscore';

let TravelRequestHelper = {
    formatNumber: function(numberVariable, n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return numberVariable.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    },

    formatDate: function (date) {
        var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [day, month, year].join('-');
    },
    getEmployeeNameById: function(employeeId){
        return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
    },
    getTravelcityName: function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.name
        }
    },
    sendRequisitionCreated: function( approvalsPageUrl) {
        try {
            SSR.compileTemplate("TravelRequestNotification2", Assets.getText("emailTemplates/TravelRequestNotification2.html"));
            Email.send({
                to: "michaelukpong@gmail.com",
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                subject: "Travel Request created!",
                html: SSR.render("TravelRequestNotification2", {


                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            console.log(e);
            //throw new Meteor.Error(401, e.message);
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
                currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentTravelRequest._id){

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
                const travelType = currentTravelRequest.type === "Return"?'Return Trip':'Multiple Stops';
                const returnDate = currentTravelRequest.type === "Return"?currentTravelRequest.trips[0].returnDate:currentTravelRequest.trips[currentTravelRequest.trips.length-1].departureDate;
                let itenerary = TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].fromId) + " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].toId);
                if (currentTravelRequest.type === "Multiple"){
                    for (i = 1; i < currentTravelRequest.trips.length; i++) {
                        itenerary += " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[i].toId);
                    }
                }

                //Todo, itenerary, employee full name
                SSR.compileTemplate("TravelRequestNotification2", Assets.getText("emailTemplates/TravelRequestNotification2.html"));
                Email.send({
                    to: "michaelukpong@gmail.com",
                    from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                    subject: "Travel Request created!",
                    html: SSR.render("TravelRequestNotification2", {
                        itenerary: itenerary,
                        departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
                        returnDate: TravelRequestHelper.formatDate(returnDate),
                        travelType: travelType,
                        employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
                        status: currentTravelRequest.status,
                        description: currentTravelRequest.description,
                        totalTripDuration: currentTravelRequest.totalTripDuration,
                        totalEmployeePerdiemNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemNGN,2),
                        totalEmployeePerdiemUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemUSD,2),
                        totalAirportTaxiCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostNGN,2),
                        totalAirportTaxiCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostUSD,2),
                        totalGroundTransportCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostNGN,2),
                        totalGroundTransportCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostUSD,2),
                        totalHotelCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalHotelCostNGN,2),
                        totalHotelCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalHotelCostUSD,2),
                        totalTripCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalTripCostNGN,2),
                        totalTripCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalTripCostUSD,2),
                        actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + result
                    })
                });

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
                currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
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
                currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
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
                currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
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
                currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
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
                currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
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
        "TravelRequest2/financeRetirements": function(currentTravelRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentTravelRequest.businessId, String);
            this.unblock()

            currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
            if (budgetCode){
                currentTravelRequest.budgetHolderId = budgetCode.employeeId;
                currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
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
        }

    });
