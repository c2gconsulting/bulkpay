Core.Travel = {
	"costCenters" : [
    {
      id: "Project",
      name: 'Project Trip'
    },
    {
      id: "Department",
      name: "Departmental Trip"
    }
  ],

  carOptions: [
    {
      id: 'THIRD_PARTY',
      name: 'A third party will provide me a car'
    },
    {
      id: 'OFFICE',
      name: 'I need an office car and driver'
    },
    {
      id: 'CAR_HIRE',
      name: 'I need a car hire'
    }
  ]
};

Core.queryClient = (apiUrl, userId, reactiveVariable) => {
  Meteor.call(apiUrl, userId, (err, res) => {
    if (res) reactiveVariable.set(res)
  })
}


Core.updateTravelActivities = (departmentOrProjectId, reactiveVar) => {
  // const { departmentOrProjectId } = currentTravelRequest;
  const activities = Activities.find({ type: 'project', unitOrProjectId: departmentOrProjectId });
  reactiveVar.set(activities);
}

Core.getCurrentTrip = function () {
  var currentRoute = Router.current();
  // currentRoute.url - http://localhost:3000/business/FJe5hXSxCHvR2FBjJ/employee/grouptravelrequisition2index
  // currentRoute.route.getName() - travelrequest2.grouptravelrequisition2index
  const GROUP_TRIP = 'grouptravelrequisition2index';
  // const INDIVIDUAL_TRIP = 'individualtravelrequisition2index';
  const TPC_TRIP = 'tpctravelrequisition2index';
  const RouteName = currentRoute.route.getName().replace('travelrequest2.', '')
  if(RouteName === GROUP_TRIP && RouteName.includes('group')) return 'GROUP';
  if(RouteName === TPC_TRIP && RouteName.includes('tpc')) return 'THIRD_PARTY_CLIENT';
  return 'INDIVIDUAL';
}

Core.getUTCDate = (rawDate) => new Date(Date.UTC(
  rawDate.getFullYear(),
  rawDate.getMonth(),
  rawDate.getDate(),
  rawDate.getHours(),
  rawDate.getMinutes(),
  rawDate.getSeconds(),
  rawDate.getMilliseconds()
));

Core.tripDetails = (index, minDate, from) => ({
  tripIndex: index || 1,
  fromId: from || "",
  toId: "",
  departureDate: minDate,
  returnDate: minDate,
  departureTime: "6 AM",
  returnTime: "6 PM",
  transportationMode: 'AIR',
  carOption: 'CAR_HIRE',
  provideAirportPickup: false,
  provideGroundTransport: false,
  provideSecurity: false,
  originCityAirportTaxiCost: 0,
  destinationCityAirportTaxiCost: 0,
  groundTransportCost: 0,
  airlineId: "",
  airfareCost: 0,
  airfareCurrency: "NGN",
  hotelId: "H3593",
  hotelRate: 0,
  destinationCityCurrreny: "NGN",
  hotelNotRequired: false,
  perDiemCost: 0,
  originCityCurrreny: "NGN",
  isBreakfastIncluded: false,
  isLunchIncluded: false,
  isDinnerIncluded: false,
  isIncidentalsIncluded: false,
  totalDuration: 0,
  totalPerDiem: 0,
  totalHotelCost: 0
})


const minDate = new Date(moment().add(5, 'day').format());

