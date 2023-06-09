const HOD = "HOD";
const HOC = "HOC";
const PM = "PM";
const BUDGETHOLDER = 'BUDGET HOLDER';
const MD = "MD";
const GCOO = "GCOO";
const GCEO = "GCEO";
const BST = "BST";
const LOGISTICS = "LOGISTICS";
const FINANCE = "FINANCE";
const SECURITY = "SECURITY";

Core.Approvals = {
  PM,
  HOD,
  HOC,
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
  PM,
  HOD,
  HOC,
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
const DRAFT = 'Draft'
const PENDING = 'Pending'
const APPROVED_BY_PM = 'Approved By PM'
const REJECTED_BY_PM = 'Rejected By PM'
const APPROVED_BY_HOD = 'Approved By HOD'
const REJECTED_BY_HOD = 'Rejected By HOD'
const APPROVED_BY_HOC = 'Approved By HOC'
const REJECTED_BY_HOC = 'Rejected By HOC'
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
const RETIREMENT_DRAFT = 'Draft'
const RETIREMENT_SUBMITED = 'Retirement Submitted'
const RETIREMENT_APPROVED_BY_PM = 'Retirement Approved By PM'
const RETIREMENT_REJECTED_BY_PM = 'Retirement Rejected By PM'
const RETIREMENT_APPROVED_BY_HOD = 'Retirement Approved By HOD'
const RETIREMENT_REJECTED_BY_HOD = 'Retirement Rejected By HOD'
const RETIREMENT_APPROVED_BY_HOC = 'Retirement Approved By HOC'
const RETIREMENT_REJECTED_BY_HOC = 'Retirement Rejected By HOC'
const RETIREMENT_APPROVED_BY_FINANCE = 'Retirement Approved Finance'
const RETIREMENT_REJECTED_BY_FINANCE = "Retirement Rejected Finance"
const RETIREMENT_APPROVED_BY_BUDGETHOLDER =  "Retirement Approved Budget Holder"
const RETIREMENT_REJECTED_BY_BUDGETHOLDER = "Retirement Rejected Budget Holder"
const RETIREMENT_APPROVED_BY_BST =  "Retirement Approved BST"
const RETIREMENT_REJECTED_BY_BST = "Retirement Rejected BST"

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
  APPROVED_BY_PM,
  REJECTED_BY_PM,
  APPROVED_BY_HOD,
  REJECTED_BY_HOD,
  APPROVED_BY_HOC,
  REJECTED_BY_HOC,
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
  RETIREMENT_APPROVED_BY_HOC,
  RETIREMENT_REJECTED_BY_HOC,
  RETIREMENT_APPROVED_BY_PM,
  RETIREMENT_REJECTED_BY_PM,
  RETIREMENT_APPROVED_BY_FINANCE,
  RETIREMENT_REJECTED_BY_FINANCE,
  RETIREMENT_APPROVED_BY_BUDGETHOLDER,
  RETIREMENT_REJECTED_BY_BUDGETHOLDER,
  RETIREMENT_APPROVED_BY_BST,
  RETIREMENT_REJECTED_BY_BST,
}

Core.travelStatus = [
  CANCELLED,
  DRAFT,
  PENDING,
  APPROVED_BY_HOD,
  REJECTED_BY_HOD,
  APPROVED_BY_HOC,
  REJECTED_BY_HOC,
  APPROVED_BY_PM,
  REJECTED_BY_PM,
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
  RETIREMENT_APPROVED_BY_PM,
  RETIREMENT_REJECTED_BY_PM,
  RETIREMENT_APPROVED_BY_HOD,
  RETIREMENT_REJECTED_BY_HOD,
  RETIREMENT_APPROVED_BY_HOC,
  RETIREMENT_REJECTED_BY_HOC,
  RETIREMENT_APPROVED_BY_BUDGETHOLDER,
  RETIREMENT_REJECTED_BY_BUDGETHOLDER,
  RETIREMENT_APPROVED_BY_FINANCE,
  RETIREMENT_REJECTED_BY_FINANCE,
  RETIREMENT_APPROVED_BY_BST,
  RETIREMENT_REJECTED_BY_BST,
]

