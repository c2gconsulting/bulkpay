/*****************************************************************************/
/* TravelRequisition2IndexGroup: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisition2IndexGroup.events({
    "keyup #logSearch": function (e, tmpl) {
        let searchTerm = tmpl
            .$("#logSearch")
            .val()
            .trim();
        tmpl.elements.set("searchText", searchTerm);
        if (searchTerm.length) {
            if (searchTerm !== tmpl.lastSearchText) {
                Session.set("searchQueryReturned", false);
                Session.set("searchActive", true);
                tmpl.setSearchFunctionTimeOut(searchTerm);
            }
        } else {
            tmpl.setSearchFunctionTimeOut(searchTerm);
            tmpl.limit.set(getLimit());
            Session.set("searchQueryReturned", false);
            Session.set("searchActive", false);
        }
        tmpl.lastSearchText = searchTerm;
    },
    "submit form": function (event) {
        event.preventDefault();
        let start = event.target.from.value;
        let end = event.target.to.value;
        let events = [];
        let collections = [];
        let selectedEvents = $("#event").find("option:selected");
        let selectedCollections = $("#collection").find("option:selected");

        _.each(selectedEvents, select => {
            events.push(select.value);
        });


        _.each(selectedCollections, select => {
            collections.push(select.value);
        })

        let duration = event.target.by.value;
        let filterConditions = {
            startDate: new Date(start),
            endDate: end ? moment(new Date(end))
                .endOf("day")
                .toDate() : moment(new Date()).endOf("day").toDate(),
            events,
            collections,
            duration: duration,
            searchText: Template.instance().elements.get("searchText")
        };
        Template.instance().reportData.set("filterConditions", filterConditions);
        Template.instance().setSearchFunctionTimeOut(filterConditions.searchText);
    },

    'click #createTravelRequisition  ': function(e, tmpl) {
        e.preventDefault()
        Modal.show('TravelRequisition2Create')
    },
    'click .edit-requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();


      //explicitly set status
      let currentStatus = "Pending";
      let currentPosition = 'HOD'

    //   if (tmpl.isHOD.curValue) {
    //     currentPosition = 'HOD';
    //     currentStatus = 'Approved By HOD'
    //   }

      if (tmpl.isDirectManager.curValue) {
        currentPosition = 'MANAGER';
        currentStatus = 'Approved By MD'
      }

      if (tmpl.isGcoo.curValue) {
        currentPosition = "GCOO";
        currentStatus = 'Approved By GCOO'
      }

      if (tmpl.isGceo.curValue) {
        currentPosition = "GCEO"
        currentStatus = 'Approved By GCEO'
      }

      console.log('status', status)


      if ((status === "Draft") || (status === "Pending") || (status === currentStatus) || (status === "Rejected By HOD") || (status === "Rejected By HOC")  || (status === "Rejected By MD")){
            Modal.show('TravelRequisition2Create', invokeReason);
        } else if (!status.includes('Retire')) {
            Modal.show('TravelRequisition2ExtensionDetail', invokeReason);
        }
    },

    'click .view-requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();




        Modal.show('TravelRequisition2Detail', invokeReason);

    },
    // 'click .requisitionRow': function(e, tmpl) {
    //     e.preventDefault()
    //     let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

    //     let invokeReason = {}
    //     invokeReason.requisitionId = requisitionId
    //     invokeReason.reason = 'edit'
    //     invokeReason.approverId = null

    //     const status = $("#status_" + requisitionId).html();




    //     if ((status === "Draft") || (status === "Pending") || (status === "Rejected By HOD") || (status === "Rejected By MD")){
    //         Modal.show('TravelRequisition2Create', invokeReason);
    //     } else if (!status.includes('Retire')) {
    //         Modal.show('TravelRequisition2ExtensionDetail', invokeReason);
    //     } else{
    //         Modal.show('TravelRequisition2Detail', invokeReason);
    //     }

    // },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTravelRequestsICreated(skip)
        Template.instance().travelRequestsICreated.set(newPageOfProcurements)

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
/* TravelRequisition2IndexGroup: Helpers */
/*****************************************************************************/
Template.TravelRequisition2IndexGroup.helpers({
    searchText: function () {
        return Template.instance().elements.get("searchText");
    },
    searchActive: function () {
        return Session.get("searchActive");
    },

    searchQueryReturned: function () {
        return Session.get("searchQueryReturned");
    },

    'travelRequestsICreated': function() {
        return Template.instance().travelRequestsICreated.get()
    },
    getStatus: function (status, currentTravelRequest) {
        const lastApproval = "Approved By MD";
        const { trips } = currentTravelRequest;
        const departureDate = trips && trips[0].departureDate
        const returnDate = trips && trips[0].returnDate
        const hasStartedTrip = new Date() > new Date(departureDate);
        const hasEndedTrip = new Date() > new Date(returnDate);
        console.log('departureDate', departureDate)
        if (status === lastApproval && hasStartedTrip && !hasEndedTrip) {
            return 'Ongoing'
        } else if (status === lastApproval && hasStartedTrip && hasEndedTrip) {
            return 'Completed'
        }  else if (status.includes('Approved')) return 'Approved'
        return status
    },
    // 'hasUnretiredTrips': function() {

    //     let unretiredCount = TravelRequisition2s.find({
    //         $and : [
    //             { retirementStatus: "Not Retired"},
    //             { $or : [ { status : "Pending" }, { status : "Approved By HOD" }, { status : "Approved By MD"}] }
    //         ]}).count()
    //     console.log("Unretired Count: " + unretiredCount);
    //     if (unretiredCount > 0){
    //         return true;
    //     }else{
    //         return false;
    //     }

    // },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()

        // const groupTrip = { tripCategory: 'GROUP'}
        const { groupTripCondition } = Core.getTravelQueries()
        let totalNum = TravelRequisition2s.find(groupTripCondition).count()

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
    'getPrintUrl': function(currentTravelRequest) {
        if(currentTravelRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTravelRequest._id
        }
    }

});

