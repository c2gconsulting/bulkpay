/*****************************************************************************/
/* LocalErrandTransportRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.LocalErrandTransportRequisitionCreate.events({

    "change [name='travelType']":_.throttle(function(e, tmpl) {
        let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
        const travelType = $(e.currentTarget).val();
        currentLocalErrandTransportRequest.description = $("#description").val();
        currentLocalErrandTransportRequest.budgetCodeId = $("#budget-code").val();
        currentLocalErrandTransportRequest.type = travelType;
        currentLocalErrandTransportRequest.totalTripDuration = 0;
        currentLocalErrandTransportRequest.totalEmployeePerdiemNGN = 0;
        currentLocalErrandTransportRequest.totalEmployeePerdiemUSD = 0;
        currentLocalErrandTransportRequest.totalFlightCostNGN = 0;
        currentLocalErrandTransportRequest.totalFlightCostUSD = 0;
        currentLocalErrandTransportRequest.totalHotelCostNGN = 0;
        currentLocalErrandTransportRequest.totalHotelCostUSD = 0;
        currentLocalErrandTransportRequest.totalTripCostNGN = 0;
        currentLocalErrandTransportRequest.totalTripCostUSD = 0;

        if (travelType && (currentLocalErrandTransportRequest.trips)) {
            if ((travelType === "Return") && (currentLocalErrandTransportRequest.trips.length > 0)) {
                currentLocalErrandTransportRequest.trips = [{
                    tripIndex: 1,
                    fromId: "",
                    toId: "",
                    departureDate: new Date(),
                    returnDate: new Date(),
                    departureTime: "6 AM",
                    returnTime: "6 AM",
                    transportationMode: 'AIRLINE',
                    carOption: 'CAR_HIRE',
                    provideAirportPickup: false,
                    provideGroundTransport: false,
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
                }];
            }else if (($(e.currentTarget).val() === "Multiple") && (currentLocalErrandTransportRequest.trips.length > 0)){
                currentLocalErrandTransportRequest.trips = [{
                    tripIndex: 1,
                    fromId: "",
                    toId: "",
                    departureDate: new Date(),
                    returnDate: new Date(),
                    departureTime: "6 AM",
                    returnTime: "6 AM",
                    transportationMode: 'AIRLINE',
                    carOption: 'CAR_HIRE',
                    provideAirportPickup: false,
                    provideGroundTransport: false,
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
                },{
                    tripIndex: 2,
                    fromId: "",
                    toId: "",
                    departureDate: new Date(),
                    returnDate: new Date(),
                    departureTime: "6 AM",
                    returnTime: "6 AM",
                    transportationMode: 'AIRLINE',
                    carOption: 'CAR_HIRE',
                    provideAirportPickup: false,
                    provideGroundTransport: false,
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
                },{
                    tripIndex: 3,
                    fromId: "",
                    toId: "",
                    departureDate: new Date(),
                    returnDate: new Date(),
                    departureTime: "6 AM",
                    returnTime: "6 AM",
                    transportationMode: 'AIRLINE',
                    carOption: 'CAR_HIRE',
                    provideAirportPickup: false,
                    provideGroundTransport: false,
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
                }
            ]
        }
    }

    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

}, 200),

"change [name='cashAdvanceNotRequired']":_.throttle(function(e, tmpl) {
    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    currentLocalErrandTransportRequest.cashAdvanceNotRequired = !currentLocalErrandTransportRequest.cashAdvanceNotRequired;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
},200),
'click [id=description]': function(e, tmpl) {
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

    currentLocalErrandTransportRequest.description = $("#description").val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
   console.log("description")
   console.log(description)

},
'change [id=budget-code]': function(e, tmpl) {
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    currentLocalErrandTransportRequest.budgetCodeId = $("#budget-code").val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
},
'click [id=add-additional_stop]': function(e, tmpl) {
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

    currentLocalErrandTransportRequest.trips.push({
        tripIndex: currentLocalErrandTransportRequest.trips.length + 1,
        fromId: currentLocalErrandTransportRequest.trips[currentLocalErrandTransportRequest.trips.length - 1].toId,
        toId: "",
        departureDate: new Date(),
        returnDate: new Date(),
        departureTime: "6 AM",
        returnTime: "6 AM",
        transportationMode: 'AIRLINE',
        carOption: 'CAR_HIRE',
        provideAirportPickup: false,
        provideGroundTransport: false,
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
    });

    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();

},
'click [id*=hotelNotRequired]': function(e, tmpl) {
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = parseInt($(e.currentTarget).val()) - 1;
    currentLocalErrandTransportRequest.trips[index].hotelNotRequired = !currentLocalErrandTransportRequest.trips[index].hotelNotRequired;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();

},
"change [id*='fromId']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].fromId = $(e.currentTarget).val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='toId']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].toId = $(e.currentTarget).val();
    //currentLocalErrandTransportRequest.trips[index].airlineId = "";
    //currentLocalErrandTransportRequest.trips[index].airfareCost = 0;
    //currentLocalErrandTransportRequest.trips[index].hotelId = "";
    //currentLocalErrandTransportRequest.trips[index].hotelRate = 0;

    if ((index + 1) < currentLocalErrandTransportRequest.trips.length){
        currentLocalErrandTransportRequest.trips[index + 1].fromId = $(e.currentTarget).val();
    }

    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='transportationMode']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].transportationMode = $(e.currentTarget).val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='airlineId']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].airlineId = $(e.currentTarget).val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='carOption']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].carOption = $(e.currentTarget).val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='hotelId']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].hotelId = $(e.currentTarget).val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='departureTime']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].departureTime = $(e.currentTarget).val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='returnTime']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].returnTime = $(e.currentTarget).val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"click [id*='provideAirportPickup']": function(e, tmpl){

    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].provideAirportPickup = !currentLocalErrandTransportRequest.trips[index].provideAirportPickup;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"click [id*='provideGroundTransport']": function(e, tmpl){

    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].provideGroundTransport = !currentLocalErrandTransportRequest.trips[index].provideGroundTransport;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isBreakfastIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].isBreakfastIncluded = !currentLocalErrandTransportRequest.trips[index].isBreakfastIncluded;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isLunchIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].isLunchIncluded = !currentLocalErrandTransportRequest.trips[index].isLunchIncluded;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isDinnerIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].isDinnerIncluded = !currentLocalErrandTransportRequest.trips[index].isDinnerIncluded;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"click [id*='isIncidentalsIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentLocalErrandTransportRequest.trips[index].isIncidentalsIncluded = !currentLocalErrandTransportRequest.trips[index].isIncidentalsIncluded;
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    tmpl.updateTripNumbers();
},
"change [id*='departureDate']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;


    for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
        let rawDepartureDate = new Date($("#departureDate_" + (i+1)).val());
        let utcDepartureDate = new Date(Date.UTC(
            rawDepartureDate.getFullYear(),
            rawDepartureDate.getMonth(),
            rawDepartureDate.getDate(),
            rawDepartureDate.getHours(),
            rawDepartureDate.getMinutes(),
            rawDepartureDate.getSeconds(),
            rawDepartureDate.getMilliseconds()
        ));
        console.log(rawDepartureDate);
        console.log(utcDepartureDate);

        let rawReturnDate = new Date($("#returnDate_" + (i+1)).val());
        let utcReturnDate = new Date(Date.UTC(
            rawReturnDate.getFullYear(),
            rawReturnDate.getMonth(),
            rawReturnDate.getDate(),
            rawReturnDate.getHours(),
            rawReturnDate.getMinutes(),
            rawReturnDate.getSeconds(),
            rawReturnDate.getMilliseconds()
        ));
        console.log(rawReturnDate);
        console.log(utcReturnDate);

        currentLocalErrandTransportRequest.trips[i].departureDate = utcDepartureDate;
        currentLocalErrandTransportRequest.trips[i].returnDate = utcReturnDate;
    }

    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
    tmpl.updateTripNumbers();
    // console.log("departureDate:")
    // console.log(currentLocalErrandTransportRequest.trips[0].departureDate);
    // console.log("returnDate:")
    // console.log(currentLocalErrandTransportRequest.trips[0].returnDate);

},
"change [id*='returnDate']": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

    for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
        let rawDepartureDate = new Date($("#departureDate_" + (i+1)).val());
        let utcDepartureDate = new Date(Date.UTC(
            rawDepartureDate.getFullYear(),
            rawDepartureDate.getMonth(),
            rawDepartureDate.getDate(),
            rawDepartureDate.getHours(),
            rawDepartureDate.getMinutes(),
            rawDepartureDate.getSeconds(),
            rawDepartureDate.getMilliseconds()
        ));
        // console.log(rawDepartureDate);
        // console.log(utcDepartureDate);

        let rawReturnDate = new Date($("#returnDate_" + (i+1)).val());
        let utcReturnDate = new Date(Date.UTC(
            rawReturnDate.getFullYear(),
            rawReturnDate.getMonth(),
            rawReturnDate.getDate(),
            rawReturnDate.getHours(),
            rawReturnDate.getMinutes(),
            rawReturnDate.getSeconds(),
            rawReturnDate.getMilliseconds()
        ));
        // console.log(rawReturnDate);
        // console.log(utcReturnDate);

        currentLocalErrandTransportRequest.trips[i].departureDate = utcDepartureDate;
        currentLocalErrandTransportRequest.trips[i].returnDate = utcReturnDate;
    }

    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
    tmpl.updateTripNumbers();
},
"dp.change": function(e, tmpl){
    e.preventDefault()

    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

    for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
        let rawDepartureDate = new Date($("#departureDate_" + (i+1)).val());
        let utcDepartureDate = new Date(Date.UTC(
            rawDepartureDate.getFullYear(),
            rawDepartureDate.getMonth(),
            rawDepartureDate.getDate(),
            rawDepartureDate.getHours(),
            rawDepartureDate.getMinutes(),
            rawDepartureDate.getSeconds(),
            rawDepartureDate.getMilliseconds()
        ));
        // console.log(rawDepartureDate);
        // console.log(utcDepartureDate);

        let rawReturnDate = new Date($("#returnDate_" + (i+1)).val());
        let utcReturnDate = new Date(Date.UTC(
            rawReturnDate.getFullYear(),
            rawReturnDate.getMonth(),
            rawReturnDate.getDate(),
            rawReturnDate.getHours(),
            rawReturnDate.getMinutes(),
            rawReturnDate.getSeconds(),
            rawReturnDate.getMilliseconds()
        ));
        // console.log(rawReturnDate);
        // console.log(utcReturnDate);

        currentLocalErrandTransportRequest.trips[i].departureDate = utcDepartureDate;
        currentLocalErrandTransportRequest.trips[i].returnDate = utcReturnDate;  }

    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
    tmpl.updateTripNumbers();
},

'click #new-requisition-create': function(e, tmpl) {
    e.preventDefault()
    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

    //update description one last final time
    currentLocalErrandTransportRequest.description = $("#description").val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    let fieldsAreValid = true;
    let validationErrors = '';

    /*** VALIDATIONS ***/
    //check that the description is not hello

    if (currentLocalErrandTransportRequest.description ===""){
        fieldsAreValid = false;
        validationErrors += ": description cannot be empty";
    }

    if( currentLocalErrandTransportRequest.budgetCodeId=="I am not sure")
    {
        fieldsAreValid = false;
        validationErrors += ": select a budget code";
    }
    for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
        const currentTrip = currentLocalErrandTransportRequest.trips[i];

        // if (currentTrip.transportationMode === ""){
        //     fieldsAreValid = false;
        //     validationErrors += ": select transportation mode";
        // }
        //console.log(currentLocalErrandTransportRequest.type);
        if ((currentLocalErrandTransportRequest.type === "Multiple") && ((i + 1) < currentLocalErrandTransportRequest.trips.length)) {
            const startDate = moment(currentTrip.departureDate);
            const endDate = moment(currentLocalErrandTransportRequest.trips[i+1].departureDate)

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

        if (currentLocalErrandTransportRequest.trips.length ===1){


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
            //if (currentTrip.transportationMode === "AIRLINE" && currentTrip.airlineId === ""){
            //    fieldsAreValid = false;
            //    validationErrors += ": select an airline";
            //}
        }
    }


    if (fieldsAreValid){
        //explicitely set status
        currentLocalErrandTransportRequest.status = "Pending";

        Meteor.call('LocalErrandTransportRequest/create', currentLocalErrandTransportRequest, (err, res) => {
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
        Modal.hide('LocalErrandTransportRequisitionCreate');
    }else{
        Template.instance().errorMessage.set("Validation errors" + validationErrors);
    }

},

'click #new-requisition-save-draft': function(e, tmpl) {
    e.preventDefault()
    let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

    //update description one last final time
    currentLocalErrandTransportRequest.description = $("#description").val();
    tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    let fieldsAreValid = true;
    let validationErrors = '';

    /*** VALIDATIONS ***/
    //check that the description is not hello

    if (currentLocalErrandTransportRequest.description ===""){
        fieldsAreValid = false;
        validationErrors += ": description cannot be empty";
    }

    if( currentLocalErrandTransportRequest.budgetCodeId=="I am not sure")
    {
        fieldsAreValid = false;
        validationErrors += ": select a budget code";
    }
    for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {
        const currentTrip = currentLocalErrandTransportRequest.trips[i];

        // if (currentTrip.transportationMode === ""){
        //     fieldsAreValid = false;
        //     validationErrors += ": select transportation mode";
        // }
        //console.log(currentLocalErrandTransportRequest.type);
        if ((currentLocalErrandTransportRequest.type === "Multiple") && ((i + 1) < currentLocalErrandTransportRequest.trips.length)) {
            const startDate = moment(currentTrip.departureDate);
            const endDate = moment(currentLocalErrandTransportRequest.trips[i+1].departureDate)

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

        if (currentLocalErrandTransportRequest.trips.length ===1){


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
            //if (currentTrip.transportationMode === "AIRLINE" && currentTrip.airlineId === ""){
            //    fieldsAreValid = false;
            //    validationErrors += ": select an airline";
            //}
        }
    }


    if (fieldsAreValid){
        //explicitely set status
        currentLocalErrandTransportRequest.status = "Draft";


        Meteor.call('LocalErrandTransportRequest/createDraft', currentLocalErrandTransportRequest, (err, res) => {
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
                    text: "Your local errand transport requisition could not be created, reason: " + err.message,
                    confirmButtonClass: "btn-danger",
                    type: "error",
                    confirmButtonText: "OK"
                });
                console.log(err);
            }

        });
        Template.instance().errorMessage.set(null);
        Modal.hide('LocalErrandTransportRequisitionCreate');
    }else{
        Template.instance().errorMessage.set("Validation errors" + validationErrors);
    }

}
});





