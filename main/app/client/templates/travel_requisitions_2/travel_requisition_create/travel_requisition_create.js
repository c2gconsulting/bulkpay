/*****************************************************************************/
/* TravelRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

const getSelectedItem = (items) => {
  let options = typeof items !== 'string' ? items : Core.returnSelection($(`[name="${items}"]`));
  const individuals = [];
  const users = Meteor.users.find({employee: true});
  _.each(options, function(option){
    let user = Meteor.users.findOne({ _id: option })
    // let user = _.find(users, function(user) {return user._id === option})

    const { emails, profile, _id, staffCategory } = user;
    const userId = _id || option;
    const email = emails[0] && emails[0].address;
    if (user){
      individuals.push({ ...profile, id: userId, email, staffCategory });
    }
  });

  return individuals
}

const updateIndvidualsGoingOnTrip = (currentTravelRequest) => {
    if (currentTravelRequest.tripCategory !== 'INDIVIDUAL' && currentTravelRequest.tpcTrip !== 'Client') {
        currentTravelRequest.tripFor = {
          noOfIndividuals: $(`[id="noOfIndividuals"]`).val() || 1,
          individuals: getSelectedItem('individuals')
        }
    }

    return currentTravelRequest
}

Template.TravelRequisition2Create.events({
    'change [name="individuals"]': _.throttle(function(e, tmpl) {
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest = updateIndvidualsGoingOnTrip(currentTravelRequest);
        let errorMessage = "";
        currentTravelRequest.tripFor.individuals.map(individual => {
            if (individual && !individual.staffCategory) errorMessage += `${errorMessage ? ', ' : ''} ${individual.firstname}`;
        })

        if (errorMessage) errorMessage = "Oops! No staff category(s) for " + errorMessage
        // const individuals = $(e.currentTarget).val();
        tmpl.currentTravelRequest.set(currentTravelRequest);
        tmpl.staffCategoryErrorMessage.set(errorMessage);
        tmpl.updateTripNumbers();
   }, 200),
    "change [name='destinationType']": _.throttle(function(e, tmpl) {
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const destinationType = $(e.currentTarget).val();
        currentTravelRequest.destinationType = destinationType;

        tmpl.currentTravelRequest.set(currentTravelRequest);
        tmpl.updateTripNumbers();

   }, 200),
   "change [name='noOfClients']": function (e, tmpl) {
    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const numberOfClients = parseInt($(e.currentTarget).val());
    const { tripFor } = currentTravelRequest;
    /************* Determine previous number of individuals  ******************/
    const prevNoOfClients = tripFor.individuals.length;
    /************* Filter labels and approval levels  ******************/
    if (prevNoOfClients > numberOfClients) {
      for (let i = 0; i < prevNoOfClients; i++) {
        const currentNoOfClients = i + 1;
        if (currentNoOfClients > numberOfClients) {
          tripFor.individuals.splice(i, 1);
        }
      }
    } else {
      for (let i = prevNoOfClients; i < numberOfClients; i++) {
        // const currentNoOfClients = prevNoOfClients + 1;
        tripFor.individuals.push({});
      }
    }

    tmpl.currentTravelRequest.set({
      ...currentTravelRequest,
      tripFor: {
        ...tripFor,
        noOfIndividuals: numberOfClients
      }
    })
  },
  "click [id='selectEmergencyTrip']": function(e, tmpl){
      e.preventDefault()
      let currentTravelRequest = tmpl.currentTravelRequest.curValue;
      const isEmergencyTrip = !currentTravelRequest.isEmergencyTrip;
      const minDate = isEmergencyTrip ? new Date() : new Date(moment().add(5, 'day').format())
      const trips = currentTravelRequest.trips.map(trip => ({
        ...trip,
        departureDate: minDate,
        returnDate: minDate,
      }))

      currentTravelRequest.trips = trips;
      currentTravelRequest.isEmergencyTrip = isEmergencyTrip;
      tmpl.currentTravelRequest.set(currentTravelRequest);
  },
   "change [name*='clientName']": _.throttle(function(e, tmpl) {
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const fullName = $(e.currentTarget).val();
        const [firstName, lastName] = fullName.split(' ');
        const currentTripFor = currentTravelRequest.tripFor && currentTravelRequest.tripFor.individuals;

        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1));

        const individual = {
          ...(currentTripFor && currentTripFor[index]),
          fullName: fullName,
          firstname: firstName,
          lastname: lastName,
        }

        delete individual._id;
        const { tripFor } = currentTravelRequest;
        tripFor.individuals[index] = individual

        currentTravelRequest.tripFor = tripFor
        tmpl.currentTravelRequest.set(currentTravelRequest);

   }, 200),

   "change [name*='clientEmail']": _.throttle(function(e, tmpl) {
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const clientEmail = $(e.currentTarget).val();
        const currentTripFor = currentTravelRequest.tripFor && currentTravelRequest.tripFor.individuals;

        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1));

        const individual = {
          ...(currentTripFor && currentTripFor[index]),
          email: clientEmail,
        }

        delete individual._id;
        const { tripFor } = currentTravelRequest;
        tripFor.individuals[index] = individual

        currentTravelRequest.tripFor = tripFor
        tmpl.currentTravelRequest.set(currentTravelRequest);

   }, 200),

    "change [name='travelType']":_.throttle(function(e, tmpl) {
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const travelType = $(e.currentTarget).val();
        currentTravelRequest.description = $("#description").val();
        currentTravelRequest.budgetCodeId = $("#budget-code").val();
        currentTravelRequest.departmentOrProjectId = $("#departmentOrProjectId").val();
        currentTravelRequest.type = travelType;
        currentTravelRequest.totalTripDuration = 0;
        currentTravelRequest.totalEmployeePerdiemNGN = 0;
        currentTravelRequest.totalEmployeePerdiemUSD = 0;
        currentTravelRequest.totalFlightCostNGN = 0;
        currentTravelRequest.totalFlightCostUSD = 0;
        currentTravelRequest.totalHotelCostNGN = 0;
        currentTravelRequest.totalHotelCostUSD = 0;
        currentTravelRequest.totalTripCostNGN = 0;
        currentTravelRequest.totalTripCostUSD = 0;

        const { isEmergencyTrip } = currentTravelRequest;
        const minDate = isEmergencyTrip ? new Date() : new Date(moment().add(5, 'day').format())

        if (travelType && (currentTravelRequest.trips)) {
            if ((travelType === "Return") && (currentTravelRequest.trips.length > 0)) {
                currentTravelRequest.trips = [Core.tripDetails(1, minDate)];
            } else if (($(e.currentTarget).val() === "Multiple") && (currentTravelRequest.trips.length > 0)){
                currentTravelRequest.trips = [Core.tripDetails(1, minDate), Core.tripDetails(2, minDate)]
            } else if (($(e.currentTarget).val() === "Single") && (currentTravelRequest.trips.length > 0)){
                currentTravelRequest.trips = [Core.tripDetails(1, minDate)]
            }
        }

    tmpl.currentTravelRequest.set(currentTravelRequest);

    }, 200),