/*****************************************************************************/
/* TravelRequisition2IndexGroup: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2IndexGroup.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.travelRequestsICreated = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.currentUser = new ReactiveVar();
    self.isHOD = new ReactiveVar();
    self.isDirectManager = new ReactiveVar();
    self.isGceo = new ReactiveVar();
    self.isGcoo = new ReactiveVar();
    const currentUser = Meteor.user();
    self.currentUser.set(currentUser || {});


    Core.queryClient('account/isHod', Meteor.userId(), self.isHOD)
    Core.queryClient('account/isManager', Meteor.userId(), self.isDirectManager)
    Core.queryClient('account/gcoo', Meteor.userId(), self.isGcoo)
    Core.queryClient('account/gceo', Meteor.userId(), self.isGceo)


    self.totalTripCost = new ReactiveVar(0)

    // self.getTravelRequestsICreated = function(skip) {
    //     let sortBy = "createdAt";
    //     let sortDirection = -1;

    //     let options = {};
    //     options.sort = {};
    //     options.sort[sortBy] = sortDirection;
    //     options.limit = self.NUMBER_PER_PAGE.get();
    //     options.skip = skip

    //     // const groupTrip = { tripCategory: 'GROUP'}
    //     const { groupTripCondition } = Core.getTravelQueries()
    //     return TravelRequisition2s.find(groupTripCondition, options);
    // }

    self.subscribe('getCostElement', businessUnitId)

    self.getTravelRequestsICreated = function (skip, queryObject = {}) {
        let sortBy = "createdAt";
        let sortDirection = -1;
    
        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip;
    
        const { groupTripCondition } = Core.getTravelQueries();
        // const individualTrip = { tripCategory: { $nin: ['GROUP', 'THIRD_PARTY_CLIENT'] } };
    
        const { searchText, queryId } = queryObject;
        console.log('searchText', searchText)
        if (queryId || searchText) {
            console.log('queryObject -- searchText', searchText)
          const conditions = { ...groupTripCondition };
          let filter = {
            $or: [
              { description: { $regex: `${searchText}`, $options: "i" } },
              { status: { $regex: `${searchText}`, $options: "i" } },
              { type: { $regex: `${searchText}`, $options: "i" } },
              { costCenter: { $regex: `${searchText}`, $options: "i" } },
              { destinationType: { $regex: `${searchText}`, $options: "i" } },
              {
                "tripFor.noOfIndividuals": {
                  $regex: `${searchText}`,
                  $options: "i",
                },
              },
              {
                "tripFor.individuals.fullName": {
                  $regex: `${searchText}`,
                  $options: "i",
                },
              },
              {
                "tripFor.individuals.firstname": {
                  $regex: `${searchText}`,
                  $options: "i",
                },
              },
              {
                "tripFor.individuals.lastname": {
                  $regex: `${searchText}`,
                  $options: "i",
                },
              },
              {
                "tripFor.individuals.email": {
                  $regex: `${searchText}`,
                  $options: "i",
                },
              },
            //   { "user.email": { $regex: `${searchText}`, $options: "i" } },
            ],
          };
    
          if (conditions["$and"] && conditions["$and"][1]["$or"]) {
            conditions["$and"][1]["$or"] = [
              ...conditions["$and"][1]["$or"],
              ...filter.$or,
            ];
            filter = { ...conditions };
          } else {
            filter = {
              ...conditions,
              ...filter,
            };
          }
          try {
            console.log('filter -- filter', filter)

            let travels;
            if (searchText) {
                travels = TravelRequisition2s.find({ $and: [filter] });
            } else {
                options.skip = 0;
                travels = TravelRequisition2s.find(groupTripCondition, options)
            }
    
            let currentQueryIds = instance.elements.get("queryIds");
            if (
              queryObject.queryId === currentQueryIds[currentQueryIds.length - 1]
            ) {
              // instance.searchResults.set("results", results);
              instance.elements.set("queryIds", []);
              Session.set("searchQueryReturned", true);
              return travels;
            }
          } catch (error) {
            console.log(error);
          }
        }
        console.log('searchText nullllll', searchText)

        return TravelRequisition2s.find(groupTripCondition, options);
    };

    self.subscribe('getCostElement', businessUnitId)
    // LogSubs.clear();
    let logStatusFilter = Session.get("logsListStatusFilter");
    let dFilter = Session.get("logsListDurationFilter")
        ? Session.get("logsListDurationFilter")
        : 12;
    let startDate = moment().subtract(dFilter, "months")._d;
    let logsListType = Session.get("logsListType");
    Session.set("startDate", startDate);

    if (!logsListType) {
        Session.set("logsListType", "standardOrders");
    }

    if (!logStatusFilter) {
        // Session.set("logsListStatusFilter", "OPEN");
        Session.set("logsListDurationFilter", 12);
    }

    if (!Session.get("logSortBy")) {
        Session.set("logSortBy", "createdAt");
        Session.set("logSortDirection", -1);
    }

    if (!Session.get("searchActive")) {
        Session.set("searchActive", false);
    }

    let instance = this;

    instance.reportData = new ReactiveDict();

    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    instance.ready = new ReactiveVar();

    instance.searchResults = new ReactiveDict();
    instance.searchResults.set("results", []);
    instance.searchFunctionTimeOut = null;
    instance.elements = new ReactiveDict();
    instance.elements.set("queryIds", []);
    instance.lastSearchText = "";

    if (!instance.reportData.get("filterConditions")) {
        let filterConditions = {};
        instance.reportData.set("filterConditions", filterConditions);
    }

    let query = function (queryObject) {
        //Core.SearchConnection.call('search/local', 'logs', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
        const filter = instance.reportData.get("filterConditions");
        Meteor.call("search/tripRequest", queryObject.searchTerm, filter , function (
            error,
            results
        ) {
            if (!error) {
                let currentQueryIds = instance.elements.get("queryIds");
                if (
                    queryObject.queryId === currentQueryIds[currentQueryIds.length - 1]
                ) {
                    instance.searchResults.set("results", results);
                    instance.elements.set("queryIds", []);
                    Session.set("searchQueryReturned", true);
                }
            } else {
                console.log(error);
            }
        });
    };

    instance.setSearchFunctionTimeOut = function (searchTerm) {
        Meteor.clearTimeout(instance.searchFunctionTimeOut);
        let queryId = Random.id();
        instance.searchFunctionTimeOut = Meteor.setTimeout(function () {
            console.log('searchTerm', searchTerm)
            instance.travelRequestsICreated.set(self.getTravelRequestsICreated(200, {
                searchText: searchTerm,
                queryId: queryId
            }));
        }, 500);
        let currentQueryIds = instance.elements.get("queryIds");
        currentQueryIds.push(queryId);
        instance.elements.set("queryIds", currentQueryIds);
    };

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let employeeProfile = Meteor.user().employeeProfile
        if(employeeProfile && employeeProfile.employment && employeeProfile.employment.position) {
            let userPositionId = employeeProfile.employment.position

            let positionSubscription = self.subscribe('getEntity', userPositionId)
        }

        let travelRequestsCreatedSub = self.subscribe('TravelRequestsICreated', businessUnitId, limit, sort)
        if(travelRequestsCreatedSub.ready()) {
            self.travelRequestsICreated.set(self.getTravelRequestsICreated(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.TravelRequisition2IndexGroup.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TravelRequisition2IndexGroup.onDestroyed(function () {
});

function getLimit() {
    return 20;
}
