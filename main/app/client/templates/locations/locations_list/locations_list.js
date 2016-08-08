/*****************************************************************************/
/* LocationsList: Event Handlers */
/*****************************************************************************/
Template.LocationsList.events({
    'click #add-location': function (e) {
        e.preventDefault();
        Modal.show('LocationCreate');
    }
});

/*****************************************************************************/
/* LocationsList: Helpers */
/*****************************************************************************/
Template.LocationsList.helpers({
    locations: function () {
        return Template.instance().locations();
    },
    hasMoreLocations: function () {
        return Template.instance().locations().count() >= Template.instance().limit.get();
    },
    searchLocations: function () {
        return [];
    }
});

/*****************************************************************************/
/* LocationsList: Lifecycle Hooks */
/*****************************************************************************/
Template.LocationsList.onCreated(function () {
    
    let instance = this;

    // initialize the reactive variables
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    
    instance.autorun(function () {

        let limit = instance.limit.get();
        instance.subscribe("Locations");

        // if subscription is ready, set limit to newLimit
        if (instance.subscriptionsReady()) {
            instance.loaded.set(limit);
        }
        
    });

    // 3. Cursor
    instance.locations = function () {

        let options = {};
        options.limit = instance.loaded.get();

        return Locations.find({}, options);
    }
});

Template.LocationsList.onRendered(function () {
    //let instance = this;
    this.scrollHandler = function (e) {
        let threshold, target = $("#showMoreResults");
        if (!target.length) return;

        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if (target.offset().top < threshold) {
            if (!target.data("visible")) {
                target.data("visible", true);
                var limit = this.limit.get();
                limit += 25;
                this.limit.set(limit);
            }
        } else {
            if (target.data("visible")) {
                target.data("visible", false);
            }
        }
    }.bind(this);

    $(window).on('scroll', this.scrollHandler);
});

Template.LocationsList.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
    Session.set('searchActive', false);
});


function getLimit() {
    return 20;
}