/**
 * @description canCreateTravel
 * @returns {*} void
 */
Core.canCreateTravel = () => {
  const { employee, employeeProfile } = Meteor.user();
  const isVerified = () => employeeProfile.employment && employeeProfile.employment.status === 'Active';

  if (!employee || !employeeProfile || !employeeProfile.employment || !isVerified()) {
    let errMsg = "Sorry, you are not allowed to create a travel requisition because you are a super admin"
    throw new Meteor.Error(401, errMsg);
  }
}

/**
 * @description queryUsersExcept
 * @param {*} userId 
 * @param {*} conditions 
 * @returns {*} Object - ({ $and: [{ _id: { $ne: userId } }, conditions] })
 */
Core.queryUsersExcept = (userId, conditions) => ({ $and: [{ _id: { $ne: userId } }, conditions] })

/**
 * @description getUserApproval
 * @param {*} conditions 
 * @returns {*} Object - Meteor.users.findOne(conditions);
 */
Core.getUserApproval = (conditions) => Meteor.users.findOne(conditions);

/**
 * @description getTravelQueries
 * @returns {*} Object 
 * @example {
    hocCondition, pmCondition, hodOrSupervisorCondition, budgetHolderCondition, managerCondition,
    gcooCondition, gceoCondition, bstCondition, logisticsCondition, securityCondition,
    myTripCondition, thirdPartyTripCondition, groupTripCondition, thirdPartyTripCondition,
    hodOrSupervisorRetirementCond, financeRetirementCond, budgetHolderRetirementCond, bstRetirementCond
  }
 */