"change [name='cashAdvanceNotRequired']":_.throttle(function(e, tmpl) {
    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.cashAdvanceNotRequired = !currentTravelRequest.cashAdvanceNotRequired;
    tmpl.currentTravelRequest.set(currentTravelRequest);
},200),
'change [id=additionalSecurityComment]': function(e, tmpl) {
  e.preventDefault()

  let currentTravelRequest = tmpl.currentTravelRequest.curValue;

  currentTravelRequest.additionalSecurityComment = $("#additionalSecurityComment").val();
  tmpl.currentTravelRequest.set(currentTravelRequest);

},
'change [id=additionalComment]': function(e, tmpl) {
  e.preventDefault()

  let currentTravelRequest = tmpl.currentTravelRequest.curValue;

  currentTravelRequest.additionalComment = $("#additionalComment").val();
  tmpl.currentTravelRequest.set(currentTravelRequest);

},
'change [id=ineedHotel]': function(e, tmpl) {
  e.preventDefault()

  let ineedHotel = tmpl.ineedHotel.curValue;

  ineedHotel = !ineedHotel;
  tmpl.ineedHotel.set(ineedHotel);

},
'click [id=description]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    currentTravelRequest.description = $("#description").val();
    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},
'change [id=budget-code]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.budgetCodeId = $("#budget-code").val();
    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},
