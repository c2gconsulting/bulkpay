/*****************************************************************************/
/* TravelRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisition2Create.events({

    "change [name='travelType']":_.throttle(function(e, tmpl) {
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const travelType = $(e.currentTarget).val();
        currentTravelRequest.description = $("#description").val();
        currentTravelRequest.budgetCodeId = $("#budget-code").val();
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

        if (travelType && (currentTravelRequest.trips)) {
            if ((travelType === "Return") && (currentTravelRequest.trips.length > 0)) {
                currentTravelRequest.trips = [{
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
            }else if (($(e.currentTarget).val() === "Multiple") && (currentTravelRequest.trips.length > 0)){
                currentTravelRequest.trips = [{
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

    tmpl.currentTravelRequest.set(currentTravelRequest);

}, 200),

"change [name='cashAdvanceNotRequired']":_.throttle(function(e, tmpl) {
    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.cashAdvanceNotRequired = !currentTravelRequest.cashAdvanceNotRequired;
    tmpl.currentTravelRequest.set(currentTravelRequest);
},200),
'click [id=description]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.description = $("#description").val();
    tmpl.currentTravelRequest.set(currentTravelRequest);
   console.log("description")
   console.log(description)

},
'change [id=budget-code]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.budgetCodeId = $("#budget-code").val();
    tmpl.currentTravelRequest.set(currentTravelRequest);
},
'click [id=add-additional_stop]': function(e, tmpl) {
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    currentTravelRequest.trips.push({
        tripIndex: currentTravelRequest.trips.length + 1,
        fromId: currentTravelRequest.trips[currentTravelRequest.trips.length - 1].toId,
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
        currentTravelRequest.trips[i].departureDate = new Date($("#departureDate_" + (i+1)).val());
        currentTravelRequest.trips[i].returnDate = new Date($("#returnDate_" + (i+1)).val());
    }

    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},
"change [id*='returnDate']": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    for (i = 0; i < currentTravelRequest.trips.length; i++) {
        currentTravelRequest.trips[i].departureDate = new Date($("#departureDate_" + (i+1)).val());
        currentTravelRequest.trips[i].returnDate = new Date($("#returnDate_" + (i+1)).val());
    }

    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},
"dp.change": function(e, tmpl){
    e.preventDefault()

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;

    for (i = 0; i < currentTravelRequest.trips.length; i++) {
        currentTravelRequest.trips[i].departureDate = new Date($("#departureDate_" + (i+1)).val());
        currentTravelRequest.trips[i].returnDate = new Date($("#returnDate_" + (i+1)).val());
    }

    tmpl.currentTravelRequest.set(currentTravelRequest);
    tmpl.updateTripNumbers();
},

'click #new-requisition-create': function(e, tmpl) {
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
            //if (currentTrip.transportationMode === "AIRLINE" && currentTrip.airlineId === ""){
            //    fieldsAreValid = false;
            //    validationErrors += ": select an airline";
            //}
        }
    }


    if (fieldsAreValid){
        //explicitely set status
        currentTravelRequest.status = "Pending";

        Meteor.call('TravelRequest2/create', currentTravelRequest, (err, res) => {
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
    }else{
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
            //if (currentTrip.transportationMode === "AIRLINE" && currentTrip.airlineId === ""){
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
        Template.instance().errorMessage.set("Validation errors" + validationErrors);
    }

}
});





/*****************************************************************************/
/* TravelRequisitionCreate: Helpers */
/*****************************************************************************/
Template.TravelRequisition2Create.helpers({
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
            return parseInt(index) >= currentTravelRequest.trips.length;
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
    isReturnTrip(){
        return Template.instance().currentTravelRequest.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "AIRLINE"? '':'none';
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
Template.TravelRequisition2Create.onCreated(function () {

    let self = this;

    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("flightroutes", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));

    let currentTravelRequest = {
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
        trips: [{
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

    self.currentTravelRequest =  new ReactiveVar();
    self.currentTravelRequest.set(currentTravelRequest);

    self.updateTripNumbers = () => {

        let currentTravelRequest = self.currentTravelRequest.curValue;
        const tripType = currentTravelRequest.type;

        currentTravelRequest.description = $("#description").val();
        currentTravelRequest.budgetCodeId = $("#budget-code").val();

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

            const toId = currentTravelRequest.trips[i].toId;
            const hotelNotRequired = currentTravelRequest.trips[i].hotelNotRequired;


            let totalDuration = 0;

            if (tripType === "Return"){
                const startDate = moment(currentTravelRequest.trips[i].departureDate);
                const endDate = moment(currentTravelRequest.trips[i].returnDate)
                const responseDate = moment(startDate).format('DD/MM/YYYY');
                const responseDate2 = moment(endDate).format('DD/MM/YYYY');

                console.log("responseDate")
                console.log(responseDate)

                console.log("responseDate2")
                console.log(responseDate2)

                totalDuration = endDate.diff(startDate, 'days');

                if (totalDuration < 0){
                    totalDuration = 0;
                }else{
                    totalDuration = totalDuration + 0.5;
                    //totalDuration = totalDuration;

                }
            }else if (tripType === "Multiple"){

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



            let perDiemCost = 0;
            let unadjustedPerDiemCost = 0;
            let originCityCurrreny = "NGN";
            let destinationCityCurrreny = "NGN";

            let toTravelCity = Travelcities.findOne({_id: currentTravelRequest.trips[i].toId});
            let fromTravelCity = Travelcities.findOne({_id: currentTravelRequest.trips[i].fromId});

            if(toTravelCity){
                destinationCityCurrreny = toTravelCity.currency;
            }

            if(fromTravelCity){
                originCityCurrreny = fromTravelCity.currency;
            }

            if (toTravelCity){
                unadjustedPerDiemCost = toTravelCity.perdiem;
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
            let hotel = Hotels.findOne({_id: currentTravelRequest.trips[i].hotelId});
            if (hotel){
                hotelRate = hotel.dailyRate;
            }

            currentTravelRequest.trips[i].totalHotelCost = (totalDuration - 0.5) * hotelRate;

            currentTravelRequest.trips[i].totalPerDiem = totalDuration * perDiemCost;
            currentTravelRequest.trips[i].totalDuration = totalDuration;
            currentTravelRequest.trips[i].perDiemCost = perDiemCost;
            currentTravelRequest.trips[i].originCityCurrreny = originCityCurrreny;
            currentTravelRequest.trips[i].hotelRate = hotelRate;
            currentTravelRequest.trips[i].destinationCityCurrreny = destinationCityCurrreny

            if (currentTravelRequest.trips[i].transportationMode !== "AIRLINE"){
                currentTravelRequest.trips[i].provideAirportPickup = false;
                currentTravelRequest.trips[i].originCityAirportTaxiCost = 0;
            }

            if (currentTravelRequest.trips[i].provideAirportPickup){
                if (fromTravelCity){
                    currentTravelRequest.trips[i].originCityAirportTaxiCost = fromTravelCity.airportPickupDropOffCost;
                }else{
                    currentTravelRequest.trips[i].originCityAirportTaxiCost = 0;
                }

                if (toTravelCity){
                    currentTravelRequest.trips[i].destinationCityAirportTaxiCost = toTravelCity.airportPickupDropOffCost;
                }else{
                    currentTravelRequest.trips[i].destinationCityAirportTaxiCost = 0;
                }

            }else{
                currentTravelRequest.trips[i].originCityAirportTaxiCost = 0;
            }

            if (currentTravelRequest.trips[i].provideGroundTransport){
                if (toTravelCity){
                    currentTravelRequest.trips[i].groundTransportCost = toTravelCity.groundTransport;
                }else{
                    currentTravelRequest.trips[i].groundTransportCost = 0;
                }
            }else{
                currentTravelRequest.trips[i].groundTransportCost = 0;
            }

            totalTripDuration = totalTripDuration + currentTravelRequest.trips[i].totalDuration;
            if (currentTravelRequest.trips[i].destinationCityCurrreny  === "NGN"){
                totalEmployeePerdiemNGN = totalEmployeePerdiemNGN + currentTravelRequest.trips[i].totalPerDiem;
            }else{
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
                self.currentTravelRequest.set(travelRequestDetails)

            }
        }
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
