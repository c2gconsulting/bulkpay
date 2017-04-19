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
    }, 200),
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        console.log(`pageNum: ${pageNum}`)
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt
        console.log(`skip: ${skip}`)

        let newPageOfEmployees = Template.instance().getEmployees(skip)
        Template.instance().employees.set(newPageOfEmployees)

        Template.instance().currentPage.set(pageNumAsInt)
    },

});


Template.registerHelper('repeat', function(max) {
    return _.range(max - 1); // undescore.js but every range impl would work
});

/*****************************************************************************/
/* Employees: Helpers */
/*****************************************************************************/
Template.Employees.helpers({
    // 'employees': function(){
    //     return Meteor.users.find({"employee": true});
    // },
    'doEmployeesExist': function() {
        return Meteor.users.find({employee: true}).count() > 0 ? true : false;
    },

    'employees': function() {
        return Template.instance().employees.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = Meteor.users.find({"employee": true}).count()
        console.log(`totalNum: ${totalNum}`)

        let result = Math.floor(totalNum/limit)
        var remainder = totalNum % limit;
        if (remainder > 0)
            result += 2;
        return result;
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
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
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(5);
    self.currentPage = new ReactiveVar(0);
    //--
    self.employees = new ReactiveVar()

    self.getEmployees = function(skip) {
        let sortBy = "profile.fullName";
        let sortDirection = 1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        return Meteor.users.find({}, options);
    }

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "profile.fullName";
        let sortDirection =  1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let employeesSub = self.subscribe('allEmployees', businessUnitId, limit, sort)
        if(employeesSub.ready()) {
            self.employees.set(self.getEmployees(0))
        }
    })

    //--
    //self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));

    self.isSearchView = new ReactiveVar();
    self.isSearchView.set(false);
});

Template.Employees.onRendered(function () {
});

Template.Employees.onDestroyed(function () {
});
