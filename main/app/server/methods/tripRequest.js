import _ from 'underscore';

// import mailgun from 'mailgun-js';

// const mailgunInstance = mailgun({
//   apiKey: process.env.MAILGUN_API_KEY,
//   domain: process.env.MAILGUN_DOMAIN,
//   host: process.env.MAILGUN_HOST,
// });

let TravelRequestHelper = {
  checkWhoToRefund: function(currentTravelRequest, currency){
    let formatNumber = function(numberVariable, n, x) {
      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
      return numberVariable.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    }

    if (currency === "USD"){
      let usdDifference = currentTravelRequest.totalAncilliaryCostUSD - currentTravelRequest.actualTotalAncilliaryCostUSD;
      if (currentTravelRequest.cashAdvanceNotRequired){
        usdDifference = -1 * currentTravelRequest.actualTotalAncilliaryCostUSD;
      }
      if (usdDifference > 0){
        // return "Employee to refund " + formatNumber(usdDifference,2) + " USD";
        return "Company to refund " + formatNumber(usdDifference,2) + " USD";
      }else if (usdDifference < 0){
        return "Company to refund " + formatNumber((-1 * usdDifference),2) + " USD";
      }else{
        return "No USD refunds"
      }
    } else if (currency === "NGN"){
      let ngnDifference = currentTravelRequest.totalAncilliaryCostNGN - currentTravelRequest.actualTotalAncilliaryCostNGN;
      if (currentTravelRequest.cashAdvanceNotRequired){
        ngnDifference = -1 * currentTravelRequest.actualTotalAncilliaryCostNGN;
      }
      if (ngnDifference > 0){
        // return "Employee to refund " + formatNumber(ngnDifference,2) + " NGN";
        return "Company to refund " + formatNumber(ngnDifference,2) + " NGN";
      } else if (ngnDifference < 0){
        return "Company to refund " + formatNumber((-1 * ngnDifference),2) + " NGN";
      } else{
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
    return travelcityId
  },
  getTravelcityEmail: function(travelcityId) {
    const travelcity = Travelcities.findOne({_id: travelcityId})

    if(travelcity) {
      return travelcity.notificationEmail;
    }
  },
  sendTravelRequestEmail: function(currentTravelRequest, emailTo, emailSubject, isExternalMail, writeReadOnly) {
    try {
      // const hasBookingAgent = actionType && (actionType.includes('booking') || actionType.includes('Booking'))
      const lastUrlPath = writeReadOnly ? 'bookingrequisition' : 'printrequisition';
      const isTripType = (tripType) => currentTravelRequest.type == tripType;
      const oneWayOrMultipleStops = isTripType('Single') ? 'One Way Trip' : 'Multiple Stops'
      const travelType = isTripType("Return") ? 'Return Trip': `${oneWayOrMultipleStops}`;
      const returnDate = isTripType("Return") ? currentTravelRequest.trips[0].returnDate : currentTravelRequest.trips[currentTravelRequest.trips.length-1].departureDate;
      const fromCountry = currentTravelRequest.trips[0].fromCountry;
      const toCountry = currentTravelRequest.trips[0].toCountry;
      const fromCity = TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].fromId);
      const toCity = TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].toId);
      const fromAddress = fromCity ? `${fromCity}, ${fromCountry}` : '';
      const toAddress = toCity ? `${toCity}, ${toCountry}` : '';
      let itenerary = fromAddress + " - " + toAddress;
      if (isTripType("Multiple")){
        for (i = 1; i < currentTravelRequest.trips.length; i++) {
          let toCountry2 = currentTravelRequest.trips[i].toCountry;
          toCountry2 = toCountry2 ? `, ${toCountry2}` : '';
          itenerary += " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[i].toId) + toCountry2;
        }
      }

      const getStatus  = (status) => {
        const { APPROVED_BY_HOC, APPROVED_BY_HOD, REJECTED_BY_HOC, REJECTED_BY_HOD, } = Core.ALL_TRAVEL_STATUS;
        let newStatus = (status || '').replace(APPROVED_BY_HOC, APPROVED_BY_HOD);
        newStatus = (newStatus || '').replace(REJECTED_BY_HOC, REJECTED_BY_HOD);
        return newStatus;
      }

      // const data = {
      //   to: emailTo,
      //   from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
      //   subject: emailSubject,
      //   template: isExternalMail ? process.env.TRAVEL_REQUEST_EXTERNAL_NOTIFICATION2 : process.env.TRAVEL_REQUEST_NOTIFICATION2,
      //   'h:X-Mailgun-Variables': JSON.stringify({
      //     itenerary: itenerary,
      //     departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
      //     returnDate: TravelRequestHelper.formatDate(returnDate),
      //     travelType: travelType,
      //     employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
      //     status: getStatus(currentTravelRequest.status),
      //     description: currentTravelRequest.description,
      //     totalTripDuration: currentTravelRequest.totalTripDuration,
      //     totalEmployeePerdiemNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemNGN,2),
      //     totalEmployeePerdiemUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemUSD,2),
      //     totalAirportTaxiCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostNGN,2),
      //     totalAirportTaxiCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostUSD,2),
      //     totalGroundTransportCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostNGN,2),
      //     totalGroundTransportCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostUSD,2),
      //     totalHotelCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalHotelCostNGN,2),
      //     totalHotelCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalHotelCostUSD,2),
      //     totalTripCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalTripCostNGN,2),
      //     totalTripCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalTripCostUSD,2),
      //     actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + `/travelrequests2/${lastUrlPath}?requisitionId=` + currentTravelRequest._id
      //   }),
      // }
      // Core.sendMail(data)

      SSR.compileTemplate("TravelRequestNotification2", Assets.getText("emailTemplates/TravelRequestNotification2.html"));
      Email.send({
        to: emailTo,
        from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
        subject: emailSubject,
        html: SSR.render("TravelRequestNotification2", {
          itenerary: itenerary,
          departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
          returnDate: TravelRequestHelper.formatDate(returnDate),
          travelType: travelType,
          employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
          status: getStatus(currentTravelRequest.status),
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
          actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + `/travelrequests2/${lastUrlPath}?requisitionId=` + currentTravelRequest._id
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

      const getStatus  = (status) => {
        const { APPROVED_BY_HOC, APPROVED_BY_HOD, REJECTED_BY_HOC, REJECTED_BY_HOD } = Core.ALL_TRAVEL_STATUS;
        let newStatus = (status || '').replace(APPROVED_BY_HOC, APPROVED_BY_HOD);
        newStatus = (newStatus || '').replace(REJECTED_BY_HOC, REJECTED_BY_HOD);
        return newStatus;
      }

      // const data = {
      //   to: emailTo,
      //   from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
      //   subject: emailSubject,
      //   template: process.env.TRAVEL_RETIREMENT_NOTIFICATION2,
      //   'h:X-Mailgun-Variables': JSON.stringify({ 
      //     itenerary: itenerary,
      //     departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
      //     returnDate: TravelRequestHelper.formatDate(returnDate),
      //     travelType: travelType,
      //     employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
      //     status: getStatus(currentTravelRequest.retirementStatus),
      //     description: currentTravelRequest.description,
      //     totalTripDuration: currentTravelRequest.totalTripDuration,
      //     actualTotalTripDuration: currentTravelRequest.actualTotalTripDuration,
      //     totalEmployeePerdiemNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemNGN,2),
      //     totalEmployeePerdiemUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalEmployeePerdiemUSD,2),
      //     totalAirportTaxiCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostNGN,2),
      //     totalAirportTaxiCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalAirportTaxiCostUSD,2),
      //     totalGroundTransportCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostNGN,2),
      //     totalGroundTransportCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalGroundTransportCostUSD,2),
      //     totalAncilliaryCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.totalAncilliaryCostNGN,2),
      //     totalAncilliaryCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.totalAncilliaryCostUSD,2),
      //     actualTotalEmployeePerdiemNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalEmployeePerdiemNGN,2),
      //     actualTotalEmployeePerdiemUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalEmployeePerdiemUSD,2),
      //     actualTotalAirportTaxiCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAirportTaxiCostNGN,2),
      //     actualTotalAirportTaxiCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAirportTaxiCostUSD,2),
      //     actualTotalGroundTransportCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalGroundTransportCostNGN,2),
      //     actualTotalGroundTransportCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalGroundTransportCostUSD,2),
      //     actualTotalAncilliaryCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAncilliaryCostNGN,2),
      //     actualTotalAncilliaryCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalAncilliaryCostUSD,2),
      //     actualTotalMiscCostNGN: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalMiscCostNGN,2),
      //     actualTotalMiscCostUSD: TravelRequestHelper.formatNumber(currentTravelRequest.actualTotalMiscCostUSD,2),
      //     actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printretirement?requisitionId=' + currentTravelRequest._id,
      //     whoToRefundNGN: TravelRequestHelper.checkWhoToRefund(currentTravelRequest, "NGN"),
      //     whoToRefundUSD: TravelRequestHelper.checkWhoToRefund(currentTravelRequest, "USD")
      //   }),
      // }
      // Core.sendMail(data)

      //Todo, itenerary, employee full name
      SSR.compileTemplate("TravelRetirementNotification2", Assets.getText("emailTemplates/TravelRetirementNotification2.html"));
      Email.send({
        to: emailTo,
        from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
        subject: emailSubject,
        html: SSR.render("TravelRetirementNotification2", {
          itenerary: itenerary,
          departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
          returnDate: TravelRequestHelper.formatDate(returnDate),
          travelType: travelType,
          employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
          status: getStatus(currentTravelRequest.retirementStatus),
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
        from: "OILSERV TRIPS™ Team <eariaroo@c2gconsulting.com>",
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

Core.TravelRequestHelper = TravelRequestHelper

/**
*  Travel Request Methods
*/
Meteor.methods({
  "TRIPREQUEST/createDraft": function(currentTravelRequest){
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

    Core.canProcessTrip();
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
    } else {
      currentTravelRequest._id = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/editTravelRequisition": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    Core.canProcessTrip();
    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      Core.sendUpdateOrCancellationMail(currentTravelRequest, TravelRequestHelper, true);
    }else{
      currentTravelRequest._id = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/editTravelRetirement": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()


      // Verify user creating a trip
      // Core.canCreateTravel()
    Core.canProcessTrip();
    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      Core.sendRetirementUpdateMail(tripInfo, TravelRequestHelper, true);
    } else{
      currentTravelRequest._id = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/cancelTravel": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    // let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    // if (budgetCode){
    //   currentTravelRequest.budgetHolderId = budgetCode.employeeId;
    //   currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    // }
    if (currentTravelRequest._id){
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const tripInfo = currentTravelRequest;
      const { CANCELLED } = Core.ALL_TRAVEL_STATUS;

      //explicitly set status
      currentTravelRequest.status = CANCELLED;

      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      Core.sendUpdateOrCancellationMail(tripInfo, TravelRequestHelper);
    }

    return true;
  },
  // "TRIPREQUEST/create": function(currentTravelRequest){
  //   if(!this.userId && Core.hasPayrollAccess(this.userId)){
  //       throw new Meteor.Error(401, "Unauthorized");
  //   }
  //   check(currentTravelRequest.businessId, String);
  //   this.unblock()
  //   try {
  //     const fetchUser = (conditions, position, skipApprovalTillApprovedByBudgetHolder) => {
  //       // if (skipApprovalTillApprovedByBudgetHolder) return "";
  //       const isPartOfApprovalFlow = Core.getApprovalConfig(position, currentTravelRequest)
  //       if (position && !isPartOfApprovalFlow) return ""
  //       const fetchedUser = Meteor.users.findOne(conditions);
  //       if (fetchedUser) return fetchedUser._id;
  //       return ''
  //     }

  //     // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
  //     const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
  //     const {
  //       hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
  //     } = Core.getApprovalQueries(currentUser);

  //     const { directSupervisorId, _id, positionId } = currentUser
  //     const userId = _id || Meteor.userId()
  //     currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond, Core.Approvals.HOD)
  //     currentTravelRequest.managerId = fetchUser(managerCond, Core.Approvals.MD)
  //     currentTravelRequest.gcooId = fetchUser(GcooCond, Core.Approvals.GCOO)
  //     currentTravelRequest.gceoId = fetchUser(GceoCond, Core.Approvals.GCEO)
  //     currentTravelRequest.bstId = fetchUser(bstCond, Core.Approvals.BST)
  //     currentTravelRequest.logisticsId = fetchUser(logisticCond, Core.Approvals.LOGISTICS)
  //     currentTravelRequest.financeApproverId = fetchUser(financeCond, Core.Approvals.FINANCE)
  //     currentTravelRequest.securityId = fetchUser(securityCond, Core.Approvals.SECURITY)

  //     let budgetCode = Budgets.findOne({ businessId: currentTravelRequest.businessId });
  //     console.log('budgetCode', budgetCode);
  //     if (budgetCode){
  //       currentTravelRequest.budgetCodeId = budgetCode._id
  //       currentTravelRequest.budgetHolderId = budgetCode.employeeId;
  //       // currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
  //     }

  //     // Verify user creating a trip
  //     Core.canCreateTravel()
      
  //     if (currentTravelRequest._id){
  //       TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
  //       // console.log("currentTravelRequest1")
  //       // console.log(currentTravelRequest)
  //     } else {
  //       currentTravelRequest._id = TravelRequisition2s.insert(currentTravelRequest);
  //       // console.log("currentTRIPREQUEST")
  //       // console.log(currentTravelRequest)
  //       let otherPartiesEmail = "bulkpay@c2gconsulting.com";

  //       const { BUDGETHOLDER, HOD } = Core.Approvals

  //       const isInternationalTrip = destinationType === 'International';
  //       let isAirRailTransportationMode;
  //       for (let i = 0; i < trips.length; i++) {
  //         const { transportationMode } = trips[i];
  //         if (transportationMode == 'AIR' || transportationMode == 'RAIL') isAirRailTransportationMode = true
  //       }

  //       // if (isInternationalTrip || isAirRailTransportationMode) {
  //       //   Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, "", BUDGETHOLDER)
  //       // } else {
  //         Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, "", HOD)
  //       // }

  //     }

  //     return true;
  //   } catch (error) {
  //     console.log('error', error);
  //     throw new Meteor.Error(401, error.message || error);
  //   }
  // },
  "TRIPREQUEST/create": function (currentTravelRequest) {
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
        throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()
    try {
      const fetchUser = (conditions, position, skipApprovalTillApprovedByBudgetHolder) => {
        // if (skipApprovalTillApprovedByBudgetHolder) return "";
        const isPartOfApprovalFlow = Core.getApprovalConfig(position, currentTravelRequest)
        if (position && !isPartOfApprovalFlow) return ""
        const fetchedUser = Meteor.users.findOne(conditions);
        if (fetchedUser) return fetchedUser._id;
        return ''
      }

      const fetchUsers = (conditions, position) => {
        const isPartOfApprovalFlow = Core.getApprovalConfig(position, currentTravelRequest)
        if (position && !isPartOfApprovalFlow) return ""
        const fetchedUsers = Meteor.users.find(conditions);
        if (fetchedUsers) return fetchedUsers.map(fetchedUser => fetchedUser._id);
        return ''
      }

      // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
      const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
      const {
        pmCond, hocCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
      } = Core.getUserPrivilege(currentTravelRequest);

      const { departmentOrProjectId, costCenter } = currentTravelRequest;

      // if (currentTravelRequest.costCenter === 'Project') {
      //   const currentProject = Projects.findOne({ _id: departmentOrProjectId });
      //   const { project_manager } = currentProject || {};

      //   const username = (project_manager || " ").split(' ').reverse().join(' ');
      //   console.log('project_manager', project_manager);
      //   const PM = Meteor.users.findOne({ $or: [{ 'profile.fullName': { '$regex': `${project_manager}`, '$options': 'i' } }, { 'profile.fullName': { '$regex': `${username}`, '$options': 'i' } }] });
      //   console.log('PM----PM', PM);
      //   if (!PM) throw new Meteor.Error(404, "Project manager doesn't exist");
      //   currentTravelRequest.pmId = (PM && PM._id) || currentTravelRequest.supervisorId;
      //   delete currentTravelRequest.hocId
      // } else {
      //   const currentCostCenter = CostCenters.findOne({ _id: departmentOrProjectId });
      //   const { person_responsible_employee_number: userId } = currentCostCenter || {};

      //   const hoc = Meteor.users.findOne({ 'employeeProfile.employeeId': userId });

      //   currentTravelRequest.hocId =  (hoc && hoc._id)  || currentTravelRequest.hocId;
      //   delete currentTravelRequest.pmId
      // }

      if (costCenter === 'Project') {
        currentTravelRequest.pmId = fetchUser(pmCond, Core.Approvals.HOD)
        if (!currentTravelRequest.pmId) throw new Meteor.Error(404, "Project manager doesn't exist");
      }

      else if (costCenter === 'Department') {
        currentTravelRequest.hocId = fetchUser(hocCond, Core.Approvals.HOD)
        if (!currentTravelRequest.hocId) throw new Meteor.Error(404, "Hoc doesn't exist");
      };
      currentTravelRequest.managerId = fetchUser(managerCond, Core.Approvals.MD)
      currentTravelRequest.gcooId = fetchUser(GcooCond, Core.Approvals.GCOO)
      currentTravelRequest.gceoId = fetchUser(GceoCond, Core.Approvals.GCEO)
      currentTravelRequest.bstId = fetchUser(bstCond, Core.Approvals.BST)
      currentTravelRequest.bstIds = fetchUsers(bstCond, Core.Approvals.BST)
      currentTravelRequest.logisticsId = fetchUser(logisticCond, Core.Approvals.LOGISTICS)
      currentTravelRequest.logisticsIds = fetchUsers(logisticCond, Core.Approvals.LOGISTICS)
      currentTravelRequest.financeApproverId = fetchUser(financeCond, Core.Approvals.FINANCE)
      currentTravelRequest.securityId = fetchUser(securityCond, Core.Approvals.SECURITY)
      currentTravelRequest.securityIds = fetchUsers(securityCond, Core.Approvals.SECURITY)


      // let budgetCode = Budgets.findOne({ businessId: currentTravelRequest.businessId });
      // console.log('budgetCode', budgetCode);
      // if (budgetCode){
      //   currentTravelRequest.budgetCodeId = budgetCode._id
      //   currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      //   // currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
      // }

      // GET ALL DELEGATES
      currentTravelRequest = Core.travelDelegateIds('budgetHolderId', currentTravelRequest);
      currentTravelRequest = Core.travelDelegateIds('supervisorId', currentTravelRequest);
      currentTravelRequest = Core.travelDelegateIds('managerId', currentTravelRequest);
      currentTravelRequest = Core.travelDelegateIds('gcooId', currentTravelRequest);
      currentTravelRequest = Core.travelDelegateIds('gceoId', currentTravelRequest);
      // currentTravelRequest = Core.travelDelegateIds('bstId', currentTravelRequest);
      // currentTravelRequest = Core.travelDelegateIds('logisticsId', currentTravelRequest);
      currentTravelRequest = Core.travelDelegateIds('financeApproverId', currentTravelRequest);
      // currentTravelRequest = Core.travelDelegateIds('securityId', currentTravelRequest);
      // END OF DELEGATES

      // Verify user creating a trip
      Core.canCreateTravel()

      if (currentTravelRequest._id){
        TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
        // console.log("currentTravelRequest1")
        // console.log(currentTravelRequest)
      } else {
        currentTravelRequest._id = TravelRequisition2s.insert(currentTravelRequest);
        // console.log("currentTRIPREQUEST")
        // console.log(currentTravelRequest)
        let otherPartiesEmail = "bulkpay@c2gconsulting.com";

        let isTripByAir;
        for (let i = 0; i < currentTravelRequest.trips.length; i++) {
          const trip = currentTravelRequest.trips[i];
          if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
        }
        const { BUDGETHOLDER, PM, HOD, MD, GCOO, GCEO, BST, LOGISTICS } = Core.Approvals

        const { destinationType } = currentTravelRequest;
        const isInternationalTrip = destinationType === 'International';

        const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = Core.getWhereToStartApproval(currentTravelRequest)
        let nextRecipientPosition = '';

        console.log('isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO', isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO)

        // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
        if (isTripByAir) {
          const isProject = currentTravelRequest.costCenter === 'Project';
          if ((!isAboveOrHOD && !nextRecipientPosition) && !isProject) nextRecipientPosition = HOD
          if ((!isAboveOrHOD && !nextRecipientPosition) && isProject) nextRecipientPosition = PM
          if (!isAboveOrMD && !nextRecipientPosition) nextRecipientPosition = MD
          if (!isAboveOrGCOO && !nextRecipientPosition) nextRecipientPosition = GCOO
          if (!isInternationalTrip && !nextRecipientPosition) nextRecipientPosition = BST
          if (!isAboveOrGCEO && !nextRecipientPosition) nextRecipientPosition = GCEO
          if (!nextRecipientPosition) nextRecipientPosition = BST
        }

        // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
        if (!isTripByAir) {
          if (!isAboveOrHOD) {
            nextRecipientPosition = HOD
          }

          if (!nextRecipientPosition || isAboveOrHOD || isAboveOrMD || isAboveOrGCOO || isAboveOrGCEO) {
            nextRecipientPosition = LOGISTICS
            } else {
            nextRecipientPosition = HOD
          }
        }

        console.log('nextRecipientPosition', nextRecipientPosition)
        Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, "", nextRecipientPosition)
      }

      return true;
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(401, error.message || error);
    }
  },
  /**
   * @description Create trip extension
   * @param {*} currentTravelRequest 
   * @returns 
   */
  "TRIPREQUEST/createExtension": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
        throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    // Verify user creating a trip
    Core.canCreateTravel()

    if (currentTravelRequest._id) {
      currentTravelRequest.editted = true;
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      let isTripByAir;
      for (let i = 0; i < currentTravelRequest.trips.length; i++) {
        const trip = currentTravelRequest.trips[i];
        if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
      }

      const { BUDGETHOLDER, HOD, MD, GCOO, GCEO, BST, LOGISTICS } = Core.Approvals

      const { destinationType } = currentTravelRequest;
      const isInternationalTrip = destinationType === 'International';

      const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = Core.getWhereToStartApproval(currentTravelRequest)
      let nextPosition = HOD

      // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
      if (isTripByAir) {
        if (!isAboveOrHOD && !nextPosition) nextPosition = HOD
        if (!isAboveOrMD && !nextPosition) nextPosition = MD
        if (!isAboveOrGCOO && !nextPosition) nextPosition = GCOO
        if (!isInternationalTrip && !nextPosition) nextPosition = BST
        if (!isAboveOrGCEO && !nextPosition) nextPosition = GCEO
        if (!nextPosition) nextPosition = BST
      }

      // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
      if (!isTripByAir) {
        if (!isAboveOrHOD && !nextPosition) {
          nextPosition = HOD
        }

        if (nextPosition || isAboveOrHOD || isAboveOrMD || isAboveOrGCOO || isAboveOrGCEO) {
          nextPosition = LOGISTICS
          } else {
          nextPosition = HOD
        }
      }
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, null, nextPosition)
    }

    return true;
  },
  "TRIPREQUEST/retirementReminder": function(currentTravelRequest){
    // if(!this.userId && Core.hasPayrollAccess(this.userId)){
    //   throw new Meteor.Error(401, "Unauthorized");
    // }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    // Core.canProcessTrip();

    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest});

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";
      let nextApproval = null;

      Core.sendRetirementApprovalMail(currentTravelRequest, TravelRequestHelper, null, nextApproval, 'Reminder: Trip is overdue for retirement');
    } else{
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/retire": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    Core.canProcessTrip();

    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest});

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";
      const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = Core.getWhereToStartApproval(currentTravelRequest)
      
      const { HOD, FINANCE } = Core.Approvals;
      let nextApproval = HOD;

      if (isAboveOrHOD || isAboveOrMD || isAboveOrGCOO || isAboveOrGCEO) {
        nextApproval = FINANCE
      }

      Core.sendRetirementApprovalMail(currentTravelRequest, TravelRequestHelper, null, nextApproval);
    } else{
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/createDraft": function(currentTravelRequest){
    if (!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    Core.canProcessTrip();

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest});

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { HOD } = Core.Approvals;
      let nextApproval = HOD;
      Core.sendRetirementApprovalMail(currentTravelRequest, TravelRequestHelper, null, nextApproval);
    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/projectManagerApprovals": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
        throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
    }

    Core.canProcessTrip();
    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      const { PM, MD, LOGISTICS } = Core.Approvals;
      const { APPROVED_BY_PM } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = MD;
      if (!isTripByAir) nextApproval = LOGISTICS;
      nextApproval = currentTravelRequest.status === APPROVED_BY_PM ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, PM, nextApproval);

    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/hocApprovals": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
        throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()
    let isTripByAir, isTripByRail, isTripByLand;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true
      if (trip.transportationMode === 'RAIL') isTripByRail = true
      if (trip.transportationMode === 'isTripByLand') isTripByLand = true
    }

    Core.canProcessTrip();
    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      const { HOC, MD, LOGISTICS } = Core.Approvals;
      const { APPROVED_BY_HOC } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = MD;
      if (!isTripByAir) nextApproval = LOGISTICS;
      nextApproval = currentTravelRequest.status === APPROVED_BY_HOC ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, HOC, nextApproval);

    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/supervisorApprovals": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
        throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true;
    }

    Core.canProcessTrip();
    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      const { HOD, MD, LOGISTICS } = Core.Approvals;
      const { APPROVED_BY_HOD } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = MD;
      if (!isTripByAir) nextApproval = LOGISTICS;
      nextApproval = currentTravelRequest.status === APPROVED_BY_HOD ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, HOD, nextApproval);

    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/budgetHolderApprovals": function(currentTravelRequest){
    if (!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }

    check(currentTravelRequest.businessId, String);
    this.unblock()

    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
    }

    const fetchUser = (conditions) => {
      const fetchedUser = Meteor.users.findOne(conditions);
      if (fetchedUser) return fetchedUser;
      return null
    }

    const fetchUsers = (conditions) => {
      const fetchedUsers = Meteor.users.find(conditions);
      if (fetchedUsers) return fetchedUsers;
      return []
    }

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
    const {
      hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
    } = Core.getUserPrivilege(currentTravelRequest);

    const { positionId } = currentUser
    let budgetCode = Budgets.findOne({ businessId: currentTravelRequest.businessId });
    console.log('budgetCode', budgetCode);
    if (budgetCode) currentTravelRequest.budgetHolderId = budgetCode.employeeId;

    const getUserEmail = (userData) => {
      if (userData && userData.emails.length > 0){
        console.log(userData.emails[0].address);
        return "bulkpay@c2gconsulting.com, aadesanmi@c2gconsulting.com, " + userData.emails[0].address;
      }
    }

    const getJustUserEmail = (userData) => {
      if (userData && userData.emails.length > 0){
        console.log(userData.emails[0].address);
        return "" + userData.emails[0].address;
      }
    }
    let nextUserApproval = null, isManager = false, isHOD = false, isGcoo = false, isGceo = false,
    nextUserEmail = "", nextUserSubject = "Please approve travel request for ";
    let otherUserEmails = "", otherUserSubject = "Travel request process for ", assignedFullName; // has been assigned to 

    const { destinationType } = currentTravelRequest;
    const isInternationalTrip = destinationType === 'International';
    const fetchOtherUsers = (fetchedUser, conditions) => {
      if (fetchedUser) {
        const filter = Core.queryUsersExcept(fetchedUser._id, conditions);
        const otherUsers = fetchUsers(filter);
        if (otherUsers) {
          otherUserEmails = otherUsers.map(otherUser => getJustUserEmail(otherUser))
          console.log('otherUserEmails', otherUserEmails)
          assignedFullName = fetchedUser.profile.fullName
        }
      }
    }

    const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = Core.getWhereToStartApproval(currentTravelRequest)
    let nextPosition = 'HOD'

    // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (isTripByAir) {
      if (!isAboveOrHOD && !nextUserApproval) {
        const fetchedUser = fetchUser(currentTravelRequest.supervisorId, true);
        console.log('fetchedUser', fetchedUser)
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
        nextPosition = '--HOD'
      }

      if (!isAboveOrMD && !nextUserApproval) {
        const fetchedUser = fetchUser(currentTravelRequest.managerId, true);
        console.log('fetchedUser', fetchedUser)
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
        nextPosition = '--MD'
      }

      if (!isAboveOrGCOO && !nextUserApproval) {
        const fetchedUser = fetchUser(currentTravelRequest.gcooId, true);
        console.log('fetchedUser', fetchedUser)
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
        nextPosition = '--GCOO'
      }

      if (!isInternationalTrip && !nextUserApproval) {
        const fetchedUser = fetchUser(currentTravelRequest.bstId, true);
        console.log('fetchedUser', fetchedUser)
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
        nextPosition = '--BST'
      }

      if (!isAboveOrGCEO && !nextUserApproval) {
        const fetchedUser = fetchUser(currentTravelRequest.gceoId, true);
        console.log('fetchedUser', fetchedUser)
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
        nextPosition = '--GCEO'
      }

      if (!nextUserApproval) {
        const fetchedUser = fetchUser(currentTravelRequest.bstId, true);
        console.log('fetchedUser', fetchedUser)
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
        nextPosition = '--BST--'
      }
    }

    // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (!isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { hodPositionId: positionId }] });
      isHOD = !!nextUserApproval;

      const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = Core.getWhereToStartApproval(currentTravelRequest);

      if (nextUserApproval || isAboveOrHOD || isAboveOrMD || isAboveOrGCOO || isAboveOrGCEO) {
        const fetchedUser = fetchUser(currentTravelRequest.logisticsId, true);
        fetchOtherUsers(fetchedUser, logisticCond);
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
        nextUserSubject = "Please process travel request for "
        } else {
        console.log('isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO ', isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO )
        console.log('JSON.stringify(nextUserApproval)', JSON.stringify(nextUserApproval))
        const fetchedUser = fetchUser(currentTravelRequest.supervisorId, true);
        console.log('fetchedUser', fetchedUser)
        nextUserApproval = fetchedUser;
        nextUserEmail = getUserEmail(fetchedUser);
      }
    }

    console.log('nextPosition', nextPosition)


    Core.canProcessTrip();

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      // otherPartiesEmail += "," + budgetCode.externalNotificationEmail;


      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
      let createdByEmail = "";
      let budgetHolderEmail = "";
      let createdByName = "Employee"
      let budgetHolderName = "Budget Holder"
      let createdBySubject = "";
      let budgetHolderSubject = "";
      let bookingAgentSubject = "";
      let securityDeptSubject = "";

      if(currentTravelRequest.status === "Approved By Budget Holder"){
        createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s travel request";
        budgetHolderSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
        bookingAgentSubject = "Ticket booking for " + createdBy.profile.fullName + "'s travel request";
        securityDeptSubject = "Security request for " + createdBy.profile.fullName + "'s travel request";
      } else {
        createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has rejected your travel request";
        budgetHolderSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
      }

      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor, trips } = currentTravelRequest;
      console.log('tripFor', tripFor)
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const { individuals } = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
      }

      if (budgetHolder.emails.length > 0){
        budgetHolderEmail = budgetHolder.emails[0].address;
        budgetHolderEmail = budgetHolderEmail  + ", bulkpay@c2gconsulting.com";
        console.log(budgetHolderEmail);
      }
      console.log('createdByEmail', createdByEmail)
      console.log('budgetHolderEmail', budgetHolderEmail)
      console.log('nextUserEmail', nextUserEmail)
      console.log('otherUserEmails', otherUserEmails)
      //Send to requestor
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

      //Send to Budget Holder
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, budgetHolderEmail, budgetHolderSubject);

      const { APPROVED_BY_BUDGETHOLDER } = Core.ALL_TRAVEL_STATUS


      if (currentTravelRequest.status === APPROVED_BY_BUDGETHOLDER) {
        if (nextUserEmail) {
          // Send to NEXT USER APPROVAL
          nextUserSubject += createdBy.profile.fullName
          console.log('nextUserEmail', nextUserEmail);
          TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, nextUserEmail, nextUserSubject);
        }

        if (otherUserEmails) {
          // Send to NEXT USER APPROVAL
          console.log('otherUserEmails', otherUserEmails);
          otherUserSubject = otherUserSubject + createdBy.profile.fullName + "has been assigned to " + assignedFullName;
          TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, otherUserEmails, otherUserSubject);
        }
      }
    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/managerApprovals": function (currentTravelRequest) {
    if (!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }

    check(currentTravelRequest.businessId, String);
    this.unblock()

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
     let isTripByAir;
     for (let i = 0; i < currentTravelRequest.trips.length; i++) {
       const trip = currentTravelRequest.trips[i];
       if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
     }

    Core.canProcessTrip();

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      // otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

      const { destinationType } = currentTravelRequest;
      const isInternationalTrip = destinationType === 'International';

      const { MD, GCOO, LOGISTICS } = Core.Approvals;
      // const { APPROVED_BY_MD } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = BST;
      if (!isTripByAir) nextApproval = LOGISTICS;
      /*
        // old approval workflow
       let nextApproval = GCOO;
        if (!isTripByAir) next = LOGISTICS;
        nextApproval = currentTravelReqApprovaluest.status === APPROVED_BY_MD ? nextApproval : "";
      */
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, MD, nextApproval);

    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/gcooApprovals": function (currentTravelRequest) {
    if (!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }

    check(currentTravelRequest.businessId, String);
    this.unblock()

     let isTripByAir;
     for (let i = 0; i < currentTravelRequest.trips.length; i++) {
       const trip = currentTravelRequest.trips[i];
       if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
     }

    Core.canProcessTrip();

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { destinationType } = currentTravelRequest;
      const isInternationalTrip = destinationType === 'International';
    
      const { GCOO, GCEO, LOGISTICS, BST } = Core.Approvals;
      const { APPROVED_BY_GCOO } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = GCEO;
      if (!isInternationalTrip) nextApproval = BST;
      if (!isTripByAir) nextApproval = LOGISTICS;
      nextApproval = currentTravelRequest.status === APPROVED_BY_GCOO ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, GCOO, nextApproval);

    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/gceoApprovals": function (currentTravelRequest) {
    if (!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }

    check(currentTravelRequest.businessId, String);
    this.unblock()

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
     let isTripByAir;
     for (let i = 0; i < currentTravelRequest.trips.length; i++) {
       const trip = currentTravelRequest.trips[i];
       if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
     }
 
    Core.canProcessTrip();

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { destinationType } = currentTravelRequest;
      const isInternationalTrip = destinationType === 'International';
    
      const { GCEO, LOGISTICS, BST } = Core.Approvals;
      const { APPROVED_BY_GCEO } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = BST;
      if (!isTripByAir) nextApproval = LOGISTICS;
      nextApproval = currentTravelRequest.status === APPROVED_BY_GCEO ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, GCEO, nextApproval);


    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/retryJournalPosting": function (currentTravelRequest) {
    this.unblock();

    try {
      const data = Core.journalPosting(currentTravelRequest);

      console.log('data', data)
    } catch (error) {
      console.log('journalPosting ERROR')
      console.log(error)
      throw new Meteor.Error(403, "Journal Posting failed")
    }
  
    return true
  },
  "TRIPREQUEST/bstProcess": function (currentTravelRequest) {
    if (!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }

    check(currentTravelRequest.businessId, String);
    this.unblock()

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
     let isTripByAir;
     for (let i = 0; i < currentTravelRequest.trips.length; i++) {
       const trip = currentTravelRequest.trips[i];
       if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
     }

    Core.canProcessTrip();

    if (currentTravelRequest._id){
      let newLogistics = false;

      // const currentUser = Meteor.user();

      // console.log('currentUser', currentUser)

      // const { logisticCond, } = Core.getApprovalQueries(currentUser);
      const { logisticCond, } = Core.getUserPrivilege(currentTravelRequest);
      const fetchUsers = (conditions, position) => {
        const isPartOfApprovalFlow = Core.getApprovalConfig(position, currentTravelRequest)
        if (position && !isPartOfApprovalFlow) return ""
        const fetchedUsers = Meteor.users.find(conditions);
        if (fetchedUsers) return fetchedUsers.map(fetchedUser => fetchedUser._id);
        return ''
      }

      const { logisticsIds } = currentTravelRequest;
      console.log('logisticsIds', logisticsIds)
      if (logisticsIds && !(logisticsIds[0] !== null || logisticsIds[0] !== '')) {
        currentTravelRequest.logisticsIds = fetchUsers(logisticCond, Core.Approvals.LOGISTICS);
        newLogistics = true;
      }
      console.log('currentTravelRequest.logisticsIds', currentTravelRequest.logisticsIds)


      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { BST, LOGISTICS } = Core.Approvals;
      const { PROCESSED_BY_BST } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = "";
      if (!isTripByAir && newLogistics) nextApproval = LOGISTICS;
      nextApproval = currentTravelRequest.status === PROCESSED_BY_BST ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, BST, nextApproval);

      // try {
      //   Core.journalPosting(currentTravelRequest);
      // } catch (error) {
      //   console.log('journalPosting ERROR')
      //   console.log(error)
      //   throw new Meteor.Error(403, "Journal Posting failed")
      // }

    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/logisticsProcess": function (currentTravelRequest) {
    if (!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
     let isTripByAir;
     let hasAccommodation = "";
     for (let i = 0; i < currentTravelRequest.trips.length; i++) {
       const trip = currentTravelRequest.trips[i];
       const { accommodation } = trip;
       if (['Hotel', 'Guest House'].includes(accommodation)) hasAccommodation = true;
       if (trip.transportationMode === 'AIR') isTripByAir = true
     }
 
    Core.canProcessTrip();

    if (currentTravelRequest._id){
      let newBst = false;

      // const currentUser = Meteor.user();

      // console.log('currentUser', currentUser)
      // const { bstCond, } = Core.getApprovalQueries(currentUser);
      const { bstCond, } = Core.getUserPrivilege(currentTravelRequest);
      const fetchUsers = (conditions, position) => {
        const isPartOfApprovalFlow = Core.getApprovalConfig(position, currentTravelRequest)
        if (position && !isPartOfApprovalFlow) return ""
        const fetchedUsers = Meteor.users.find(conditions);
        if (fetchedUsers) return fetchedUsers.map(fetchedUser => fetchedUser._id);
        return ''
      }

      const { bstIds } = currentTravelRequest;
      console.log('bstIds', bstIds)
      if (!bstIds || !(bstIds[0] !== null || bstIds[0] !== '')) {
        currentTravelRequest.bstIds = fetchUsers(bstCond, Core.Approvals.BST);
        newBst = true;
      }
      console.log('currentTravelRequest.bstIds', currentTravelRequest.bstIds)

      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { LOGISTICS, BST } = Core.Approvals;
      const { PROCESSED_BY_LOGISTICS } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = newBst ? BST : "";
      nextApproval = currentTravelRequest.status === PROCESSED_BY_LOGISTICS ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, LOGISTICS, nextApproval);

    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/supervisorRetirements": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    Core.canProcessTrip();
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest});

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { HOD, FINANCE } = Core.Approvals;
      const { RETIREMENT_APPROVED_BY_HOD } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = FINANCE;
      nextApproval = currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_HOD ? nextApproval : "";
      Core.sendRetirementApprovalMail(currentTravelRequest, TravelRequestHelper, HOD, nextApproval);
    } else{
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/financeRetirements": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
        throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    let budgetCode = Budgets.findOne({ businessId: currentTravelRequest.businessId });
    console.log('budgetCode', budgetCode);
    // if (budgetCode) currentTravelRequest.budgetHolderId = budgetCode.employeeId;

    Core.canProcessTrip();
    if(currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { FINANCE, BUDGETHOLDER } = Core.Approvals;
      const { RETIREMENT_APPROVED_BY_FINANCE } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = BUDGETHOLDER;
      nextApproval = currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_FINANCE ? nextApproval : "";
      Core.sendRetirementApprovalMail(currentTravelRequest, TravelRequestHelper, FINANCE, nextApproval);

    }else{
        let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/budgetHolderRetirements": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    Core.canProcessTrip();
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      const { BUDGETHOLDER, BST } = Core.Approvals;
      const { RETIREMENT_APPROVED_BY_BUDGETHOLDER } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = BST;
      nextApproval = currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_BUDGETHOLDER ? nextApproval : "";
      Core.sendRetirementApprovalMail(currentTravelRequest, TravelRequestHelper, BUDGETHOLDER, nextApproval);
    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/bstRetirements": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    Core.canProcessTrip();
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      const { BST } = Core.Approvals;
      const { RETIREMENT_APPROVED_BY_BST } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = null;
      nextApproval = currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_BST ? nextApproval : "";
      Core.sendRetirementApprovalMail(currentTravelRequest, TravelRequestHelper, BST, nextApproval);
    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },
  "TRIPREQUEST/logisticsRetirements": function(currentTravelRequest){
    if(!this.userId && Core.hasPayrollAccess(this.userId)){
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(currentTravelRequest.businessId, String);
    this.unblock()

    Core.canProcessTrip();
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
    } else {
      let result = TravelRequisition2s.insert(currentTravelRequest);
    }

    return true;
  },

});
