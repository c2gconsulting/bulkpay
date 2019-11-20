/*****************************************************************************/
/* TravelRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.EmployeeTimeManagementCreate.events({
  'click #new-timeRecord-create': function(e, tmpl) {
      e.preventDefault()
      console.log("creating time record")
  //    let currentTimeRecord = {};
      const createdAt = new Date();
      currentTimeRecord.projectCode = $('#projectCode').val();
      currentTimeRecord.chargeCode = $('#chargeCode').val();

      const company = {
    name: c.name,
    id: c._id,
    address: getAddress(c.address),
    phoneNumber: c.phoneNumber,
    email: c.email,
    tin: c.tin
}




      let currentTimeRecord = tmpl.currentTimeRecord.curValue;

      //update projectCode one last final time
      currentTimeRecord.projectCode = $("#projectCode").val();
      tmpl.currentTimeRecord.set(currentTimeRecord);

      let fieldsAreValid = true;
      let validationErrors = '';

      /*** VALIDATIONS ***/
      //check that the projectCode is not hello

      if (currentTimeRecord.projectCode ===""){
          fieldsAreValid = false;
          validationErrors += ": projectCode cannot be empty";
      }

      if( currentTimeRecord.budgetCodeId=="I am not sure")
      {
          fieldsAreValid = false;
          validationErrors += ": select a budget code";
      }
      for (i = 0; i < currentTimeRecord.trips.length; i++) {
          const currentTrip = currentTimeRecord.trips[i];

          // if (currentTrip.transportationMode === ""){
          //     fieldsAreValid = false;
          //     validationErrors += ": select transportation mode";
          // }
          //console.log(currentTimeRecord.type);
          if ((currentTimeRecord.type === "Multiple") && ((i + 1) < currentTimeRecord.trips.length)) {
              const startDate = moment(currentTrip.departureDate);
              const endDate = moment(currentTimeRecord.trips[i+1].departureDate)

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

          if (currentTimeRecord.trips.length ===1){


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
          currentTimeRecord.status = "Pending";

          Meteor.call('TravelRequest2/create', currentTimeRecord, (err, res) => {
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
          Modal.hide('EmployeeTimeManagementCreate');
      }else{
          Template.instance().errorMessage.set("Validation errors" + validationErrors);
      }

  },
  'change [name=projectCode]': function(e, tmpl) {
      e.preventDefault()
      let projectCode = $('#projectCode').val() || "";
      console.log("projectCode")
      console.log(projectCode)


  //    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
//      currentTimeRecord.projectCode = $("#projectCode").val();
//      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=chargeCode]': function(e, tmpl) {
      e.preventDefault()
      let chargeCode = $('#chargeCode').val() || "";
      console.log("chargeCode")
      console.log(chargeCode)


  //    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
//      currentTimeRecord.projectCode = $("#projectCode").val();
//      tmpl.currentTimeRecord.set(currentTimeRecord);
  },

"change [name='travelType']":_.throttle(function(e, tmpl) {
        let currentTimeRecord = tmpl.currentTimeRecord.curValue;
        const travelType = $(e.currentTarget).val();
        currentTimeRecord.projectCode = $("#projectCode").val();
        currentTimeRecord.budgetCodeId = $("#budget-code").val();
        currentTimeRecord.type = travelType;
        currentTimeRecord.totalTripDuration = 0;
        currentTimeRecord.totalEmployeePerdiemNGN = 0;
        currentTimeRecord.totalEmployeePerdiemUSD = 0;
        currentTimeRecord.totalFlightCostNGN = 0;
        currentTimeRecord.totalFlightCostUSD = 0;
        currentTimeRecord.totalHotelCostNGN = 0;
        currentTimeRecord.totalHotelCostUSD = 0;
        currentTimeRecord.totalTripCostNGN = 0;
        currentTimeRecord.totalTripCostUSD = 0;

        if (travelType && (currentTimeRecord.trips)) {
            if ((travelType === "Return") && (currentTimeRecord.trips.length > 0)) {
                currentTimeRecord.trips = [{
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
            }else if (($(e.currentTarget).val() === "Multiple") && (currentTimeRecord.trips.length > 0)){
                currentTimeRecord.trips = [{
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

    tmpl.currentTimeRecord.set(currentTimeRecord);

}, 200),

"change [name='cashAdvanceNotRequired']":_.throttle(function(e, tmpl) {
    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    currentTimeRecord.cashAdvanceNotRequired = !currentTimeRecord.cashAdvanceNotRequired;
    tmpl.currentTimeRecord.set(currentTimeRecord);
},200),
'change [id=budget-code]': function(e, tmpl) {
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    currentTimeRecord.budgetCodeId = $("#budget-code").val();
    tmpl.currentTimeRecord.set(currentTimeRecord);
},
'click [id=add-additional_stop]': function(e, tmpl) {
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;

    currentTimeRecord.trips.push({
        tripIndex: currentTimeRecord.trips.length + 1,
        fromId: currentTimeRecord.trips[currentTimeRecord.trips.length - 1].toId,
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

    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();

},
'click [id*=hotelNotRequired]': function(e, tmpl) {
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = parseInt($(e.currentTarget).val()) - 1;
    currentTimeRecord.trips[index].hotelNotRequired = !currentTimeRecord.trips[index].hotelNotRequired;
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();

},
"change [id*='fromId']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].fromId = $(e.currentTarget).val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='toId']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].toId = $(e.currentTarget).val();
    //currentTimeRecord.trips[index].airlineId = "";
    //currentTimeRecord.trips[index].airfareCost = 0;
    //currentTimeRecord.trips[index].hotelId = "";
    //currentTimeRecord.trips[index].hotelRate = 0;

    if ((index + 1) < currentTimeRecord.trips.length){
        currentTimeRecord.trips[index + 1].fromId = $(e.currentTarget).val();
    }

    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='transportationMode']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].transportationMode = $(e.currentTarget).val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='airlineId']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].airlineId = $(e.currentTarget).val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='carOption']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].carOption = $(e.currentTarget).val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='hotelId']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].hotelId = $(e.currentTarget).val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='departureTime']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].departureTime = $(e.currentTarget).val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='returnTime']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].returnTime = $(e.currentTarget).val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"click [id*='provideAirportPickup']": function(e, tmpl){

    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].provideAirportPickup = !currentTimeRecord.trips[index].provideAirportPickup;
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"click [id*='provideGroundTransport']": function(e, tmpl){

    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].provideGroundTransport = !currentTimeRecord.trips[index].provideGroundTransport;
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"click [id*='isBreakfastIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].isBreakfastIncluded = !currentTimeRecord.trips[index].isBreakfastIncluded;
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"click [id*='isLunchIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].isLunchIncluded = !currentTimeRecord.trips[index].isLunchIncluded;
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"click [id*='isDinnerIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].isDinnerIncluded = !currentTimeRecord.trips[index].isDinnerIncluded;
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"click [id*='isIncidentalsIncluded']": function(e, tmpl){

    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;

    currentTimeRecord.trips[index].isIncidentalsIncluded = !currentTimeRecord.trips[index].isIncidentalsIncluded;
    tmpl.currentTimeRecord.set(currentTimeRecord);

    tmpl.updateTripNumbers();
},
"change [id*='departureDate']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;


    for (i = 0; i < currentTimeRecord.trips.length; i++) {
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

        currentTimeRecord.trips[i].departureDate = utcDepartureDate;
        currentTimeRecord.trips[i].returnDate = utcReturnDate;
    }

    tmpl.currentTimeRecord.set(currentTimeRecord);
    tmpl.updateTripNumbers();
    // console.log("departureDate:")
    // console.log(currentTimeRecord.trips[0].departureDate);
    // console.log("returnDate:")
    // console.log(currentTimeRecord.trips[0].returnDate);

},
"change [id*='returnDate']": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;

    for (i = 0; i < currentTimeRecord.trips.length; i++) {
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

        currentTimeRecord.trips[i].departureDate = utcDepartureDate;
        currentTimeRecord.trips[i].returnDate = utcReturnDate;
    }

    tmpl.currentTimeRecord.set(currentTimeRecord);
    tmpl.updateTripNumbers();
},
"dp.change": function(e, tmpl){
    e.preventDefault()

    let currentTimeRecord = tmpl.currentTimeRecord.curValue;

    for (i = 0; i < currentTimeRecord.trips.length; i++) {
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

        currentTimeRecord.trips[i].departureDate = utcDepartureDate;
        currentTimeRecord.trips[i].returnDate = utcReturnDate;  }

    tmpl.currentTimeRecord.set(currentTimeRecord);
    tmpl.updateTripNumbers();
},