'change [id=departmentOrProjectId]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    let { departmentOrProjectId } = currentTravelRequest;
    departmentOrProjectId = $("#departmentOrProjectId").val() || departmentOrProjectId;

    currentTravelRequest.departmentOrProjectId = departmentOrProjectId;
    currentTravelRequest.activityId = "";
    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();

    Core.updateTravelActivities(departmentOrProjectId, tmpl.activities)
},
'change [id=project_activity-code]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    let { activityId } = currentTravelRequest;
    activityId = $("#project_activity-code").val() || activityId;

    currentTravelRequest.activityId = activityId;
    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},
'change [id=costCenter]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.costCenter = $("#costCenter").val();
    tmpl.currentTravelRequest.set(currentTravelRequest);
},
'change [id=tpcTrip]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.tpcTrip = $("#tpcTrip").val();
    
    currentTravelRequest.tripFor = {
        noOfIndividuals: 1,
        individuals: [{}]
    }
    tmpl.currentTravelRequest.set(currentTravelRequest);
},
'click [id=add-additional_stop]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    const { isEmergencyTrip } = currentTravelRequest;
    const minDate = isEmergencyTrip ? new Date() : new Date(moment().add(5, 'day').format())

    const fromId = currentTravelRequest.trips[currentTravelRequest.trips.length - 1].toId;
    const tripIndex = currentTravelRequest.trips.length + 1;

    currentTravelRequest.trips.push(Core.tripDetails(tripIndex, minDate, fromId));

    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();

},
'click [id*=hotelNotRequired]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = parseInt($(e.currentTarget).val()) - 1;
    currentTravelRequest.trips[index].hotelNotRequired = !currentTravelRequest.trips[index].hotelNotRequired;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();

},
"change [id*='fromId']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].fromId = $(e.currentTarget).val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='toId']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].toId = $(e.currentTarget).val();
    //currentTravelRequest.trips[index].airlineId = "";
    //currentTravelRequest.trips[index].airfareCost = 0;
    //currentTravelRequest.trips[index].hotelId = "";
    //currentTravelRequest.trips[index].hotelRate = 0;

    if ((index + 1) < currentTravelRequest.trips.length){
        currentTravelRequest.trips[index + 1].fromId = $(e.currentTarget).val();
    }

    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='transportationMode']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].transportationMode = $(e.currentTarget).val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='airlineId']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].airlineId = $(e.currentTarget).val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='carOption']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].carOption = $(e.currentTarget).val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='hotelId']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].hotelId = $(e.currentTarget).val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='departureTime']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].departureTime = $(e.currentTarget).val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='returnTime']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].returnTime = $(e.currentTarget).val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"click [id*='provideAirportPickup']": function(e, tmpl){

    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].provideAirportPickup = !currentTravelRequest.trips[index].provideAirportPickup;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"click [id*='provideGroundTransport']": function(e, tmpl){

    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].provideGroundTransport = !currentTravelRequest.trips[index].provideGroundTransport;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"click [id*='provideSecurity']": function(e, tmpl){

    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].provideSecurity = !currentTravelRequest.trips[index].provideSecurity;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isBreakfastIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].isBreakfastIncluded = !currentTravelRequest.trips[index].isBreakfastIncluded;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isLunchIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].isLunchIncluded = !currentTravelRequest.trips[index].isLunchIncluded;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isDinnerIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].isDinnerIncluded = !currentTravelRequest.trips[index].isDinnerIncluded;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isIncidentalsIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTravelRequest.trips[index].isIncidentalsIncluded = !currentTravelRequest.trips[index].isIncidentalsIncluded;
    tmpl.currentTravelRequest.set(currentTravelRequest);

    tmpl.updateTripNumbers();
},
"change [id*='departureDate']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;


    for (i = 0; i < currentTravelRequest.trips.length; i++) {
        let rawDepartureDate = new Date($("#departureDate_" + (i+1)).val());
        let utcDepartureDate = Core.getUTCDate(rawDepartureDate);
        console.log(rawDepartureDate);
        console.log(utcDepartureDate);

        let rawReturnDate = new Date($("#returnDate_" + (i+1)).val());
        let utcReturnDate = Core.getUTCDate(rawReturnDate);
        console.log(rawReturnDate);
        console.log(utcReturnDate);

        currentTravelRequest.trips[i].departureDate = utcDepartureDate;
        currentTravelRequest.trips[i].returnDate = utcReturnDate;
    }

    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
    // console.log("departureDate:")
    // console.log(currentTravelRequest.trips[0].departureDate);
    // console.log("returnDate:")
    // console.log(currentTravelRequest.trips[0].returnDate);

},
"change [id*='returnDate']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    for (i = 0; i < currentTravelRequest.trips.length; i++) {
        let rawDepartureDate = new Date($("#departureDate_" + (i+1)).val());
        let utcDepartureDate = Core.getUTCDate(rawDepartureDate);
        // console.log(rawDepartureDate);
        // console.log(utcDepartureDate);

        let rawReturnDate = new Date($("#returnDate_" + (i+1)).val());
        let utcReturnDate = Core.getUTCDate(rawReturnDate);
        // console.log(rawReturnDate);
        // console.log(utcReturnDate);

        currentTravelRequest.trips[i].departureDate = utcDepartureDate;
        currentTravelRequest.trips[i].returnDate = utcReturnDate;
    }

    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},