Core.currentTravelRequest = (businessUnitId) => ({
  businessId: businessUnitId,

  destinationType: 'Local',
  costCenter: 'Project',
  tpcTrip: 'Third_Party',
  tripFor: {},
  tripCategory: Core.getCurrentTrip() || 'INDIVIDUAL',
  description: "",
  budgetCodeId: "",
  departmentOrProjectId: "",
  // PROJECT BREAK DOWN ACTIVITY ID
  activityId: "",
  cashAdvanceNotRequired: false,
  isEmergencyTrip: false,
  type:"Return",
  totalTripDuration: 0,
  totalEmployeePerdiemNGN: 0,
  totalEmployeePerdiemUSD: 0, totalAirportTaxiCostNGN: 0, totalAirportTaxiCostUSD: 0, totalGroundTransportCostNGN: 0, totalGroundTransportCostUSD: 0,
  totalFlightCostNGN: 0,
  totalFlightCostUSD: 0,
  totalHotelCostNGN: 0,
  totalHotelCostUSD: 0,
  totalTripCostNGN: 0,
  totalTripCostUSD: 0,
  status: "Pending",
  supervisorId: "",
  budgetHolderId: "",
  createdBy: Meteor.user()._id,

  trips:[Core.tripDetails(1, minDate)]
})

/******** UTILITY FUNCTIONS BELOW ***********/
Core.getIndividualIDs = (individuals) => {
  let IDs = _.map(individuals, function(individual) {
    return individual.id
  })

  IDs = _.filter(IDs, function (ID) {
    return ID !== undefined;
  })

  return IDs
}

Core.defaultDepartmentAndProject = (self, travelRequestDetails) => {
  self.subscribe('project', travelRequestDetails.departmentOrProjectId);
  self.subscribe('costcenter', travelRequestDetails.departmentOrProjectId);
    self.subscribe('activity', travelRequestDetails.activityId);

  if (travelRequestDetails.costCenter !== 'Project') {
    const department = CostCenters.findOne(travelRequestDetails.departmentOrProjectId);
    const departmentDatum = department ? `${department.cost_center_general_name} - ${department.functional_area}` : "I am not sure";
    self.currentDepartment.set(departmentDatum);
  }

  if (travelRequestDetails.costCenter === 'Project') {
    const project = Projects.findOne(travelRequestDetails.departmentOrProjectId)
    // console.log('project', project)
    const projectDatum = project ? `${project.name} - ${project.external_project_number}` : "I am not sure";
    // console.log('project -- data', projectDatum)
    self.currentProject.set(projectDatum)

    const activity = Activities.findOne(travelRequestDetails.activityId)
    // console.log('activity', activity)
    // console.log('travelRequestDetails.activityId', travelRequestDetails.activityId)
    const datum = activity ? `${activity.description} - ${activity.externalCode}` : "I am not sure";
    self.currentActivity.set(datum)
  }
}

Core.autorun = (invokeReason, self) => {
  // self.currentDepartment = new ReactiveVar()
  // self.currentProject = new ReactiveVar()
  try {
    if (invokeReason){
      let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId);
      if(travelRequest2Sub.ready()) {
        let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId});

        Core.defaultDepartmentAndProject(self, travelRequestDetails)
  
        if (travelRequestDetails) {
          $('#costCenter').dropdown('set selected', travelRequestDetails.costCenter);
          $('#departmentOrProjectId').dropdown('set selected', travelRequestDetails.departmentOrProjectId);
          // console.log('travelRequestDetails.activityId', travelRequestDetails.activityId)
          if (travelRequestDetails.activityId) $('#project_activity-code').dropdown('set selected', travelRequestDetails.activityId);
        }
        /* Pre-select individual going on trip if there's any */
        let individuals = (travelRequestDetails.tripFor && travelRequestDetails.tripFor.individuals) || [];
        const IDs = Core.getIndividualIDs(individuals);
        if (IDs && IDs.length) {
          // $('.ui.fluid.dropdown').dropdown('set selected',['Role1','Role2']);
          $('#individuals').dropdown('set selected', IDs);
        }
        /* End of Pre-selection */
        self.currentTravelRequest.set(travelRequestDetails)
  
      }
    }
  } catch (error) {
    Core.Log.error('travel autorun error')
    Core.Log.error(error)
  }
}



/**
 * 
 */
