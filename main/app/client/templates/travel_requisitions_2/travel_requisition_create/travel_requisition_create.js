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
        currentTravelRequest.totalEmployeeAmountPayableNGN = 0;
        currentTravelRequest.totalEmployeeAmountPayableUSD = 0;
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
                    hotelId: "",
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
                    hotelId: "",
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
                    hotelId: "",
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
                    hotelId: "",
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
    currentTravelRequest.trips[index].airlineId = "";
    currentTravelRequest.trips[index].airfareCost = 0;
    currentTravelRequest.trips[index].hotelId = "";
    currentTravelRequest.trips[index].hotelRate = 0;

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
     currentTravelRequest.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

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

},
});







//     let validation = tmpl.areInputsValid(description)
//     if(validation === true) {
//         let requisitionDoc = {}

//         requisitionDoc.description = description

//         let currentUserUnitId = Template.instance().unitId.get()
//         if(currentUserUnitId) {
//             requisitionDoc.unitId = currentUserUnitId
//         }
//         let businessUnitId = Session.get('context')

//         Meteor.call('TravelRequest/create', newTravelRequest,businessUnitId, requisitionDoc, function(err, res) {
//             if(!err) {
//                 swal({title: "Success", text: "Requisition is now pending approval", type: "success",
//                     confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
//                 }, () => {
//                     //Modal.hide()
//                 })
//             } else {
//                 swal('Validation error', err.message, 'error')
//             }
//         })
//     } else {
//         swal('Validation error', validation, 'error')
//     }
// }
// });


//'change .calculate': function(e, tmpl) {
//  e.preventDefault();
//$('#pay-type-title').val('populate automatically!');
//},
// "change .fieldInputField": _.throttle(function(e, tmpl) {
//     const fieldName = $(e.target).attr('name');
//     let inputVal = $(e.target).val().trim();
//     const customConfig = tmpl.businessUnitCustomConfig.get();

//     if(customConfig) {
//         let travelRequestConfig = customConfig.travelRequestConfig;
//         if(travelRequestConfig) {
//             let fields = travelRequestConfig.fields || [];
//             fields.forEach(field => {
//                 if(field.dbFieldName === fieldName) {
//                     if(!tmpl[fieldName]) {
//                         tmpl[fieldName] = new ReactiveVar();
//                     }

//                     if(field.type === 'String' || field.type === 'TextArea') {
//                         tmpl[fieldName].set(inputVal)
//                     } else if(field.type === 'Date' || field.type === 'Time') {
//                         if(inputVal && inputVal.length > 0) {
//                             const date = new Date(inputVal)
//                             const momentObj = moment(date)

//                             if(momentObj.isBefore(moment())) {
//                                 if(!field.allowDatesInPast) {
//                                     tmpl[fieldName].set(null)
//                                     $(e.target).val(null)
//                                 } else {
//                                     if(inputVal && inputVal.length > 0)
//                                     tmpl[fieldName].set(new Date(inputVal))
//                                     else
//                                     tmpl[fieldName].set(null)
//                                 }
//                             } else {
//                                 if(inputVal && inputVal.length > 0)
//                                 tmpl[fieldName].set(new Date(inputVal))
//                                 else
//                                 tmpl[fieldName].set(null)
//                             }
//                         } else {
//                             tmpl[fieldName].set(null)
//                             $(e.target).val(null)
//                         }
//                     }
//                 }
//             })
//         }
//     }
// }, 200),
// "change .currencyField": _.throttle(function(e, tmpl) {
//     var currency = $(e.target).val().trim();

//     tmpl.selectedCurrency.set(currency)
//     Meteor.defer(function() {
//         $('.costInputField').selectpicker('refresh');
//     });
// }, 200),
// "change .numberOfDaysField": _.throttle(function(e, tmpl) {
//     const fieldName = $(e.target).attr('name');
//     var text = $(e.target).val().trim();

//     if (!text || text.trim().length === 0) {
//         text = "0"
//     }
//     let daysAsNumber = parseFloat(text)
//     if(isNaN(daysAsNumber)) {
//         daysAsNumber = 0
//     }

//     tmpl.selectedNumDays.set(daysAsNumber)
// }, 200),
// "change .costCenterField": _.throttle(function(e, tmpl) {
//     var val = $(e.target).val().trim();

