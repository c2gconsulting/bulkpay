import _ from 'underscore';

import mailgun from 'mailgun-js';

const mailgunInstance = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  host: process.env.MAILGUN_HOST,
});

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
        return "Employee to refund " + formatNumber(usdDifference,2) + " USD";
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
        return "Employee to refund " + formatNumber(ngnDifference,2) + " NGN";
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
  },
  getTravelcityEmail: function(travelcityId) {
    const travelcity = Travelcities.findOne({_id: travelcityId})

    if(travelcity) {
      return travelcity.notificationEmail;
    }
  },
  sendTravelRequestEmail: function(currentTravelRequest, emailTo, emailSubject, actionType) {
    try {
      const hasBookingAgent = actionType && (actionType.includes('booking') || actionType.includes('Booking'))
      const lastUrlPath = hasBookingAgent ? 'bookingrequisition' : 'printrequisition';
      const travelType = currentTravelRequest.type === "Return"?'Return Trip':'Multiple Stops';
      const returnDate = currentTravelRequest.type === "Return"?currentTravelRequest.trips[0].returnDate:currentTravelRequest.trips[currentTravelRequest.trips.length-1].departureDate;
      let itenerary = TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].fromId) + " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[0].toId);
      if (currentTravelRequest.type === "Multiple"){
        for (i = 1; i < currentTravelRequest.trips.length; i++) {
          itenerary += " - " + TravelRequestHelper.getTravelcityName(currentTravelRequest.trips[i].toId);
        }
      }

      // //Todo, itenerary, employee full name
      // SSR.compileTemplate("TravelRequestNotification2", Assets.getText("emailTemplates/TravelRequestNotification2.html"));
      // Email.send({
      //   to: emailTo,
      //   from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
      //   subject: emailSubject,
      //   html: SSR.render("TravelRequestNotification2", {
      //     itenerary: itenerary,
      //     departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
      //     returnDate: TravelRequestHelper.formatDate(returnDate),
      //     travelType: travelType,
      //     employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
      //     status: currentTravelRequest.status,
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
      //   })
      // });

      const data = {
        to: emailTo,
        from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
        subject: emailSubject,
        template: process.env.TRAVEL_REQUEST_NOTIFICATION2,
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

      mailgunInstance.messages().send(data, (error, body) => {
        if (error) {
          console.error('error sending email', error);
          return error
        } else {
          console.log('emails were sent successfully');
        }
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

      // //Todo, itenerary, employee full name
      // SSR.compileTemplate("TravelRetirementNotification2", Assets.getText("emailTemplates/TravelRetirementNotification2.html"));
      // Email.send({
      //   to: emailTo,
      //   from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
      //   subject: emailSubject,
      //   html: SSR.render("TravelRetirementNotification2", {
      //     itenerary: itenerary,
      //     departureDate: TravelRequestHelper.formatDate(currentTravelRequest.trips[0].departureDate),
      //     returnDate: TravelRequestHelper.formatDate(returnDate),
      //     travelType: travelType,
      //     employeeFullName: TravelRequestHelper.getEmployeeNameById(currentTravelRequest.createdBy),
      //     status: currentTravelRequest.retirementStatus,
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
      //   })
      // });
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

      mailgunInstance.messages().send(data, (error, body) => {
        if (error) {
          console.error('error sending email', error);
          return error
        } else {
          console.log('emails were sent successfully');
        }
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
  },
  getTripFacilitators: function (currentTravelRequest) {
    let hasFlightRequest;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') {
        hasFlightRequest = true
      }
    }

    const currentUser = (Meteor.users.findOne(currentTravelRequest.createdBy));
    const { lineManagerId, hodPositionId } = currentUser;
    if (hasFlightRequest) {
      const managerCond = [{'positionId': String(lineManagerId) }, {'positionId': lineManagerId }];
      const hodCond = [{'positionId': String(hodPositionId) }, {'positionId': hodPositionId }];
      currentTravelRequest.supervisor = Meteor.users.findOne({ $or: hodCond })._id;
      currentTravelRequest.managerId = Meteor.users.findOne({ $or: managerCond })._id;
      currentTravelRequest.gcooId = (Meteor.users.findOne({ 'positionDesc': 'Group Chief Operating off' }))._id;
      currentTravelRequest.gceoId = (Meteor.users.findOne({ 'positionDesc': 'Group Chief Executive off' }))._id;
      // BST and LOGISTICS => "roles.__global_roles__" : "logistics/process"
      currentTravelRequest.bstId = (Meteor.users.findOne({ "roles.__global_roles__" : "bst/process" }))._id;
      currentTravelRequest.logisticsId = (Meteor.users.findOne({ "roles.__global_roles__" : "logistics/process" }))._id;
    } else {
      const positionCond = [{'positionId': String(lineManagerId) }, {'positionId': lineManagerId }];
      const hodCond = [{'positionId': String(hodPositionId) }, {'positionId': hodPositionId }];
      currentTravelRequest.supervisor = Meteor.users.findOne({ $or: hodCond })._id;
      currentTravelRequest.managerId = Meteor.users.findOne({ $or: positionCond })._id;
      // currentTravelRequest.managerId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directManagerId;
      // currentTravelRequest.gcooId = (Meteor.users.findOne(currentTravelRequest.createdBy)).gcooId;
      // currentTravelRequest.gceoId = (Meteor.users.findOne(currentTravelRequest.createdBy)).gceoId;
      // BST and LOGISTICS => "roles.__global_roles__" : "logistics/process"
      currentTravelRequest.bstId = (Meteor.users.findOne({ "roles.__global_roles__" : "bst/process" }))._id;
      currentTravelRequest.logisticsId = (Meteor.users.findOne({ "roles.__global_roles__" : "logistics/process" }))._id;
    }

    return { currentTravelRequest, hasFlightRequest};
  },
  sendNotifications: function (currentTravelRequest, hasFlightRequest, notifReciever, hasApproved, isNewOrUpdated, firstApproval, processed) {
    // console.log("currentTRIPREQUEST")
    // console.log(currentTravelRequest)
    let otherPartiesEmail = "bulkpay@c2gconsulting.com";

    const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
    const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
    const manager = Meteor.users.findOne(currentTravelRequest.managerId);
    const gcoo = Meteor.users.findOne(currentTravelRequest.gcooId);
    const gceo = Meteor.users.findOne(currentTravelRequest.gceoId);
    const logistics = Meteor.users.findOne(currentTravelRequest.logisticsId);
    const bst = Meteor.users.findOne(currentTravelRequest.bstId);
    let createdByEmail = "";
    let supervisorEmail = "";
    let managerEmail = "";
    let gcooEmail = "";
    let gceoEmail = "";
    let logisticsEmail = "";
    let bstEmail = "";
    let fullName = "";

    let createdBySubject, approvedOrRejectSubject, approvalSubject, processSubject, processedSubject;

    switch (notifReciever) {
      case 'HOD':
        fullName = supervisor.profile.fullName
        break;
      case 'MANAGER':
        fullName = manager && manager.profile && manager.profile.fullName
        break;
      case 'GCOO':
        fullName = gcoo && gcoo.profile && gcoo.profile.fullName
        break;
      case 'GCEO':
        fullName = gceo && gceo.profile && gceo.profile.fullName
        break;
      case 'BST':
        fullName = bst && bst.profile && bst.profile.fullName
        break;
      case 'LOGISTICS':
        fullName = logistics && logistics.profile && logistics.profile.fullName
        break;
      default:
        break;
    }
  
    if (isNewOrUpdated && firstApproval) {
      createdBySubject = "New travel request for " + createdBy.profile.fullName;
      approvedOrRejectSubject = "Please approve travel request for " + createdBy.profile.fullName;
      approvalSubject = "Please approve travel request for " + createdBy.profile.fullName;
      processSubject = "Please process travel request for " + createdBy.profile.fullName;
    } else if (processed) {
      createdBySubject = `${notifReciever}: ` + fullName + " has processed your travel request";
      processedSubject = "You have proeccesed " + createdBy.profile.fullName + "'s travel request";
    } else {
      if (hasApproved) {
        createdBySubject = `${notifReciever}: ` + fullName + " has approved your travel request";
        approvedOrRejectSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
      } else {
        createdBySubject = `${notifReciever}: ` + fullName + " has rejected your travel request";
        approvedOrRejectSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
      }
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

    /* MANAGER */
    if (manager.emails.length > 0){
      managerEmail = manager.emails[0].address;
      managerEmail = managerEmail + "," + otherPartiesEmail;
      console.log(managerEmail);
    }

    /* GCOO */
    if (gcoo.emails.length > 0){
      gcooEmail = gcoo.emails[0].address;
      gcooEmail = gcooEmail + "," + otherPartiesEmail;
      console.log(gcooEmail);
    }

    /* GCEO */
    if (gceo.emails.length > 0){
      gceoEmail = gceo.emails[0].address;
      gceoEmail = gceoEmail + "," + otherPartiesEmail;
      console.log(gceoEmail);
    }

    /* Logistics */
    if (logistics.emails.length > 0){
      logisticsEmail = logistics.emails[0].address;
      logisticsEmail = logisticsEmail + "," + otherPartiesEmail;
      console.log(logisticsEmail);
    }

    /* BST */
    if (bst.emails.length > 0){
      bstEmail = bst.emails[0].address;
      bstEmail = bstEmail + "," + otherPartiesEmail;
      console.log(bstEmail);
    }

    /* OTHER INDIVIDUALS OR CLIENT going on this trip */
    const { tripFor } = currentTravelRequest;
    if (tripFor && tripFor.individuals && tripFor.individuals.length) {
      const { individuals } = tripFor;
      const getIndividualEmails = (prev, curr) => prev + ',' + curr.email;
      //  Send Notification to other individual going on this trip
      createdByEmail = createdByEmail + individuals.reduce(getIndividualEmails, '');
    }

    //Send to requestor
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

    // /* Send to HOD/PM/Supervisor - Send notificataion if it's a new trip or extended trip */
    // if (hasFlightRequest || isNewOrUpdated) {
    //   TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, supervisorEmail, approvedOrRejectSubject);
    // }

    /* Send to Logistics */
    if (!hasFlightRequest) {
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, processSubject);
    }

    switch (notifReciever) {
      case 'HOD':
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, supervisorEmail, approvedOrRejectSubject);
        if (hasApproved) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, managerEmail, approvalSubject);
        break;

      case 'MANAGER':
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, managerEmail, approvedOrRejectSubject);
        if (hasApproved) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gcooEmail, approvalSubject);
        if (!hasFlightRequest) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, processSubject);
        break;
    
      case 'GCOO':
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gcooEmail, approvedOrRejectSubject);
        if (hasApproved) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gceoEmail, approvalSubject);
        if (hasFlightRequest && hasApproved) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bstEmail, processSubject);
        if (!hasFlightRequest) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, processSubject);
        break;

      case 'GCEO':
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gceoEmail, approvedOrRejectSubject);
        if (hasFlightRequest && hasApproved) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bstEmail, processSubject);
        if (!hasFlightRequest) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, processSubject);
        break;

      case 'BST':
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bstEmail, processedSubject);
        if (hasApproved) TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, processSubject);
        break;

      case 'LOGISTICS':
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, processedSubject);
        break;

      default:
        break;
    }
  }
}


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

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      // console.log("currentTravelRequest1")
      // console.log(currentTravelRequest)
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

    const supervisor = currentTravelRequest.supervisorId || (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    currentTravelRequest.supervisorId = supervisor;
    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode) {
      currentTravelRequest.budgetHolderId = currentTravelRequest.budgetHolderId || budgetCode.employeeId;
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
      const createdBySubject = "Updated travel request for " + createdBy.profile.fullName;
      const supervisorSubject = "Please approve the updated travel request for " + createdBy.profile.fullName;


      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }


      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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
      // console.log("currentTravelRequest1")
      // console.log(currentTravelRequest)
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

    const supervisor = currentTravelRequest.supervisorId || (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    currentTravelRequest.supervisorId = supervisor;
    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode) {
      currentTravelRequest.budgetHolderId = currentTravelRequest.budgetHolderId || budgetCode.employeeId;
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
      const createdBySubject = "Updated travel retirement for " + createdBy.profile.fullName;
      const supervisorSubject = "Please approve the updated travel retirement for " + createdBy.profile.fullName;


      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }


      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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
      // console.log("currentTravelRequest1")
      // console.log(currentTravelRequest)
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

    currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    //if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
    //    let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
    //    throw new Meteor.Error(401, errMsg);
    //}
    if (currentTravelRequest._id){
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      //only invole city by city admin in trip was approved
      if (currentTravelRequest.status === "Approved By MD"){
        for (i = 0; i < currentTravelRequest.trips.length; i++) {
          otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].toId);
          otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].fromId);
        }
      }

      //explicitely set status
      currentTravelRequest.status = "Cancelled";

      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
      let createdByEmail = "";
      let budgetHolderEmail = "";
      let createdByName = "Employee"
      let budgetHolderName = "Budget Holder"
      let createdBySubject = "";
      let budgetHolderSubject = "";

      if (currentTravelRequest.status === "Approved By MD"){
        createdBySubject = "Travel Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
        budgetHolderSubject = "Travel Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
      } else {
        createdBySubject = "Travel Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
        budgetHolderSubject = "Travel Request for: " + createdBy.profile.fullName + " has been cancelled by the Administrator";
      }
      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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
      /**
       * IF trip mode is Air, should go through normal stages of approval
       * ELSE should skip couple of approvals (GCOO and GCEO respectively) then go to logistics
       */
      let isTripByAir;
      for (let i = 0; i < currentTravelRequest.trips.length; i++) {
        const trip = currentTravelRequest.trips[i];
        if (trip.transportationMode === 'AIR') isTripByAir = true
      }

      const fetchUser = (conditions) => {
        const fetchedUser = Meteor.users.findOne(conditions);
        if (fetchedUser) return fetchedUser._id;
        return ''
      }

      // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
      const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
      const { lineManagerId: managerCode, hodPositionId: hodCode, positionId } = currentUser;
      const { managerId, directSupervisorId } = currentUser;
      const queryByCode = 'positionId', queryByName = 'positionDesc';
      const GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
      const hodOrSupervisorCond = { $or: [{ [queryByCode]: String(hodCode) }, { [queryByCode]: hodCode }] };
      const managerCond = { $or: [{ [queryByCode]: String(managerCode) }, { [queryByCode]: managerCode }] };
      const GcooCond = { [queryByName]: GCOO };
      const GceoCond = { [queryByName]: GCEO };
      const bstCond = { "roles.__global_roles__" : "bst/process" }
      const logisticCond = { "roles.__global_roles__" : "logistics/process" }
      const securityCond = { "roles.__global_roles__" : "security/manage" }

      currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond)
      currentTravelRequest.managerId = managerId || fetchUser(managerCond)
      currentTravelRequest.gcooId = fetchUser(GcooCond)
      currentTravelRequest.gceoId = fetchUser(GceoCond)
      currentTravelRequest.bstId = fetchUser(bstCond)
      currentTravelRequest.logisticsId = fetchUser(logisticCond)

      let isTopLevelUser = false
      const managerIdentifier = 'lineManagerId', hodIdentifier = 'hodPositionId';
      const topLevelQuery = { $and: [{ _id: this.userId }, {
        $or: [{[hodIdentifier]: String(positionId)}, { [managerIdentifier]: String(managerCode) }, { [queryByName]: GCOO }, { [queryByName]: GCEO }]
      }]}

      if (fetchUser(topLevelQuery)) isTopLevelUser = true;


      let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
      if (budgetCode){
        currentTravelRequest.budgetHolderId = budgetCode.employeeId;
        currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
      }


      if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
        let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
        throw new Meteor.Error(401, errMsg);
      }
      if (currentTravelRequest._id){
        TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
        // console.log("currentTravelRequest1")
        // console.log(currentTravelRequest)
      } else {
        currentTravelRequest._id = TravelRequisition2s.insert(currentTravelRequest);
        // console.log("currentTRIPREQUEST")
        // console.log(currentTravelRequest)
        let otherPartiesEmail = "bulkpay@c2gconsulting.com";

        const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
        const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
        // const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
        let createdByEmail = "";
        let supervisorEmail = "";
        let budgetHolderEmail = "";
        let createdByName = "Employee"
        let supervisorName = "Supervisor"
        const createdBySubject = "New travel request for " + createdBy.profile.fullName;
        const supervisorSubject = "Please approve travel request for " + createdBy.profile.fullName;
        // const budgetHolderSubject = "Please approve travel request for " + createdBy.profile.fullName;


        if (createdBy.emails.length > 0){
          createdByEmail = createdBy.emails[0].address;
          createdByEmail = createdByEmail + "," + otherPartiesEmail;
          console.log('createdByEmail', createdByEmail);
        }


        // if (budgetHolder.emails.length > 0){
        //   budgetHolderEmail = budgetHolder.emails[0].address;
        //   budgetHolderEmail = budgetHolderEmail  + ", bulkpay@c2gconsulting.com";
        //   console.log(budgetHolderEmail);
        // }

        if (supervisor && supervisor.emails.length > 0){
          supervisorEmail = supervisor.emails[0].address;
          supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
          console.log('supervisorEmail', supervisorEmail);
        }

        const { tripFor } = currentTravelRequest;
        if (tripFor && tripFor.individuals && tripFor.individuals.length) {
          const { individuals } = tripFor;
          //  Send Notification to other individual going on this trip
          createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
        }

        //Send to requestor
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

        if (!isTopLevelUser) {
          //Send to Supervisor
          TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, supervisorEmail, supervisorSubject);
        }

        // if (isTopLevelUser) {
        //   //Send to Budget holder
        //   TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, budgetHolderEmail, budgetHolderSubject);
        // }
      }

      return true;
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(401, error.message || error);
    }
  },
  "TRIPREQUEST/retire": function(currentTravelRequest){
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

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

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

      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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

    currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }

    if (currentTravelRequest._id){
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


      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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
      const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
      let createdByEmail = "";
      let supervisorEmail = "";
      let createdByName = "Employee"
      let supervisorName = "Supervisor"
      let budgetHolderEmail = "";
      let budgetHolderName = "Budget Holder"
      let createdBySubject = "";
      let supervisorSubject = "";
      const budgetHolderSubject = "Please approve travel request for " + createdBy.profile.fullName;


      if(currentTravelRequest.status === "Approved by HOD"){
        createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has approved your travel request";
        supervisorSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
      } else {
        createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has rejected your travel request";
        supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
      }
      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

      //Send to Supervisor
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, supervisorEmail, supervisorSubject);

      //Send to Budget holder
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, budgetHolderEmail, budgetHolderSubject);
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

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    /**
     * IF trip mode is Air, should go through normal stages of approval
     * ELSE should skip couple of approvals (GCOO and GCEO respectively) then go to logistics
     */
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true
    }

    const fetchUser = (conditions) => {
      const fetchedUser = Meteor.users.findOne(conditions);
      if (fetchedUser) return fetchedUser._id;
      return ''
    }

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
    const { lineManagerId: managerCode, hodPositionId: hodCode, positionId } = currentUser;
    const { managerId, directSupervisorId } = currentUser;
    const managerIdentifier = 'lineManagerId', hodIdentifier = 'hodPositionId', indentifier = 'positionDesc';
    const GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
    const hodOrSupervisorCond = { $or: [{ [hodIdentifier]: String(hodCode) }, { [hodIdentifier]: hodCode }] };
    const managerCond = { $or: [{ [managerIdentifier]: String(managerCode) }, { [managerIdentifier]: managerCode }] };
    const GcooCond = { 'positionDesc': 'Group Chief Operating off' };
    const GceoCond = { 'positionDesc': 'Group Chief Executive off' };
    const bstCond = { "roles.__global_roles__" : "bst/process" }
    const logisticCond = { "roles.__global_roles__" : "logistics/process" }
    const securityCond = { "roles.__global_roles__" : "security/manage" }

    currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond)
    currentTravelRequest.managerId = managerId || fetchUser(managerCond)
    currentTravelRequest.gcooId = fetchUser(GcooCond)
    currentTravelRequest.gceoId = fetchUser(GceoCond)
    currentTravelRequest.bstId = fetchUser(bstCond)
    currentTravelRequest.logisticsId = fetchUser(logisticCond)

    // let isTopLevelUser = false
    // const topLevelQuery = { $and: [{ _id: currentTravelRequest.createdBy }, {
    //   $or: [{[hodIdentifier]: String(positionId)}, { [managerIdentifier]: String(positionId) }, { [indentifier]: GCOO }, { [indentifier]: GCEO }]
    // }]}

    // if (fetchUser(topLevelQuery)) isTopLevelUser = true;

    const getUserEmail = (userData) => {
      if (userData && userData.emails.length > 0){
        console.log(userData.emails[0].address);
        return "bulkpay@c2gconsulting.com, aadesanmi@c2gconsulting.com, " + userData.emails[0].address;
      }
    }

    /**
     * - BY AIR: 
     *   - TRIP BY AIR APPROVAL SHOULD GO THROUGH MANAGER, GCOO, GCEO, BST, LOGISTIC, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY AIR APPROVAL SHOULD GO THROUGH GCOO, GCEO, BST, LOGISTIC, SECURITY. (same for other positions except LOGISTIC, BST AND SECURITY).
     * - BY LAND:
     *   - TRIP BY LAND APPROVAL SHOULD GO THROUGH MANAGER, LOGISTIC, BST, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY LAND APPROVAL SHOULD GO THROUGH LOGISTIC, BST, SECURITY.
     */
    let nextUserApproval = null, isManager = false, isHOD = false, isGcoo = false, isGceo = false,
    nextUserEmail = "", nextUserSubject = "Please approve travel request for ";

    // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [hodIdentifier]: String(positionId) }] });
      if (nextUserApproval) {
        isHOD = true;
        const fetchedUser = fetchUser(currentTravelRequest.managerId);
        nextUserEmail = getUserEmail(fetchedUser);
      }

      if (!nextUserApproval) {
        nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [managerIdentifier]: String(positionId) }] });
        if (nextUserApproval) {
          isManager = true;
          const fetchedUser = fetchUser(currentTravelRequest.gcooId);
          nextUserEmail = getUserEmail(fetchedUser);
        }
      }

      if (!nextUserApproval) {
        nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCOO }] });
        if (nextUserApproval) {
          isGcoo = true;
          const fetchedUser = fetchUser(currentTravelRequest.gceoId);
          nextUserEmail = getUserEmail(fetchedUser);
        }
      }

      if (!nextUserApproval) {
        nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCEO }] });
        if (nextUserApproval) {
          isGceo = true;
          // SEND TO BST TO PROCESS THE AIR TRIP
          const fetchedUser = fetchUser(bstCond);
          nextUserEmail = getUserEmail(fetchedUser);
          nextUserSubject = "Please process travel request for "
        }
      }
    }

    // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (!isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [hodIdentifier]: String(positionId) }] });
      if (nextUserApproval) {
        isHOD = true;
        const fetchedUser = fetchUser(currentTravelRequest.managerId);
        nextUserEmail = getUserEmail(fetchedUser);
      }

      if (!nextUserApproval) {
        nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [managerIdentifier]: String(positionId) }] });
        if (nextUserApproval) {
          isManager = true;
          // SEND TO LOGISTICS TO PROCESS THE LAND TRIP
          const fetchedUser = fetchUser(logisticCond);
          nextUserEmail = getUserEmail(fetchedUser);
          nextUserSubject = "Please process travel request for "
        }
      }
    }


    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      //only invole city by city admin in trip was approved
      if (currentTravelRequest.status === "Approved By Budget Holder"){
          for (i = 0; i < currentTravelRequest.trips.length; i++) {
              otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].toId);
              otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].fromId);
          }
      }

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;


      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
      const bookingAgentEmail = sendNotificationToBookingAgent(currentTravelRequest);
      const securityDeptEmail = sendNotificationToSecurityDept(currentTravelRequest);
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
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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

      if (currentTravelRequest.status === "Approved By Budget Holder") {
        nextUserSubject += createdBy.profile.fullName
        //Send to NEXT USER APPROVAL
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, nextUserEmail, nextUserSubject);
      }

      // Send to booking agent if it's approved by budgetHolder
      if (bookingAgentSubject && bookingAgentEmail) {
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bookingAgentEmail, bookingAgentSubject, 'booking agent');
      }

      // Send to security dept if requested and approved by budgetHolder
      if (trips.length > 0 && securityDeptSubject) {
        for (let t = 0; t < trips.length; t++) {
          const { provideSecurity } = trips[t];
          if (provideSecurity) {
            TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);
          }
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
    /**
     * IF trip mode is Air, should go through normal stages of approval
     * ELSE should skip couple of approvals (GCOO and GCEO respectively) then go to logistics
     */
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true
    }

    const fetchUser = (conditions) => {
      const fetchedUser = Meteor.users.findOne(conditions);
      if (fetchedUser) return fetchedUser._id;
      return ''
    }

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
    const { lineManagerId: managerCode, hodPositionId: hodCode, positionId } = currentUser;
    const { managerId, directSupervisorId } = currentUser;
    const managerIdentifier = 'lineManagerId', hodIdentifier = 'hodPositionId', indentifier = 'positionDesc';
    const GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
    const hodOrSupervisorCond = { $or: [{ [hodIdentifier]: String(hodCode) }, { [hodIdentifier]: hodCode }] };
    const managerCond = { $or: [{ [managerIdentifier]: String(managerCode) }, { [managerIdentifier]: managerCode }] };
    const GcooCond = { 'positionDesc': 'Group Chief Operating off' };
    const GceoCond = { 'positionDesc': 'Group Chief Executive off' };
    const bstCond = { "roles.__global_roles__" : "bst/process" }
    const logisticCond = { "roles.__global_roles__" : "logistics/process" }
    const securityCond = { "roles.__global_roles__" : "security/manage" }

    currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond)
    currentTravelRequest.managerId = managerId || fetchUser(managerCond)
    currentTravelRequest.gcooId = fetchUser(GcooCond)
    currentTravelRequest.gceoId = fetchUser(GceoCond)
    currentTravelRequest.bstId = fetchUser(bstCond)
    currentTravelRequest.logisticsId = fetchUser(logisticCond)

    // let isTopLevelUser = false
    // const topLevelQuery = { $and: [{ _id: currentTravelRequest.createdBy }, {
    //   $or: [{[hodIdentifier]: String(positionId)}, { [managerIdentifier]: String(positionId) }, { [indentifier]: GCOO }, { [indentifier]: GCEO }]
    // }]}

    // if (fetchUser(topLevelQuery)) isTopLevelUser = true;

    const getUserEmail = (userData) => {
      if (userData && userData.emails.length > 0){
        console.log(userData.emails[0].address);
        return "bulkpay@c2gconsulting.com, aadesanmi@c2gconsulting.com, " + userData.emails[0].address;
      }
    }

    /**
     * - BY AIR: 
     *   - TRIP BY AIR APPROVAL SHOULD GO THROUGH MANAGER, GCOO, GCEO, BST, LOGISTIC, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY AIR APPROVAL SHOULD GO THROUGH GCOO, GCEO, BST, LOGISTIC, SECURITY. (same for other positions except LOGISTIC, BST AND SECURITY).
     * - BY LAND:
     *   - TRIP BY LAND APPROVAL SHOULD GO THROUGH MANAGER, LOGISTIC, BST, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY LAND APPROVAL SHOULD GO THROUGH LOGISTIC, BST, SECURITY.
     */
    let nextUserApproval = null, isManager = false, isHOD = false, isGcoo = false, isGceo = false,
    nextUserEmail = "", nextUserSubject = "Please approve travel request for ";

    // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [managerIdentifier]: String(positionId) }] });
      if (nextUserApproval) {
        isManager = true;
        const fetchedUser = fetchUser(currentTravelRequest.gcooId);
        nextUserEmail = getUserEmail(fetchedUser);
      }

      if (!nextUserApproval) {
        nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCOO }] });
        if (nextUserApproval) {
          isGcoo = true;
          const fetchedUser = fetchUser(currentTravelRequest.gceoId);
          nextUserEmail = getUserEmail(fetchedUser);
        }
      }

      if (!nextUserApproval) {
        nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCEO }] });
        if (nextUserApproval) {
          isGceo = true;
          // SEND TO BST TO PROCESS THE AIR TRIP
          const fetchedUser = fetchUser(bstCond);
          nextUserEmail = getUserEmail(fetchedUser);
          nextUserSubject = "Please process travel request for "
        }
      }
    }

    // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (!isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [managerIdentifier]: String(positionId) }] });
      if (nextUserApproval) {
        isManager = true;
        // SEND TO LOGISTICS TO PROCESS THE LAND TRIP
        const fetchedUser = fetchUser(logisticCond);
        nextUserEmail = getUserEmail(fetchedUser);
        nextUserSubject = "Please process travel request for "
      }
    }

    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const manager = Meteor.users.findOne(currentTravelRequest.managerId);
      const bookingAgentEmail = sendNotificationToBookingAgent(currentTravelRequest);
      const securityDeptEmail = sendNotificationToSecurityDept(currentTravelRequest);
      let createdByEmail = "";
      let managerEmail = "";
      let createdBySubject = "";
      let managerSubject = "";
      let bookingAgentSubject = "";
      let securityDeptSubject = "";

      if(currentTravelRequest.status === "Approved By MD"){
        createdBySubject = "Managing Director: " + manager.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s travel request";
        managerSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
        bookingAgentSubject = "Ticket booking for " + createdBy.profile.fullName + "'s travel request";
        securityDeptSubject = "Security request for " + createdBy.profile.fullName + "'s travel request";
      } else {
        createdBySubject = "Managing Director: " + manager.profile.fullName + " has rejected your travel request";
        managerSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
      }

      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor, trips } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
      }

      if (manager.emails.length > 0){
        managerEmail = manager.emails[0].address;
        managerEmail = managerEmail  + ", bulkpay@c2gconsulting.com";
        console.log(managerEmail);
      }
      //Send to requestor
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

      //Send to Managing Director
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, managerEmail, managerSubject);

      if (currentTravelRequest.status === "Approved By MD") {
        nextUserSubject += createdBy.profile.fullName
        //Send to NEXT USER APPROVAL
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, nextUserEmail, nextUserSubject);
      }

      // Send to booking agent if it's approved by manager
      if (bookingAgentSubject && bookingAgentEmail) {
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bookingAgentEmail, bookingAgentSubject, 'booking agent');
      }

      // Send to security dept if requested and approved by manager
      if (trips.length > 0 && securityDeptSubject) {
        for (let t = 0; t < trips.length; t++) {
          const { provideSecurity } = trips[t];
          if (provideSecurity) {
            TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);
          }
        }
      }
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

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    /**
     * IF trip mode is Air, should go through normal stages of approval
     * ELSE should skip couple of approvals (GCOO and GCEO respectively) then go to logistics
     */
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true
    }

    const fetchUser = (conditions) => {
      const fetchedUser = Meteor.users.findOne(conditions);
      if (fetchedUser) return fetchedUser._id;
      return ''
    }

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
    const { lineManagerId: managerCode, hodPositionId: hodCode, positionId } = currentUser;
    const { managerId, directSupervisorId } = currentUser;
    const managerIdentifier = 'lineManagerId', hodIdentifier = 'hodPositionId', indentifier = 'positionDesc';
    const GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
    const hodOrSupervisorCond = { $or: [{ [hodIdentifier]: String(hodCode) }, { [hodIdentifier]: hodCode }] };
    const managerCond = { $or: [{ [managerIdentifier]: String(managerCode) }, { [managerIdentifier]: managerCode }] };
    const GcooCond = { 'positionDesc': 'Group Chief Operating off' };
    const GceoCond = { 'positionDesc': 'Group Chief Executive off' };
    const bstCond = { "roles.__global_roles__" : "bst/process" }
    const logisticCond = { "roles.__global_roles__" : "logistics/process" }
    const securityCond = { "roles.__global_roles__" : "security/manage" }

    currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond)
    currentTravelRequest.managerId = managerId || fetchUser(managerCond)
    currentTravelRequest.gcooId = fetchUser(GcooCond)
    currentTravelRequest.gceoId = fetchUser(GceoCond)
    currentTravelRequest.bstId = fetchUser(bstCond)
    currentTravelRequest.logisticsId = fetchUser(logisticCond)

    // let isTopLevelUser = false
    // const topLevelQuery = { $and: [{ _id: currentTravelRequest.createdBy }, {
    //   $or: [{[hodIdentifier]: String(positionId)}, { [managerIdentifier]: String(positionId) }, { [indentifier]: GCOO }, { [indentifier]: GCEO }]
    // }]}

    // if (fetchUser(topLevelQuery)) isTopLevelUser = true;

    const getUserEmail = (userData) => {
      if (userData && userData.emails.length > 0){
        console.log(userData.emails[0].address);
        return "bulkpay@c2gconsulting.com, aadesanmi@c2gconsulting.com, " + userData.emails[0].address;
      }
    }

    /**
     * - BY AIR: 
     *   - TRIP BY AIR APPROVAL SHOULD GO THROUGH MANAGER, GCOO, GCEO, BST, LOGISTIC, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY AIR APPROVAL SHOULD GO THROUGH GCOO, GCEO, BST, LOGISTIC, SECURITY. (same for other positions except LOGISTIC, BST AND SECURITY).
     * - BY LAND:
     *   - TRIP BY LAND APPROVAL SHOULD GO THROUGH MANAGER, LOGISTIC, BST, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY LAND APPROVAL SHOULD GO THROUGH LOGISTIC, BST, SECURITY.
     */
    let nextUserApproval = null, isManager = false, isHOD = false, isGcoo = false, isGceo = false,
    nextUserEmail = "", nextUserSubject = "Please approve travel request for ";

    // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCOO }] });
      if (nextUserApproval) {
        isGcoo = true;
        const fetchedUser = fetchUser(currentTravelRequest.gceoId);
        nextUserEmail = getUserEmail(fetchedUser);
      }

      if (!nextUserApproval) {
        nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCEO }] });
        if (nextUserApproval) {
          isGceo = true;
          // SEND TO BST TO PROCESS THE AIR TRIP
          const fetchedUser = fetchUser(bstCond);
          nextUserEmail = getUserEmail(fetchedUser);
          nextUserSubject = "Please process travel request for "
        }
      }
    }

    // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (!isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [managerIdentifier]: String(positionId) }] });
      if (nextUserApproval) {
        isManager = true;
        // SEND TO LOGISTICS TO PROCESS THE LAND TRIP
        const fetchedUser = fetchUser(logisticCond);
        nextUserEmail = getUserEmail(fetchedUser);
        nextUserSubject = "Please process travel request for "
      }
    }

    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const gcoo = Meteor.users.findOne(currentTravelRequest.gcooId);
      const bookingAgentEmail = sendNotificationToBookingAgent(currentTravelRequest);
      const securityDeptEmail = sendNotificationToSecurityDept(currentTravelRequest);
      let createdByEmail = "";
      let gcooEmail = "";
      let createdBySubject = "";
      let gcooSubject = "";
      let bookingAgentSubject = "";
      let securityDeptSubject = "";

      if(currentTravelRequest.status === "Approved By GCOO"){
        createdBySubject = "Managing Director: " + gcoo.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s travel request";
        gcooSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
        bookingAgentSubject = "Ticket booking for " + createdBy.profile.fullName + "'s travel request";
        securityDeptSubject = "Security request for " + createdBy.profile.fullName + "'s travel request";
      } else {
        createdBySubject = "Managing Director: " + gcoo.profile.fullName + " has rejected your travel request";
        gcooSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
      }

      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor, trips } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
      }

      if (gcoo.emails.length > 0){
        gcooEmail = gcoo.emails[0].address;
        gcooEmail = gcooEmail  + ", bulkpay@c2gconsulting.com";
        console.log(gcooEmail);
      }
      //Send to requestor
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

      //Send to GCOO
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gcooEmail, gcooSubject);

      if (currentTravelRequest.status === "Approved By GCOO") {
        nextUserSubject += createdBy.profile.fullName
        //Send to NEXT USER APPROVAL
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, nextUserEmail, nextUserSubject);
      }

      // Send to booking agent if it's approved by gcoo
      if (bookingAgentSubject && bookingAgentEmail) {
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bookingAgentEmail, bookingAgentSubject, 'booking agent');
      }

      // Send to security dept if requested and approved by gcoo
      if (trips.length > 0 && securityDeptSubject) {
        for (let t = 0; t < trips.length; t++) {
          const { provideSecurity } = trips[t];
          if (provideSecurity) {
            TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);
          }
        }
      }
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
    /**
     * IF trip mode is Air, should go through normal stages of approval
     * ELSE should skip couple of approvals (GCOO and GCEO respectively) then go to logistics
     */
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true
    }

    const fetchUser = (conditions) => {
      const fetchedUser = Meteor.users.findOne(conditions);
      if (fetchedUser) return fetchedUser._id;
      return ''
    }

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
    const { lineManagerId: managerCode, hodPositionId: hodCode, positionId } = currentUser;
    const { managerId, directSupervisorId } = currentUser;
    const managerIdentifier = 'lineManagerId', hodIdentifier = 'hodPositionId', indentifier = 'positionDesc';
    const GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
    const hodOrSupervisorCond = { $or: [{ [hodIdentifier]: String(hodCode) }, { [hodIdentifier]: hodCode }] };
    const managerCond = { $or: [{ [managerIdentifier]: String(managerCode) }, { [managerIdentifier]: managerCode }] };
    const GcooCond = { 'positionDesc': 'Group Chief Operating off' };
    const GceoCond = { 'positionDesc': 'Group Chief Executive off' };
    const bstCond = { "roles.__global_roles__" : "bst/process" }
    const logisticCond = { "roles.__global_roles__" : "logistics/process" }
    const securityCond = { "roles.__global_roles__" : "security/manage" }

    currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond)
    currentTravelRequest.managerId = managerId || fetchUser(managerCond)
    currentTravelRequest.gcooId = fetchUser(GcooCond)
    currentTravelRequest.gceoId = fetchUser(GceoCond)
    currentTravelRequest.bstId = fetchUser(bstCond)
    currentTravelRequest.logisticsId = fetchUser(logisticCond)

    // let isTopLevelUser = false
    // const topLevelQuery = { $and: [{ _id: currentTravelRequest.createdBy }, {
    //   $or: [{[hodIdentifier]: String(positionId)}, { [managerIdentifier]: String(positionId) }, { [indentifier]: GCOO }, { [indentifier]: GCEO }]
    // }]}

    // if (fetchUser(topLevelQuery)) isTopLevelUser = true;

    const getUserEmail = (userData) => {
      if (userData && userData.emails.length > 0){
        console.log(userData.emails[0].address);
        return "bulkpay@c2gconsulting.com, aadesanmi@c2gconsulting.com, " + userData.emails[0].address;
      }
    }

    /**
     * - BY AIR: 
     *   - TRIP BY AIR APPROVAL SHOULD GO THROUGH MANAGER, GCOO, GCEO, BST, LOGISTIC, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY AIR APPROVAL SHOULD GO THROUGH GCOO, GCEO, BST, LOGISTIC, SECURITY. (same for other positions except LOGISTIC, BST AND SECURITY).
     * - BY LAND:
     *   - TRIP BY LAND APPROVAL SHOULD GO THROUGH MANAGER, LOGISTIC, BST, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY LAND APPROVAL SHOULD GO THROUGH LOGISTIC, BST, SECURITY.
     */
    let nextUserApproval = null, isManager = false, isHOD = false, isGcoo = false, isGceo = false,
    nextUserEmail = "", nextUserSubject = "Please approve travel request for ";

    // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCEO }] });
      if (nextUserApproval) {
        isGceo = true;
        // SEND TO BST TO PROCESS THE AIR TRIP
        const fetchedUser = fetchUser(bstCond);
        nextUserEmail = getUserEmail(fetchedUser);
        nextUserSubject = "Please process travel request for "
      }
    }

    // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (!isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [managerIdentifier]: String(positionId) }] });
      if (nextUserApproval) {
        isManager = true;
        // SEND TO LOGISTICS TO PROCESS THE LAND TRIP
        const fetchedUser = fetchUser(logisticCond);
        nextUserEmail = getUserEmail(fetchedUser);
        nextUserSubject = "Please process travel request for "
      }
    }

    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const gceo = Meteor.users.findOne(currentTravelRequest.gceoId);
      const bookingAgentEmail = sendNotificationToBookingAgent(currentTravelRequest);
      const securityDeptEmail = sendNotificationToSecurityDept(currentTravelRequest);
      let createdByEmail = "";
      let gceoEmail = "";
      let createdBySubject = "";
      let gceoSubject = "";
      let bookingAgentSubject = "";
      let securityDeptSubject = "";

      if(currentTravelRequest.status === "Approved By GCEO"){
        createdBySubject = "Managing Director: " + gceo.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s travel request";
        gceoSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
        bookingAgentSubject = "Ticket booking for " + createdBy.profile.fullName + "'s travel request";
        securityDeptSubject = "Security request for " + createdBy.profile.fullName + "'s travel request";
      } else {
        createdBySubject = "Managing Director: " + gceo.profile.fullName + " has rejected your travel request";
        gceoSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
      }

      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor, trips } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
      }

      if (gceo.emails.length > 0){
        gceoEmail = gceo.emails[0].address;
        gceoEmail = gceoEmail  + ", bulkpay@c2gconsulting.com";
        console.log(gceoEmail);
      }
      //Send to requestor
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

      //Send to GCOO
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gceoEmail, gceoSubject);

      if (currentTravelRequest.status === "Approved By GCEO") {
        nextUserSubject += createdBy.profile.fullName
        //Send to NEXT USER APPROVAL
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, nextUserEmail, nextUserSubject);
      }

      // Send to booking agent if it's approved by gceo
      if (bookingAgentSubject && bookingAgentEmail) {
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bookingAgentEmail, bookingAgentSubject, 'booking agent');
      }

      // Send to security dept if requested and approved by gceo
      if (trips.length > 0 && securityDeptSubject) {
        for (let t = 0; t < trips.length; t++) {
          const { provideSecurity } = trips[t];
          if (provideSecurity) {
            TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);
          }
        }
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
    /**
     * IF trip mode is Air, should go through normal stages of approval
     * ELSE should skip couple of approvals (GCOO and GCEO respectively) then go to logistics
     */
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true
    }

    const fetchUser = (conditions) => {
      const fetchedUser = Meteor.users.findOne(conditions);
      if (fetchedUser) return fetchedUser._id;
      return ''
    }

    // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
    const { lineManagerId: managerCode, hodPositionId: hodCode, positionId } = currentUser;
    const { managerId, directSupervisorId } = currentUser;
    const managerIdentifier = 'lineManagerId', hodIdentifier = 'hodPositionId', indentifier = 'positionDesc';
    const GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
    const hodOrSupervisorCond = { $or: [{ [hodIdentifier]: String(hodCode) }, { [hodIdentifier]: hodCode }] };
    const managerCond = { $or: [{ [managerIdentifier]: String(managerCode) }, { [managerIdentifier]: managerCode }] };
    const GcooCond = { 'positionDesc': 'Group Chief Operating off' };
    const GceoCond = { 'positionDesc': 'Group Chief Executive off' };
    const bstCond = { "roles.__global_roles__" : "bst/process" }
    const logisticCond = { "roles.__global_roles__" : "logistics/process" }
    const securityCond = { "roles.__global_roles__" : "security/manage" }

    currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond)
    currentTravelRequest.managerId = managerId || fetchUser(managerCond)
    currentTravelRequest.gcooId = fetchUser(GcooCond)
    currentTravelRequest.gceoId = fetchUser(GceoCond)
    currentTravelRequest.bstId = fetchUser(bstCond)
    currentTravelRequest.logisticsId = fetchUser(logisticCond)

    // let isTopLevelUser = false
    // const topLevelQuery = { $and: [{ _id: currentTravelRequest.createdBy }, {
    //   $or: [{[hodIdentifier]: String(positionId)}, { [managerIdentifier]: String(positionId) }, { [indentifier]: GCOO }, { [indentifier]: GCEO }]
    // }]}

    // if (fetchUser(topLevelQuery)) isTopLevelUser = true;

    const getUserEmail = (userData) => {
      if (userData && userData.emails.length > 0){
        console.log(userData.emails[0].address);
        return "bulkpay@c2gconsulting.com, aadesanmi@c2gconsulting.com, " + userData.emails[0].address;
      }
    }

    /**
     * - BY AIR: 
     *   - TRIP BY AIR APPROVAL SHOULD GO THROUGH MANAGER, GCOO, GCEO, BST, LOGISTIC, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY AIR APPROVAL SHOULD GO THROUGH GCOO, GCEO, BST, LOGISTIC, SECURITY. (same for other positions except LOGISTIC, BST AND SECURITY).
     * - BY LAND:
     *   - TRIP BY LAND APPROVAL SHOULD GO THROUGH MANAGER, LOGISTIC, BST, SECURITY.
     *   - AND IF TRIP REQUESTER OR CREATOR IS A MANAGER AND TRIP BY LAND APPROVAL SHOULD GO THROUGH LOGISTIC, BST, SECURITY.
     */
    let nextUserApproval = null, isManager = false, isHOD = false, isGcoo = false, isGceo = false,
    nextUserEmail = "", nextUserSubject = "Please approve travel request for ";

    // IF it's by AIR. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [indentifier]: GCEO }] });
      if (nextUserApproval) {
        isGceo = true;
        // SEND TO BST TO PROCESS THE AIR TRIP
        const fetchedUser = fetchUser(bstCond);
        nextUserEmail = getUserEmail(fetchedUser);
        nextUserSubject = "Please process travel request for "
      }
    }

    // IF it's by LAND. CHECK THE NEXT IN LINE FOR APPROVAL IN RELATION TO THE REQUESTOR POSITION
    if (!isTripByAir) {
      nextUserApproval = fetchUser({ $and: [{ _id: currentTravelRequest.createdBy }, { [managerIdentifier]: String(positionId) }] });
      if (nextUserApproval) {
        isManager = true;
        // SEND TO LOGISTICS TO PROCESS THE LAND TRIP
        const fetchedUser = fetchUser(logisticCond);
        nextUserEmail = getUserEmail(fetchedUser);
        nextUserSubject = "Please process travel request for "
      }
    }

    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }

    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const logistics = Meteor.users.findOne(currentTravelRequest.logisticsId);
      const bookingAgentEmail = sendNotificationToBookingAgent(currentTravelRequest);
      const securityDeptEmail = sendNotificationToSecurityDept(currentTravelRequest);
      let createdByEmail = "";
      let logisticsEmail = "";
      let createdBySubject = "";
      let logisticsSubject = "";
      let bookingAgentSubject = "";
      let securityDeptSubject = "";

      if(currentTravelRequest.status === "Approved By GCEO"){
        createdBySubject = "Managing Director: " + logistics.profile.fullName + " has approved " +  createdBy.profile.fullName + "'s travel request";
        logisticsSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
        bookingAgentSubject = "Ticket booking for " + createdBy.profile.fullName + "'s travel request";
        securityDeptSubject = "Security request for " + createdBy.profile.fullName + "'s travel request";
      } else {
        createdBySubject = "Managing Director: " + logistics.profile.fullName + " has rejected your travel request";
        logisticsSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
      }

      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor, trips } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
      }

      if (logistics.emails.length > 0){
        logisticsEmail = logistics.emails[0].address;
        logisticsEmail = logisticsEmail  + ", bulkpay@c2gconsulting.com";
        console.log(logisticsEmail);
      }
      //Send to requestor
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

      //Send to GCOO
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, logisticsSubject);

      if (currentTravelRequest.status === "Approved By GCEO") {
        nextUserSubject += createdBy.profile.fullName
        //Send to NEXT USER APPROVAL
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, nextUserEmail, nextUserSubject);
      }

      // Send to booking agent if it's approved by logistics
      if (bookingAgentSubject && bookingAgentEmail) {
        TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bookingAgentEmail, bookingAgentSubject, 'booking agent');
      }

      // Send to security dept if requested and approved by logistics
      if (trips.length > 0 && securityDeptSubject) {
        for (let t = 0; t < trips.length; t++) {
          const { provideSecurity } = trips[t];
          if (provideSecurity) {
            TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);
          }
        }
      }
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

    currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
    let budgetCode = Budgets.findOne(currentTravelRequest.budgetCodeId);
    if (budgetCode){
      currentTravelRequest.budgetHolderId = budgetCode.employeeId;
      currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
    }

    if (!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
      let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
      throw new Meteor.Error(401, errMsg);
    }
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest});

      let otherPartiesEmail = "bulkpay@c2gconsulting.com";

      otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

      const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
      const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
      const financeApprover = Meteor.users.findOne(currentTravelRequest.financeApproverId);
      let createdByEmail = "";
      let supervisorEmail = "";
      let createdByName = "Employee"
      let supervisorName = "Supervisor"
      let financeApproverEmail = "";
      let financeApproverName = "Finance"
      let createdBySubject = "";
      let supervisorSubject = "";
      const financeApproverSubject = "Please approve travel retirement for " + createdBy.profile.fullName;



      if (currentTravelRequest.retirementStatus === "Retirement Approved by HOD"){
        createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has approved your travel retirement";
        supervisorSubject = "You have approved " + createdBy.profile.fullName + "'s travel retirement";
      } else{
        createdBySubject = "Supervisor: " + supervisor.profile.fullName + " has rejected your travel retirement";
        supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s travel retirement";
      }
      if (createdBy.emails.length > 0){
        createdByEmail = createdBy.emails[0].address;
        createdByEmail = createdByEmail + "," + otherPartiesEmail;
        console.log(createdByEmail);
      }

      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
        const individuals = tripFor;
        //  Send Notification to other individual going on this trip
        createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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
      TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, createdByEmail, createdBySubject);

      //Send to Supervisor
      TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, supervisorEmail, supervisorSubject);

      //Send to Finance
      TravelRequestHelper.sendTravelRetirementEmail(currentTravelRequest, financeApproverEmail, financeApproverSubject);
    } else{
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
    if (currentTravelRequest._id){
      TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})
    } else {
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

      //For retirements no need to involve city by city admin
      // for (i = 0; i < currentTravelRequest.trips.length; i++) {
      //    otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].toId);
      //    otherPartiesEmail += "," + TravelRequestHelper.getTravelcityEmail(currentTravelRequest.trips[i].fromId);
      // }

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


      const { tripFor } = currentTravelRequest;
      if (tripFor && tripFor.individuals && tripFor.individuals.length) {
          const individuals = tripFor;
          //  Send Notification to other individual going on this trip
          createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
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


const sendNotificationToBookingAgent = (currentTravelRequest) => {
  const { businessId } = currentTravelRequest;
  const emailSettings = EmailSettings.find({ businessId, department: 'Booking Agent' });
  return emailSettings.email
}


const sendNotificationToSecurityDept = (currentTravelRequest) => {
  const { businessId } = currentTravelRequest;
  const emailSettings = EmailSettings.find({ businessId, department: 'Security Dept' });
  return emailSettings.email
}