/*****************************************************************************/
/* LocalErrandTransportRequisitionCreate: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionCreate.helpers({
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
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();

        if(currentLocalErrandTransportRequest && val){
            if(currentLocalErrandTransportRequest.budgetCodeId === val){
                $('#budget-code').dropdown('set selected', currentLocalErrandTransportRequest.budgetCodeId);
            }

            //return currentLocalErrandTransportRequest.budgetCodeId === val ? selected="selected" : '';

        }

    },
    formatDate(dateVal){
        return moment(dateVal).format('YYYY-MM-DD');
    },
    formatDate2(dateVal){
        return moment(dateVal).format('DD MMM YYYY');
    },
    isLastLeg(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index && currentLocalErrandTransportRequest.type ==="Multiple"){
            return parseInt(index) >= currentLocalErrandTransportRequest.trips.length;
        }
    },
    fromIdSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val && index){

            if(currentLocalErrandTransportRequest.trips[parseInt(index) - 1].fromId === val){
                $('#fromId_' + index).dropdown('set selected', currentLocalErrandTransportRequest.trips[parseInt(index) - 1].fromId);
            }
            //return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].fromId === val ? selected="selected" : '';
        }

    },
    toIdSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val && index){
            if(currentLocalErrandTransportRequest.trips[parseInt(index) - 1].toId === val){
                $('#toId_' + index).dropdown('set selected', currentLocalErrandTransportRequest.trips[parseInt(index) - 1].toId);
            }
            //return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].toId === val ? selected="selected" : '';
        }
    },
    transportModeSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val && index){
            if(currentLocalErrandTransportRequest.trips[parseInt(index) - 1].transportationMode === val){
                $('#transportationMode_' + index).dropdown('set selected', currentLocalErrandTransportRequest.trips[parseInt(index) - 1].transportationMode);
            }
            //return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].transportationMode === val ? selected="selected" : '';
        }
    },
    departureTimeSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].departureTime === val ? selected="selected" : '';
        }
    },
    returnTimeSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].returnTime === val ? selected="selected" : '';
        }
    },
    carOptionSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val && index){
            if(currentLocalErrandTransportRequest.trips[parseInt(index) - 1].carOption === val){
                $('#carOption_' + index).dropdown('set selected', currentLocalErrandTransportRequest.trips[parseInt(index) - 1].carOption);
            }
            //return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].carOption === val ? selected="selected" : '';
        }
    },
    airlineSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        //console.log(currentLocalErrandTransportRequest);
        if(currentLocalErrandTransportRequest && val && index){
            if(currentLocalErrandTransportRequest.trips[parseInt(index) - 1].airlineId === val){
                $('#airlineId_' + index).dropdown('set selected', currentLocalErrandTransportRequest.trips[parseInt(index) - 1].airlineId);
            }
            //return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].airlineId === val ? selected="selected" : '';
        }
    },
    hotelSelected(val, index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val && index){
            if(currentLocalErrandTransportRequest.trips[parseInt(index) - 1].hotelId === val){
               $('#hotelId_' + index).dropdown('set selected', currentLocalErrandTransportRequest.trips[parseInt(index) - 1].hotelId);
            }
            //return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].hotelId === val ? selected="selected" : '';
        }
    },
    cashAdvanceNotRequiredChecked(){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest){
            return currentLocalErrandTransportRequest.cashAdvanceNotRequired? checked="checked" : '';
        }
    },
    currentLocalErrandTransportRequest(){
        return Template.instance().currentLocalErrandTransportRequest.get();
    },
    travelTypeChecked(val){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val){
            return currentLocalErrandTransportRequest.type === val ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentLocalErrandTransportRequest.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();

        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();

        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].transportationMode === "AIRLINE"? '':'none';
        }
    },
    isBreakfastIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
        }
    },

    selected(context,val) {
        let self = this;

        if(Template.instance().data){
            //get value of the option element
            //check and return selected if the template instce of data.context == self._id matches
            if(val){
                return Template.instance().data[context] === val ? selected="selected" : '';
            }
            return Template.instance().data[context] === self._id ? selected="selected" : '';
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
/* LocalErrandTransportRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionCreate.onCreated(function () {

    let self = this;



    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("flightroutes", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));

    let currentLocalErrandTransportRequest = {
        businessId: businessUnitId,

        description: "",
        budgetCodeId: "",
        cashAdvanceNotRequired: false,
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

        trips:[ {
            tripIndex: 1,
            fromId: "",
            toId: "",
            departureDate: new Date(),
            returnDate: new Date(),
            departureTime: "6 AM",
            returnTime: "6 PM",
            transportationMode: 'AIRLINE',
            carOption: 'CAR_HIRE',
            provideAirportPickup: false,
            provideGroundTransport: false,
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
        }]
    };

    self.currentLocalErrandTransportRequest =  new ReactiveVar();
    self.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    self.updateTripNumbers = () => {

        let currentLocalErrandTransportRequest = self.currentLocalErrandTransportRequest.curValue;
        const tripType = currentLocalErrandTransportRequest.type;

        currentLocalErrandTransportRequest.description = $("#description").val();
        currentLocalErrandTransportRequest.budgetCodeId = $("#budget-code").val();

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

        for (i = 0; i < currentLocalErrandTransportRequest.trips.length; i++) {

            const toId = currentLocalErrandTransportRequest.trips[i].toId;
            const hotelNotRequired = currentLocalErrandTransportRequest.trips[i].hotelNotRequired;


            let totalDuration = 0;

            if (tripType === "Return"){
              const startDate = moment(currentLocalErrandTransportRequest.trips[i].departureDate)
              const endDate = moment(currentLocalErrandTransportRequest.trips[i].returnDate)


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
            }else if (tripType === "Multiple"){

                if ((i + 1) >= currentLocalErrandTransportRequest.trips.length){
                    totalDuration = 0;
                }else{
                    const startDate = moment(currentLocalErrandTransportRequest.trips[i].departureDate);
                    const endDate = moment(currentLocalErrandTransportRequest.trips[i+1].departureDate)

                    totalDuration = endDate.diff(startDate, 'days');
                    if (totalDuration < 0){
                        totalDuration = 0;
                    }else{
                        totalDuration = totalDuration + 0.5;
                    }
                }
            }



            console.log("Total Duration: " + totalDuration)



            let perDiemCost = 0;
            let unadjustedPerDiemCost = 0;
            let originCityCurrreny = "NGN";
            let destinationCityCurrreny = "NGN";

            let toTravelCity = Travelcities.findOne({_id: currentLocalErrandTransportRequest.trips[i].toId});
            let fromTravelCity = Travelcities.findOne({_id: currentLocalErrandTransportRequest.trips[i].fromId});

            if(toTravelCity){
                destinationCityCurrreny = toTravelCity.currency;
            }

            if(fromTravelCity){
                originCityCurrreny = fromTravelCity.currency;
            }

            if (toTravelCity){
                unadjustedPerDiemCost = toTravelCity.perdiem;
                perDiemCost = unadjustedPerDiemCost;

                if (currentLocalErrandTransportRequest.trips[i].isBreakfastIncluded){
                    perDiemCost = perDiemCost - (0.2 * unadjustedPerDiemCost);
                }

                if (currentLocalErrandTransportRequest.trips[i].isLunchIncluded){
                    perDiemCost = perDiemCost - (0.3 * unadjustedPerDiemCost);
                }

                if (currentLocalErrandTransportRequest.trips[i].isDinnerIncluded){
                    perDiemCost = perDiemCost - (0.4 * unadjustedPerDiemCost);
                }

                if (currentLocalErrandTransportRequest.trips[i].isIncidentalsIncluded){
                    perDiemCost = perDiemCost - (0.1 * unadjustedPerDiemCost);
                }
            }

            let hotelRate = 0;
            let hotel = Hotels.findOne({_id: currentLocalErrandTransportRequest.trips[i].hotelId});
            if (hotel){
                hotelRate = hotel.dailyRate;
            }

            currentLocalErrandTransportRequest.trips[i].totalHotelCost = (totalDuration - 0.5) * hotelRate;

            currentLocalErrandTransportRequest.trips[i].totalPerDiem = totalDuration * perDiemCost;
            currentLocalErrandTransportRequest.trips[i].totalDuration = totalDuration;
            currentLocalErrandTransportRequest.trips[i].perDiemCost = perDiemCost;
            currentLocalErrandTransportRequest.trips[i].originCityCurrreny = originCityCurrreny;
            currentLocalErrandTransportRequest.trips[i].hotelRate = hotelRate;
            currentLocalErrandTransportRequest.trips[i].destinationCityCurrreny = destinationCityCurrreny

            if (currentLocalErrandTransportRequest.trips[i].transportationMode !== "AIRLINE"){
                currentLocalErrandTransportRequest.trips[i].provideAirportPickup = false;
                currentLocalErrandTransportRequest.trips[i].originCityAirportTaxiCost = 0;
            }

            if (currentLocalErrandTransportRequest.trips[i].provideAirportPickup){
                if (fromTravelCity){
                    currentLocalErrandTransportRequest.trips[i].originCityAirportTaxiCost = fromTravelCity.airportPickupDropOffCost;
                }else{
                    currentLocalErrandTransportRequest.trips[i].originCityAirportTaxiCost = 0;
                }

                if (toTravelCity){
                    currentLocalErrandTransportRequest.trips[i].destinationCityAirportTaxiCost = toTravelCity.airportPickupDropOffCost;
                }else{
                    currentLocalErrandTransportRequest.trips[i].destinationCityAirportTaxiCost = 0;
                }

            }else{
                currentLocalErrandTransportRequest.trips[i].originCityAirportTaxiCost = 0;
            }

            if (currentLocalErrandTransportRequest.trips[i].provideGroundTransport){
                if (toTravelCity){
                    currentLocalErrandTransportRequest.trips[i].groundTransportCost = toTravelCity.groundTransport;
                }else{
                    currentLocalErrandTransportRequest.trips[i].groundTransportCost = 0;
                }
            }else{
                currentLocalErrandTransportRequest.trips[i].groundTransportCost = 0;
            }

            totalTripDuration = totalTripDuration + currentLocalErrandTransportRequest.trips[i].totalDuration;
            if (currentLocalErrandTransportRequest.trips[i].destinationCityCurrreny  === "NGN"){
                totalEmployeePerdiemNGN = totalEmployeePerdiemNGN + currentLocalErrandTransportRequest.trips[i].totalPerDiem;
            }else{
                totalEmployeePerdiemUSD = totalEmployeePerdiemUSD + currentLocalErrandTransportRequest.trips[i].totalPerDiem;
            }

            if (fromTravelCity && (fromTravelCity.currency   === "NGN")){
                totalAirportTaxiCostNGN = totalAirportTaxiCostNGN + currentLocalErrandTransportRequest.trips[i].originCityAirportTaxiCost;
            }else{
                totalAirportTaxiCostUSD = totalAirportTaxiCostUSD + currentLocalErrandTransportRequest.trips[i].originCityAirportTaxiCost;
            }

            if (toTravelCity && (toTravelCity.currency   === "NGN")){
                totalAirportTaxiCostNGN = totalAirportTaxiCostNGN + currentLocalErrandTransportRequest.trips[i].destinationCityAirportTaxiCost;
            }else{
                totalAirportTaxiCostUSD = totalAirportTaxiCostUSD + currentLocalErrandTransportRequest.trips[i].destinationCityAirportTaxiCost;
            }

            if (currentLocalErrandTransportRequest.trips[i].destinationCityCurrreny === "NGN"){
                totalGroundTransportCostNGN = totalGroundTransportCostNGN + ((totalDuration - 0.5) * currentLocalErrandTransportRequest.trips[i].groundTransportCost);
                totalHotelCostNGN = totalHotelCostNGN + currentLocalErrandTransportRequest.trips[i].totalHotelCost;
            }else{
                totalGroundTransportCostUSD = totalGroundTransportCostUSD + ((totalDuration - 0.5) * currentLocalErrandTransportRequest.trips[i].groundTransportCost);
                totalHotelCostUSD = totalHotelCostUSD + currentLocalErrandTransportRequest.trips[i].totalHotelCost;
            }


        }

        totalTripCostNGN = totalEmployeePerdiemNGN + totalAirportTaxiCostNGN + totalGroundTransportCostNGN + totalHotelCostNGN;
        totalTripCostUSD = totalEmployeePerdiemUSD + totalAirportTaxiCostUSD + totalGroundTransportCostUSD + totalHotelCostUSD;


        currentLocalErrandTransportRequest.totalTripDuration = totalTripDuration;
        currentLocalErrandTransportRequest.totalEmployeePerdiemNGN = totalEmployeePerdiemNGN;
        currentLocalErrandTransportRequest.totalEmployeePerdiemUSD = totalEmployeePerdiemUSD;
        currentLocalErrandTransportRequest.totalAirportTaxiCostNGN = totalAirportTaxiCostNGN;
        currentLocalErrandTransportRequest.totalAirportTaxiCostUSD = totalAirportTaxiCostUSD;
        currentLocalErrandTransportRequest.totalGroundTransportCostNGN = totalGroundTransportCostNGN;
        currentLocalErrandTransportRequest.totalGroundTransportCostUSD = totalGroundTransportCostUSD;
        currentLocalErrandTransportRequest.totalAncilliaryCostNGN = totalEmployeePerdiemNGN + totalAirportTaxiCostNGN + totalGroundTransportCostNGN + totalMiscCostNGN;
        currentLocalErrandTransportRequest.totalAncilliaryCostUSD = totalEmployeePerdiemUSD + totalAirportTaxiCostUSD + totalGroundTransportCostUSD + totalMiscCostUSD;
        currentLocalErrandTransportRequest.totalHotelCostNGN = totalHotelCostNGN;
        currentLocalErrandTransportRequest.totalHotelCostUSD = totalHotelCostUSD;
        currentLocalErrandTransportRequest.totalTripCostNGN = totalTripCostNGN;
        currentLocalErrandTransportRequest.totalTripCostUSD = totalTripCostUSD;

        self.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
    }

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


    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    let invokeReason = self.data;

    self.autorun(function(){

        if (invokeReason){
            let localErrandTransportRequestSub = self.subscribe('LocalErrandTransportRequest', invokeReason.requisitionId);
            if(localErrandTransportRequestSub.ready()) {
                let localErrandTransportRequestDetails = LocalErrandTransportRequisitions.findOne({_id: invokeReason.requisitionId});
                self.currentLocalErrandTransportRequest.set(localErrandTransportRequestDetails)

            }
        }
    })


});

Template.LocalErrandTransportRequisitionCreate.onRendered(function () {


    /*this.$('.datetimepicker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: new Date()
})*/

});

Template.LocalErrandTransportRequisitionCreate.onDestroyed(function () {
});