"dp.change": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    for (i = 0; i < currentTravelRequest.trips.length; i++) {
        let rawDepartureDate = new Date($("#departureDate_" + (i+1)).val());
        let utcDepartureDate = Core.getUTCDate(rawDepartureDate);
        // console.log(rawDepartureDate);
        // console.log(utcDepartureDate);

        let rawReturnDate = new Date($("#returnDate_" + (i+1)).val());
        let utcReturnDate = Core.getUTCDate(rawReturnDate);
        // console.log(rawReturnDate);
        // console.log(utcReturnDate);

        currentTravelRequest.trips[i].departureDate = utcDepartureDate;
        currentTravelRequest.trips[i].returnDate = utcReturnDate;  }

    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},

 'click #new-requisition-create': function(e, tmpl) {
    e.preventDefault()
    const position = Core.getUserHighestPosition(tmpl.isHOD, tmpl.isDirectManager);
    console.log('position', position);
    Template.instance().errorMessage.set(null);
    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    //update description one last final time
    currentTravelRequest.description = $("#description").val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    let fieldsAreValid = true;
    let validationErrors = '';

    /*** VALIDATIONS ***/
    //check that the description is not hello

    if (currentTravelRequest.description ===""){
        fieldsAreValid = false;
        validationErrors += ": description cannot be empty";
    }

    // if( currentTravelRequest.budgetCodeId=="I am not sure")
    // {
    //     fieldsAreValid = false;
    //     validationErrors += ": select a budget code";
    // }

    const { costCenter, departmentOrProjectId } = currentTravelRequest;
    if(departmentOrProjectId == "I am not sure" || !departmentOrProjectId)
    {
        fieldsAreValid = false;
        validationErrors += `: select a ${costCenter} code`;
    }

    if (currentTravelRequest.tripCategory !== 'INDIVIDUAL' && currentTravelRequest.tpcTrip !== 'Client') {
      currentTravelRequest.tripFor = {
        noOfIndividuals: $(`[id="noOfIndividuals"]`).val() || 1,
        individuals: getSelectedItem('individuals')
      }
    }

    if (currentTravelRequest.tripFor && currentTravelRequest.tripFor.individuals) {
      const { individuals } = currentTravelRequest.tripFor;
      console.log('individuals', individuals)
      for (let i = 0; i < individuals.length; i++) {
        if (individuals[i] && (!individuals[i].fullName || !individuals[i].email)) {
          fieldsAreValid = false;
          validationErrors += ": Fill in the individual(s) details going on this trip";
        }
      }
    }

    if (currentTravelRequest.tripCategory !== 'INDIVIDUAL' && (!currentTravelRequest.tripFor || !currentTravelRequest.tripFor.individuals)) {
      fieldsAreValid = false;
      validationErrors += ": select the individual(s) going on this trip";
    }

    if (currentTravelRequest.tripCategory !== 'INDIVIDUAL' && currentTravelRequest.tripFor && (currentTravelRequest.tripFor.individuals.length != currentTravelRequest.tripFor.noOfIndividuals)) {
      fieldsAreValid = false;
      validationErrors += ": Invalid number of individual(s) going on this trip";
    }


    for (i = 0; i < currentTravelRequest.trips.length; i++) {
        const currentTrip = currentTravelRequest.trips[i];

        // if (currentTrip.transportationMode === ""){
        //     fieldsAreValid = false;
        //     validationErrors += ": select transportation mode";
        // }
        //console.log(currentTravelRequest.type);
        if ((currentTravelRequest.type === "Multiple") && ((i + 1) < currentTravelRequest.trips.length)) {
            const startDate = moment(currentTrip.departureDate);
            const endDate = moment(currentTravelRequest.trips[i+1].departureDate)

            if (endDate.diff(startDate, 'days') < 0){
                fieldsAreValid = false;
                validationErrors += ": Return date cannot be earlier than Departure date";
            }
        }else{
            const startDate = moment(currentTrip.departureDate);
            const endDate = moment(currentTrip.returnDate)

            if (endDate.diff(startDate, 'days') < 0){
                fieldsAreValid = false;
                validationErrors += ": Return date cannot be earlier than Departure date";
            }
        }

        if (currentTravelRequest.trips.length ===1){


            if (currentTrip.fromId === ""){
                fieldsAreValid = false;
                validationErrors += ": select your current location";
            }
            if (currentTrip.fromId.selectedIndex == 0){
                fieldsAreValid = false;
                validationErrors += ": select your current location";
            }
            if (currentTrip.toId === ""){
                fieldsAreValid = false;
                validationErrors += ": select your destination location";
            }
            if (currentTrip.hotelId === ""){
                fieldsAreValid = false;
                validationErrors += ": select a hotel";
            }
            //if (currentTrip.transportationMode === "AIR" && currentTrip.airlineId === ""){
            //    fieldsAreValid = false;
            //    validationErrors += ": select an airline";
            //}
        }
    }

    if (fieldsAreValid){
      //explicitely set status
      currentTravelRequest.status = Core.ALL_TRAVEL_STATUS.PENDING;
      currentTravelRequest[`createdBy${position}`] = true;
      Meteor.call('TRIPREQUEST/create', currentTravelRequest, (err, res) => {
        if (res){
          swal({
            title: "Travel requisition created",
            text: "Your travel requisition has been created, a notification has been sent to your supervisor",
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });
        } else {
          swal({
            title: "Oops!",
            text: "Your travel requisition could not be created, reason: " + err.message,
            confirmButtonClass: "btn-danger",
            type: "error",
            confirmButtonText: "OK"
          });
          console.log(err);
        }

      });
      Template.instance().errorMessage.set(null);
      Modal.hide('TravelRequisition2Create');
    } else {
        swal({
            title: "Oops!",
            text: "Validation errors" + validationErrors,
            confirmButtonClass: "btn-danger",
            type: "error",
            confirmButtonText: "OK"
        });
      Template.instance().errorMessage.set("Validation errors" + validationErrors);
    }
  },

