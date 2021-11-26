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
      let itenerary = TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].fromId) + " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].toId);
      if (isTripType("Multiple")){
        for (i = 1; i < currentTravelRequest.trips.length; i++) {
          itenerary += " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[i].toId);
        }
      }

      const data = {
        to: emailTo,
        from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
        subject: emailSubject,
        template: isExternalMail ? process.env.TRAVEL_REQUEST_EXTERNAL_NOTIFICATION2 : process.env.TRAVEL_REQUEST_NOTIFICATION2,
        'h:X-Mailgun-Variables': JSON.stringify({
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
          actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + `/travelrequests2/${lastUrlPath}?requisitionId=` + currentTravelRequest._id
        }),
      }
      Core.sendMail(data)

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

      const data = {
        to: emailTo,
        from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
        subject: emailSubject,
        template: process.env.TRAVEL_RETIREMENT_NOTIFICATION2,
        'h:X-Mailgun-Variables': JSON.stringify({ 
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
        }),
      }
      Core.sendMail(data)

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

      Core.sendUpdateOrCancellationMail(tripInfo, TravelRequestHelper, true);
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

      //explicitely set status
      currentTravelRequest.status = CANCELLED;

      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      Core.sendUpdateOrCancellationMail(tripInfo, TravelRequestHelper);
    }

    return true;
  },
  "TRIPREQUEST/create": function(currentTravelRequest){
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

      // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
      const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
      const {
        hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
      } = Core.getApprovalQueries(currentUser);

      const { directSupervisorId, _id, positionId } = currentUser
      const userId = _id || Meteor.userId()
      currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond, Core.Approvals.HOD)
      currentTravelRequest.managerId = fetchUser(managerCond, Core.Approvals.MD)
      currentTravelRequest.gcooId = fetchUser(GcooCond, Core.Approvals.GCOO)
      currentTravelRequest.gceoId = fetchUser(GceoCond, Core.Approvals.GCEO)
      currentTravelRequest.bstId = fetchUser(bstCond, Core.Approvals.BST)
      currentTravelRequest.logisticsId = fetchUser(logisticCond, Core.Approvals.LOGISTICS)
      currentTravelRequest.financeApproverId = fetchUser(financeCond, Core.Approvals.FINANCE)
      currentTravelRequest.securityId = fetchUser(securityCond, Core.Approvals.SECURITY)

      let budgetCode = Budgets.findOne({ businessId: currentTravelRequest.businessId });
      console.log('budgetCode', budgetCode);
      if (budgetCode){
        currentTravelRequest.budgetCodeId = budgetCode._id
        currentTravelRequest.budgetHolderId = budgetCode.employeeId;
        // currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
      }

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

        const { BUDGETHOLDER } = Core.Approvals
        Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, "", BUDGETHOLDER)

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

      const { BUDGETHOLDER, HOD } = Core.Approvals;
      let nextApproval = BUDGETHOLDER;// HOD
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, null, nextApproval);
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
  "TRIPREQUEST/supervisorApprovals": function(currentTravelRequest){
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
    } = Core.getApprovalQueries(currentUser);

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

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;


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
      const { APPROVED_BY_MD } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = GCOO;
      if (!isTripByAir) nextApproval = LOGISTICS;
      nextApproval = currentTravelRequest.status === APPROVED_BY_MD ? nextApproval : "";
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
    try {
      Core.journalPosting(currentTravelRequest);
    } catch (error) {
      console.log('journalPosting ERROR')
      console.log(error)
      throw new Meteor.Error(403, "Journal Posting failed")
    }
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
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { BST } = Core.Approvals;
      const { PROCESSED_BY_BST } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = "";
      if (!isTripByAir) nextApproval = "";
      nextApproval = currentTravelRequest.status === PROCESSED_BY_BST ? nextApproval : "";
      Core.sendApprovalMail(currentTravelRequest, TravelRequestHelper, BST, nextApproval);

      try {
        Core.journalPosting(currentTravelRequest);
      } catch (error) {
        console.log('journalPosting ERROR')
        console.log(error)
        throw new Meteor.Error(403, "Journal Posting failed")
      }

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
     for (let i = 0; i < currentTravelRequest.trips.length; i++) {
       const trip = currentTravelRequest.trips[i];
       if (trip.transportationMode === 'AIR' || trip.transportationMode === 'RAIL') isTripByAir = true
     }
 
    Core.canProcessTrip();

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      const { LOGISTICS, BST } = Core.Approvals;
      const { PROCESSED_BY_LOGISTICS } = Core.ALL_TRAVEL_STATUS;
      let nextApproval = BST;
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