Core.getTravelQueries = () => {
  const user = Meteor.user();
  const userId = user ? user._id : Meteor.userId();

  const budgetHolderQueries = [
    // { status: PENDING },
    { status: APPROVED_BY_BUDGETHOLDER },
    { status: REJECTED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_HOD },
    { status: REJECTED_BY_HOD },
    { status: APPROVED_BY_PM },
    { status: REJECTED_BY_PM },
    { status: APPROVED_BY_HOC },
    { status: REJECTED_BY_HOC },
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
    { status: PENDING },
    { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': 'LAND' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: PENDING }] }]},
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

  const hocQueries = [
    { status: PENDING },
    { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': 'LAND' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: PENDING }] }]},
    { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_HOC },
    { status: REJECTED_BY_HOC },
    { status: APPROVED_BY_MD },
    { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
  ]

  const pmQueries = [
    { status: PENDING },
    { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': 'LAND' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: PENDING }] }]},
    { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_PM },
    { status: REJECTED_BY_PM },
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
    // { status: PENDING },
    // { status: APPROVED_BY_BUDGETHOLDER },
    { status: APPROVED_BY_PM },
    { status: APPROVED_BY_HOD },
    { status: APPROVED_BY_HOC },
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
    { status: PENDING },
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
    // { $and: [{ $or: [{ destinationType: 'Local' }, { destinationType: 'International' }] }, { 'trips.transportationMode': 'AIR' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]},
  ]

  const gceoQueries = [
    { status: PENDING },
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
    // { $and: [{ destinationType: 'International' }, { 'trips.transportationMode': { $ne: 'LAND' } }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]}
  ]

  const bstQueries = [
    { status: PENDING },
    // { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    // { status: APPROVED_BY_HOD },
    { status: APPROVED_BY_MD },
    // { status: REJECTED_BY_MD },
    { status: APPROVED_BY_GCOO },
    // { status: REJECTED_BY_GCOO },
    { status: APPROVED_BY_GCEO },
    // { status: REJECTED_BY_GCEO },
    { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
    { $and: [{ createdByGCEO: true }, { status: APPROVED_BY_BUDGETHOLDER }] },
    // { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': 'AIR' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]}
    { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': { $ne: 'LAND' } }, { status: APPROVED_BY_BUDGETHOLDER }, { $or: [{ createdByGCOO: true }, { createdByGCEO: true }] }] }
  ]

  const logisticsQueries = [
    { status: PENDING },
    // { status: APPROVED_BY_BUDGETHOLDER },
    // { status: REJECTED_BY_BUDGETHOLDER },
    // { status: APPROVED_BY_HOD },
    // { status: APPROVED_BY_MD },
    // { status: REJECTED_BY_MD },
    // { status: APPROVED_BY_GCOO },
    // { status: REJECTED_BY_GCOO },
    // { status: APPROVED_BY_GCEO },
    // { status: REJECTED_BY_GCEO },
    // { status: PROCESSED_BY_BST },
    { status: PROCESSED_BY_LOGISTICS },
    // { $and: [{ createdByGCEO: true }, { status: APPROVED_BY_BUDGETHOLDER }] },
    // { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': { $ne: 'AIR' } }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_MD }] }]}
    { $and: [{ destinationType: 'Local' }, { 'trips.transportationMode': 'LAND' }, { $or: [{ status: APPROVED_BY_BUDGETHOLDER }, { status: APPROVED_BY_HOD }, { status: APPROVED_BY_PM }, { status: APPROVED_BY_HOC }, { createdByHOD: true }, { createdByMD: true }, { createdByGCOO: true }, { createdByGCEO: true }] } ]}
  ]

  // RETIREMENT
  const hodRetirementQueries = [
    { retirementStatus: RETIREMENT_SUBMITED },
    { retirementStatus: RETIREMENT_APPROVED_BY_HOD },
    { retirementStatus: RETIREMENT_REJECTED_BY_HOD },
  ]

  const hocRetirementQueries = [
    { retirementStatus: RETIREMENT_SUBMITED },
    { retirementStatus: RETIREMENT_APPROVED_BY_HOC },
    { retirementStatus: RETIREMENT_REJECTED_BY_HOC },
  ]

  const pmRetirementQueries = [
    { retirementStatus: RETIREMENT_SUBMITED },
    { retirementStatus: RETIREMENT_APPROVED_BY_PM },
    { retirementStatus: RETIREMENT_REJECTED_BY_PM },
  ]

  const financeRetirementQueries = [
    { retirementStatus: RETIREMENT_APPROVED_BY_HOD },
    { retirementStatus: RETIREMENT_APPROVED_BY_PM },
    { retirementStatus: RETIREMENT_APPROVED_BY_HOC },
    { retirementStatus: RETIREMENT_APPROVED_BY_FINANCE },
    { retirementStatus: RETIREMENT_REJECTED_BY_FINANCE },
    { $and: [{ createdByHOD: true }, { retirementStatus: RETIREMENT_SUBMITED }] },
    { $and: [{ createdByMD: true }, { retirementStatus: RETIREMENT_SUBMITED }] },
    { $and: [{ createdByGCOO: true }, { retirementStatus: RETIREMENT_SUBMITED }] },
    { $and: [{ createdByGCEO: true }, { retirementStatus: RETIREMENT_SUBMITED }] },
  ]

  const budgetHolderRetirementQueries = [
    { retirementStatus: RETIREMENT_APPROVED_BY_FINANCE },
    { retirementStatus: RETIREMENT_APPROVED_BY_BUDGETHOLDER },
    { retirementStatus: RETIREMENT_REJECTED_BY_BUDGETHOLDER },
  ]

  const bstRetirementQueries = [
    { retirementStatus: RETIREMENT_APPROVED_BY_FINANCE },
    { retirementStatus: RETIREMENT_APPROVED_BY_BUDGETHOLDER },
    { retirementStatus: RETIREMENT_APPROVED_BY_BST },
    { retirementStatus: RETIREMENT_REJECTED_BY_BST },
  ]

  // BUILD ACTUAL QUERIES

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
    // $and : [{ supervisorId: userId }, { $or : hodQueries }]
    $and : [{ supervisorId: userId }, { $or : hodQueries }]
  };

  const hocCondition = {
    $and : [{ hocId: userId }, { $or : hocQueries }]
  };

  const pmCondition = {
    $and : [{ pmId: userId }, { $or : pmQueries }]
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
    $and : [{ bstIds: userId }, { $or : bstQueries }]
  };

  const logisticsCondition = {
    $and : [{ logisticsIds: userId }, { $or : logisticsQueries }]
  };

  const securityCondition = {
    $or: [{ securityIds: userId }, { securityId: userId }]
  };

  const hodOrSupervisorRetirementCond = {
    $and : [{ supervisorId: userId }, { $or : hodRetirementQueries }]
  };

  const hocRetirementCond = {
    $and : [{ hocId: userId }, { $or : hocRetirementQueries }]
  };

  const hodOrPmRetirementCond = {
    $and : [{ supervisorId: userId }, { $or : pmRetirementQueries }]
  };

  const financeRetirementCond = {
    $and : [{ financeApproverId: userId }, { $or : financeRetirementQueries }]
  };

  const budgetHolderRetirementCond = {
    $and : [{ budgetHolderId: userId }, { $or : budgetHolderRetirementQueries }]
  };

  const bstRetirementCond = {
    $and : [{ bstId: userId }, { $or : bstRetirementQueries }]
  };

  return {
    pmCondition, hodOrSupervisorCondition, hocCondition, budgetHolderCondition, managerCondition,
    gcooCondition, gceoCondition, bstCondition, logisticsCondition, securityCondition,
    myTripCondition, thirdPartyTripCondition, groupTripCondition, thirdPartyTripCondition,
    hocRetirementCond, hodOrPmRetirementCond, hodOrSupervisorRetirementCond, financeRetirementCond, budgetHolderRetirementCond, bstRetirementCond
  }
}

/**
 * @description getUserPrivilege
 * @param {*} travelDetail
 * @returns {*} Object - @example{ hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond }
 */
Core.getDirectPrivilege = (travelDetail) => {
  const GCOO = 'Group Chief Operating off', // SPELLINGS ARE INTENTIONAL
  GCEO = 'Group Chief Executive off', // SPELLINGS ARE INTENTIONAL
  GCFO = 'Group Chief Finance Offic', // SPELLINGS ARE INTENTIONAL
  ICT_MANAGER = 'ICT Manager',
  FINANCE_CONTROLLER = 'Financial Controller';

  const user = Meteor.user();
  const positionId = user ? user._id : "";
  const hodOrSupervisorCond = { hodId:  positionId };
  const pmCond = { $or: [{ pmIds: positionId  }, { pmId: positionId  }] };
  const hocCond = { $or: [{ hocIds: positionId  }, { hocId: positionId  }] };
  const managerCond = { managerId: positionId };
  const GcooCond = { $and: [{ _id: positionId }, { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } }] };
  const GceoCond = { $and: [{ _id: positionId }, { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } }] };
  const bstCond = { "roles.__global_roles__" : Core.Permissions.BST_PROCESS }
  const logisticCond = { "roles.__global_roles__" : Core.Permissions.LOGISTICS_PROCESS }
  const financeCond = { "roles.__global_roles__" : Core.Permissions.FINANCE_MANAGE }
  const securityCond = { "roles.__global_roles__" : Core.Permissions.SECURITY_MANAGE }

  return { pmCond, hocCond, hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond }
}

/**
 * @description getUserPrivilege
 * @param {*} travelDetail
 * @returns {*} Object - @example{ hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond }
 */
Core.getUserPrivilege = (travelDetail) => {
  const GCOO = 'Group Chief Operating off', // SPELLINGS ARE INTENTIONAL
  GCEO = 'Group Chief Executive off', // SPELLINGS ARE INTENTIONAL
  GCFO = 'Group Chief Finance Offic', // SPELLINGS ARE INTENTIONAL
  ICT_MANAGER = 'ICT Manager',
  FINANCE_CONTROLLER = 'Financial Controller';
  // Generic queries
  const bstCond = { "roles.__global_roles__" : Core.Permissions.BST_PROCESS }
  const logisticCond = { "roles.__global_roles__" : Core.Permissions.LOGISTICS_PROCESS }
  const financeCond = { "roles.__global_roles__" : Core.Permissions.FINANCE_MANAGE }
  const securityCond = { "roles.__global_roles__" : Core.Permissions.SECURITY_MANAGE }

  if (travelDetail) {
    const { departmentOrProjectId } = travelDetail;
    const foundUser = Meteor.users.findOne(travelDetail.createdBy);
    const { lineManagerId  } = foundUser;
    const managerCond = { positionId: lineManagerId };
    const GcooCond = { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } };
    const GceoCond = { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } };


    const queries = { managerCond, GcooCond, GceoCond };
    if (travelDetail.costCenter === 'Project') {
      const currentProject = Projects.findOne({ _id: departmentOrProjectId });
      const { project_manager } = currentProject || {};
      const username = (project_manager || " ").split(' ').reverse().join(' ');
      const pmCond = { $or: [{ 'profile.fullName': { '$regex': `${project_manager}`, '$options': 'i' } }, { 'profile.fullName': { '$regex': `${username}`, '$options': 'i' } }] };

      return { ...queries, pmCond }
    }
    const currentCostCenter = CostCenters.findOne({ _id: departmentOrProjectId });
    const { person_responsible_employee_number: userId } = currentCostCenter || {};
    const hocCond = { 'employeeProfile.employeeId': userId };

    return { ...queries, hocCond }
  }

  const user = Meteor.user();
  const positionId = user ? user._id : "";
  const hodOrSupervisorCond = { hodId:  positionId };
  const pmCond = { $or: [{ pmIds: positionId  }, { pmId: positionId  }] };
  const hocCond = { $or: [{ hocIds: positionId  }, { hocId: positionId  }] };
  const managerCond = { managerId: positionId };
  const GcooCond = { $and: [{ _id: positionId }, { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } }] };
  const GceoCond = { $and: [{ _id: positionId }, { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } }] };

  return { pmCond, hocCond, hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond }
}