'click #new-requisition-save-draft': function(e, tmpl) {
    e.preventDefault()
    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    //update description one last final time
    currentTravelRequest.description = $("#description").val();
    tmpl.currentTravelRequest.set(currentTravelRequest);

    let fieldsAreValid = true;
    let validationErrors = '';

    /*** VALIDATIONS ***/
    //check that the description is not hello

    if (currentTravelRequest.description ===""){
        fieldsAreValid = false;
        validationErrors += ": description cannot be empty";
    }

    if( currentTravelRequest.budgetCodeId=="I am not sure")
    {
        fieldsAreValid = false;
        validationErrors += ": select a budget code";
    }
    for (i = 0; i < currentTravelRequest.trips.length; i++) {
        const currentTrip = currentTravelRequest.trips[i];

        // if (currentTrip.transportationMode === ""){
        //     fieldsAreValid = false;
        //     validationErrors += ": select transportation mode";
        // }
        //console.log(currentTravelRequest.type);
        if ((currentTravelRequest.type === "Multiple") && ((i + 1) < currentTravelRequest.trips.length)) {
            const startDate = moment(currentTrip.departureDate);
            const endDate = moment(currentTravelRequest.trips[i+1].departureDate)

            if (endDate.diff(startDate, 'days') < 0){
                fieldsAreValid = false;
                validationErrors += ": Return date cannot be earlier than Departure date";
            }
        }else{
            const startDate = moment(currentTrip.departureDate);
            const endDate = moment(currentTrip.returnDate)

            if (endDate.diff(startDate, 'days') < 0){
                fieldsAreValid = false;
                validationErrors += ": Return date cannot be earlier than Departure date";
            }
        }

        if (currentTravelRequest.trips.length ===1){


            if (currentTrip.fromId === ""){
                fieldsAreValid = false;
                validationErrors += ": select your current location";
            }
            if (currentTrip.fromId.selectedIndex == 0){
                fieldsAreValid = false;
                validationErrors += ": select your current location";
            }
            if (currentTrip.toId === ""){
                fieldsAreValid = false;
                validationErrors += ": select your destination location";
            }
            if (currentTrip.hotelId === ""){
                fieldsAreValid = false;
                validationErrors += ": select a hotel";
            }
            //if (currentTrip.transportationMode === "AIR" && currentTrip.airlineId === ""){
            //    fieldsAreValid = false;
            //    validationErrors += ": select an airline";
            //}
        }
    }


    if (fieldsAreValid){
        //explicitely set status
        currentTravelRequest.status = "Draft";


        Meteor.call('TravelRequest2/createDraft', currentTravelRequest, (err, res) => {
            if (res){
                swal({
                    title: "Travel requisition created",
                    text: "Your travel requisition has been saved as draft",
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                swal({
                    title: "Oops!",
                    text: "Your travel requisition could not be created, reason: " + err.message,
                    confirmButtonClass: "btn-danger",
                    type: "error",
                    confirmButtonText: "OK"
                });
                console.log(err);
            }

        });
        Template.instance().errorMessage.set(null);
        Modal.hide('TravelRequisition2Create');
    }else{
        swal({
            title: "Oops!",
            text: "Validation errors" + validationErrors,
            confirmButtonClass: "btn-danger",
            type: "error",
            confirmButtonText: "OK"
        });
        Template.instance().errorMessage.set("Validation errors" + validationErrors);
    }

}
});





