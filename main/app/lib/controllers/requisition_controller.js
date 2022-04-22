RequisitionController = BusinessUnitController.extend({

    // a place to put your subscriptions
    // this.subscribe('items');
    // // add the subscription to the waitlist
    // this.subscribe('item', this.params._id).wait();

    subscriptions: function() {
    },

    // Subscriptions or other things we want to "wait" on. This also
    // automatically uses the loading hook. That's the only difference between
    // this option and the subscriptions option above.
    // return Meteor.subscribe('post', this.params._id);

    waitOn: function () {
    },

    // A data function that can be used to automatically set the data context for
    // our layout. This function can also be used by hooks and plugins. For
    // example, the "dataNotFound" plugin calls this function to see if it
    // returns a null value, and if so, renders the not found template.
    // return Posts.findOne({_id: this.params._id});

    data: function () {
        return BusinessUnits.findOne({_id: this.params._id});
    },

    // You can provide any of the hook options

    onRun: function () {
        this.next();
    },
    onRerun: function () {
        this.next();
    },
    onBeforeAction: function () {
        this.next();
    },

    // The same thing as providing a function as the second parameter. You can
    // also provide a string action name here which will be looked up on a Controller
    // when the route runs. More on Controllers later. Note, the action function
    // is optional. By default a route will render its template, layout and
    // regions automatically.
    // Example:
    //  action: 'myActionFunction'
    // action: function () {
    //   this.render();
    // },
    showProcurementRequisitionsList: function() {
        this.render('ProcurementRequisitionIndex')
    },
    showProcurementRequisitionApprovalList: function() {
        this.render('ProcurementRequisitionApprovalList')
    },
    showProcurementRequisitionTreatList: function() {
        this.render('ProcurementRequisitionTreatList')
    },

    showTravelRequestsList: function() {
        this.render('TravelRequisitionIndex')
    },
    showTravelRequestTreatList: function() {
        this.render('TravelRequisitionTreatList')
    },
    showTravelRequisition2BudgetHolderIndex: function() {
        this.render('TravelRequisition2BudgetHolderIndex')
    },
    showTravelRequisition2AdminIndex: function() {
        this.render('TravelRequisition2AdminIndex')
    },
    showTravelRequisitionRetirement2AdminIndex: function() {
        this.render('TravelRequisitionRetirement2AdminIndex')
    },
    showTravelRequisition2Index: function() {
        this.render('TravelRequisition2Index')
    },
    // other travel requisition
    showGroupTravelRequisition2Index: function() {
        this.render('TravelRequisition2IndexGroup')
    },
    showTPCTravelRequisition2Index: function() {
        this.render('TravelRequisition2IndexTPC')
    },
    showTravelRequisition2BudgetHolderRetireIndex: function() {
        this.render('TravelRequisition2BudgetHolderRetireIndex')
    },
    showTravelRequisition2FinanceRetireIndex: function() {
        this.render('TravelRequisition2FinanceRetireIndex')
    },
    showTravelRequisition2SupervisorRetirementIndex: function() {
        this.render('TravelRequisition2SupervisorRetirementIndex')
    },
    showTravelRequisition2PMRetirementIndex: function() {
        this.render('TravelRequisition2PMRetirementIndex')
    },
    showTravelRequisition2HOCRetirementIndex: function() {
        this.render('TravelRequisition2HOCRetirementIndex')
    },
    showTravelRequisition2LogisticsRetirementIndex: function() {
        this.render('TravelRequisition2LogisticsRetirementIndex')
    },
    showTravelRequisition2BSTRetirementIndex: function() {
        this.render('TravelRequisition2BSTRetirementIndex')
    },
    showTravelRequisition2RetirementIndex: function() {
        this.render('TravelRequisition2RetirementIndex')
    },
    showTravelRequisition2SupervisorIndex: function() {
        this.render('TravelRequisition2SupervisorIndex')
    },
    showTravelRequisition2PMIndex: function() {
        this.render('TravelRequisition2PMIndex')
    },
    showTravelRequisition2HOCIndex: function() {
        this.render('TravelRequisition2HOCIndex')
    },
    showTravelRequisition2GCOOIndex: function() {
        this.render('TravelRequisition2GCOOIndex')
    },
    showTravelRequisition2GCEOIndex: function() {
        this.render('TravelRequisition2GCEOIndex')
    },
    showTravelRequisition2BSTIndex: function() {
        this.render('TravelRequisition2BSTIndex')
    },
    showTravelRequisition2SecurityIndex: function() {
        this.render('TravelRequisition2SecurityIndex')
    },
    showTravelRequisition2LogisticsIndex: function() {
        this.render('TravelRequisition2LogisticsIndex')
    },
    showTravelRequisition2MDIndex: function() {
        this.render('TravelRequisition2MDIndex')
    },
    onAfterAction: function () {
    },
    onStop: function () {
    }
});
