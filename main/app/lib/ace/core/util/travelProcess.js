const HOD = "HOD";
const BUDGETHOLDER = 'BUDGET HOLDER';
const MD = "MD";
const GCOO = "GCOO";
const GCEO = "GCEO";
const BST = "BST";
const LOGISTICS = "LOGISTICS";
const FINANCE = "FINANCE";
const SECURITY = "SECURITY";

Core.Approvals = {
  HOD,
  BUDGETHOLDER,
  MD,
  GCOO,
  GCEO,
  BST,
  LOGISTICS,
  FINANCE,
  SECURITY
}

Core.approvalList = [
  HOD,
  MD,
  GCOO,
  GCEO,
  BST,
  LOGISTICS,
  FINANCE,
  SECURITY
]

// STATUS
const CANCELLED = 'Cancelled'
const DRAFT = 'draft'
const PENDING = 'Pending'
const APPROVED_BY_HOD = 'Approved By HOD'
const REJECTED_BY_HOD = 'Rejected By HOD'
const APPROVED_BY_BUDGETHOLDER = 'Approved By Budget Holder'
const REJECTED_BY_BUDGETHOLDER = 'Rejected By Budget Holder'
const APPROVED_BY_MD = 'Approved By MD'
const REJECTED_BY_MD = 'Rejected By MD'
const APPROVED_BY_GCOO = 'Approved By GCOO'
const REJECTED_BY_GCOO = 'Rejected By GCOO'
const APPROVED_BY_GCEO = 'Approved By GCEO'
const REJECTED_BY_GCEO = 'Rejected By GCEO'
const PROCESSED_BY_BST = 'Processed By BST'
const PROCESSED_BY_LOGISTICS = 'Processed By Logistics'

// RETIREMENT STATUS
const NOT_RETIRED = 'Not Retired'
const RETIREMENT_DRAFT = 'draft'
const RETIREMENT_SUBMITED = 'Retirement Submitted'
const RETIREMENT_APPROVED_BY_HOD = 'Retirement Approved By HOD'
const RETIREMENT_REJECTED_BY_HOD = 'Retirement Rejected By HOD'
const RETIREMENT_APPROVED_BY_FINANCE = 'Retirement Approved Finance'
const RETIREMENT_REJECTED_BY_FINANCE = "Retirement Rejected Finance"
const RETIREMENT_APPROVED_BY_BUDGETHOLDER =  "Retirement Approved Budget Holder"
const RETIREMENT_REJECTED_BY_BUDGETHOLDER = "Retirement Rejected Budget Holder"
const RETIREMENT_APPROVED_BY_BST =  "Retirement Approved BST"
const RETIREMENT_REJECT_BY_BST = "Retirement Rejected BST"

// TRIP Category
const INDIVIDUAL = 'INDIVIDUAL'
const GROUP = 'GROUP'
const THIRD_PARTY_CLIENT = 'THIRD_PARTY_CLIENT'

Core.tripCategories = [INDIVIDUAL, GROUP, THIRD_PARTY_CLIENT];

Core.ALL_TRIP_CATEGORIES = {
  INDIVIDUAL,
  GROUP,
  THIRD_PARTY_CLIENT,
}

Core.ALL_TRAVEL_STATUS = {
  CANCELLED,
  DRAFT,
  PENDING,
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
  PROCESSED_BY_LOGISTICS,
  // Retirement status
  NOT_RETIRED,
  RETIREMENT_DRAFT,
  RETIREMENT_SUBMITED,
  RETIREMENT_APPROVED_BY_HOD,
  RETIREMENT_REJECTED_BY_HOD,
  APPROVED_BY_BUDGETHOLDER,
  REJECTED_BY_BUDGETHOLDER,
  RETIREMENT_APPROVED_BY_FINANCE,
  RETIREMENT_REJECTED_BY_FINANCE,
  RETIREMENT_APPROVED_BY_BUDGETHOLDER,
  RETIREMENT_REJECTED_BY_BUDGETHOLDER,
  RETIREMENT_APPROVED_BY_BST,
  RETIREMENT_REJECT_BY_BST,
}

Core.travelStatus = [
  CANCELLED,
  DRAFT,
  PENDING,
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
  PROCESSED_BY_LOGISTICS,
]

