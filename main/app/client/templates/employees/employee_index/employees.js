/*****************************************************************************/
/* Employees: Event Handlers */
/*****************************************************************************/
Template.Employees.events({
    'click #createEmployee': (e, tmpl) => {
        e.preventDefault();
        Router.go('employees.create', tmpl.data);
    },
    'click .anEmployee': (e, tmpl) => {
        let employeeRowElem = e.currentTarget;
        let employeeIdToEdit = employeeRowElem.getAttribute("name");
        console.log("Employee Id to edit: " + employeeIdToEdit);

        let selectedEmployee = Meteor.users.findOne({_id: employeeIdToEdit});
        Session.set("employeesList_selectedEmployee", selectedEmployee);
    },
    "keyup #search-box": _.throttle(function(e) {
      console.log("Inside throttle of searchbox");
      var text = $(e.target).val().trim();
      console.log("Text enterd: " + text);

      if (text && text.trim().length > 0) {
        Session.set("isSearchView", true);
        PackageSearch.search(text);
      } else {
        Session.set("isSearchView", false);
      }

    }, 200)
});

/*****************************************************************************/
/* Employees: Helpers */
/*****************************************************************************/
Template.Employees.helpers({
    'employees': function(){
        return Meteor.users.find({"employee": true});
    },
    getPackages: function() {
      return PackageSearch.getData({
        sort: {isoScore: -1}
      });
    },
    isSearchView: function() {
      return Session.get("isSearchView");
    },
    isLoading: function() {
      return PackageSearch.getStatus().loading;
    }
});

/*****************************************************************************/
/* Employees: Lifecycle Hooks */
/*****************************************************************************/
Template.Employees.onCreated(function () {
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));
    self.subscribe("allEmployees", Session.get('context'));
});

Template.Employees.onRendered(function () {
});

Template.Employees.onDestroyed(function () {
});
