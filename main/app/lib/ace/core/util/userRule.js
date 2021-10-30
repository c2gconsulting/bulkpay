Core.Approvals = {
  HOD: "HOD",
  MD: "MD",
  GCOO: "GCOO",
  GCEO: "GCEO",
  BST: "BST",
  LOGISTICS: "LOGISTICS",
  FINANCE: "FINANCE",
  SECURITY: "SECURITY"
}

Core.approvalList = [
  "HOD",
  "MD",
  "GCOO",
  "GCEO",
  "BST",
  "LOGISTICS",
  "FINANCE",
  "SECURITY"
]

Core.queryUsersExcept = (userId, conditions) => ({ $and: [{ _id: { $ne: userId } }, conditions] })


Core.getApprovalQueries = (currentUser = {}) => {
  // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
  // const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
  const { lineManagerId, hodPositionId, directSupervisorId } = currentUser;
  const GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
  const hodOrSupervisorCond = { positionId: hodPositionId };
  const managerCond = { positionId: lineManagerId };
  const GcooCond = { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } };
  const GceoCond = { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } };
  const bstCond = { "roles.__global_roles__" : Core.Permissions.BST_PROCESS }
  const logisticCond = { "roles.__global_roles__" : Core.Permissions.LOGISTICS_PROCESS }
  const financeCond = { "roles.__global_roles__" : Core.Permissions.FINANCE_MANAGE }
  const securityCond = { "roles.__global_roles__" : Core.Permissions.SECURITY_MANAGE }

  return {
    hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
  }
}

Core.hasApprovalLevel = (tripInfo = {}, approvalInfo) => {
  const { positionId, hodPositionId, lineManagerId, positionDesc } = Meteor.user();
  // let { trips, destinationType } = tripInfo;
  // const isInternationalTrip = destinationType === 'International';
  let status = tripInfo ? tripInfo.status : "Pending", currentPosition = 'HOD';
  const position = positionDesc ? positionDesc.toLowerCase() : "";
  let hasApprovalLevel = false;
  if (positionId === hodPositionId) {
    hasApprovalLevel = true;
    currentPosition = 'HOD';
    status = 'Approved By HOD'
  }
  if (positionId === lineManagerId) {
    hasApprovalLevel = true;
    currentPosition = 'MANAGER';
    status = 'Approved By MD'
    // if(!isAIR) status = 'Processed By Logistics'
  }
  if (position.includes('group chief operating off')) {
    hasApprovalLevel = true;
    currentPosition = "GCOO";
    status = 'Approved By GCOO'
    // if(!isAIR) status = 'Processed By Logistics'
  }
  if (position.includes('group chief executive off')) {
    hasApprovalLevel = true;
    currentPosition = "GCEO"
    status = 'Approved By GCEO'
    // if(!isAIR) status = 'Processed By Logistics'
  }
  return approvalInfo ? { currentPosition, status } : hasApprovalLevel;
}


Core.canCreateTravel = () => {
  const { employee, employeeProfile } = Meteor.user();
  const isVerified = () => employeeProfile.employment && employeeProfile.employment.status === 'Active';

  if (!employee || !employeeProfile || !employeeProfile.employment || !isVerified()) {
    let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
    throw new Meteor.Error(401, errMsg);
  }
}

Core.getApprovalConfig = (isUserPartOfApproval, tripInfo = { trips: [] }) => {
  let isAirTransportationMode = false;
  const { trips, destinationType } = tripInfo;

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode } = trips[i];
    if (transportationMode == 'AIR') isAirTransportationMode = true
  }

  if (isUserPartOfApproval === 'HOD') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'MD') {
    if (isAirTransportationMode) return Meteor.user();
    // return Meteor.user();
  }

  if (isUserPartOfApproval === 'GCOO') {
    if (isAirTransportationMode && isInternationalTrip) return Meteor.user();
    if (isAirTransportationMode && !isInternationalTrip) return Meteor.user();
    return null
  }

  if (isUserPartOfApproval === 'GCEO') {
    if (isInternationalTrip) return Meteor.user();
    return null
  }

  if (isUserPartOfApproval === 'LOGISTICS') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'BST') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'SECURITY') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'FINANCE') {
    return Meteor.user();
  }

  return null
}


Core.getNextApproval = (isUserPartOfApproval, tripInfo = { trips: [] }) => {
  let isAirTransportationMode = false;
  const { trips, destinationType } = tripInfo;

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode } = trips[i];
    if (transportationMode == 'AIR') isAirTransportationMode = true
  }

  if (isUserPartOfApproval === 'HOD') {
    return 'MD'
  }

  if (isUserPartOfApproval === 'MD') {
    if (isAirTransportationMode) return "GCOO"
    else return "LOGISTICS"
  }

  if (isUserPartOfApproval === 'GCOO') {
    if (isAirTransportationMode && isInternationalTrip) return 'GCEO';
    if (isAirTransportationMode && !isInternationalTrip) return 'BST';
    return "BST"
  }

  if (isUserPartOfApproval === 'GCEO') {
    if (isInternationalTrip) return 'BST';
    return "BST"
  }

  if (isUserPartOfApproval === 'LOGISTICS') {
    return "BST"
  }

  if (isUserPartOfApproval === 'BST') {
    return "LOGISTICS"
  }

  if (isUserPartOfApproval === 'SECURITY') {
    return "BST"
  }

  if (isUserPartOfApproval === 'FINANCE') {
    return ""
  }

  return null
}


Core.runApprovalFlow = (isUserPartOfApproval, tripInfo = { trips: [] }, callback) => {
  let isAirTransportationMode = false;
  const { trips, destinationType } = tripInfo;

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode } = trips[i];
    if (transportationMode == 'AIR') isAirTransportationMode = true
  }

  if (isUserPartOfApproval === 'HOD') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'MD') {
    if (isAirTransportationMode) return Meteor.user();
  }

  if (isUserPartOfApproval === 'GCOO') {
    if (isAirTransportationMode && isInternationalTrip) return Meteor.user();
    if (isAirTransportationMode && !isInternationalTrip) return Meteor.user();
    return null
  }

  if (isUserPartOfApproval === 'GCEO') {
    if (isInternationalTrip) return Meteor.user();
    return null
  }

  if (isUserPartOfApproval === 'LOGISTICS') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'BST') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'SECURITY') {
    return Meteor.user();
  }

  if (isUserPartOfApproval === 'FINANCE') {
    return Meteor.user();
  }

  return null
}
