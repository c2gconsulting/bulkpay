/*****************************************************************************/
/* ApproveEmployeeTimeManagementIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.ApproveEmployeeTimeManagementIndex.events({
    'click #createTravelRequisition  ': function(e, tmpl) {
        e.preventDefault()
        Modal.show('TravelRequisition2Create')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        Modal.show('TimeRecordSupervisorDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTimeRecordsBySupervisor(skip)
        Template.instance().timeRecordsBySupervisor.set(newPageOfProcurements)

        Template.instance().currentPage.set(pageNumAsInt)
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
/* ApproveEmployeeTimeManagementIndex: Helpers */
/*****************************************************************************/
Template.ApproveEmployeeTimeManagementIndex.helpers({
  'errorMessage': function() {
      return Template.instance().errorMessage.get()
  },
  'checked': (prop) => {
      if(Template.instance().data)
      return Template.instance().data[prop];
      return false;
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
    timeRecordChecked(val){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val){
            return currentTimeRecord.type === val ? checked="checked" : '';
        }
    },
    'timeRecordsBySupervisor': function() {
        return Template.instance().timeRecordsBySupervisor.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = TimeRecord.find({$and : [
            { supervisorId: Meteor.userId()},
            { $or : [ { status : "Approved By HOD" }, { status : "Pending" }, { status : "Rejected By HOD"}] }
        ]}).count()

        let result = Math.floor(totalNum/limit)
        var remainder = totalNum % limit;
        if (remainder > 0)
            result += 2;
        return result;
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

});

/*****************************************************************************/
/* ApproveEmployeeTimeManagementIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.ApproveEmployeeTimeManagementIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.timeRecordsBySupervisor = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.totalTripCost = new ReactiveVar(0)

    self.getTimeRecordsBySupervisor = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        //options.sort["status"] = sortDirection;
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip
        return TimeRecord.find({
            $and : [
                { supervisorId: Meteor.userId()},
                { $or : [ { status : "Approved By HOD" }, { status : "Pending" }, { status : "Rejected By HOD"}] }
            ]
        }, options);
            }

    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let travelRequestsBySupervisorSub = self.subscribe('TimeRecordsBySupervisor', businessUnitId, Meteor.userId());
        if(travelRequestsBySupervisorSub.ready()) {
            self.timeRecordsBySupervisor.set(self.getTimeRecordsBySupervisor(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.ApproveEmployeeTimeManagementIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.ApproveEmployeeTimeManagementIndex.onDestroyed(function () {
});