//     if (!val || val.trim().length === 0) {
//         tmpl.selectedCostCenter.set(null)
//     } else {
//         tmpl.selectedCostCenter.set(val)
//     }
// }, 200),
// "change .costInputField": _.throttle(function(e, tmpl) {
//     const fieldName = $(e.target).attr('name');
//     var text = $(e.target).val().trim();

//     if (!text || text.trim().length === 0) {
//         text = "0"
//     }
//     let costAsNumber = parseFloat(text)
//     if(isNaN(costAsNumber)) {
//         costAsNumber = 0
//     }

//     tmpl[fieldName].set(costAsNumber)
//     tmpl.updateTotalTripCost()
// }, 200),
// "keyup .costInputField": _.throttle(function(e, tmpl) {
//     const fieldName = $(e.target).attr('name');
//     var text = $(e.target).val().trim();

//     if (!text || text.trim().length === 0) {
//         text = "0"
//     }
//     let costAsNumber = parseFloat(text)
//     if(isNaN(costAsNumber)) {
//         costAsNumber = 0
//     }

//     tmpl[fieldName].set(costAsNumber)
//     tmpl.updateTotalTripCost()
// }, 200),

// 'click #new-requisition-save-draft': function(e, tmpl) {
//     e.preventDefault()
//     let requisitionDoc = {}

//     let currentUserUnitId = Template.instance().unitId.get()
//     if(currentUserUnitId) {
//         requisitionDoc.unitId = currentUserUnitId
//     }
//     //--
//     const customConfig = tmpl.businessUnitCustomConfig.get();
//     if(customConfig) {
//         let travelRequestConfig = customConfig.travelRequestConfig;
//         if(travelRequestConfig) {
//             requisitionDoc.currency = tmpl.selectedCurrency.get()
//             requisitionDoc.numberOfDays = tmpl.selectedNumDays.get()
//             requisitionDoc.costCenterCode = tmpl.selectedCostCenter.get()

//             let fields = travelRequestConfig.fields || [];
//             fields.forEach(field => {
//                 if(tmpl[field.dbFieldName]) {
//                     const fieldVal = tmpl[field.dbFieldName].get();
//                     requisitionDoc[field.dbFieldName] = fieldVal;
//                 }
//             })

//             requisitionDoc.tripCosts = {}
//             let costs = travelRequestConfig.costs || [];
//             costs.forEach(cost => {
//                 let costAmount = tmpl[cost.dbFieldName].get();
//                 if(cost.realValueMultiplier && cost.realValueMultiplier === 'NumberOfDaysOnTrip') {
//                     const selectedNumDays = tmpl.selectedNumDays.get()
//                     costAmount = costAmount * selectedNumDays
//                 }
//                 requisitionDoc.tripCosts[cost.dbFieldName] = costAmount;
//             })
//         }
//     }
//     //--
//     let businessUnitId = Session.get('context')

//     Meteor.call('TravelRequest/createDraft', businessUnitId, requisitionDoc, null, function(err, res) {
//         if(!err) {
//             swal({title: "Success", text: "Requisition Draft saved", type: "success",
//             confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
//         }, () => {
//             // Modal.hide()
//         })
//     } else {
//         swal('Validation error', err.message, 'error')
//     }
// })
// },
// 'click #new-requisition-create': function(e, tmpl) {
//     e.preventDefault()

//    // let validation = tmpl.areInputsValid(tmpl)
//     if(validation === true) {
//         let requisitionDoc = {}

//         let currentUserUnitId = Template.instance().unitId.get()
//         if(currentUserUnitId) {
//             requisitionDoc.unitId = currentUserUnitId
//         }
//         //--
//         // const customConfig = tmpl.businessUnitCustomConfig.get();
//         // if(customConfig) {
//         //     let travelRequestConfig = customConfig.travelRequestConfig;
//         //     if(travelRequestConfig) {
//         //         requisitionDoc.currency = tmpl.selectedCurrency.get()
//         //         requisitionDoc.numberOfDays = tmpl.selectedNumDays.get()
//         //         requisitionDoc.costCenterCode = tmpl.selectedCostCenter.get()

