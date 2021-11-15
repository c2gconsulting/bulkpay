Core.getOtherSubribedParties = (businessId, department) => {
  // const bookingAget = 'Booking';// department
  const emailSettings = EmailSettings._collection.find({ businessId, department: { '$regex': `${department}`, '$options': 'i' } }).fetch();
  let emails = '';
  for (let i = 0; i < emailSettings.length; i++) {
    const element = emailSettings[i];
    const comma = emails ? ', ' : '';
    emails += element.email + comma;
  }
  return emails
}

const fetchUsers = (conditions) => {
  const fetchedUsers = Meteor.users.find(conditions);
  if (fetchedUsers) return fetchedUsers;
  return []
}

const fetchOtherUsers = (fetchedUser, conditions) => {
  let assignedFullName, otherUserEmails;
  if (fetchedUser) {
    const filter = Core.queryUsersExcept(fetchedUser._id, conditions);
    const otherUsers = fetchUsers(filter);
    if (otherUsers) {
      otherUserEmails = otherUsers.map(otherUser => getJustUserEmail(otherUser))
      console.log('otherUserEmails', otherUserEmails)
      assignedFullName = fetchedUser.profile.fullName
    }
  }
  return { assignedFullName, otherUserEmails };
}

const supportmail = 'aadesanmi@c2gconsulting.com';
Core.sendApprovalMail = (currentTravelRequest, TravelRequestHelper, recieverID, nextUserID) => {
  let otherPartiesEmail = "bulkpay@c2gconsulting.com" + supportmail ? ` ${supportmail}, ` : supportmail;
  const defaultUserData = { profile: {} };

  const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy) || defaultUserData;
  const supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId) || defaultUserData;
  const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId) || defaultUserData;
  const manager = Meteor.users.findOne(currentTravelRequest.managerId) || defaultUserData;
  const gcoo = Meteor.users.findOne(currentTravelRequest.gcooId) || defaultUserData;
  const gceo = Meteor.users.findOne(currentTravelRequest.gceoId) || defaultUserData;
  const bst = Meteor.users.findOne(currentTravelRequest.bstId) || defaultUserData;
  const logistics = Meteor.users.findOne(currentTravelRequest.logisticsId) || defaultUserData;

  const { businessId } = currentTravelRequest;
  const bookingAgentEmail = Core.getOtherSubribedParties(businessId, 'Booking');
  const securityDeptEmail = Core.getOtherSubribedParties(businessId, 'Security');
  let createdByEmail = "";
  let supervisorEmail = "";
  let budgetHolderEmail = "";
  let managerEmail = "";
  let gcooEmail = "";
  let gceoEmail = "";
  let bstEmail = "";
  let logisticsEmail = "";

  let createdByName = "Employee"
  let supervisorName = "Supervisor"
  let budgetHolderName = "Budget Holder"
  let managerName = "Managing Director"
  let gcooName = "GCOO"
  let gceoName = "GCEO"
  let bstName = "BST"
  let logisticsName = "LOGISTICS"

  let otherUserSubject = "Travel request process for ";
  let bookingAgentSubject = "Ticket booking for " + createdBy.profile.fullName + "'s travel request";
  let securityDeptSubject = "Security Notification for " + createdBy.profile.fullName + "'s travel request";
  let createdBySubject = "New travel request for " + createdBy.profile.fullName;
  let supervisorSubject = "Please approve travel request for " + createdBy.profile.fullName;
  let budgetHolderSubject = "Please approve travel request for " + createdBy.profile.fullName;
  let managerSubject = "Please approve travel request for " + createdBy.profile.fullName;
  let gcooSubject = "Please approve travel request for " + createdBy.profile.fullName;
  let gceoSubject = "Please approve travel request for " + createdBy.profile.fullName;
  let bstSubject = "Please process travel request for " + createdBy.profile.fullName;
  let logisticsSubject = "Please process travel request for " + createdBy.profile.fullName;

  const { bstCond, logisticCond, financeCond, securityCond } = Core.getApprovalQueries(createdBy);

  const { 
    APPROVED_BY_HOD,
    REJECTED_BY_HOD,
    APPROVED_BY_BUDGETHOLDER,
    REJECTED_BY_BUDGETHOLDER,
    APPROVED_BY_MD,
    REJECTED_BY_MD,
    APPROVED_BY_GCOO,
    REJECTED_BY_GCOO,
    APPROVED_BY_GCEO,
    REJECTED_BY_GCEO,
    PROCESSED_BY_BST,
    PROCESSED_BY_LOGISTICS } = Core.ALL_TRAVEL_STATUS

  const {
    HOD,
    BUDGETHOLDER,
    MD,
    GCOO,
    GCEO,
    BST,
    LOGISTICS,
    FINANCE,
    SECURITY
  } = Core.Approvals;

  // JUST APPROVED BY:
  const isBUDGETHOLDER = recieverID === BUDGETHOLDER;
  const isHOD = recieverID === HOD;
  const isMD = recieverID === MD;
  const isGCOO = recieverID === GCOO;
  const isGCEO = recieverID === GCEO;
  const isBST = recieverID === BST;
  const isLOGISTICS = recieverID === LOGISTICS;

  // NEXT APPROVAL BY:
  const nextBUDGETHOLDER = nextUserID === BUDGETHOLDER;
  const nextHOD = nextUserID === HOD;
  const nextMD = nextUserID === MD;
  const nextGCOO = nextUserID === GCOO;
  const nextGCEO = nextUserID === GCEO;
  const nextBST = nextUserID === BST;
  const nextLOGISTICS = nextUserID === LOGISTICS;


  if (isBUDGETHOLDER && currentTravelRequest.status === APPROVED_BY_BUDGETHOLDER){
    createdBySubject = `${BUDGETHOLDER}: ` + budgetHolder.profile.fullName + " has approved your travel request";
    budgetHolderSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isHOD && currentTravelRequest.status === APPROVED_BY_HOD){
    createdBySubject = `${HOD}: ` + supervisor.profile.fullName + " has approved your travel request";
    supervisorSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isMD && currentTravelRequest.status === APPROVED_BY_MD){
    createdBySubject = `${MD}: ` + manager.profile.fullName + " has approved your travel request";
    managerSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isGCOO && currentTravelRequest.status === APPROVED_BY_GCOO){
    createdBySubject = `${GCOO}: ` + gcoo.profile.fullName + " has approved your travel request";
    gcooSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isGCEO && currentTravelRequest.status === APPROVED_BY_GCEO){
    createdBySubject = `${GCEO}: ` + gceo.profile.fullName + " has approved your travel request";
    gceoSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isBST && currentTravelRequest.status === PROCESSED_BY_BST){
    createdBySubject = `${BST}: ` + bst.profile.fullName + " has processed your travel request";
    bstSubject = "You have processed " + createdBy.profile.fullName + "'s travel request";
  }

  if (isLOGISTICS && currentTravelRequest.status === PROCESSED_BY_LOGISTICS){
    createdBySubject = `${LOGISTICS}: ` + logistics.profile.fullName + " has processed your travel request";
    logisticsSubject = "You have processed " + createdBy.profile.fullName + "'s travel request";
  }

  // REJECTION SUBJECTS
  // BUDGET HOLDER
  if (isBUDGETHOLDER && currentTravelRequest.status === REJECTED_BY_BUDGETHOLDER) {
    createdBySubject = `${BUDGETHOLDER}: ` + budgetHolder.profile.fullName + " has rejected your travel request";
    supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }

  // HOD
  if (isHOD && currentTravelRequest.status === REJECTED_BY_HOD) {
    createdBySubject = `${HOD}: ` + supervisor.profile.fullName + " has rejected your travel request";
    supervisorSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // MD
  if (isMD && currentTravelRequest.status === REJECTED_BY_MD) {
  createdBySubject = `${MD}: ` + manager.profile.fullName + " has rejected your travel request";
  managerSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // GCOO
  if (isGCOO && currentTravelRequest.status === REJECTED_BY_GCOO) {
    createdBySubject = `${GCOO}: ` + gcoo.profile.fullName + " has rejected your travel request";
    gcooSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // GCEO
  if (isGCEO && currentTravelRequest.status === REJECTED_BY_GCEO) {
    createdBySubject = `${GCEO}: ` + gceo.profile.fullName + " has rejected your travel request";
    gceoSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // END OF REJECTION SUBJECTS


  if (createdBy.emails.length > 0) {
    createdByEmail = createdBy.emails[0].address;
    createdByEmail = createdByEmail + "," + otherPartiesEmail;
    console.log(createdByEmail);
  }

  const { tripFor } = currentTravelRequest;
  if (tripFor && tripFor.individuals && tripFor.individuals.length) {
    const { individuals } = tripFor;
    //  Send Notification to other individual going on this trip
    createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
  }

  if ((isBUDGETHOLDER || nextBUDGETHOLDER) && budgetHolder.emails.length > 0) {
    budgetHolderEmail = budgetHolder.emails[0].address;
    budgetHolderEmail = budgetHolderEmail + "," + otherPartiesEmail;
    console.log(budgetHolderEmail);
  }

  if ((isHOD || nextHOD) && supervisor.emails.length > 0) {
    supervisorEmail = supervisor.emails[0].address;
    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
    console.log(supervisorEmail);
  }

  if ((isMD || nextMD) && manager.emails.length > 0) {
    managerEmail = manager.emails[0].address;
    managerEmail = managerEmail + "," + otherPartiesEmail;
    console.log(managerEmail);
  }

  if ((isGCOO || nextGCOO) && gcoo.emails.length > 0) {
    gcooEmail = gcoo.emails[0].address;
    gcooEmail = gcooEmail + "," + otherPartiesEmail;
    console.log(gcooEmail);
  }

  if ((isGCEO || nextGCEO) && gceo.emails.length > 0) {
    gceoEmail = gceo.emails[0].address;
    gceoEmail = gceoEmail + "," + otherPartiesEmail;
    console.log(gceoEmail);
  }

  if ((isBST || nextBST) && bst.emails.length > 0) {
    bstEmail = bst.emails[0].address;
    bstEmail = bstEmail + "," + otherPartiesEmail;
    console.log(bstEmail);
  }

  if ((isLOGISTICS || nextLOGISTICS) && logistics.emails.length > 0) {
    logisticsEmail = logistics.emails[0].address;
    logisticsEmail = logisticsEmail + "," + otherPartiesEmail;
    console.log(logisticsEmail);
  }

  //Send to requestor
  TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

  //Send to Budegt Holder
  if (isBUDGETHOLDER || nextBUDGETHOLDER) {
    console.log('Email To: BUDGETHOLDER', budgetHolderEmail);
    console.log('budgetHolderSubject: ', budgetHolderSubject)
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, budgetHolderEmail, budgetHolderSubject);
  }

  //Send to Supervisor
  if (isHOD || nextHOD) {
    console.log('Email To: HOD', supervisorEmail);
    console.log('supervisorSubject: ', supervisorSubject)
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, supervisorEmail, supervisorSubject);
  }

  //Send to Manager
  if (isMD || nextMD) {
    console.log('Email To: MD', managerEmail);
    console.log('managerSubject: ', managerSubject)
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, managerEmail, managerSubject);
  }

  //Send to Supervisor
  if (isGCOO || nextGCOO) {
    console.log('Email To: GCOO', gcooEmail);
    console.log('gcooSubject: ', gcooSubject)
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gcooEmail, gcooSubject);
  }

  //Send to Supervisor
  if (isGCEO || nextGCEO) {
    console.log('Email To: GCEO', gceoEmail);
    console.log('gceoSubject: ', gceoSubject)
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, gceoEmail, gceoSubject);
  }

  //Send to Supervisor
  if (isBST || nextBST) {
    console.log('Email To: BST', bstEmail);
    console.log('bstSubject: ', bstSubject)
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bstEmail, bstSubject);

    if (nextBST) {
      // Send to NEXT USER APPROVAL
      const { otherUserEmails, assignedFullName } = fetchOtherUsers(bst, bstCond)
      console.log(`BST approval assigned to: ${assignedFullName}, then inform other bst members`, otherUserEmails);
      otherUserSubject = otherUserSubject + createdBy.profile.fullName + "has been assigned to " + assignedFullName;
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, otherUserEmails, otherUserSubject);
    }
  
    let isTripByAir;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === 'AIR') isTripByAir = true
    }

    // Send to booking agent if it's approved by manager
    if (isBST && isTripByAir) {
      console.log('--bookingAgentEmail--', bookingAgentEmail)
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bookingAgentEmail, bookingAgentSubject, 'booking agent');
    }

    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);

  }

  //Send to Supervisor
  if (isLOGISTICS || nextLOGISTICS) {
    console.log('Email To: LOGISTICS')
    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, logisticsEmail, logisticsSubject);

    if (nextLOGISTICS) {
      // Send to NEXT USER APPROVAL
      const { otherUserEmails, assignedFullName } = fetchOtherUsers(logistics, logisticCond)
      console.log(`BST approval assigned to: ${assignedFullName}, then inform other logistics members`, otherUserEmails);
      otherUserSubject = otherUserSubject + createdBy.profile.fullName + "has been assigned to " + assignedFullName;
      TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, otherUserEmails, otherUserSubject);
    }

    TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);
  }
}