Core.tripAnalysis = (self) => {

  let currentTravelRequest = self.currentTravelRequest.curValue;
  const tripType = currentTravelRequest.type;

  currentTravelRequest.description = $("#description").val();
  currentTravelRequest.budgetCodeId = $("#budget-code").val();
  // currentTravelRequest.departmentOrProjectId = $("#departmentOrProjectId").val();

  self.subscribe("activities", 'project', currentTravelRequest.departmentOrProjectId);


  const { destinationType } = currentTravelRequest;
  const isInternational = destinationType === "International"
  let StaffCategory = StaffCategories.find({ isInternational }).fetch();
  // console.log('StaffCategoryyyy', StaffCategory)

  const { tripFor } = currentTravelRequest;
  let individuals = tripFor && tripFor.individuals ? tripFor.individuals : [{}];
  // console.log('individuals', individuals)

  let totalTripDuration = 0;
  let totalEmployeePerdiemNGN = 0;
  let totalEmployeePerdiemUSD = 0;
  let totalFlightCostNGN = 0;
  let totalFlightCostUSD = 0;
  let totalHotelCostNGN = 0;
  let totalHotelCostUSD = 0;
  let totalTripCostNGN = 0;
  let totalTripCostUSD = 0;
  let totalAirportTaxiCostNGN = 0;
  let totalAirportTaxiCostUSD = 0;
  let totalGroundTransportCostNGN = 0;
  let totalGroundTransportCostUSD = 0;
  let totalMiscCostNGN = 0;
  let totalMiscCostUSD = 0;

  for (i = 0; i < currentTravelRequest.trips.length; i++) {
    let totalHotelCost = 0;
    let totalHotelRate = 0;
    let totalPerDiem = 0;// group perdiem
    let totalPerDiemCost = 0;// group perdiem multply by days spent on the trip
    let originCityAirportTaxiCost = 0;
    let destinationCityAirportTaxiCost = 0;
    let groundTransportCost = 0;


    let totalDuration = 0;

    if (tripType === "Return"){
      const startDate = moment(currentTravelRequest.trips[i].departureDate)
      const endDate = moment(currentTravelRequest.trips[i].returnDate)


    //    var sTARTDATE = moment(startDate).format('DD/MM/YYYY');
    //    var eNDDATE = moment(endDate).format('DD/MM/YYYY');


    //   console.log("sTARTDATE")
    //   console.log(sTARTDATE)
    //   console.log("eNDDATE")
    //   console.log(eNDDATE)

        totalDuration = endDate.diff(startDate, 'days');

        if (totalDuration < 0){
            totalDuration = 0;
        }else{
            totalDuration = totalDuration + 0.5;
            //totalDuration = totalDuration;

        }
    } else if (tripType === "Single") {
      totalDuration = totalDuration + 0.5;
    } else if (tripType === "Multiple"){

        if ((i + 1) >= currentTravelRequest.trips.length){
            totalDuration = 0;
        }else{
            const startDate = moment(currentTravelRequest.trips[i].departureDate);
            const endDate = moment(currentTravelRequest.trips[i+1].departureDate)

            totalDuration = endDate.diff(startDate, 'days');
            if (totalDuration < 0){
                totalDuration = 0;
            }else{
                totalDuration = totalDuration + 0.5;
            }
        }
    }



    console.log("Total Duration: " + totalDuration)



    let toTravelCity = Travelcities.findOne({_id: currentTravelRequest.trips[i].toId});
    let fromTravelCity = Travelcities.findOne({_id: currentTravelRequest.trips[i].fromId});

    for (let eI = 0; eI < individuals.length; eI++) {
      let { staffCategory } = Meteor.user();

      if (currentTravelRequest.tripCategory !== 'INDIVIDUAL') {
        const individual = individuals[eI];
        // console.log('individuals[eI]', individuals[eI])
        if (individual && individual.staffCategory) staffCategory = individual.staffCategory;
      }

      const toId = currentTravelRequest.trips[i].toId;
      const hotelNotRequired = currentTravelRequest.trips[i].hotelNotRequired;



      let perDiemCost = 0;
      let unadjustedPerDiemCost = 0;
      let originCityCurrreny = "NGN";
      let destinationCityCurrreny = "NGN";

      userStaffCategory = StaffCategory.find((StaffCategory) => StaffCategory.category === staffCategory);
      userStaffCategory = userStaffCategory || null

      console.log('userStaffCategory', userStaffCategory)

      if(toTravelCity){
          destinationCityCurrreny = toTravelCity.currency;
      }

      if(fromTravelCity){
          // originCityCurrreny = fromTravelCity.currency;
          originCityCurrreny = fromTravelCity.currency;
      }

      if (userStaffCategory){
          unadjustedPerDiemCost = userStaffCategory.perdiem;
          perDiemCost = unadjustedPerDiemCost;

          if (currentTravelRequest.trips[i].isBreakfastIncluded){
              perDiemCost = perDiemCost - (0.2 * unadjustedPerDiemCost);
          }

          if (currentTravelRequest.trips[i].isLunchIncluded){
              perDiemCost = perDiemCost - (0.3 * unadjustedPerDiemCost);
          }

          if (currentTravelRequest.trips[i].isDinnerIncluded){
              perDiemCost = perDiemCost - (0.4 * unadjustedPerDiemCost);
          }

          if (currentTravelRequest.trips[i].isIncidentalsIncluded){
              perDiemCost = perDiemCost - (0.1 * unadjustedPerDiemCost);
          }
      }

      let hotelRate = 0;
      // let hotel = Hotels.findOne({_id: currentTravelRequest.trips[i].hotelId});
      if (userStaffCategory){
          hotelRate = userStaffCategory.hotelDailyRate;
      }

      totalHotelCost = ((totalDuration - 0.5) * hotelRate) + totalHotelCost;
      totalHotelRate = hotelRate + totalHotelRate;
      totalPerDiem = (totalDuration * perDiemCost) + totalPerDiem;
      totalPerDiemCost = perDiemCost + totalPerDiemCost;
    
      // currentTravelRequest.trips[i].totalHotelCost = (totalDuration - 0.5) * hotelRate;

      // currentTravelRequest.trips[i].totalPerDiem = totalDuration * perDiemCost;
      currentTravelRequest.trips[i].totalDuration = totalDuration;
      currentTravelRequest.trips[i].originCityCurrreny = originCityCurrreny;
      currentTravelRequest.trips[i].destinationCityCurrreny = destinationCityCurrreny
      // currentTravelRequest.trips[i].perDiemCost = perDiemCost;
      // currentTravelRequest.trips[i].hotelRate = hotelRate;

      if (currentTravelRequest.trips[i].transportationMode !== "AIR"){
          currentTravelRequest.trips[i].provideAirportPickup = false;
          // currentTravelRequest.trips[i].originCityAirportTaxiCost = 0;
          originCityAirportTaxiCost = 0;
      }

      if (currentTravelRequest.trips[i].provideAirportPickup){
          if (userStaffCategory){
              originCityAirportTaxiCost = userStaffCategory.airportPickupDropOffCost;
          }
          // else{
          //     originCityAirportTaxiCost = 0;
          // }

          if (userStaffCategory){
              destinationCityAirportTaxiCost = userStaffCategory.airportPickupDropOffCost;
          }
          // else{
          //     destinationCityAirportTaxiCost = 0;
          // }

      }else{
          originCityAirportTaxiCost = 0;
      }

      if (currentTravelRequest.trips[i].provideGroundTransport){
          if (userStaffCategory){
            groundTransportCost = userStaffCategory.groundTransport;
          }
          // else{
          //     groundTransportCost = 0;
          // }
      }
      // else{
      //     groundTransportCost = 0;
      // }

    }


    currentTravelRequest.trips[i].perDiemCost = totalPerDiemCost;
    currentTravelRequest.trips[i].hotelRate = totalHotelRate;
    currentTravelRequest.trips[i].totalHotelCost = totalHotelCost
    currentTravelRequest.trips[i].totalPerDiem = totalPerDiem;
    currentTravelRequest.trips[i].originCityAirportTaxiCost = originCityAirportTaxiCost;
    currentTravelRequest.trips[i].destinationCityAirportTaxiCost = destinationCityAirportTaxiCost;
    currentTravelRequest.trips[i].groundTransportCost = groundTransportCost;

    totalTripDuration = totalTripDuration + currentTravelRequest.trips[i].totalDuration;

    if (currentTravelRequest.trips[i].destinationCityCurrreny  === "NGN"){
      totalEmployeePerdiemNGN = totalEmployeePerdiemNGN + currentTravelRequest.trips[i].totalPerDiem;
    } else {
      totalEmployeePerdiemUSD = totalEmployeePerdiemUSD + currentTravelRequest.trips[i].totalPerDiem;
    }

    if (fromTravelCity && (fromTravelCity.currency   === "NGN")){
        totalAirportTaxiCostNGN = totalAirportTaxiCostNGN + currentTravelRequest.trips[i].originCityAirportTaxiCost;
    }else{
        totalAirportTaxiCostUSD = totalAirportTaxiCostUSD + currentTravelRequest.trips[i].originCityAirportTaxiCost;
    }

    if (toTravelCity && (toTravelCity.currency   === "NGN")){
        totalAirportTaxiCostNGN = totalAirportTaxiCostNGN + currentTravelRequest.trips[i].destinationCityAirportTaxiCost;
    }else{
        totalAirportTaxiCostUSD = totalAirportTaxiCostUSD + currentTravelRequest.trips[i].destinationCityAirportTaxiCost;
    }

    if (currentTravelRequest.trips[i].destinationCityCurrreny === "NGN"){
        totalGroundTransportCostNGN = totalGroundTransportCostNGN + ((totalDuration - 0.5) * currentTravelRequest.trips[i].groundTransportCost);
        totalHotelCostNGN = totalHotelCostNGN + currentTravelRequest.trips[i].totalHotelCost;
    }else{
        totalGroundTransportCostUSD = totalGroundTransportCostUSD + ((totalDuration - 0.5) * currentTravelRequest.trips[i].groundTransportCost);
        totalHotelCostUSD = totalHotelCostUSD + currentTravelRequest.trips[i].totalHotelCost;
    }

  }

  totalTripCostNGN = totalEmployeePerdiemNGN + totalAirportTaxiCostNGN + totalGroundTransportCostNGN + totalHotelCostNGN;
  totalTripCostUSD = totalEmployeePerdiemUSD + totalAirportTaxiCostUSD + totalGroundTransportCostUSD + totalHotelCostUSD;


  currentTravelRequest.totalTripDuration = totalTripDuration;
  currentTravelRequest.totalEmployeePerdiemNGN = totalEmployeePerdiemNGN;
  currentTravelRequest.totalEmployeePerdiemUSD = totalEmployeePerdiemUSD;
  currentTravelRequest.totalAirportTaxiCostNGN = totalAirportTaxiCostNGN;
  currentTravelRequest.totalAirportTaxiCostUSD = totalAirportTaxiCostUSD;
  currentTravelRequest.totalGroundTransportCostNGN = totalGroundTransportCostNGN;
  currentTravelRequest.totalGroundTransportCostUSD = totalGroundTransportCostUSD;
  currentTravelRequest.totalAncilliaryCostNGN = totalEmployeePerdiemNGN + totalAirportTaxiCostNGN + totalGroundTransportCostNGN + totalMiscCostNGN;
  currentTravelRequest.totalAncilliaryCostUSD = totalEmployeePerdiemUSD + totalAirportTaxiCostUSD + totalGroundTransportCostUSD + totalMiscCostUSD;
  currentTravelRequest.totalHotelCostNGN = totalHotelCostNGN;
  currentTravelRequest.totalHotelCostUSD = totalHotelCostUSD;
  currentTravelRequest.totalTripCostNGN = totalTripCostNGN;
  currentTravelRequest.totalTripCostUSD = totalTripCostUSD;

  self.currentTravelRequest.set(currentTravelRequest);
}
