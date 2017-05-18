/**
 * Core
 * Global tenant permissions methods and tenant initialization
 */
_.extend(Core, {
    tenantId: null,
    init: function () {
        let self;
        self = this;



        return Tracker.autorun(function () {
            let domain = document.location.hostname;
            let tenant;
            let tenantHandle;

            // keep an eye out for tenant change
            if (Meteor.userId())
                tenantHandle = Meteor.subscribe('CurrentTenant');
            else {
                tenantHandle = Meteor.subscribe('TenantForDomain', domain);
            }



            if (tenantHandle.ready()) {
                //domain = Meteor.absoluteUrl().split("/")[2].split(":")[0];
                tenant = Tenants.findOne({
                    // domains: domain
                });
                if (tenant) {
                    self.tenantId = tenant._id;
                    self.country = tenant.country;
                    self.baseCurrency = tenant.baseCurrency;
                    self.settings = tenant.settings;
                    self.timezone = tenant.timezone;
                    return self;
                }

            }
        });
    },
    getTenantId: function () {
        return this.tenantId;
    },
    getTenantCountry: function () {
        return this.country;
    },
    getTenantTaxRate: function () {
        let tax = Taxes.findOne({});
        if (tax) {
            let rate = tax.rates[0];
            return rate.rate;
        }
    },
    getTenantBaseCurrency: function () {
        return this.baseCurrency;
    },
    getSearchAuth: function () {
        return {
            tenantId: this.getTenantId(),
            authArray: ['ALL_STOCK_LOCATIONS', 'ALL_CUSTOMER_GROUPS']
        };
    },
    getAllRounding: function(){
        if(this.settings && this.settings.rounding){
            return this.settings.rounding
        }
    },
    returnSelection: function(selection){
        let options = [];
        let selected = selection.find("option:selected");
        _.each(selected, function(select){
            options.push(select.value)
        });
        return _.uniq(options);
    },
    returnChecked: function (selection){
        selected = [];
        selection.each(x => {
            selected.push($(x).attr("id"));
        });
        return selected;
    }

});

/*
 * configure bunyan logging module for client
 * See: https://github.com/trentm/node-bunyan#levels
 * client we'll cofigure WARN as default
 */
let isDebug = "WARN";

if (Meteor.settings !== undefined) {
    if (Meteor.settings.public) {
        if (Meteor.settings.public.debug) {
            isDebug = Meteor.settings.public.debug;
        }
    }
}

levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
    isDebug = isDebug.toUpperCase();
}

if (!_.contains(levels, isDebug)) {
    isDebug = "INFO";
}

Core.Log = bunyan.createLogger({
    name: "core-client"
});

Core.Log.level(isDebug);


// get loggedIn user's token to be used for authentication
Core.SearchConnection.onReconnect = function() {
    var loginToken = Meteor._localStorage.getItem('Meteor.loginToken');
    this.call('search/authenticate', loginToken);
};

Tracker.autorun(function() {
    Meteor.userId();
    Core.SearchConnection.onReconnect();
});



/**
 *  Startup TradeDepot Central
 *  Init TDC client
 */

 ActivityDetected = false;

Meteor.startup(function () {
    // init the core
    Core.init();

    Meteor.setInterval(function() {
        if (Meteor.userId() && ActivityDetected) {
            ActivityDetected = false;
        } else {
          Accounts.logout();
          Router.go("home");
        }
    }, 600000);

    $(document).on('mousemove click keydown', function() {
       ActivityDetected = true;
    });

    /*initialize the spinner
     Meteor.Spinner.options = {
     className: 'spinner', // The CSS class to assign to the spinner
     top: 'auto', // Top position relative to parent in px
     left: 'auto' // Left position relative to parent in px
     };*/
});