Core.travelRetirementStatus = [
  NOT_RETIRED,
  RETIREMENT_DRAFT,
  RETIREMENT_SUBMITED,
  RETIREMENT_APPROVED_BY_HOD,
  RETIREMENT_REJECTED_BY_HOD,
  APPROVED_BY_BUDGETHOLDER,
  REJECTED_BY_BUDGETHOLDER,
  RETIREMENT_APPROVED_BY_FINANCE,
  RETIREMENT_REJECTED_BY_FINANCE,
  RETIREMENT_APPROVED_BY_BUDGETHOLDER,
  RETIREMENT_REJECTED_BY_BUDGETHOLDER,
  RETIREMENT_APPROVED_BY_BST,
  RETIREMENT_REJECT_BY_BST,
]


Core.canCreateTravel = () => {
  const { employee, employeeProfile } = Meteor.user();
  const isVerified = () => employeeProfile.employment && employeeProfile.employment.status === 'Active';

  if (!employee || !employeeProfile || !employeeProfile.employment || !isVerified()) {
    let errMsg = "Sorry, you are not allowed to create a travel requisition because you are a super admin"
    throw new Meteor.Error(401, errMsg);
  }
}

Core.queryUsersExcept = (userId, conditions) => ({ $and: [{ _id: { $ne: userId } }, conditions] })

Core.getUserApproval = (conditions) => Meteor.users.findOne(conditions);

