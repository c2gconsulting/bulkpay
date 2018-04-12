import _ from 'underscore';

let TravelRequestHelper = {

    checkWhoToRefund: function(currentTravelRequest, currency){

        let formatNumber = function(numberVariable, n, x) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return numberVariable.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        }

        if (currency === "USD"){
            const usdDifference = currentTravelRequest.totalAncilliaryCostUSD - currentTravelRequest.actualTotalAncilliaryCostUSD;
            if (usdDifference > 0){
                return "Employee to refund " + formatNumber(usdDifference,2) + " USD";
            }else if (usdDifference < 0){
                return "Company to refund " + formatNumber((-1 * usdDifference),2) + " USD";
            }else{
                return "No USD refunds"
            }
        }else if (currency === "NGN"){
            const ngnDifference = currentTravelRequest.totalAncilliaryCostNGN - currentTravelRequest.actualTotalAncilliaryCostNGN;
            if (ngnDifference > 0){
                return "Employee to refund " + formatNumber(ngnDifference,2) + " NGN";
            }else if (ngnDifference < 0){
                return "Company to refund " + formatNumber((-1 * ngnDifference),2) + " NGN";
            }else{
                return "No NGN refunds"
            }
        }
    },
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
            return travelcity.name;
        }
    },
    getTravelcityEmail: function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.notificationEmail;
        }
    },
    sendTravelRequestEmail: function(currentTravelRequest, emailTo, emailSubject) {
        try {
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
                to: emailTo,
                from: "BulkPay™ Travel Team <bulkpay@c2gconsulting.com>",
                subject: emailSubject,
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
                    actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTravelRequest._id

                })
            });

            return true
        } catch(e) {
            console.log(e);
            //throw new Meteor.Error(401, e.message);
        }
    },
    sendTravelRetirementEmail: function(currentTravelRequest, emailTo, emailSubject) {
        try {
            const travelType = currentTravelRequest.type === "Return"?'Return Trip':'Multiple Stops';
            const returnDate = currentTravelRequest.type === "Return"?currentTravelRequest.trips[0].returnDate:currentTravelRequest.trips[currentTravelRequest.trips.length-1].departureDate;
            let itenerary = TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].fromId) + " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].toId);
            if (currentTravelRequest.type === "Multiple"){
                for (i = 1; i < currentTravelRequest.trips.length; i++) {
                    itenerary += " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[i].toId);
                }
            }

            //Todo, itenerary, employee full name
            SSR.compileTemplate("TravelRetirementNotification2", Assets.getText("emailTemplates/TravelRetirementNotification2.html"));
            Email.send({
                to: emailTo,
                from: "BulkPay™ Travel Team <bulkpay@c2gconsulting.com>",
                subject: emailSubject,
                html: SSR.render("TravelRetirementNotification2", {
                    itenerary: itenerary,
                    departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
                    returnDate: TravelRequestHelper.formatDate(returnDate),
                    travelType: travelType,
                    employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
                    status: currentTravelRequest.retirementStatus,
                    description: currentTravelRequest.description,
                    totalTripDuration: currentTravelRequest.totalTripDuration,
                    actualTotalTripDuration: currentTravelRequest.actualTotalTripDuration,
                    totalEmployeePerdiemNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemNGN,2),
                    totalEmployeePerdiemUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemUSD,2),
                    totalAirportTaxiCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostNGN,2),
                    totalAirportTaxiCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostUSD,2),
                    totalGroundTransportCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostNGN,2),
                    totalGroundTransportCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostUSD,2),
                    totalAncilliaryCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalAncilliaryCostNGN,2),
                    totalAncilliaryCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalAncilliaryCostUSD,2),
                    actualTotalEmployeePerdiemNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalEmployeePerdiemNGN,2),
                    actualTotalEmployeePerdiemUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalEmployeePerdiemUSD,2),
                    actualTotalAirportTaxiCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAirportTaxiCostNGN,2),
                    actualTotalAirportTaxiCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAirportTaxiCostUSD,2),
                    actualTotalGroundTransportCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalGroundTransportCostNGN,2),
                    actualTotalGroundTransportCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalGroundTransportCostUSD,2),
                    actualTotalAncilliaryCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAncilliaryCostNGN,2),
                    actualTotalAncilliaryCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAncilliaryCostUSD,2),
                    actualTotalMiscCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalMiscCostNGN,2),
                    actualTotalMiscCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalMiscCostUSD,2),
                    actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printretirement?requisitionId=' + currentTravelRequest._id,
                    whoToRefundNGN: TravelRequestHelper.checkWhoToRefund(currentTravelRequest, "NGN"),
                    whoToRefundUSD: TravelRequestHelper.checkWhoToRefund(currentTravelRequest, "USD")

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
                currentTravelRequest._id = TravelRequisition2s.insert(currentTravelRequest);

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                const createdBySubject = "New travel request for " + createdBy.profile.fullName;
                const supervisorSubject = "Please approve travel request for " + createdBy.profile.fullName;


                if (createdBy.emails.length > 0){
                    createdByEmail = createdBy.emails[0].address;
                    createdByEmail = createdByEmail + "," + otherPartiesEmail;
                    console.log(createdByEmail);
                }

                if (supervisor.emails.length > 0){
                    supervisorEmail = supervisor.emails[0].address;
                    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
                    console.log(supervisorEmail);
                }

                //Send to requestor
                TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, supervisorEmail, supervisorSubject);

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

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest});

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                const createdBySubject = "New travel retirement for " + createdBy.profile.fullName;
                const supervisorSubject = "Please approve travel retirement for " + createdBy.profile.fullName;


                if (createdBy.emails.length > 0){
                    createdByEmail = createdBy.emails[0].address;
                    createdByEmail = createdByEmail + "," + otherPartiesEmail;
                    console.log(createdByEmail);
                }

                if (supervisor.emails.length > 0){
                    supervisorEmail = supervisor.emails[0].address;
                    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
                    console.log(supervisorEmail);
                }

                //Send to requestor
                TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, supervisorEmail, supervisorSubject);

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

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                let createdBySubject = "";
                let supervisorSubject = "";

                if(currentTravelRequest.status === "Approved By Supervisor"){
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has approved your travel request";
                    supervisorSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
                }else{
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has rejected your travel request";
                    supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
                }
                if (createdBy.emails.length > 0){
                    createdByEmail = createdBy.emails[0].address;
                    createdByEmail = createdByEmail + "," + otherPartiesEmail;
                    console.log(createdByEmail);
                }

                if (supervisor.emails.length > 0){
                    supervisorEmail = supervisor.emails[0].address;
                    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
                    console.log(supervisorEmail);
                }

                //Send to requestor
                TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, supervisorEmail, supervisorSubject);


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
                let otherPartiesEmail = "bulkpay@c2gconsulting.com";
                for (i = 0; i < currentTravelRequest.trips.length; i++) {
                    otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].toId);
                    otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].fromId);
                }

                otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

                const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
                const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
                let createdByEmail = "";
                let budgetHolderEmail = "";
                let createdByName = "Employee"
                let budgetHolderName = "Budget Holder"
                let createdBySubject = "";
                let budgetHolderSubject = "";

                if(currentTravelRequest.status === "Approved By Budget Holder"){
                    createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s travel request";
                    budgetHolderSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
                }else{
                    createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has rejected your travel request";
                    budgetHolderSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
                }
                if (createdBy.emails.length > 0){
                    createdByEmail = createdBy.emails[0].address;
                    createdByEmail = createdByEmail + "," + otherPartiesEmail;
                    console.log(createdByEmail);
                }

                if (budgetHolder.emails.length > 0){
                    budgetHolderEmail = budgetHolder.emails[0].address;
                    budgetHolderEmail = budgetHolderEmail  + ", bulkpay@c2gconsulting.com";
                    console.log(budgetHolderEmail);
                }

                //Send to requestor
                TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

                //Send to Budget Holder
                TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, budgetHolderEmail, budgetHolderSubject);


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

                TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest});

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                let createdBySubject = "";
                let supervisorSubject = "";

                if(currentTravelRequest.retirementStatus === "Retirement Approved By Supervisor"){
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has approved your travel retirement";
                    supervisorSubject = "You have approved " + createdBy.profile.fullName + "'s travel retirement";
                }else{
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has rejected your travel retirement";
                    supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s travel retirement";
                }
                if (createdBy.emails.length > 0){
                    createdByEmail = createdBy.emails[0].address;
                    createdByEmail = createdByEmail + "," + otherPartiesEmail;
                    console.log(createdByEmail);
                }

                if (supervisor.emails.length > 0){
                    supervisorEmail = supervisor.emails[0].address;
                    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
                    console.log(supervisorEmail);
                }

                //Send to requestor
                TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, supervisorEmail, supervisorSubject);


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

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";
                for (i = 0; i < currentTravelRequest.trips.length; i++) {
                    otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].toId);
                    otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].fromId);
                }

                otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

                const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
                const financeApprover = Meteor.users.findOne(currentTravelRequest.financeApproverId);
                let createdByEmail = "";
                let financeApproverEmail = "";
                let createdByName = "Employee"
                let financeApproverName = "Finance"
                let createdBySubject = "";
                let financeApproverSubject = "";

                if(currentTravelRequest.retirementStatus === "Retirement Approved Finance"){
                    createdBySubject = "Finance: " + financeApprover.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s travel retirement";
                    financeApproverSubject = "You have approved " + createdBy.profile.fullName + "'s travel retirement";
                }else{
                    createdBySubject = "Finance: " + financeApprover.profile.fullName + " has rejected your travel retirement";
                    financeApproverSubject = "You have rejected " + createdBy.profile.fullName + "'s travel retirement";
                }
                if (createdBy.emails.length > 0){
                    createdByEmail = createdBy.emails[0].address;
                    createdByEmail = createdByEmail + "," + otherPartiesEmail;
                    console.log(createdByEmail);
                }

                if (financeApprover.emails.length > 0){
                    financeApproverEmail = financeApprover.emails[0].address;
                    financeApproverEmail = financeApproverEmail  + ", bulkpay@c2gconsulting.com";
                    console.log(financeApproverEmail);
                }

                //Send to requestor
                TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, createdByEmail, createdBySubject);

                //Send to Finance
                TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, financeApproverEmail, financeApproverSubject);



            }else{
                let result = TravelRequisition2s.insert(currentTravelRequest);
            }

            return true;
        }

    });