//         //         let fields = travelRequestConfig.fields || [];
//         //         fields.forEach(field => {
//         //             if(tmpl[field.dbFieldName]) {
//         //                 const fieldVal = tmpl[field.dbFieldName].get();
//         //                 requisitionDoc[field.dbFieldName] = fieldVal;
//         //             }
//         //         })
//         //         //--
//         //         requisitionDoc.tripCosts = {}
//         //         let costs = travelRequestConfig.costs || [];
//         //         costs.forEach(cost => {
//         //             let costAmount = tmpl[cost.dbFieldName].get();

//         //             if(cost.realValueMultiplier && cost.realValueMultiplier === 'NumberOfDaysOnTrip') {
//         //                 const selectedNumDays = tmpl.selectedNumDays.get()
//         //                 costAmount = costAmount * selectedNumDays
//         //             }

//         //             requisitionDoc.tripCosts[cost.dbFieldName] = costAmount;
//         //         })

//         //     }
//         // }
//         //--
//         let businessUnitId = Session.get('context')

//         Meteor.call('TravelRequest/create', businessUnitId, requisitionDoc, function(err, res) {
//             if(!err) {
//                 swal({title: "Success", text: "Requisition is now pending approval", type: "success",
//                 confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
//             }, () => {
//                 //Modal.hide()
//             })
//         } else {
//             swal('Validation error', err.message, 'error')
//         }
//     })
// } else {
//     swal('Validation error', validation, 'error')
// }
// }


/*****************************************************************************/
/* TravelRequisitionCreate: Helpers */
/*****************************************************************************/
Template.TravelRequisition2Create.helpers({

    'checked': (prop) => {
        if(Template.instance().data)
        return Template.instance().data[prop];
        return false;
    },
    travelcityList() {
        return  Travelcities.find();
    },
    budgetList() {
        return  Budgets.find();
    },
    airlineList(toId) {
        const travelcity = Travelcities.findOne({_id: toId});
        if(travelcity){
            return Airlines.find({isInternational: travelcity.isInternational});
        }
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
            return currentTravelRequest.budgetCodeId === val ? selected="selected" : '';
        }

    },
    formatDate(dateVal){
        return moment(dateVal).format('YYYY-MM-DD');
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
            return currentTravelRequest.trips[parseInt(index) - 1].fromId === val ? selected="selected" : '';
        }

    },
    toIdSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            return currentTravelRequest.trips[parseInt(index) - 1].toId === val ? selected="selected" : '';
        }
    },
    transportModeSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === val ? selected="selected" : '';
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
            return currentTravelRequest.trips[parseInt(index) - 1].carOption === val ? selected="selected" : '';
        }
    },
    airlineSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            return currentTravelRequest.trips[parseInt(index) - 1].airlineId === val ? selected="selected" : '';
        }
    },
    hotelSelected(val, index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            return currentTravelRequest.trips[parseInt(index) - 1].hotelId === val ? selected="selected" : '';
        }
    },

    travelTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.type === val ? checked="checked" : '';
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
    // 'amountNonPaybelToEmp': function() {
    //     return Template.instance().amountNonPaybelToEmp.get()
    // },
    // 'amoutPayableToEmp': function() {
    //     return Template.instance().amoutPayableToEmp.get()
    // },
    // 'totalTripCost': function() {
    //     return Template.instance().totalTripCost.get()
    // },
    // 'isEqual': (a, b) => {
    //     return a === b;
    // },
    // 'fields': function() {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         return travelRequestConfig.fields
    //     }
    // },
    // 'costs': function() {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         return travelRequestConfig.costs
    //     }
    // },
    // 'currencyEnabled': function() {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         if(travelRequestConfig) {
    //             return travelRequestConfig.isCurrencyEnabled
    //         }
    //     }
    // },
    // 'allowedCurrencies': function() {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         if(travelRequestConfig) {
    //             return travelRequestConfig.allowedCurrencies
    //         }
    //     }
    // },
    // 'numberDaysEnabled': function() {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         if(travelRequestConfig) {
    //             return travelRequestConfig.isNumberOfDaysEnabled
    //         }
    //     }
    // },
    // 'costCenterEnabled': function() {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         if(travelRequestConfig) {
    //             return travelRequestConfig.isCostCenterEnabled
    //         }
    //     }
    // },
    // 'costHasAllowedValues': function(dbFieldName) {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         const costs = travelRequestConfig.costs || []
    //         const fieldCost = _.find(costs, cost => cost.dbFieldName === dbFieldName)
    //         if(fieldCost) {
    //             return fieldCost.hasAllowedValues;
    //         }
    //     }
    // },
    // 'costAllowedValues': function(dbFieldName) {
    //     let customConfig = Template.instance().businessUnitCustomConfig.get()
    //     if(customConfig) {
    //         const travelRequestConfig = customConfig.travelRequestConfig;
    //         const costs = travelRequestConfig.costs || []
    //         const fieldCost = _.find(costs, cost => cost.dbFieldName === dbFieldName)
    //         if(fieldCost) {
    //             const selectedCurrency = Template.instance().selectedCurrency.get()
    //             if(selectedCurrency) {
    //                 return fieldCost.allowedValues[selectedCurrency];
    //             }
    //         }
    //     }
    // },
    // 'units': function () {
    //     return Template.instance().units.get()
    // },





});

