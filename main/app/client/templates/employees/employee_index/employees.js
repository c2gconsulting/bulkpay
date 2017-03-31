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
    'click .anEmployee': (e, tmpl) => {
        let employeeRowElem = e.currentTarget;
        let employeeIdToEdit = employeeRowElem.getAttribute("name");
        console.log("Employee Id to edit: " + employeeIdToEdit);

        let selectedEmployee = Meteor.users.findOne({_id: employeeIdToEdit});
        Session.set("employeesList_selectedEmployee", selectedEmployee);
    },
    "keyup #search-box": _.throttle(function(e, tmpl) {
      console.log("Inside throttle of searchbox");
      var text = $(e.target).val().trim();
      console.log("Text enterd: " + text);

      if (text && text.trim().length > 0) {
        tmpl.isSearchView.set(true);
        EmployeesSearch.search(text);
      } else {
        tmpl.isSearchView.set(false);
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
    'doEmployeesExist': function() {
        return Meteor.users.find({employee: true}).count() > 0 ? true : false;
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
    }
});

/*****************************************************************************/
/* Employees: Lifecycle Hooks */
/*****************************************************************************/
Template.Employees.onCreated(function () {
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));

    self.isSearchView = new ReactiveVar();
    self.isSearchView.set(false);
});

Template.Employees.onRendered(function () {
});

Template.Employees.onDestroyed(function () {
});