/**
 * @description getApprovalQueries
 * @param {*} currentUser 
 * @param {*} myApprovalAccess 
 * @returns {*} Object - @example{ hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond }
 */
Core.getApprovalQueries = (currentUser = {}, myApprovalAccess) => {
  const { managerId, hodPositionId, pmPositionId, hocPositionId, _id: userId,  } = currentUser;
  let GCOO = 'Group Chief Operating off', GCEO = 'Group Chief Executive off', GCFO = 'Group Chief Finance Offic';
  const ICT_MANAGER = 'ICT Manager', FINANCE_CONTROLLER = 'Financial Controller';
  let hodOrSupervisorCond = { positionId: hodPositionId };
  let pmCond = { $or: [{ pmIds: pmPositionId  }, { pmId: pmPositionId  }] };
  let hocCond = { $or: [{ hocIds: hocPositionId  }, { hocId: hocPositionId  }] };
  let managerCond = { positionId: managerId };
  // let managerCond = { positionDesc: { '$regex': `${FINANCE_CONTROLLER}`, '$options': 'i' } };
  // let GcooCond = { positionDesc: { '$regex': `${ICT_MANAGER}`, '$options': 'i' } };
  let GcooCond = { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } };
  let GceoCond = { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } };
  let bstCond = { "roles.__global_roles__" : Core.Permissions.BST_PROCESS }
  let logisticCond = { "roles.__global_roles__" : Core.Permissions.LOGISTICS_PROCESS }
  let financeCond = { "roles.__global_roles__" : Core.Permissions.FINANCE_MANAGE }
  let securityCond = { "roles.__global_roles__" : Core.Permissions.SECURITY_MANAGE }

  // Check Current User Approval Access
  if (myApprovalAccess) {
    hodOrSupervisorCond = { hodPositionId  };
    managerCond = { managerId };
    // managerCond = { $and: [{ _id: userId }, { positionDesc: { '$regex': `${FINANCE_CONTROLLER}`, '$options': 'i' } }] };
    // GcooCond = { $and: [{ _id: userId }, { positionDesc: { '$regex': `${ICT_MANAGER}`, '$options': 'i' } }] };
    GcooCond = { $and: [{ _id: userId }, { positionDesc: { '$regex': `${GCOO}`, '$options': 'i' } }] };
    GceoCond = { $and: [{ _id: userId }, { positionDesc: { '$regex': `${GCEO}`, '$options': 'i' } }] };
  } else {}

  return {
    pmCond, hocCond, hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
  }
}

