ApplicationControllerPrint = RouteController.extend({
    layoutTemplate: 'ApplicationLayout',


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
        return [
         Meteor.subscribe('BusinessUnit', this.params._id)

        //  Meteor.subscribe('OrderTypes'),
        //  Meteor.subscribe('ActivePriceLists'),
        //  Meteor.subscribe('CustomerGroups'),
        //  Meteor.subscribe('CashPaymentMethods')
        ];
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
        //set session context for side bar nav using session store ..
        Session.set('context', this.params._id);
        console.log("this.params._id")
        console.log(this.params._id)
        this.next();
        console.log("this1")
        console.log(this)
        Session.set('user_Id', this.params.query.userid);
        console.log("user_Id")
        console.log(this.params.query.userid)

    },
    onRerun: function () {
        this.next();
    },
    onBeforeAction: function () {
        if (!Meteor.userId()) {
            // User not logged in, redirect to login view
            $("body").addClass("fuelux");
            this.layout('ExtLayout');
            this.render('login_print');
        } else {
            // User logged in, render app view (update later to redirect)
            $("body").removeClass("fuelux");
            $("body").addClass("app-body");
            this.layout('ApplicationLayout');
            this.next();
        }
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
