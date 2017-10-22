/*****************************************************************************/
/* Employees: Event Handlers */
/*****************************************************************************/

/*
  To understand how search works on this page, you'll have to look at two files
  client/lib/helpers/search.js and
  server/search.js
*/


Template.Employees.events({
    'click #createEmployee': (e, tmpl) => {
        e.preventDefault();
        Router.go('employees.create', tmpl.data);
    },
    'click #uploadEmployees': function(e){
        e.preventDefault();
        Modal.show('ImportEmployeesModal');
    },
    'click #assignEmployeePositions': function(e){
        e.preventDefault();
        Modal.show('ImportEmployeePositionsModal');
    },
    'click #assignEmployeePaytypes': function(e) {
        e.preventDefault();
        Modal.show('ImportEmployeePaytypesModal');
    },
    'click .anEmployee': (e, tmpl) => {
        let employeeRowElem = e.currentTarget;
        let employeeIdToEdit = employeeRowElem.getAttribute("name");

        let selectedEmployee = Meteor.users.findOne({_id: employeeIdToEdit});
        Session.set("employeesList_selectedEmployee", selectedEmployee);
    },
    "keyup #search-box": _.throttle(function(e, tmpl) {
      var text = $(e.target).val().trim();

      if (text && text.trim().length > 0) {
        tmpl.isSearchView.set(true);
        EmployeesSearch.search(text, {
            businessId: Session.get('context')
        });
      } else {
        tmpl.isSearchView.set(false);
      }
    }, 200),
});


Template.registerHelper('repeat', function(max) {
    return _.range(max - 1); // undescore.js but every range impl would work
});

/*****************************************************************************/
/* Employees: Helpers */
/*****************************************************************************/
Template.Employees.helpers({
    'doEmployeesExist': function() {
        return Meteor.users.find({employee: true}).count() > 0 ? true : false;
    },
    'employees': function() {
        let loaded = Template.instance().loaded.get();
        
        let sort = {};
        sort["profile.fullName"] = 1;

        return Meteor.users.find({
            // businessIds: Session.get('context'),
            employee: true
        }, {limit: loaded, sort: sort}).fetch();
    },
    getEmployeeSearchResults: function() {
      return EmployeesSearch.getData({
        sort: {isoScore: -1}
      });
    },
    isSearchView: function() {
      return Template.instance().isSearchView.get();
    },
    isLoading: function() {
      return EmployeesSearch.getStatus().loading;
    },
    hasMoreEmployees: function () {
        let numEmployees = Meteor.users.find({
            // businessIds: Session.get('context'),
            employee: true
        }).count()
        return numEmployees >= Template.instance().limit.get();
    },
    isFetchingData: function() {
      return Template.instance().isFetchingData.get();
    },
});

/*****************************************************************************/
/* Employees: Lifecycle Hooks */
/*****************************************************************************/
Template.Employees.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.loaded = new ReactiveVar(0);
    self.limit = new ReactiveVar(getLimit());
  
    self.isFetchingData = new ReactiveVar()
    self.isFetchingData.set(true)

    self.autorun(function() {
        let limit = self.limit.get();
        
        let sort = {};
        sort["profile.fullName"] = 1;

        let subscription = self.subscribe('allEmployeesForInfiniteScroll', businessUnitId, limit, sort);
        if (subscription.ready()) {
            self.loaded.set(limit);
            self.isFetchingData.set(false)
        }
    })

    //--
    //self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));

    self.isSearchView = new ReactiveVar();
    self.isSearchView.set(false);
});

Template.Employees.onRendered(function () {
    let self = this;

    this.scrollHandler = function(e) {
        if(!self.isSearchView.get()) {
            let threshold, target = $("#showMoreResults");
            if (!target.length) return;
    
            threshold = $(window).scrollTop() + $(window).height() - target.height();
    
            if (target.offset().top < threshold) {
                if (!target.data("visible")) {
                    target.data("visible", true);
                    var limit = this.limit.get();
                    limit += 20;
                    this.limit.set(limit);
                }
            } else {
                if (target.data("visible")) {
                    target.data("visible", false);
                }
            }
        }
    }.bind(this);

    $(window).on('scroll', this.scrollHandler);
});

Template.Employees.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
});

function getLimit() {
    return 10;
}
