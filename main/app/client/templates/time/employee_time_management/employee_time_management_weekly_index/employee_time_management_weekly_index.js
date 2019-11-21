/*****************************************************************************/
/* EmployeeTimeManagement: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.EmployeeTimeManagement.events({
  'click #createTimeRecordWeekOne': function(e){
      e.preventDefault();
      Session.set("weekIndex", "1");

      Router.go('employee.time.management.create',{_id: Session.get('context')});
  },
  'click #createTimeRecordWeekTwo': function(e){
      e.preventDefault();
      Session.set("weekIndex", "2");

      Router.go('employee.time.management.create', {_id: Session.get('context')});
  },
  'click #createTimeRecordWeekThree': function(e){
        e.preventDefault();
        Session.set("weekIndex", "3");

        Router.go('employee.time.management.create', {_id: Session.get('context')});
    },

    'click #createTimeRecordWeekFour': function(e){
          e.preventDefault();
          Session.set("weekIndex", "4");

          Router.go('employee.time.management.create', {_id: Session.get('context')});
      },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();




        if ((status === "Draft") || (status === "Pending") || (status === "Rejected By Supervisor") || (status === "Rejected By Budget Holder")){
            Modal.show('TravelRequisition2Create', invokeReason);
        }else{
            Modal.show('TravelRequisition2Detail', invokeReason);
        }

    },

    'click .paginateLeft': function(e, tmpl) {

    },
    'click .paginateRight': function(e, tmpl) {

    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

Template.registerHelper('repeat', function(max) {
    return _.range(max - 1); // undescore.js but every range impl would work
});

/*****************************************************************************/
/* EmployeeTimeManagement: Helpers */
/*****************************************************************************/
Template.EmployeeTimeManagement.helpers({
    'travelRequestsICreated': function() {
        return Template.instance().travelRequestsICreated.get()
    },
    'month': function(){
        return Core.months();
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear(); x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    },

    'totalTripCostNGN': function(currentTravelRequest) {
        if(currentTravelRequest) {
            currentTravelRequest.totalTripCostNGN = totalTripCostNGN;

            return totalTripCostNGN;
        }
    },
    'getPrintUrl': function(currentTravelRequest) {
        if(currentTravelRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTravelRequest._id
        }
    }

});

/*****************************************************************************/
/* EmployeeTimeManagement: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTimeManagement.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')
//    Session.set("weekIndex", "1");

    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.travelRequestsICreated = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.totalTripCost = new ReactiveVar(0)



    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {

    })
});

Template.EmployeeTimeManagement.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.EmployeeTimeManagement.onDestroyed(function () {
});