'click #new-requisition-save-draft': function(e, tmpl) {
    e.preventDefault()
    let currentTimeRecord = tmpl.currentTimeRecord.curValue;

    //update projectCode one last final time
    currentTimeRecord.projectCode = $("#projectCode").val();
    tmpl.currentTimeRecord.set(currentTimeRecord);

    let fieldsAreValid = true;
    let validationErrors = '';

    /*** VALIDATIONS ***/
    //check that the projectCode is not hello

    if (currentTimeRecord.projectCode ===""){
        fieldsAreValid = false;
        validationErrors += ": projectCode cannot be empty";
    }

    if( currentTimeRecord.budgetCodeId=="I am not sure")
    {
        fieldsAreValid = false;
        validationErrors += ": select a budget code";
    }
    for (i = 0; i < currentTimeRecord.trips.length; i++) {
        const currentTrip = currentTimeRecord.trips[i];

        // if (currentTrip.transportationMode === ""){
        //     fieldsAreValid = false;
        //     validationErrors += ": select transportation mode";
        // }
        //console.log(currentTimeRecord.type);
        if ((currentTimeRecord.type === "Multiple") && ((i + 1) < currentTimeRecord.trips.length)) {
            const startDate = moment(currentTrip.departureDate);
            const endDate = moment(currentTimeRecord.trips[i+1].departureDate)

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

        if (currentTimeRecord.trips.length ===1){


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
        currentTimeRecord.status = "Draft";


        Meteor.call('TravelRequest2/createDraft', currentTimeRecord, (err, res) => {
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
        Modal.hide('EmployeeTimeManagementCreate');
    }else{
        Template.instance().errorMessage.set("Validation errors" + validationErrors);
    }

}
});





/*****************************************************************************/
/* TravelRequisitionCreate: Helpers */
/*****************************************************************************/
Template.EmployeeTimeManagementCreate.helpers({
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
        const currentTimeRecord = Template.instance().currentTimeRecord.get();

        if(currentTimeRecord && val){
            if(currentTimeRecord.budgetCodeId === val){
                $('#budget-code').dropdown('set selected', currentTimeRecord.budgetCodeId);
            }

            //return currentTimeRecord.budgetCodeId === val ? selected="selected" : '';

        }

    },
    formatDate(dateVal){
        return moment(dateVal).format('YYYY-MM-DD');
    },
    formatDate2(dateVal){
        return moment(dateVal).format('DD MMM YYYY');
    },
    isLastLeg(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index && currentTimeRecord.type ==="Multiple"){
            return parseInt(index) >= currentTimeRecord.trips.length;
        }
    },
    fromIdSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val && index){

            if(currentTimeRecord.trips[parseInt(index) - 1].fromId === val){
                $('#fromId_' + index).dropdown('set selected', currentTimeRecord.trips[parseInt(index) - 1].fromId);
            }
            //return currentTimeRecord.trips[parseInt(index) - 1].fromId === val ? selected="selected" : '';
        }

    },
    toIdSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val && index){
            if(currentTimeRecord.trips[parseInt(index) - 1].toId === val){
                $('#toId_' + index).dropdown('set selected', currentTimeRecord.trips[parseInt(index) - 1].toId);
            }
            //return currentTimeRecord.trips[parseInt(index) - 1].toId === val ? selected="selected" : '';
        }
    },
    transportModeSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val && index){
            if(currentTimeRecord.trips[parseInt(index) - 1].transportationMode === val){
                $('#transportationMode_' + index).dropdown('set selected', currentTimeRecord.trips[parseInt(index) - 1].transportationMode);
            }
            //return currentTimeRecord.trips[parseInt(index) - 1].transportationMode === val ? selected="selected" : '';
        }
    },
    departureTimeSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val && index){
            return currentTimeRecord.trips[parseInt(index) - 1].departureTime === val ? selected="selected" : '';
        }
    },
    returnTimeSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val && index){
            return currentTimeRecord.trips[parseInt(index) - 1].returnTime === val ? selected="selected" : '';
        }
    },
    carOptionSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val && index){
            if(currentTimeRecord.trips[parseInt(index) - 1].carOption === val){
                $('#carOption_' + index).dropdown('set selected', currentTimeRecord.trips[parseInt(index) - 1].carOption);
            }
            //return currentTimeRecord.trips[parseInt(index) - 1].carOption === val ? selected="selected" : '';
        }
    },
    airlineSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        //console.log(currentTimeRecord);
        if(currentTimeRecord && val && index){
            if(currentTimeRecord.trips[parseInt(index) - 1].airlineId === val){
                $('#airlineId_' + index).dropdown('set selected', currentTimeRecord.trips[parseInt(index) - 1].airlineId);
            }
            //return currentTimeRecord.trips[parseInt(index) - 1].airlineId === val ? selected="selected" : '';
        }
    },
    hotelSelected(val, index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val && index){
            if(currentTimeRecord.trips[parseInt(index) - 1].hotelId === val){
               $('#hotelId_' + index).dropdown('set selected', currentTimeRecord.trips[parseInt(index) - 1].hotelId);
            }
            //return currentTimeRecord.trips[parseInt(index) - 1].hotelId === val ? selected="selected" : '';
        }
    },
    cashAdvanceNotRequiredChecked(){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord){
            return currentTimeRecord.cashAdvanceNotRequired? checked="checked" : '';
        }
    },
    currentTimeRecord(){
        return Template.instance().currentTimeRecord.get();
    },
    travelTypeChecked(val){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val){
            return currentTimeRecord.type === val ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentTimeRecord.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();

        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();

        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].transportationMode === "AIRLINE"? '':'none';
        }
    },
    isBreakfastIncluded(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
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
/* TravelRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTimeManagementCreate.onCreated(function () {
    let weekIndex = Session.get("weekIndex");
    console.log("weekIndex is:")
    console.log(weekIndex)

    let self = this;

    console.log("this is:")
    console.log(this)



    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("flightroutes", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));

    let currentTimeRecord = {
        businessId: businessUnitId,
        createdBy: Meteor.user()._id,

        projectCode: "",
        chargeCode: "",
        supervisorId: "",
        budgetHolderId: "",
        totalDaysWorked : 0,

        period: {
            year: "",
            month: ""

          },
        weeks: [
          {
            weekIndex: 1,
            monday:false,
            tuesday:false,
            wednesday:false,
            thursday:false,
            friday:false,
            saturday:false,
            sunday:false,
            numOfDaysOffShore: 0,
            numOfDaysOnShore: 0,
            provideVehicleTransport: false
        },
        {
          weekIndex: 2,
          monday:false,
          tuesday:false,
          wednesday:false,
          thursday:false,
          friday:false,
          saturday:false,
          sunday:false,
          numOfDaysOffShore: 0,
          numOfDaysOnShore: 0,
          provideVehicleTransport: false
      },
      {
        weekIndex: 3,
        monday:false,
        tuesday:false,
        wednesday:false,
        thursday:false,
        friday:false,
        saturday:false,
        sunday:false,
        numOfDaysOffShore: 0,
        numOfDaysOnShore: 0,
        provideVehicleTransport: false
    },
      {
      weekIndex: 4,
      monday:false,
      tuesday:false,
      wednesday:false,
      thursday:false,
      friday:false,
      saturday:false,
      sunday:false,
      numOfDaysOffShore: 0,
      numOfDaysOnShore: 0,
      provideVehicleTransport: false
       }
      ]
    };

    console.log("current time record is:")
    console.log(currentTimeRecord)

    self.currentTimeRecord =  new ReactiveVar();
    self.currentTimeRecord.set(currentTimeRecord);

    self.updateTripNumbers = () => {

        let currentTimeRecord = self.currentTimeRecord.curValue;
        const tripType = currentTimeRecord.type;

        currentTimeRecord.projectCode = $("#projectCode").val();
        currentTimeRecord.budgetCodeId = $("#budget-code").val();

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

        for (i = 0; i < currentTimeRecord.trips.length; i++) {

            const toId = currentTimeRecord.trips[i].toId;
            const hotelNotRequired = currentTimeRecord.trips[i].hotelNotRequired;


            let totalDuration = 0;

            if (tripType === "Return"){
              const startDate = moment(currentTimeRecord.trips[i].departureDate)
              const endDate = moment(currentTimeRecord.trips[i].returnDate)


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

                if ((i + 1) >= currentTimeRecord.trips.length){
                    totalDuration = 0;
                }else{
                    const startDate = moment(currentTimeRecord.trips[i].departureDate);
                    const endDate = moment(currentTimeRecord.trips[i+1].departureDate)

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

            let toTravelCity = Travelcities.findOne({_id: currentTimeRecord.trips[i].toId});
            let fromTravelCity = Travelcities.findOne({_id: currentTimeRecord.trips[i].fromId});

            if(toTravelCity){
                destinationCityCurrreny = toTravelCity.currency;
            }

            if(fromTravelCity){
                originCityCurrreny = fromTravelCity.currency;
            }

            if (toTravelCity){
                unadjustedPerDiemCost = toTravelCity.perdiem;
                perDiemCost = unadjustedPerDiemCost;

                if (currentTimeRecord.trips[i].isBreakfastIncluded){
                    perDiemCost = perDiemCost - (0.2 * unadjustedPerDiemCost);
                }

                if (currentTimeRecord.trips[i].isLunchIncluded){
                    perDiemCost = perDiemCost - (0.3 * unadjustedPerDiemCost);
                }

                if (currentTimeRecord.trips[i].isDinnerIncluded){
                    perDiemCost = perDiemCost - (0.4 * unadjustedPerDiemCost);
                }

                if (currentTimeRecord.trips[i].isIncidentalsIncluded){
                    perDiemCost = perDiemCost - (0.1 * unadjustedPerDiemCost);
                }
            }

            let hotelRate = 0;
            let hotel = Hotels.findOne({_id: currentTimeRecord.trips[i].hotelId});
            if (hotel){
                hotelRate = hotel.dailyRate;
            }

            currentTimeRecord.trips[i].totalHotelCost = (totalDuration - 0.5) * hotelRate;

            currentTimeRecord.trips[i].totalPerDiem = totalDuration * perDiemCost;
            currentTimeRecord.trips[i].totalDuration = totalDuration;
            currentTimeRecord.trips[i].perDiemCost = perDiemCost;
            currentTimeRecord.trips[i].originCityCurrreny = originCityCurrreny;
            currentTimeRecord.trips[i].hotelRate = hotelRate;
            currentTimeRecord.trips[i].destinationCityCurrreny = destinationCityCurrreny

            if (currentTimeRecord.trips[i].transportationMode !== "AIRLINE"){
                currentTimeRecord.trips[i].provideAirportPickup = false;
                currentTimeRecord.trips[i].originCityAirportTaxiCost = 0;
            }

            if (currentTimeRecord.trips[i].provideAirportPickup){
                if (fromTravelCity){
                    currentTimeRecord.trips[i].originCityAirportTaxiCost = fromTravelCity.airportPickupDropOffCost;
                }else{
                    currentTimeRecord.trips[i].originCityAirportTaxiCost = 0;
                }

                if (toTravelCity){
                    currentTimeRecord.trips[i].destinationCityAirportTaxiCost = toTravelCity.airportPickupDropOffCost;
                }else{
                    currentTimeRecord.trips[i].destinationCityAirportTaxiCost = 0;
                }

            }else{
                currentTimeRecord.trips[i].originCityAirportTaxiCost = 0;
            }

            if (currentTimeRecord.trips[i].provideGroundTransport){
                if (toTravelCity){
                    currentTimeRecord.trips[i].groundTransportCost = toTravelCity.groundTransport;
                }else{
                    currentTimeRecord.trips[i].groundTransportCost = 0;
                }
            }else{
                currentTimeRecord.trips[i].groundTransportCost = 0;
            }

            totalTripDuration = totalTripDuration + currentTimeRecord.trips[i].totalDuration;
            if (currentTimeRecord.trips[i].destinationCityCurrreny  === "NGN"){
                totalEmployeePerdiemNGN = totalEmployeePerdiemNGN + currentTimeRecord.trips[i].totalPerDiem;
            }else{
                totalEmployeePerdiemUSD = totalEmployeePerdiemUSD + currentTimeRecord.trips[i].totalPerDiem;
            }

            if (fromTravelCity && (fromTravelCity.currency   === "NGN")){
                totalAirportTaxiCostNGN = totalAirportTaxiCostNGN + currentTimeRecord.trips[i].originCityAirportTaxiCost;
            }else{
                totalAirportTaxiCostUSD = totalAirportTaxiCostUSD + currentTimeRecord.trips[i].originCityAirportTaxiCost;
            }

            if (toTravelCity && (toTravelCity.currency   === "NGN")){
                totalAirportTaxiCostNGN = totalAirportTaxiCostNGN + currentTimeRecord.trips[i].destinationCityAirportTaxiCost;
            }else{
                totalAirportTaxiCostUSD = totalAirportTaxiCostUSD + currentTimeRecord.trips[i].destinationCityAirportTaxiCost;
            }

            if (currentTimeRecord.trips[i].destinationCityCurrreny === "NGN"){
                totalGroundTransportCostNGN = totalGroundTransportCostNGN + ((totalDuration - 0.5) * currentTimeRecord.trips[i].groundTransportCost);
                totalHotelCostNGN = totalHotelCostNGN + currentTimeRecord.trips[i].totalHotelCost;
            }else{
                totalGroundTransportCostUSD = totalGroundTransportCostUSD + ((totalDuration - 0.5) * currentTimeRecord.trips[i].groundTransportCost);
                totalHotelCostUSD = totalHotelCostUSD + currentTimeRecord.trips[i].totalHotelCost;
            }


        }

        totalTripCostNGN = totalEmployeePerdiemNGN + totalAirportTaxiCostNGN + totalGroundTransportCostNGN + totalHotelCostNGN;
        totalTripCostUSD = totalEmployeePerdiemUSD + totalAirportTaxiCostUSD + totalGroundTransportCostUSD + totalHotelCostUSD;


        currentTimeRecord.totalTripDuration = totalTripDuration;
        currentTimeRecord.totalEmployeePerdiemNGN = totalEmployeePerdiemNGN;
        currentTimeRecord.totalEmployeePerdiemUSD = totalEmployeePerdiemUSD;
        currentTimeRecord.totalAirportTaxiCostNGN = totalAirportTaxiCostNGN;
        currentTimeRecord.totalAirportTaxiCostUSD = totalAirportTaxiCostUSD;
        currentTimeRecord.totalGroundTransportCostNGN = totalGroundTransportCostNGN;
        currentTimeRecord.totalGroundTransportCostUSD = totalGroundTransportCostUSD;
        currentTimeRecord.totalAncilliaryCostNGN = totalEmployeePerdiemNGN + totalAirportTaxiCostNGN + totalGroundTransportCostNGN + totalMiscCostNGN;
        currentTimeRecord.totalAncilliaryCostUSD = totalEmployeePerdiemUSD + totalAirportTaxiCostUSD + totalGroundTransportCostUSD + totalMiscCostUSD;
        currentTimeRecord.totalHotelCostNGN = totalHotelCostNGN;
        currentTimeRecord.totalHotelCostUSD = totalHotelCostUSD;
        currentTimeRecord.totalTripCostNGN = totalTripCostNGN;
        currentTimeRecord.totalTripCostUSD = totalTripCostUSD;

        self.currentTimeRecord.set(currentTimeRecord);
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
            let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId);
            if(travelRequest2Sub.ready()) {
                let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId});
                self.currentTimeRecord.set(travelRequestDetails)

            }
        }
    })


});

Template.EmployeeTimeManagementCreate.onRendered(function () {


    /*this.$('.datetimepicker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: new Date()
})*/

});

Template.EmployeeTimeManagementCreate.onDestroyed(function () {
});
