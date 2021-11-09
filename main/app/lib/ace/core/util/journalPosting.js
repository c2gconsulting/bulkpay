Core.journalPosting = (travelRequest) => {
  const { createdBy, _id: tripId, description, departmentOrProjectId, activityId, destinationType } = travelRequest;
  let employeeId = '';
  const requesterInfo = Meteor.users.findOne(createdBy);

  const defaultCost = 0;
  const { totalTripDuration } = travelRequest;
  const { totalEmployeePerdiemNGN, totalEmployeePerdiemUSD } = travelRequest;
  const { totalAirportTaxiCostNGN, totalAirportTaxiCostUSD } = travelRequest;
  const { totalGroundTransportCostNGN, totalGroundTransportCostUSD } = travelRequest;
  const { totalMiscCostNGN, totalMiscCostUSD } = travelRequest;
  const { totalFlightCostNGN, totalFlightCostUSD } = travelRequest;
  const { totalSecurityCostNGN, totalSecurityCostUSD } = travelRequest;
  const { totalHotelCostNGN, totalHotelCostUSD } = travelRequest;
  const { totalAncilliaryCostNGN, totalAncilliaryCostUSD } = travelRequest;


  const isInternational = destinationType !== 'Local';
  const currency = isInternational ? 'USD' : 'NGN'
  if (requesterInfo) {
    const { employeeProfile } = requesterInfo;
    employeeId = employeeProfile.employeeId;
  }
  if (!employeeId) throw Error('The journal could not be posted. Employee does not have EMPLOYEE ID')

  const body = {
    "personnel_number": employeeId,
    "trip_id": tripId,
    "trip_description": description,
    "project_id": departmentOrProjectId,
    "wbs_id": activityId,
    "cost_items": [
      {
        "name": "TOTAL TRIP DURATION",
        "item_text": "TOTAL DAY(S) SPENT ON TRIP",
        "amount": (totalTripDuration || defaultCost),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL EMPLOYEE PERDIEM",
        "item_text": "AMOUNT SPENT ON PERDIEM",
        "amount": (totalEmployeePerdiemNGN || totalEmployeePerdiemUSD),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL AIRPORT TAXI COST",
        "item_text": "AMOUNT SPENT ON AIRPORT TAXI",
        "amount": (totalAirportTaxiCostNGN || totalAirportTaxiCostUSD),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL GROUND TRANSPORT COST",
        "item_text": "AMOUNT SPENT ON TRANSPORT",
        "amount": (totalGroundTransportCostNGN || totalGroundTransportCostUSD),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL MISC COST",
        "item_text": "AMOUNT SPENT ON MISC",
        "amount": (totalMiscCostNGN || totalMiscCostUSD),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL FLIGHT COST",
        "item_text": "AMOUNT SPENT ON FLIGHT",
        "amount": (totalFlightCostNGN || totalFlightCostUSD),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL SECURITY COST",
        "item_text": "AMOUNT SPENT ON SECURITY",
        "amount": (totalSecurityCostNGN || totalSecurityCostUSD),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL HOTEL COST",
        "item_text": "AMOUNT SPENT ON HOTEL",
        "amount": (totalHotelCostNGN || totalHotelCostUSD),
        "currency": currency,
        "reference": "",
      },
      {
        "name": "TOTAL ANCILILLIARY COST",
        "item_text": "AMOUNT SPENT ON ANCILILLIARY",
        "amount": (totalAncilliaryCostNGN || totalAncilliaryCostUSD),
        "currency": currency,
        "reference": "",
      }
    ],
  }

  return Core.apiClient({ url: 'postings', body  }, (response) => {
    console.log('JOURNAL POSTED')
    console.info(response)
  })
}