Core.getTravelQueries = (retirementQuery) => {
  const user = Meteor.user();
  const userId = user ? user._id : Meteor.userId();

  const budgetHolderQueries = [
    { status: PENDING },
    { status: APPROVED_BY_BUDGETHOLDER },
    { status: REJECTED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_HOD },
    { status: REJECTED_BY_HOD },
    { status: APPROVED_BY_MD },
    { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS }
  ]


  const hodQueries = [
    // { status: PENDING },
    { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_HOD },
    { status: REJECTED_BY_HOD },
    { status: APPROVED_BY_MD },
    { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
  ]


  const managerQueries = [
    { status: APPROVED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_HOD },
    // { status: REJECTED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_MD },
    { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
    { $and: [{ createdByHOD: true }, { status: APPROVED_BY_BUDGETHOLDER }] }
  ]

  const gcooQueries = [
    // { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    // { status: APPROVED_BY_HOD },
    { status: APPROVED_BY_MD },
    // { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
    { $and: [{ createdByMD: true }, { status: APPROVED_BY_BUDGETHOLDER }] },
    { $and: [{ $or: [{ destinationType: 'Local' }, { destinationType: 'International' }] }, { 'trips.transportationMode': 'AIR' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]},
  ]

  const gceoQueries = [
    // { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    // { status: APPROVED_BY_HOD },
    // { status: APPROVED_BY_MD },
    // { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    // { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
    { $and: [{ createdByGCOO: true }, { status: APPROVED_BY_BUDGETHOLDER }] },
    { $and: [{ destinationType: 'International' }, { 'trips.transportationMode': 'AIR' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]}
  ]

  const bstQueries = [
    // { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    // { status: APPROVED_BY_HOD },
    // { status: APPROVED_BY_MD },
    // { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    // { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    // { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
    { $and: [{ createdByGCEO: true }, { status: APPROVED_BY_BUDGETHOLDER }] },
    // { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': 'AIR' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]}
    { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': 'AIR' }, { status: APPROVED_BY_BUDGETHOLDER }, { $or: [{ createdByHOD: true }, { createdByMD: true }, { createdByGCOO: true }, { createdByGCEO: true }] }] }
  ]

  const logisticsQueries = [
    // { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    // { status: APPROVED_BY_HOD },
    // { status: APPROVED_BY_MD },
    // { status: REJECTED_BY_MD },
    // { status: APPROVED_BY_GCOO },
    // { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    // { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
    { $and: [{ createdByGCEO: true }, { status: APPROVED_BY_BUDGETHOLDER }] },
    // { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': { $ne: 'AIR' } }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]}
    { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': { $ne: 'AIR' } }, { status: APPROVED_BY_BUDGETHOLDER }, { $or: [{ createdByHOD: true }, { createdByMD: true }, { createdByGCOO: true }, { createdByGCEO: true }] } ]}
  ]

  const myTripCondition = {
    createdBy: userId, tripCategory: { $nin: ['GROUP', 'THIRD_PARTY_CLIENT'] }
  };

  const groupTripCondition = {
    createdBy: userId, tripCategory: 'GROUP'
  };

  const thirdPartyTripCondition = {
    createdBy: userId, tripCategory: 'THIRD_PARTY_CLIENT'
  };

  const hodOrSupervisorCondition = {
    $and : [{ supervisorId: userId }, { $or : hodQueries }]
  };

  const budgetHolderCondition = {
    $and : [{ budgetHolderId: userId }, { $or : budgetHolderQueries }]
  };

  const managerCondition = {
    $and : [{ managerId: userId }, { $or : managerQueries }]
  };

  const gcooCondition = {
    $and : [{ gcooId: userId }, { $or : gcooQueries }]
  };

  const gceoCondition = {
    $and : [{ gceoId: userId }, { $or : gceoQueries }]
  };

  const bstCondition = {
    $and : [{ bstId: userId }, { $or : bstQueries }]
  };

  const logisticsCondition = {
    $and : [{ logisticsId: userId }, { $or : logisticsQueries }]
  };

  if (retirementQuery) {
    
  }

  return {
    hodOrSupervisorCondition, budgetHolderCondition, managerCondition, gcooCondition, gceoCondition, bstCondition, logisticsCondition,
    myTripCondition, thirdPartyTripCondition, groupTripCondition, thirdPartyTripCondition
  }
}


Core.getTravelRetirementQueries = () => {
  const hodOrSupervisorCond = {}
  return {

  }
}

Core.getApprovalQueries = (currentUser = {}, myApprovalAccess) => {
  const { lineManagerId, hodPositionId, _id: userId,  } = currentUser;
  let GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off';
  let hodOrSupervisorCond = { positionId: hodPositionId };
  let managerCond = { positionId: lineManagerId };
  let GcooCond = { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } };
  let GceoCond = { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } };
  let bstCond = { "roles.__global_roles__" : Core.Permissions.BST_PROCESS }
  let logisticCond = { "roles.__global_roles__" : Core.Permissions.LOGISTICS_PROCESS }
  let financeCond = { "roles.__global_roles__" : Core.Permissions.FINANCE_MANAGE }
  let securityCond = { "roles.__global_roles__" : Core.Permissions.SECURITY_MANAGE }

  // Check Current User Approval Access
  if (myApprovalAccess) {
    hodOrSupervisorCond = { hodPositionId  };
    managerCond = { lineManagerId };
    GcooCond = { $and: [{ _id: userId }, { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } }] };
    GceoCond = { $and: [{ _id: userId }, { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } }] };
  } else {}

  return {
    hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
  }
}

Core.canApprove = (position, tripInfo) => {
  const { status, isProcessedByLogistics, isProcessedByBST } = tripInfo;
  switch (position) {
    case BUDGETHOLDER:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${REJECTED_BY_BUDGETHOLDER}`.includes(status);

    case HOD:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_HOD} ${REJECTED_BY_HOD}`.includes(status);

    case MD:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${REJECTED_BY_MD}`.includes(status);

    case GCOO:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO} ${REJECTED_BY_GCOO}`.includes(status);

    case GCEO:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO} ${APPROVED_BY_GCEO} ${REJECTED_BY_GCEO}`.includes(status);

    case BST:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO} ${APPROVED_BY_GCEO} ${REJECTED_BY_GCEO}`.includes(status);

    case LOGISTICS:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO} ${APPROVED_BY_GCEO} ${REJECTED_BY_GCEO}`.includes(status);
    default:
      break;
  }
}


Core.hasApprovalLevel = (tripInfo = {}, approvalInfo) => {
  const { positionId, positionDesc } = Meteor.user();

  let status = tripInfo ? tripInfo.status : PENDING, currentPosition = HOD;
  const position = positionDesc ? positionDesc.toLowerCase() : "";
  let hasApprovalLevel = false;
  // if (positionId === hodPositionId) {
  if (Meteor.users.findOne({ hodPositionId: positionId })) {
    hasApprovalLevel = true;
    currentPosition = HOD;
    status = APPROVED_BY_HOD
  }
  // if (positionId === lineManagerId) {
  if (Meteor.users.findOne({ lineManagerId: positionId })) {
    hasApprovalLevel = true;
    currentPosition = 'MANAGER';
    status = APPROVED_BY_MD
    // if(!isAIR) status = 'Processed By Logistics'
  }
  if (position.includes('group chief operating off')) {
    hasApprovalLevel = true;
    currentPosition = GCOO;
    status = APPROVED_BY_GCOO
    // if(!isAIR) status = 'Processed By Logistics'
  }
  if (position.includes('group chief executive off')) {
    hasApprovalLevel = true;
    currentPosition = GCEO
    status = APPROVED_BY_GCEO
    // if(!isAIR) status = 'Processed By Logistics'
  }
  return approvalInfo ? { currentPosition, status } : hasApprovalLevel;
}

const getWhereToStartApproval = (tripInfo) => {
  const { createdByHOD, createdByMD, createdByGCOO, createdByGCEO } = tripInfo;

  const isAboveOrHOD = createdByHOD || createdByMD || createdByGCOO || createdByGCEO
  const isAboveOrMD = createdByMD || createdByGCOO || createdByGCEO
  const isAboveOrGCOO = createdByGCOO || createdByGCEO
  const isAboveOrGCEO = createdByGCEO

  return { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO }
}

Core.getWhereToStartApproval = getWhereToStartApproval;

Core.canProcessTrip = () => {
  if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
    let errMsg = "Sorry, you are not allowed to perform an action on travel requisition because you are not an internal staff memeber"
    throw new Meteor.Error(401, errMsg);
  }
}

Core.getApprovalConfig = (isUserPartOfApproval, tripInfo = { trips: [] }) => {
  let isAirTransportationMode = false;
  const { trips, destinationType, } = tripInfo;
  const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = getWhereToStartApproval(tripInfo);

  console.log('isAboveOrHOD', isAboveOrHOD)

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode } = trips[i];
    if (transportationMode == 'AIR') isAirTransportationMode = true
  }

  if (!isAboveOrHOD && isUserPartOfApproval === HOD) {
    return Meteor.user();
  }

  if (!isAboveOrMD && isAirTransportationMode && isUserPartOfApproval === MD) {
    if (isAirTransportationMode) return Meteor.user();
    return null
    // return Meteor.user();
  }

  if (!isAboveOrGCOO && isAirTransportationMode && isUserPartOfApproval === GCOO) {
    if (isAirTransportationMode && isInternationalTrip) return Meteor.user();
    if (isAirTransportationMode && !isInternationalTrip) return Meteor.user();
    return null
  }

  if (!isAboveOrGCEO && isAirTransportationMode && isUserPartOfApproval === GCEO) {
    if (isInternationalTrip) return Meteor.user();
    return null
  }

  if (isUserPartOfApproval === LOGISTICS) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === BST) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === SECURITY) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === FINANCE) {
    return Meteor.user();
  }

  return null
}


Core.getNextApproval = (nextApproval, tripInfo = { trips: [] }) => {
  let isAirTransportationMode = false;
  const { trips, destinationType, } = tripInfo;
  const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = getWhereToStartApproval(tripInfo);

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode } = trips[i];
    if (transportationMode == 'AIR') isAirTransportationMode = true
  }

  if (nextApproval === HOD) {
    return MD
  }

  if (nextApproval === MD) {
    if (isAirTransportationMode) return GCOO
    else return LOGISTICS
  }

  if (nextApproval === GCOO) {
    if (isAirTransportationMode && isInternationalTrip) return GCEO;
    if (isAirTransportationMode && !isInternationalTrip) return BST;
    return BST
  }

  if (nextApproval === GCEO) {
    if (isInternationalTrip) return BST;
    return BST
  }

  if (nextApproval === LOGISTICS) {
    return BST
  }

  if (nextApproval === BST) {
    return LOGISTICS
  }

  if (nextApproval === SECURITY) {
    return BST
  }

  if (nextApproval === FINANCE) {
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

  if (isUserPartOfApproval === HOD) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === MD) {
    if (isAirTransportationMode) return Meteor.user();
  }

  if (isUserPartOfApproval === GCOO) {
    if (isAirTransportationMode && isInternationalTrip) return Meteor.user();
    if (isAirTransportationMode && !isInternationalTrip) return Meteor.user();
    return null
  }

  if (isUserPartOfApproval === GCEO) {
    if (isInternationalTrip) return Meteor.user();
    return null
  }

  if (isUserPartOfApproval === LOGISTICS) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === BST) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === SECURITY) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === FINANCE) {
    return Meteor.user();
  }

  return null
}
