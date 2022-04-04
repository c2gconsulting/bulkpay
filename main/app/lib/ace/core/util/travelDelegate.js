const fetchUsers = (conditions) => {
  const fetchedUsers = Meteor.users.find(conditions);
  if (fetchedUsers) return fetchedUsers;
  return []
}

const getJustUserEmail = (userData) => {
  if (userData && userData.emails.length > 0){
    console.log(userData.emails[0].address);
    return "" + userData.emails[0].address;
  }
}

const getTripDate = (currentTravelRequest) => {
  const { trips } = currentTravelRequest;
  let departureDate = trips && trips[0] && trips[0].departureDate;
  departureDate = getTripDate ? new Date(departureDate) : new Date();
  return departureDate;
}

Core.travelDelegateIds = (user, currentTravelRequest) => {
  const departureDate = getTripDate(currentTravelRequest);
  const userId = currentTravelRequest[user];
  console.log('userId', userId);
  const delegates = EmployeeDelegates.find({ createdBy: userId, endDate: { $gte: departureDate }  }).fetch();
  console.log('delegates', JSON.stringify(delegates))
  const employeeIds = delegates.map(delegate => delegate && delegate.userId);
  console.log('employeeIds', JSON.stringify(employeeIds))
  // if (employeeIds) currentTravelRequest.supervisorIds
  currentTravelRequest[`${user}s`] = [userId, ...employeeIds];
  return currentTravelRequest;
}

Core.travelDelegateMails = (delegates) => {
  const departureDate = getTripDate(currentTravelRequest);
  // const delegates = EmployeeDelegates.find({ createdBy: userId, endDate: { $gte: departureDate } }).fetch();
  console.log('delegates', JSON.stringify(delegates))
  const employeeIds = delegates.map(delegate => delegate && delegate.userId);
  const employees = fetchUsers({ _id: employeeIds });
  console.log('employees', JSON.stringify(employees));
  return employees.map(employee => getJustUserEmail(employee))
}
