TimeManagementController = BusinessUnitController.extend({
  
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
        this.subscribe("subUsers", this.params._id);
        //this.subscribe("timedata", this.params._id);  //uses old 'times' collection
        this.subscribe("alltimedata", this.params._id); //uses new 'timewriting' collection
  
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
  
      create: function(){
        this.render('EmployeeCreate')  ;
      },
      time: function(){
          this.render('EmployeeTime');
      },
      approveTime: function(){
          this.render('ApproveEmployeeTime');
      },
  
      showTimeManagement1: function(){
        this.render('TimeManagement1');
      },
      
      showTimeManagement2: function(){
        this.render('TimeManagement2');
      },

      expense: function(){
          this.render('EmployeeExpense');
      },
  
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
    
    action: function () {
      this.render();
    },
    onAfterAction: function () {
    },
    onStop: function () {
    }
  });
  