/*****************************************************************************/
/* TravelRequisitionCreate: Helpers */
/*****************************************************************************/
Template.TravelRequisition2Create.helpers({
	activeIfRouteIsIn: function (route) {
      var currentRoute = Router.current();
      // currentRoute.url - http://localhost:3000/business/FJe5hXSxCHvR2FBjJ/employee/grouptravelrequisition2index
      // currentRoute.route.getName() - travelrequest2.grouptravelrequisition2index
      const GROUP_TRIP = 'grouptravelrequisition2index';
      const INDIVIDUAL_TRIP = 'individualtravelrequisition2index';
      const TPC_TRIP = 'tpctravelrequisition2index';
      const RouteName = currentRoute.route.getName().replace('travelrequest2.', '')
      const isCurrentRoute = RouteName.includes(route);
      if(RouteName === INDIVIDUAL_TRIP && isCurrentRoute) return 'INDIVIDUAL';
      if(RouteName === GROUP_TRIP && isCurrentRoute) return 'GROUP';
      if(RouteName === TPC_TRIP && isCurrentRoute) return 'TPC';
      return false;
    },
    'employees': () => {
      return Meteor.users.find({employee: true});
    },
    ACTIVITY: () => 'activityId',
    COSTCENTER: () => 'costCenter',
    PROJECT_AND_DEPARTMENT: () => 'departmentOrProjectId',
    costCenters: () => Core.Travel.costCenters,
    carOptions: () => Core.Travel.carOptions,
    currentDepartment: () => Template.instance().currentDepartment.get(),
    staffCategoryErrorMessage: () => Template.instance().staffCategoryErrorMessage.get(),
    ineedHotel: () => Template.instance().ineedHotel.get(),
    currentProject: () =>Template.instance().currentProject.get(),
    currentActivity: () => Template.instance().currentActivity.get(),
    departmentList: () => Template.instance().departments.get(),
    projectList: () => Template.instance().projects.get(),
    projectActivities: () => Template.instance().activities.get(),
    //     const currentTravelRequest = Template.instance().currentTravelRequest.get();
    //     const { departmentOrProjectId } = currentTravelRequest;
    //     const activities = Activities.find({ type: 'project', unitOrProjectId: departmentOrProjectId }).fetch();
    //     return activities;
    // },
    isEmergencyTrip () {
        // let index = this.tripIndex - 1;
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        const minDate = new Date(moment(new Date()).add(5, 'day').format());
        const isEmergencyTrip = currentTravelRequest.isEmergencyTrip;

        return isEmergencyTrip ? new Date() : minDate;
    },
    costCenterType: function (item) {
      const currentTravelRequest = Template.instance().currentTravelRequest.get();
      if (currentTravelRequest && currentTravelRequest.costCenter === item) return item
      return false
    },
    selected(context,val) {
        let self = this;
        const { currentTravelRequest } = Template.instance();

        if(currentTravelRequest){
            //get value of the option element
            //check and return selected if the template instce of data.context == self._id matches
            if(val){
                return currentTravelRequest[context] === val ? selected="selected" : '';
            }
            return currentTravelRequest[context] === self._id ? selected="selected" : '';
        }
    },
    checkbox(isChecked){
        console.log('isChecked', isChecked)
        return isChecked ? checked="checked" : checked="";
    },
    'errorMessage': function() {
        return Template.instance().errorMessage.get()
    },
    'checked': (prop) => {
        if(Template.instance().data)
        return Template.instance().data[prop];
        return false;
    },
    travelcityList() {
        let sortBy = "name";
        let sortDirection = 1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;

        return  Travelcities.find({},options);
    },
    tpcTripType(type){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(!currentTravelRequest || !type) return false
        if (currentTravelRequest.tpcTrip === type) return type
        return false
    },
    budgetList() {
        return  Budgets.find();
    },
    airlineList(fromId, toId) {
        let isInternational = false;
        let fromTravelCity = Travelcities.findOne({_id: fromId});
        if (fromTravelCity){
            isInternational = isInternational || fromTravelCity.isInternational;
        }
        let toTravelCity = Travelcities.findOne({_id: toId});
        if (toTravelCity){
            isInternational = isInternational || toTravelCity.isInternational;
        }


        let sortBy = "name";
        let sortDirection = 1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;

        return Airlines.find({isInternational: isInternational}, options);
    },
    getAirlineName(airlineId) {
        const airline = Airlines.findOne({_id: airlineId})
        if(airline) {
            return airline.name
        }
    },
    hotelList(toId) {
        return Hotels.find({travelcityId: toId});
    },
    budgetCodeSelected(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && val){
            if(currentTravelRequest.budgetCodeId === val){
                $('#budget-code').dropdown('set selected', currentTravelRequest.budgetCodeId);
            }

            //return currentTravelRequest.budgetCodeId === val ? selected="selected" : '';

        }

    },
    formatDate(dateVal){
        return moment(dateVal).format('YYYY-MM-DD');
    },
    formatDate2(dateVal){
        return moment(dateVal).format('DD MMM YYYY');
    },
    isLastLeg(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index && currentTravelRequest.type ==="Multiple"){
            // return parseInt(index) >= currentTravelRequest.trips.length;
            return parseInt(index) >= currentTravelRequest.trips.length + 1;
        }
    },
    fromIdSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){

            if(currentTravelRequest.trips[parseInt(index) - 1].fromId === val){
                $('#fromId_' + index).dropdown('set selected', currentTravelRequest.trips[parseInt(index) - 1].fromId);
            }
            //return currentTravelRequest.trips[parseInt(index) - 1].fromId === val ? selected="selected" : '';
        }

    },
    toIdSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            if(currentTravelRequest.trips[parseInt(index) - 1].toId === val){
                $('#toId_' + index).dropdown('set selected', currentTravelRequest.trips[parseInt(index) - 1].toId);
            }
            //return currentTravelRequest.trips[parseInt(index) - 1].toId === val ? selected="selected" : '';
        }
    },
    transportModeSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            if(currentTravelRequest.trips[parseInt(index) - 1].transportationMode === val){
                $('#transportationMode_' + index).dropdown('set selected', currentTravelRequest.trips[parseInt(index) - 1].transportationMode);
            }
            //return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === val ? selected="selected" : '';
        }
    },
    departureTimeSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            return currentTravelRequest.trips[parseInt(index) - 1].departureTime === val ? selected="selected" : '';
        }
    },
    returnTimeSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            return currentTravelRequest.trips[parseInt(index) - 1].returnTime === val ? selected="selected" : '';
        }
    },
    carOptionSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            if(currentTravelRequest.trips[parseInt(index) - 1].carOption === val){
                $('#carOption_' + index).dropdown('set selected', currentTravelRequest.trips[parseInt(index) - 1].carOption);
            }
            //return currentTravelRequest.trips[parseInt(index) - 1].carOption === val ? selected="selected" : '';
        }
    },
    airlineSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        //console.log(currentTravelRequest);
        if(currentTravelRequest && val && index){
            if(currentTravelRequest.trips[parseInt(index) - 1].airlineId === val){
                $('#airlineId_' + index).dropdown('set selected', currentTravelRequest.trips[parseInt(index) - 1].airlineId);
            }
            //return currentTravelRequest.trips[parseInt(index) - 1].airlineId === val ? selected="selected" : '';
        }
    },
    hotelSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            if(currentTravelRequest.trips[parseInt(index) - 1].hotelId === val){
               $('#hotelId_' + index).dropdown('set selected', currentTravelRequest.trips[parseInt(index) - 1].hotelId);
            }
            //return currentTravelRequest.trips[parseInt(index) - 1].hotelId === val ? selected="selected" : '';
        }
    },
    cashAdvanceNotRequiredChecked(){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest){
            return currentTravelRequest.cashAdvanceNotRequired? checked="checked" : '';
        }
    },
    currentTravelRequest(){
        return Template.instance().currentTravelRequest.get();
    },
    travelTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.type === val ? checked="checked" : '';
        }
    },
    destinationTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.destinationType === val ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentTravelRequest.get().type === "Return";
    },
    isMultipleTrip(){
        return Template.instance().currentTravelRequest.get().type === "Multiple";
    },
    isCarModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "LAND"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "AIR"? '':'none';
        }
    },
    isBreakfastIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    ineedHotelChecked(){
        const ineedHotel = Template.instance().ineedHotel.get();
        if(ineedHotel && index){
            return ineedHotel? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
        }
    },

    'getCurrentUserUnitName': function() {
        let unitId = Template.instance().unitId.get()
        if(unitId) {
            let unit = EntityObjects.findOne({_id: unitId});
            if(unit) {
                return unit.name
            }
        }
    },




});

