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

  const project = Projects.findOne(departmentOrProjectId)
  const activity = Activities.findOne(activityId)
  const department = CostCenters.findOne(departmentOrProjectId)

  const projectID = project ? project.project_number : "";
  const wbsID = activity ? activity.code : "";
  const departmentID = department ? department.cost_center : "";

  const body = {
    "personnel_number": employeeId,
    "trip_id": tripId,
    "trip_description": description,
    "project_id": projectID,
    "wbs_id": wbsID,
    "department_id": departmentID,
    "cost_items": [
      // {
      //   "name": "TOTAL TRIP DURATION",
      //   "item_text": "TOTAL DAY(S) SPENT ON TRIP",
      //   "amount": (totalTripDuration || defaultCost),
      //   "currency": currency,
      //   "reference": "",
      // },
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

  const config = { url: 'postings', body: JSON.stringify(body) }
  const successFN = (resp) => journalPostingSuccess(body, resp);
  const errorFN = (error) => journalPostingFailed(body, error);

  return Core.apiClient(config, successFN, null, errorFN)
}

const journalPostingSuccess = (body, response) => {
  console.log('JOURNAL POSTED')
  console.info(response)

  const data = {
    to: 'trips@oilservltd-ng.com, adesanmiakoladedotun@gmail.com',
    from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
    subject: 'JOURNAL POSITING FAILED FOR TRAVEL REQUISITION',
    html: `
      <style>
        * {
          margin: 0;
          padding: 0;
        }

        pre {
          background: black;
          color: white;
          padding: 20px;
          margin-bottom: 30px;
        }

        h1 {
          padding: 15px;
        }

        h2 {
          padding: 20px
        }
      </style>
      <h1>JOURNAL POSITING FAILED</h1>

      <h2>JOURNAL POSTING ERROR OBJECT:</h2>
      <pre>
        ${JSON.stringify(response, undefined, 2)}
      </pre>

      <h2>JOURNAL POSTING PAYLOAD:</h2>
      <pre>
        ${JSON.stringify(body, undefined, 2)}
      </pre>
    `,
  }
  if (response && response.Errors && response.Errors.lines) {
    Core.sendMail(data)
    throw new Meteor.Error(403, "Journal Posting failed");
  } else {
    // SUCESS
    travelRequest.journalPosted = true;
    TravelRequisition2s.update(travelRequest._id, {$set: travelRequest})
  }
}

const journalPostingFailed = (body, error) => {
  const data = {
    to: 'trips@oilservltd-ng.com, adesanmiakoladedotun@gmail.com',
    from: "OILSERV TRIPS™ Travel Team <bulkpay@c2gconsulting.com>",
    subject: 'JOURNAL POSITING FAILED FOR TRAVEL REQUISITION',
    html: `
      <style>
        * {
          margin: 0;
          padding: 0;
        }

        pre {
          background: black;
          color: white;
          padding: 20px;
          margin-bottom: 30px;
        }

        h1 {
          padding: 15px;
        }
        
        h2 {
          padding: 20px
        }
      </style>
      <h1>JOURNAL POSITING FAILED</h1>

      <h2>JOURNAL POSTING ERROR OBJECT:</h2>
      <pre>
        ${JSON.stringify(error, undefined, 2)}
      </pre>

      <h2>JOURNAL POSTING PAYLOAD:</h2>
      <pre>
        ${JSON.stringify(body, undefined, 2)}
      </pre>
    `,
  }
  Core.sendMail(data)
  throw new Meteor.Error(400, "Journal Posting failed");
}
