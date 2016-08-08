/*****************************************************************************/
/* MasterLayout: Event Handlers */
/*****************************************************************************/
Template.ApplicationLayout.events({
	'click [data-logout]': function(e, tmpl) {
	    Router.go('home');
    	Meteor.logout(function(err) {
            if (!err) {
                Session.keys = {};

                // clear subscription cache
                OrderSubs.clear();
                InvoiceSubs.clear();
                ProductVariantSubs.clear();
                CustomerSubs.clear();
                ReturnOrderSubs.clear();
                ReturnReasonSubs.clear();
                PromotionSubs.clear();
                UserSubs.clear();
                LocationSubs.clear();
            }
        });
    }, 
	'click #sidebar-toggle': function(e, tmpl) {
        if ($('#sidebar-toggle').data('toggle')) {
            $('body').removeClass('sidebar-mini');
            /*
            $('.menu-sidebar').show();
            $('.main-right-col').css('paddingLeft', '230px').removeClass('sidebar-hidden');
            $('.top-menu').css('marginLeft', '230px');
            */
            $('#sidebar-toggle').data('toggle', false);
        } else {
            $('body').addClass('sidebar-mini');
            /*
            $('.menu-sidebar').hide();
            $('.main-right-col').css('paddingLeft', 0).addClass('sidebar-hidden');
            $('.top-menu').css('marginLeft', 0);
            */
            $('#sidebar-toggle').data('toggle', true);
        }
    },
    'click .notifications .meta a': function() {
        if(Meteor.status().status !== 'connecting') {
            Meteor.reconnect();
        }
        return false;
    },
    'click #settings-menu': function(e, tmpl) {
        if (Core.hasAdminAccess(Meteor.userId())) {
            if (tmpl.state.get('show-sub-menu')) {
                tmpl.$('.menu-sidebar-second').hide();
                tmpl.state.set('show-sub-menu', false);
            } else {
                tmpl.$('.menu-sidebar-second').show();
                tmpl.state.set('show-sub-menu', true);
            }  
        }
    },
    'click [name="settings-sub-menu"]': function(e, tmpl) {
        if (Core.hasAdminAccess(Meteor.userId())) {
            if (tmpl.state.get('show-sub-menu')) {
                tmpl.$('.menu-sidebar-second').hide();
                tmpl.state.set('show-sub-menu', false);
            }
        }
    },

    'click': function(e, tmpl) {
        if (e.target.id === 'settings-menu') return; //omit for settings menu
        if (tmpl.state.get('show-sub-menu')) {
            tmpl.$('.menu-sidebar-second').hide();
            tmpl.state.set('show-sub-menu', false);
        }
    },
    
    'click #view-profile': function (e, tmpl) {
        
    }

});

/*****************************************************************************/
/* ApplicationLayout: Helpers */
/*****************************************************************************/
Template.ApplicationLayout.helpers({
	activeIfRouteIsIn: function (route) {
      var currentRoute = Router.current();
      return currentRoute &&
          s.startsWith(currentRoute.route.getName(), route) ? 'active' : '';
    },
    timeToConnect: function() {
        return Template.instance().nextRetry.get()
    },
    show: function () {
        //only show alert after the first connection attempt, if disconnected, if not manually disconnected (status == 'offline), if at least second retry
        if(!Template.instance().firstConnection.get() && !Meteor.status().connected && Meteor.status().status !== 'offline' && Meteor.status().retryCount > 1){
            return true;
        }
        return false;
    },
    intercomAppId: function() {
        return process.env.INTERCOM_APP_ID;
    },
    currentUserId: function(){
        return Meteor.userId();
    },
    loggedIn: function() {
        return !!Meteor.userId();
    },

    avatar: function () {
        return UserImages.findOne({owner: Meteor.userId()})
    },
    canCreateOrders: function () {
        return Core.hasOrderAccess(Meteor.userId())
    }
});

/*****************************************************************************/
/* MasterLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.ApplicationLayout.onCreated(function () {
    this.state = new ReactiveDict();
    this.state.set('show-sub-menu', false);

    let instance = this;

    instance.updateCountdownTimeout;
    instance.nextRetry = new ReactiveVar(0);
    instance.options = {
        style: true,
        lang: 'en',
        position: 'bottom',
        showLink: true,
        msgText: '',
        linkText: '',
        overlay: false
    };
    instance.firstConnection = new ReactiveVar(true);
    
    instance.autorun(function () {
       instance.subscribe("UserImages", Meteor.userId()) 
    });

    //get template params
    if(Template.currentData()) {
        for(var property in instance.options) {
            if(Template.currentData()[property] !== undefined) {
                instance.options[property] = Template.currentData()[property];
            }
        }
    }

    //set tracker for retry delay
    Tracker.autorun(function() {
        //set nextRetry delay update
        if(Meteor.status().status === 'waiting') {
            instance.updateCountdownTimeout = Meteor.setInterval(function() {
                instance.nextRetry.set(Math.round((Meteor.status().retryTime - (new Date()).getTime()) / 1000));
            }, 1000);
        } else {
            instance.nextRetry.set(0);
            Meteor.clearInterval(instance.updateCountdownTimeout);
        }
    });

    //do not alert on first connection to avoid meteor status flashing
    Tracker.autorun(function(computation) {
        if(Meteor.status().connected && Meteor.status().status === 'connected') {
            instance.firstConnection.set(false);
            computation.stop();
        }
    });

    // setup intercom settings
    Tracker.autorun(function () {
      // initialize Intercom info
      IntercomSettings.userInfo = function(user, info) {
        let tenant = Tenants.findOne();
        
        if (!user || !user.profile || !tenant || !tenant._id) 
            return false;
        

        info.email = user.emails[0].address;
        info.name = user.profile.fullName;
        if (user.createdAt) info.created_at = Math.floor(new Date(user.createdAt).getTime() / 1000);
        info.username = user.username;
        info.company = {
            id: tenant._id,
            name: tenant.name,
            domain: tenant && tenant.domains && tenant.domains.length > 0 ? tenant.domains[0] : ''
        };

        if (tenant.createdAt) info.company.created_at = Math.floor(new Date(tenant.createdAt).getTime() / 1000);

        /* remove, costly
        let totalOrders = Counts.findOne('TOTAL_ORDERS');
        let totalCustomers = Counts.findOne('TOTAL_CUSTOMERS');

        if (totalOrders) info.company.orders = totalOrders.count;
        if (totalCustomers) info.company.customers = totalCustomers.count;
        */
      }
    });
});

Template.ApplicationLayout.onRendered(function () {
});

Template.ApplicationLayout.onDestroyed(function () {
});


