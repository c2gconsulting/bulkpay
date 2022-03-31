import _ from 'underscore';

let LocalErrandTransportRequestHelper = {

    checkWhoToRefund: function(currentLocalErrandTransportRequest, currency){

        let formatNumber = function(numberVariable, n, x) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return numberVariable.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        }

        if (currency === "USD"){
            let usdDifference = currentLocalErrandTransportRequest.totalAncilliaryCostUSD - currentLocalErrandTransportRequest.actualTotalAncilliaryCostUSD;
            if (currentLocalErrandTransportRequest.cashAdvanceNotRequired){
                usdDifference = -1 * currentLocalErrandTransportRequest.actualTotalAncilliaryCostUSD;
            }
            if (usdDifference > 0){
                return "Employee to refund " + formatNumber(usdDifference,2) + " USD";
            }else if (usdDifference < 0){
                return "Company to refund " + formatNumber((-1 * usdDifference),2) + " USD";
            }else{
                return "No USD refunds"
            }
        }else if (currency === "NGN"){
            let ngnDifference = currentLocalErrandTransportRequest.totalAncilliaryCostNGN - currentLocalErrandTransportRequest.actualTotalAncilliaryCostNGN;
            if (currentLocalErrandTransportRequest.cashAdvanceNotRequired){
                ngnDifference = -1 * currentLocalErrandTransportRequest.actualTotalAncilliaryCostNGN;
            }
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
    sendLocalErrandTransportRequestEmail: function(currentLocalErrandTransportRequest, emailTo, emailSubject) {
        try {
            const travelType = currentLocalErrandTransportRequest.type === "Return"?'Return Trip':'Multiple Stops';
            const returnDate = currentLocalErrandTransportRequest.type === "Return"?currentLocalErrandTransportRequest.trips[0].returnDate:currentLocalErrandTransportRequest.trips[currentLocalErrandTransportRequest.trips.length-1].departureDate;
            let itenerary = LocalErrandTransportRequestHelper.getTravelcityName(currentLocalErrandTransportRequest.trips[0].fromId) + " - " + LocalErrandTransportRequestHelper.getTravelcityName(currentLocalErrandTransportRequest.trips[0].toId);
            if (currentLocalErrandTransportRequest.type === "Multiple"){
                for (i = 1; i < currentLocalErrandTransportRequest.trips.length; i++) {
                    itenerary += " - " + LocalErrandTransportRequestHelper.getTravelcityName(currentLocalErrandTransportRequest.trips[i].toId);
                }
            }

            //Todo, itenerary, employee full name
            SSR.compileTemplate("LocalErrandTransportRequestNotification2", Assets.getText("emailTemplates/LocalErrandTransportRequestNotification2.html"));
            Email.send({
                to: emailTo,
                from: "BulkPay™ Travel Team <bulkpay@c2gconsulting.com>",
                subject: emailSubject,
                html: SSR.render("LocalErrandTransportRequestNotification2", {
                    itenerary: itenerary,
                    departureDate: LocalErrandTransportRequestHelper.formatDate(currentLocalErrandTransportRequest.trips[0].departureDate),
                    returnDate: LocalErrandTransportRequestHelper.formatDate(returnDate),
                    travelType: travelType,
                    employeeFullName: LocalErrandTransportRequestHelper.getEmployeeNameById(currentLocalErrandTransportRequest.createdBy),
                    status: currentLocalErrandTransportRequest.status,
                    description: currentLocalErrandTransportRequest.description,
                    totalTripDuration: currentLocalErrandTransportRequest.totalTripDuration,
                    totalEmployeePerdiemNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalEmployeePerdiemNGN,2),
                    totalEmployeePerdiemUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalEmployeePerdiemUSD,2),
                    totalAirportTaxiCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalAirportTaxiCostNGN,2),
                    totalAirportTaxiCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalAirportTaxiCostUSD,2),
                    totalGroundTransportCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalGroundTransportCostNGN,2),
                    totalGroundTransportCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalGroundTransportCostUSD,2),
                    totalHotelCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalHotelCostNGN,2),
                    totalHotelCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalHotelCostUSD,2),
                    totalTripCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalTripCostNGN,2),
                    totalTripCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalTripCostUSD,2),
                    actionUrl:  Meteor.absoluteUrl() + 'business/' + currentLocalErrandTransportRequest.businessId + '/localerrandtransportrequests/printrequisition?requisitionId=' + currentLocalErrandTransportRequest._id

                })
            });

            return true
        } catch(e) {
            console.log(e);
            //throw new Meteor.Error(401, e.message);
        }
    },
    sendLocalErrandTransportRetirementEmail: function(currentLocalErrandTransportRequest, emailTo, emailSubject) {
        try {
            const travelType = currentLocalErrandTransportRequest.type === "Return"?'Return Trip':'Multiple Stops';
            const returnDate = currentLocalErrandTransportRequest.type === "Return"?currentLocalErrandTransportRequest.trips[0].returnDate:currentLocalErrandTransportRequest.trips[currentLocalErrandTransportRequest.trips.length-1].departureDate;
            let itenerary = LocalErrandTransportRequestHelper.getTravelcityName(currentLocalErrandTransportRequest.trips[0].fromId) + " - " + LocalErrandTransportRequestHelper.getTravelcityName(currentLocalErrandTransportRequest.trips[0].toId);
            if (currentLocalErrandTransportRequest.type === "Multiple"){
                for (i = 1; i < currentLocalErrandTransportRequest.trips.length; i++) {
                    itenerary += " - " + LocalErrandTransportRequestHelper.getTravelcityName(currentLocalErrandTransportRequest.trips[i].toId);
                }
            }

            //Todo, itenerary, employee full name
            SSR.compileTemplate("LocalErrandTransportRetirementNotification2", Assets.getText("emailTemplates/LocalErrandTransportRetirementNotification2.html"));
            Email.send({
                to: emailTo,
                from: "BulkPay™ Travel Team <bulkpay@c2gconsulting.com>",
                subject: emailSubject,
                html: SSR.render("LocalErrandTransportRetirementNotification2", {
                    itenerary: itenerary,
                    departureDate: LocalErrandTransportRequestHelper.formatDate(currentLocalErrandTransportRequest.trips[0].departureDate),
                    returnDate: LocalErrandTransportRequestHelper.formatDate(returnDate),
                    travelType: travelType,
                    employeeFullName: LocalErrandTransportRequestHelper.getEmployeeNameById(currentLocalErrandTransportRequest.createdBy),
                    status: currentLocalErrandTransportRequest.retirementStatus,
                    description: currentLocalErrandTransportRequest.description,
                    totalTripDuration: currentLocalErrandTransportRequest.totalTripDuration,
                    actualTotalTripDuration: currentLocalErrandTransportRequest.actualTotalTripDuration,
                    totalEmployeePerdiemNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalEmployeePerdiemNGN,2),
                    totalEmployeePerdiemUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalEmployeePerdiemUSD,2),
                    totalAirportTaxiCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalAirportTaxiCostNGN,2),
                    totalAirportTaxiCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalAirportTaxiCostUSD,2),
                    totalGroundTransportCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalGroundTransportCostNGN,2),
                    totalGroundTransportCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalGroundTransportCostUSD,2),
                    totalAncilliaryCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalAncilliaryCostNGN,2),
                    totalAncilliaryCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.totalAncilliaryCostUSD,2),
                    actualTotalEmployeePerdiemNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalEmployeePerdiemNGN,2),
                    actualTotalEmployeePerdiemUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalEmployeePerdiemUSD,2),
                    actualTotalAirportTaxiCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalAirportTaxiCostNGN,2),
                    actualTotalAirportTaxiCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalAirportTaxiCostUSD,2),
                    actualTotalGroundTransportCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalGroundTransportCostNGN,2),
                    actualTotalGroundTransportCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalGroundTransportCostUSD,2),
                    actualTotalAncilliaryCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalAncilliaryCostNGN,2),
                    actualTotalAncilliaryCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalAncilliaryCostUSD,2),
                    actualTotalMiscCostNGN: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalMiscCostNGN,2),
                    actualTotalMiscCostUSD: LocalErrandTransportRequestHelper.formatNumber(currentLocalErrandTransportRequest.actualTotalMiscCostUSD,2),
                    actionUrl:  Meteor.absoluteUrl() + 'business/' + currentLocalErrandTransportRequest.businessId + '/localerrandtransportrequests/printretirement?requisitionId=' + currentLocalErrandTransportRequest._id,
                    whoToRefundNGN: LocalErrandTransportRequestHelper.checkWhoToRefund(currentLocalErrandTransportRequest, "NGN"),
                    whoToRefundUSD: LocalErrandTransportRequestHelper.checkWhoToRefund(currentLocalErrandTransportRequest, "USD")

                })
            });

            return true
        } catch(e) {
            console.log(e);
            //throw new Meteor.Error(401, e.message);
        }
    },
    sendRequisitionNeedsTreatment: function(supervisorFullName, supervisorEmail, createdByFullName,
        currentLocalErrandTransportRequest, approvalsPageUrl) {
            try {
                SSR.compileTemplate("localErrandTransportRequisitionNotificationForTreatment", Assets.getText("emailTemplates/localErrandTransportRequisitionNotificationForTreatment.html"));

                Email.send({
                    to: supervisorEmail,
                    from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                    subject: "Local Errand Transport Request approved and needs to be treated",
                    html: SSR.render("localErrandTransportRequisitionNotificationForTreatment", {
                        user: supervisorFullName,
                        createdBy: createdByFullName,
                        currentLocalErrandTransportRequest,
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
    *  Local Errand Transport Request Methods
    */
    Meteor.methods({

        "LocalErrandTransportRequest/createDraft": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})
                // console.log("currentLocalErrandTransportRequest1")
                // console.log(currentLocalErrandTransportRequest)
            }else{
                currentLocalErrandTransportRequest._id = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);

            }


            return true;
        },
        "LocalErrandTransportRequest/editLocalErrandTransportRequisition": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            const supervisor = currentLocalErrandTransportRequest.supervisorId || (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            currentLocalErrandTransportRequest.supervisorId = supervisor;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode) {
                currentLocalErrandTransportRequest.budgetHolderId = currentLocalErrandTransportRequest.budgetHolderId || budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                const createdBySubject = "Updated local errand transport request for " + createdBy.profile.fullName;
                const supervisorSubject = "Please approve the updated local errand transport request for " + createdBy.profile.fullName;


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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, supervisorEmail, supervisorSubject);
                // console.log("currentLocalErrandTransportRequest1")
                // console.log(currentLocalErrandTransportRequest)
            }else{
                currentLocalErrandTransportRequest._id = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);

            }


            return true;
        },
        "LocalErrandTransportRequest/editLocalErrandTransportRetirement": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            const supervisor = currentLocalErrandTransportRequest.supervisorId || (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            currentLocalErrandTransportRequest.supervisorId = supervisor;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode) {
                currentLocalErrandTransportRequest.budgetHolderId = currentLocalErrandTransportRequest.budgetHolderId || budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                const createdBySubject = "Updated local errand transport retirement for " + createdBy.profile.fullName;
                const supervisorSubject = "Please approve the updated local errand transport retirement for " + createdBy.profile.fullName;


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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, supervisorEmail, supervisorSubject);
                // console.log("currentLocalErrandTransportRequest1")
                // console.log(currentLocalErrandTransportRequest)
            }else{
                currentLocalErrandTransportRequest._id = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);

            }


            return true;
        },
        "LocalErrandTransportRequest/cancelTravel": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            //if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            //    let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
            //    throw new Meteor.Error(401, errMsg);
            //}
            if(currentLocalErrandTransportRequest._id){

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                //only invole city by city admin in trip was approved
                if (currentLocalErrandTransportRequest.status === "Approved By Budget Holder"){
                    for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
                        otherPartiesEmail += "," + LocalErrandTransportRequestHelper.getTravelcityEmail(currentLocalErrandTransportRequest.trips[i].toId);
                        otherPartiesEmail += "," + LocalErrandTransportRequestHelper.getTravelcityEmail(currentLocalErrandTransportRequest.trips[i].fromId);
                    }
                }

                //explicitely set status
                currentLocalErrandTransportRequest.status = "Cancelled";

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})

                otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const budgetHolder = Meteor.users.findOne(currentLocalErrandTransportRequest.budgetHolderId);
                let createdByEmail = "";
                let budgetHolderEmail = "";
                let createdByName = "Employee"
                let budgetHolderName = "Budget Holder"
                let createdBySubject = "";
                let budgetHolderSubject = "";

                if(currentLocalErrandTransportRequest.status === "Approved By Budget Holder"){
                    createdBySubject = "Local Errand Transport Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
                    budgetHolderSubject = "Local Errand Transport Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
                }else{
                    createdBySubject = "Local Errand Transport Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
                    budgetHolderSubject = "Local Errand Transport Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Budget Holder
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, budgetHolderEmail, budgetHolderSubject);


            }

            return true;
        },

        "LocalErrandTransportRequest/create": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})
                // console.log("currentLocalErrandTransportRequest1")
                // console.log(currentLocalErrandTransportRequest)
            }else{
                currentLocalErrandTransportRequest._id = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
                // console.log("currentLocalErrandTransportRequest")
                // console.log(currentLocalErrandTransportRequest)
                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                const createdBySubject = "New local errand transport request for " + createdBy.profile.fullName;
                const supervisorSubject = "Please approve local errand transport request for " + createdBy.profile.fullName;


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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, supervisorEmail, supervisorSubject);

            }

            return true;
        },
        "LocalErrandTransportRequest/retire": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }

            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest});

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                const createdBySubject = "New local errand transport retirement for " + createdBy.profile.fullName;
                const supervisorSubject = "Please approve local errand transport retirement for " + createdBy.profile.fullName;


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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, supervisorEmail, supervisorSubject);

            }else{
                let result = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
            }

            return true;
        },
        "LocalErrandTransportRequest/createDraft": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }

            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest});

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                const createdBySubject = "New local errand transport retirement for " + createdBy.profile.fullName;
                const supervisorSubject = "Please approve local errand transport retirement for " + createdBy.profile.fullName;


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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, supervisorEmail, supervisorSubject);

            }else{
                let result = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
            }

            return true;
        },
        "LocalErrandTransportRequest/supervisorApprovals": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){
                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
                const budgetHolder = Meteor.users.findOne(currentLocalErrandTransportRequest.budgetHolderId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                let budgetHolderEmail = "";
                let budgetHolderName = "Budget Holder"
                let createdBySubject = "";
                let supervisorSubject = "";
                const budgetHolderSubject = "Please approve local errand transport request for " + createdBy.profile.fullName;


                if(currentLocalErrandTransportRequest.status === "Approved By Supervisor"){
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has approved your local errand transport request";
                    supervisorSubject = "You have approved " + createdBy.profile.fullName + "'s local errand transport request";
                }else{
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has rejected your local errand transport request";
                    supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s local errand transport request";
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

                if (budgetHolder.emails.length > 0){
                    budgetHolderEmail = budgetHolder.emails[0].address;
                    budgetHolderEmail = budgetHolderEmail  + ", bulkpay@c2gconsulting.com";
                    console.log(budgetHolderEmail);
                }


                //Send to requestor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, supervisorEmail, supervisorSubject);

                //Send to Budget holder
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, budgetHolderEmail, budgetHolderSubject);


            }else{
                let result = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
            }

            return true;
        },
        "LocalErrandTransportRequest/budgetHolderApprovals": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})
                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                //only invole city by city admin in trip was approved
                if (currentLocalErrandTransportRequest.status === "Approved By Budget Holder"){
                    for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
                        otherPartiesEmail += "," + LocalErrandTransportRequestHelper.getTravelcityEmail(currentLocalErrandTransportRequest.trips[i].toId);
                        otherPartiesEmail += "," + LocalErrandTransportRequestHelper.getTravelcityEmail(currentLocalErrandTransportRequest.trips[i].fromId);
                    }
                }

                otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const budgetHolder = Meteor.users.findOne(currentLocalErrandTransportRequest.budgetHolderId);
                let createdByEmail = "";
                let budgetHolderEmail = "";
                let createdByName = "Employee"
                let budgetHolderName = "Budget Holder"
                let createdBySubject = "";
                let budgetHolderSubject = "";

                if(currentLocalErrandTransportRequest.status === "Approved By Budget Holder"){
                    createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s local errand transport request";
                    budgetHolderSubject = "You have approved " + createdBy.profile.fullName + "'s local errand transport request";
                }else{
                    createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has rejected your local errand transport request";
                    budgetHolderSubject = "You have rejected " + createdBy.profile.fullName + "'s local errand transport request";
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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Budget Holder
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRequestEmail(currentLocalErrandTransportRequest, budgetHolderEmail, budgetHolderSubject);


            }else{
                let result = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
            }

            return true;
        },
        "LocalErrandTransportRequest/supervisorRetirements": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest});

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
                const financeApprover = Meteor.users.findOne(currentLocalErrandTransportRequest.financeApproverId);
                let createdByEmail = "";
                let supervisorEmail = "";
                let createdByName = "Employee"
                let supervisorName = "Supervisor"
                let financeApproverEmail = "";
                let financeApproverName = "Finance"
                let createdBySubject = "";
                let supervisorSubject = "";
                const financeApproverSubject = "Please approve local errand transport retirement for " + createdBy.profile.fullName;



                if(currentLocalErrandTransportRequest.retirementStatus === "Retirement Approved By Supervisor"){
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has approved your local errand transport retirement";
                    supervisorSubject = "You have approved " + createdBy.profile.fullName + "'s local errand transport retirement";
                }else{
                    createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has rejected your local errand transport retirement";
                    supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s local errand transport retirement";
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


                if (financeApprover.emails.length > 0){
                    financeApproverEmail = financeApprover.emails[0].address;
                    financeApproverEmail = financeApproverEmail  + ", bulkpay@c2gconsulting.com";
                    console.log(financeApproverEmail);
                }

                //Send to requestor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Supervisor
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, supervisorEmail, supervisorSubject);

                //Send to Finance
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, financeApproverEmail, financeApproverSubject);



            }else{
                let result = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
            }

            return true;
        },
        "LocalErrandTransportRequest/budgetHolderRetirements": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})
            }else{
                let result = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
            }

            return true;
        },
        "LocalErrandTransportRequest/financeRetirements": function(currentLocalErrandTransportRequest){
            if(!this.userId && Core.hasPayrollAccess(this.userId)){
                throw new Meteor.Error(401, "Unauthorized");
            }
            check(currentLocalErrandTransportRequest.businessId, String);
            this.unblock()

            currentLocalErrandTransportRequest.supervisorId = (Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy)).directSupervisorId;
            let budgetCode = Budgets.findOne(currentLocalErrandTransportRequest.budgetCodeId);
            if (budgetCode){
                currentLocalErrandTransportRequest.budgetHolderId = budgetCode.employeeId;
                currentLocalErrandTransportRequest.financeApproverId = budgetCode.financeApproverId;
            }

            if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
                let errMsg = "Sorry, you have not allowed to create a local errand transport requisition because you are a super admin"
                throw new Meteor.Error(401, errMsg);
            }
            if(currentLocalErrandTransportRequest._id){

                LocalErrandTransportRequisitions.update(currentLocalErrandTransportRequest._id, {$set: currentLocalErrandTransportRequest})

                let otherPartiesEmail = "bulkpay@c2gconsulting.com";

                //For retirements no need to involve city by city admin
                // for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
                //    otherPartiesEmail += "," + LocalErrandTransportRequestHelper.getTravelcityEmail(currentLocalErrandTransportRequest.trips[i].toId);
                //    otherPartiesEmail += "," + LocalErrandTransportRequestHelper.getTravelcityEmail(currentLocalErrandTransportRequest.trips[i].fromId);
                // }

                otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

                const createdBy = Meteor.users.findOne(currentLocalErrandTransportRequest.createdBy);
                const financeApprover = Meteor.users.findOne(currentLocalErrandTransportRequest.financeApproverId);
                let createdByEmail = "";
                let financeApproverEmail = "";
                let createdByName = "Employee"
                let financeApproverName = "Finance"
                let createdBySubject = "";
                let financeApproverSubject = "";

                if(currentLocalErrandTransportRequest.retirementStatus === "Retirement Approved Finance"){
                    createdBySubject = "Finance: " + financeApprover.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s local errand transport retirement";
                    financeApproverSubject = "You have approved " + createdBy.profile.fullName + "'s local errand transport retirement";
                }else{
                    createdBySubject = "Finance: " + financeApprover.profile.fullName + " has rejected your local errand transport retirement";
                    financeApproverSubject = "You have rejected " + createdBy.profile.fullName + "'s local errand transport retirement";
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
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, createdByEmail, createdBySubject);

                //Send to Finance
                LocalErrandTransportRequestHelper.sendLocalErrandTransportRetirementEmail(currentLocalErrandTransportRequest, financeApproverEmail, financeApproverSubject);



            }else{
                let result = LocalErrandTransportRequisitions.insert(currentLocalErrandTransportRequest);
            }

            return true;
        }

    });