/*****************************************************************************/
/* TravelRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2Create.onCreated(function () {

    let self = this;

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
        totalEmployeeAmountPayableNGN: 0,
        totalEmployeeAmountPayableUSD: 0,
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
            hotelId: "",
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
        let totalEmployeeAmountPayableNGN = 0;
        let totalEmployeeAmountPayableUSD = 0;
        let totalFlightCostNGN = 0;
        let totalFlightCostUSD = 0;
        let totalHotelCostNGN = 0;
        let totalHotelCostUSD = 0;
        let totalTripCostNGN = 0;
        let totalTripCostUSD = 0;

        for (i = 0; i < currentTravelRequest.trips.length; i++) {

            const toId = currentTravelRequest.trips[i].toId;
            const hotelNotRequired = currentTravelRequest.trips[i].hotelNotRequired;


            let totalDuration = 0;

            if (tripType === "Return"){
                const startDate = moment(currentTravelRequest.trips[i].departureDate);
                const endDate = moment(currentTravelRequest.trips[i].returnDate)
                totalDuration = endDate.diff(startDate, 'days');

                if (totalDuration < 0){
                    totalDuration = 0;
                }else{
                    //totalDuration = totalDuration + 0.5;
                    totalDuration = totalDuration;

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
                totalEmployeeAmountPayableNGN = totalEmployeeAmountPayableNGN + currentTravelRequest.trips[i].totalPerDiem;
            }else{
                totalEmployeeAmountPayableUSD = totalEmployeeAmountPayableUSD + currentTravelRequest.trips[i].totalPerDiem;
            }

            if (fromTravelCity && (fromTravelCity.currency   === "NGN")){
                totalEmployeeAmountPayableNGN = totalEmployeeAmountPayableNGN + currentTravelRequest.trips[i].originCityAirportTaxiCost;
            }else{
                totalEmployeeAmountPayableUSD = totalEmployeeAmountPayableUSD + currentTravelRequest.trips[i].originCityAirportTaxiCost;
            }

            if (toTravelCity && (toTravelCity.currency   === "NGN")){
                totalEmployeeAmountPayableNGN = totalEmployeeAmountPayableNGN + currentTravelRequest.trips[i].destinationCityAirportTaxiCost;
            }else{
                totalEmployeeAmountPayableUSD = totalEmployeeAmountPayableUSD + currentTravelRequest.trips[i].destinationCityAirportTaxiCost;
            }

            if (currentTravelRequest.trips[i].destinationCityCurrreny === "NGN"){
                totalEmployeeAmountPayableNGN = totalEmployeeAmountPayableNGN + ((totalDuration - 0.5) * currentTravelRequest.trips[i].groundTransportCost);
                totalHotelCostNGN = totalHotelCostNGN + currentTravelRequest.trips[i].totalHotelCost;
            }else{
                totalEmployeeAmountPayableUSD = totalEmployeeAmountPayableUSD + ((totalDuration - 0.5) * currentTravelRequest.trips[i].groundTransportCost);
                totalHotelCostUSD = totalHotelCostUSD + currentTravelRequest.trips[i].totalHotelCost;
            }


        }

        totalTripCostNGN = totalEmployeeAmountPayableNGN + totalHotelCostNGN;
        totalTripCostUSD = totalEmployeeAmountPayableUSD + totalHotelCostUSD;

        currentTravelRequest.totalTripDuration = totalTripDuration;
        currentTravelRequest.totalEmployeeAmountPayableNGN = totalEmployeeAmountPayableNGN;
        currentTravelRequest.totalEmployeeAmountPayableUSD = totalEmployeeAmountPayableUSD;
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

    self.getUnitForPosition = (entity) => {
        let possibleUnitId = entity.parentId
        if(possibleUnitId) {
            let possibleUnit = EntityObjects.findOne({_id: possibleUnitId})
            if(possibleUnit) {
                if(possibleUnit.otype === 'Unit') {
                    return possibleUnit
                } else {
                    return self.getUnitForPosition(possibleUnit)
                }
            } else {
                return null
            }
        } else {
            return null
        }
    }

    self.autorun(function(){
        if(unitsSubscription.ready()){
            self.units.set(EntityObjects.find({otype: 'Unit'}).fetch())

            let employeeProfile = Meteor.user().employeeProfile
            if(employeeProfile && employeeProfile.employment && employeeProfile.employment.position) {
                let userPositionId = employeeProfile.employment.position
                let positionSubscription = self.subscribe('getEntity', userPositionId)

                if(positionSubscription.ready()){
                    let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
                    let unit = self.getUnitForPosition(userPosition)
                    if(unit) {
                        self.unitId.set(unit._id)
                    } else {
                        self.unitId.set(null)
                    }
                }
            }
        }


    })

    // self.areInputsValid = function(tmpl) {
    //     const customConfig = tmpl.businessUnitCustomConfig.get();
    //     let isOk = false;

    //     if(customConfig) {
    //         let travelRequestConfig = customConfig.travelRequestConfig;
    //         if(travelRequestConfig) {
    //             let fields = travelRequestConfig.fields || [];

    //             fields.forEach(field => {
    //                 if(field.isRequired) {
    //                     if(tmpl[field.dbFieldName]) {
    //                         const fieldVal = tmpl[field.dbFieldName].get();
    //                         if(!fieldVal) {
    //                             isOk = `Please fill ${field.label}`
    //                         }
    //                     } else {
    //                         isOk = `Please fill ${field.label}`
    //                     }
    //                 }
    //             })
    //         }
    //     }
    //     if(isOk) {
    //         return isOk
    //     } else {
    //         return true
    //     }
    // }

    // self.updateTotalTripCost = () => {
    //     const customConfig = self.businessUnitCustomConfig.get();
    //     if(customConfig) {
    //         let travelRequestConfig = customConfig.travelRequestConfig;

    //         if(travelRequestConfig) {
    //             let costs = travelRequestConfig.costs || [];
    //             let nonPayableToEmp = 0;
    //             let payableToEmp = 0;
    //             let totalCosts = 0;

    //             costs.forEach(cost => {
    //                 let costAmount = self[cost.dbFieldName].get();
    //                 if(cost.realValueMultiplier && cost.realValueMultiplier === 'NumberOfDaysOnTrip') {
    //                     const selectedNumDays = self.selectedNumDays.get()
    //                     costAmount = costAmount * selectedNumDays
    //                 }
    //                 totalCosts += costAmount;

    //                 if(cost.isPayableToStaff) {
    //                     payableToEmp += costAmount;
    //                 } else if(!cost.isPayableToStaff) {
    //                     nonPayableToEmp += costAmount;
    //                 }
    //             })
    //             self.amountNonPaybelToEmp.set(nonPayableToEmp)
    //             self.amoutPayableToEmp.set(payableToEmp)
    //             self.totalTripCost.set(totalCosts)
    //         }
    //     } else {
    //         self.amountNonPaybelToEmp.set(0)
    //         self.amoutPayableToEmp.set(0)
    //         self.totalTripCost.set(0)
    //     }
    // }
});

Template.TravelRequisition2Create.onRendered(function () {
    $('select.dropdown').dropdown();

    this.$('.datetimepicker').datetimepicker(

        {format: 'YYYY-MM-DD', minDate: new Date()}
    );


});

Template.TravelRequisition2Create.onDestroyed(function () {
});
