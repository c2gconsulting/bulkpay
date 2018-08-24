BusinessUnitController = ApplicationController.extend({

    // a place to put your subscriptions
    // this.subscribe('items');
    // // add the subscription to the waitlist
    // this.subscribe('item', this.params._id).wait();

    subscriptions: function() {
        //LocationSubs.subscribe('Locations');
    },

    // Subscriptions or other things we want to "wait" on. This also
    // automatically uses the loading hook. That's the only difference between
    // this option and the subscriptions option above.
    // return Meteor.subscribe('post', this.params._id);

    waitOn: function () {
        const businessId = Session.get('context')
        const tenantId = Core.getTenantId()

        if(tenantId) {
            Meteor.subscribe("BusinessUnitCustomConfig", businessId, tenantId)
        } else {
            return []
        }

        // return [
        //     //Meteor.subscribe("BusinessUnits")
        // ];
        //return InvoiceSubs.subscribe('Invoice', this.params._id);
        // return [Meteor.subscribe('BusinessUnit')];
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
    // onRun: function () {
    //     //set session context for side bar nav using session store ..
    //     if(this.params._id) {
    //         Session.set('context', this.params._id);
    //     }
    //     this.next();
    // },
    onRun: function () {
        this.next();
        // console.log("this")
        // console.log(this.params.query.userid)
   
    },
    onRerun: function () {
        this.next();
    },
    onBeforeAction: function () {
        // console.log(`Inside businessunit controller onBeforeAction: ${this.params._id}`);
        // console.log(`this.params._id: `, this.params._id)

        if(this.params._id){
            Session.set('context', this.params._id);

            let bu = BusinessUnits.findOne({_id: this.params._id});
            if (bu){
                this.next();
            } else {
                //set session context to null
                Router.go('home');
            }
        } else {
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
    home: function(){
        //let customer = Customers.findOne({_id: this.params._id});
        //if (customer && Core.hasCustomerAccess(Meteor.userId())) {
        //    this.render('DistributorsEdit');
        //} else if (customer && Core.hasCustomerAccess(Meteor.userId(), customer.groupCode, true)) {
        //    Router.go('distributors.detail', {_id: this.params._id});
        //} else {
        //    Router.go('distributors.list');
        //}

        this.render('BusinessUnit');
    },

    show: function () {
        const businessId = Session.get('context')
        const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessId})

        if(customConfig) {
            if(customConfig.skipCompanyListPageOnLogin) {
                if(customConfig.onLoginFirstBlazeTemplate) {
                    this.render(customConfig.onLoginFirstBlazeTemplate);
                } else {
                    this.render("BuDetail");
                }
            } else {
                this.render("BuDetail");
            }
        } else {
            this.render("BuDetail");
        }
    },
    mobileNavigation: function() {
        this.render('MobileNavigation')
    },
    onAfterAction: function () {
    },
    onStop: function () {
    }
});