/**
 * @description canApprove - can User Approve
 * @param {*} position 
 * @param {*} tripInfo 
 * @returns {*} Boolean
 */
Core.canApprove = (position, tripInfo) => {
  const { status, isProcessedByLogistics, isProcessedByBST, trips } = tripInfo;
  const hasHotelId = () => (trips || []).filter(trip => trip.hotelId !== '' && trip.hotelId !== 'I do not need a Hotel');
  const hasGuestHouseId = () => (trips || []).filter(trip => trip.guestHouseId !== '' && trip.guestHouseId !== 'I do not need a Hotel');
  switch (position) {
    case BUDGETHOLDER:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${REJECTED_BY_BUDGETHOLDER}`.includes(status);

    case HOD:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER}`.includes(status);

    case PM:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER}`.includes(status);

    case HOC:
      return `${PENDING} ${APPROVED_BY_BUDGETHOLDER}`.includes(status);

    case MD:
      return `${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_PM} ${APPROVED_BY_HOC} ${APPROVED_BY_HOD}`.includes(status);

    case GCOO:
      return `${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_PM} ${APPROVED_BY_HOC} ${APPROVED_BY_HOD} ${APPROVED_BY_MD}`.includes(status);

    case GCEO:
      return `${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_PM} ${APPROVED_BY_HOC} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO}`.includes(status);

    case BST: {
      const hotelReq = hasHotelId();
      const guestHouseReq = hasGuestHouseId();
      const requestGuestHouse = (guestHouseReq && guestHouseReq.length >= 1);
      const requestHotel = (hotelReq && hotelReq.length >= 1);
      const ProcessLogistics = `${PENDING} ${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_PM} ${APPROVED_BY_HOC} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO} ${APPROVED_BY_GCEO} ${REJECTED_BY_GCEO} ${PROCESSED_BY_LOGISTICS} ${PROCESSED_BY_BST}`;
      if (requestGuestHouse || requestHotel) return ProcessLogistics.includes(status);
      return `${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_PM} ${APPROVED_BY_HOC} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO} ${APPROVED_BY_GCEO} ${REJECTED_BY_GCEO} ${PROCESSED_BY_BST}`.includes(status);
    }

    case LOGISTICS:
      return `${APPROVED_BY_BUDGETHOLDER} ${APPROVED_BY_PM} ${APPROVED_BY_HOC} ${APPROVED_BY_HOD} ${APPROVED_BY_MD} ${APPROVED_BY_GCOO} ${APPROVED_BY_GCEO} ${REJECTED_BY_GCEO} ${PROCESSED_BY_LOGISTICS}`.includes(status);
    default:
      break;
  }
}

/**
 * @description getWhereToStartApproval - get User Position Status
 * @param {*} tripInfo 
 * @returns {Object} Object - { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO }
 */
const getWhereToStartApproval = (tripInfo) => {
  const { createdByHOD, createdByMD, createdByGCOO, createdByGCEO } = tripInfo;

  const isAboveOrHOD = createdByHOD || createdByMD || createdByGCOO || createdByGCEO
  const isAboveOrMD = createdByMD || createdByGCOO || createdByGCEO
  const isAboveOrGCOO = createdByGCOO || createdByGCEO
  const isAboveOrGCEO = createdByGCEO

  return { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO }
}

/**
 * @description getWhereToStartApproval - get User Position Status
 * @param {*} tripInfo 
 * @returns {Object} Object - { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO }
 */
Core.getWhereToStartApproval = getWhereToStartApproval;

/**
 * @description canProcessTrip - Verify current user could Process Trip
 * @returns {*} void - throw error if couldn't process a trip
 */
Core.canProcessTrip = () => {
  if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
    let errMsg = "Sorry, you are not allowed to perform an action on travel requisition because you are not an internal staff member"
    throw new Meteor.Error(401, errMsg);
  }
}

Core.getApprovalConfig = (recipientPosition, tripInfo = { trips: [] }) => {
  let isAirRailTransportationMode = false;
  let isRailTransportationMode = false;
  let isLandTransportationMode = false;
  let isAirTransportationMode = false;
  let hasAccommodation = "";
  const { trips, destinationType, costCenter } = tripInfo;
  const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = getWhereToStartApproval(tripInfo);

  console.log('isAboveOrHOD', isAboveOrHOD)

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode, accommodation } = trips[i];
    // if (transportationMode == 'AIR' || transportationMode == 'RAIL') isAirRailTransportationMode = true;
    if (['Hotel', 'Guest House'].includes(accommodation)) hasAccommodation = true;
    if (transportationMode == 'LAND') isLandTransportationMode = true;
    if (transportationMode == 'RAIL') isRailTransportationMode = true;
    if (transportationMode == 'AIR') isAirTransportationMode = true
  }

  if (!isAboveOrHOD && recipientPosition === HOD) {
    // return Meteor.user();
    if (costCenter === 'Project') return Meteor.user();
    else if (costCenter === 'Department') return Meteor.user();
    return null
  }

  if (!isAboveOrMD && isAirTransportationMode && recipientPosition === MD) {
    if (isAirTransportationMode) return Meteor.user();
    return null
    // return Meteor.user();
  }

  if (!isAboveOrGCOO && isAirTransportationMode && recipientPosition === GCOO) {
    if (isAirTransportationMode && isInternationalTrip) return Meteor.user();
    if (isAirTransportationMode && !isInternationalTrip) return Meteor.user();
    return null
  }

  console.log('isAboveOrGCEO', isAboveOrGCEO)
  console.log('isAirTransportationMode', isAirTransportationMode)
  console.log('recipientPosition', recipientPosition)
  if (!isAboveOrGCEO && isAirTransportationMode && recipientPosition === GCEO) {
    console.log('isInternationalTrip', isInternationalTrip)
    console.log('isInternationalTrip', isInternationalTrip)
    if (isInternationalTrip) return Meteor.user();
    return null
  }

  if ((isLandTransportationMode || isRailTransportationMode) && recipientPosition === LOGISTICS) {
    return Meteor.user();
  }

  if (recipientPosition === BST) {
    return Meteor.user();
  }

  if (recipientPosition === SECURITY) {
    return Meteor.user();
  }

  if (recipientPosition === FINANCE) {
    return Meteor.user();
  }

  return null
}


Core.getNextApproval = (nextApproval, tripInfo = { trips: [] }) => {
  let isAirRailTransportationMode = false;
  const { trips, destinationType, } = tripInfo;
  const { isAboveOrHOD, isAboveOrMD, isAboveOrGCOO, isAboveOrGCEO } = getWhereToStartApproval(tripInfo);

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode } = trips[i];
    if (transportationMode == 'AIR' || transportationMode == 'RAIL') isAirRailTransportationMode = true
  }

  if (nextApproval === HOD) {
    return MD
  }

  if (nextApproval === MD) {
    if (isAirRailTransportationMode) return GCOO
    else return LOGISTICS
  }

  if (nextApproval === GCOO) {
    if (isAirRailTransportationMode && isInternationalTrip) return GCEO;
    if (isAirRailTransportationMode && !isInternationalTrip) return BST;
    return BST
  }

  if (nextApproval === GCEO) {
    if (isInternationalTrip) return BST;
    return BST
  }

  if (!isAirRailTransportationMode && nextApproval === LOGISTICS) {
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
  let isAirRailTransportationMode = false;
  const { trips, destinationType } = tripInfo;

  const isInternationalTrip = destinationType === 'International';
  for (let i = 0; i < trips.length; i++) {
    const { transportationMode } = trips[i];
    if (transportationMode == 'AIR' || transportationMode == 'RAIL') isAirRailTransportationMode = true
  }

  if (isUserPartOfApproval === HOD) {
    return Meteor.user();
  }

  if (isUserPartOfApproval === MD) {
    if (isAirRailTransportationMode) return Meteor.user();
  }

  if (isUserPartOfApproval === GCOO) {
    if (isAirRailTransportationMode && isInternationalTrip) return Meteor.user();
    if (isAirRailTransportationMode && !isInternationalTrip) return Meteor.user();
    return null
  }

  if (!isAboveOrGCEO && isAirRailTransportationMode && position === GCEO) {
    if (isInternationalTrip) return Meteor.user();
    return null
  }

  if (!isAirRailTransportationMode && position === LOGISTICS) {
    return Meteor.user();
  }

  if (position === BST) {
    return Meteor.user();
  }

  if (position === SECURITY) {
    return Meteor.user();
  }

  if (position === FINANCE) {
    return Meteor.user();
  }

  return null
}