/*****************************************************************************/
/* TravelRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2Create.onCreated(function () {

    let self = this;



    self.errorMessage = new ReactiveVar();
    self.staffCategoryErrorMessage = new ReactiveVar();
    self.ineedHotel = new ReactiveVar(false);
    self.errorMessage.set(null);
    self.hasEmergencyDateUpdate = new ReactiveVar();
    self.hasEmergencyDateUpdate.set(true);
    self.currentUser = new ReactiveVar();
    self.isHOD = new ReactiveVar();
    self.isDirectManager = new ReactiveVar();
    self.isGceo = new ReactiveVar();
    self.isGcoo = new ReactiveVar();
    const currentUser = Meteor.user();
    self.currentUser.set(currentUser || {});

    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("flightroutes", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));
    self.subscribe("costcenters", Session.get('context'));
    self.subscribe("projects", Session.get('context'));
    self.subscribe("staffcategories", Session.get('context'));

    Core.queryClient('account/isHod', Meteor.userId(), self.isHOD)
    Core.queryClient('account/isManager', Meteor.userId(), self.isDirectManager)
    Core.queryClient('account/gcoo', Meteor.userId(), self.isGcoo)
    Core.queryClient('account/gceo', Meteor.userId(), self.isGceo)


    let currentTravelRequest = Core.currentTravelRequest(businessUnitId);

    self.currentTravelRequest =  new ReactiveVar();
    self.currentTravelRequest.set(currentTravelRequest);

    self.updateTripNumbers = () => Core.tripAnalysis(self);
    // self.subscribe("flights", Session.get('context'));
    self.unitId = new ReactiveVar()
    self.units = new ReactiveVar([])
    self.businessUnitCustomConfig = new ReactiveVar()

    let unitsSubscription = self.subscribe('getCostElement', businessUnitId)
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    //--
    self.selectedTravelType = new ReactiveVar()
    self.selectedCurrency = new ReactiveVar()
    self.selectedNumDays = new ReactiveVar()
    self.selectedCostCenter = new ReactiveVar()
    self.selectedstateId = new ReactiveVar()
    self.selectedtravelcityId = new ReactiveVar()
    self.selectedflightrouteId = new ReactiveVar()
    self.currentDepartment = new ReactiveVar()
    self.currentProject = new ReactiveVar()
    self.currentActivity = new ReactiveVar()
    self.projects = new ReactiveVar()
    const projects = Projects.find({ businessId: Session.get('context') });
    self.projects.set(projects);
    self.departments = new ReactiveVar()
    const departments = CostCenters.find({ businessId: Session.get('context') });
    self.departments.set(departments);
    self.activities = new ReactiveVar();


    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    let invokeReason = self.data;

    self.autorun(function(){
        Core.autorun(invokeReason, self)
    })


});

Template.TravelRequisition2Create.onRendered(function () {


    /*this.$('.datetimepicker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: new Date()
})*/

});

Template.TravelRequisition2Create.onDestroyed(function () {
});
