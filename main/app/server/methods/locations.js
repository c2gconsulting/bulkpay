

Meteor.methods({
    "locations/topLocations": function (duration) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        let tenantId = Core.getTenantId(userId);

        let options = {};
        let firstDuration, previousDurationStart, previousDurationEnd, currentDuration, previousDuration;
        let today = new Date;
        let previousYear = moment().subtract(1, 'years').startOf('year');
        let todayInPreviousYear = moment(today).subtract(1, 'years');
        let thisYear = (new Date()).getFullYear();
        let start = new Date("1/1/" + thisYear);
        let defaultStart = moment(start.valueOf());
        let currentMonth =  moment().startOf("month")._d;
        let endOfCurrentMonth = moment().endOf("month")._d;
        let previousMonth = moment(endOfCurrentMonth).subtract(1, 'months').startOf('month')._d;
        let endOfPreviousMonth = moment(previousMonth).endOf("month")._d;
        let currentWeek = moment().startOf('week')._d;
        let previousWeek = moment().subtract(1, 'weeks').startOf('week')._d;
        let endOfPreviousWeek = moment().subtract(1, 'weeks').endOf('week')._d;
        let previousDay = moment().subtract(1, 'days').startOf('day')._d;
        let endOfPreviousDay = moment().subtract(1, 'days').endOf('day')._d;
        let currentDay = moment().startOf('day')._d;

        if (duration === "Year") {
            firstDuration  = defaultStart._d;
            previousDurationStart =  previousYear._d;
            previousDurationEnd =  todayInPreviousYear._d;
        }

        if (duration === "Month") {
            firstDuration  =  currentMonth;
            previousDurationStart =  previousMonth;
            previousDurationEnd =  endOfPreviousMonth;
        }

        if (duration === "Week") {
            firstDuration  =  currentWeek;
            previousDurationStart =  previousWeek;
            previousDurationEnd =  endOfPreviousWeek;
        }

        if (duration === "Today") {
            firstDuration  =  currentDay;
            previousDurationStart =  previousDay;
            previousDurationEnd =  endOfPreviousDay;
        }

        currentDuration = Orders.aggregate([
            { $match: { _groupId: tenantId, paymentStatus: "paid", issuedAt: { $gte: firstDuration } } },
            { $group: { _id: "$salesLocationId", totalAmount: { $sum: "$total" } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);

        previousDuration = Orders.aggregate([
            { $match: { _groupId: tenantId, paymentStatus: "paid", issuedAt: { $gte: previousDurationStart, $lte: previousDurationEnd } } },
            { $group: { _id: "$salesLocationId", totalAmount: { $sum: "$total" } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);


        // enrich location objects
        _.each(currentDuration, function(l) {
            if (l) {
                let location = Locations.findOne({_id: l._id});
                if (location) l.name = location.name;
            }
        });

        _.each(previousDuration, function(l) {
            if (l) {
                let location = Locations.findOne({_id: l._id});
                if (location) l.name = location.name;
            }
        });

        let data = {};
        data.currentTopLocations = currentDuration;
        data.previousTopLocations = previousDuration;
        return data;
    },

    /**
     * customers/getLocations
     * @summary returns locations that fit search criteria
     * @param {String} searchText - text to search for
     * @param {Object} options - proposed query projections
     * @returns {Collection} returns collection of found items
     */
    "locations/getLocations": function (searchText, options) {
        check(searchText, String);

        this.unblock();

        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }

        options = options || {};
        options.limit = 10;
        options.fields = {
            "name": 1
        };
        options.sort = { name: 1 };

        if(searchText && searchText.length > 0) {
            var regExp = Core.buildRegExp(searchText);
            var selector = { $and: [
                { active: { $ne: false }},
                { $or: [
                    {name: regExp}
                ]}
            ]};

            return Locations.find(selector, options).fetch();
        }

    },

    "locations/getLocationsByIds": function (locationIds) {
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        this.unblock();
        let locations = Locations.find({_id: {$in: locationIds}}).fetch();
        let data = {};

        _.each(locations, function (location) {
            data[location._id] = {
                name: location.name
            };
        });
        return data
    },
    
    "locations/createLocation": function (location) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(location, Core.Schemas.Location);
        } catch (e) {
            throw new Meteor.Error(401, "There's invalid data in your location. Please correct and retry");
        }
        this.unblock();
        let locationId = Locations.insert(location);
        let newLocation = Locations.findOne(locationId);
        return { 
            _id: locationId, 
            location: newLocation 
        };
    },

    "locations/updateLocation": function (locationId, location) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(location, Core.Schemas.Location);
        userId = userId || Meteor.userId();
        delete location._id;
        delete location.userId;
        delete location.createdAt;

        this.unblock();
        let oldLocation = Locations.findOne(locationId);
        let updateStatus = Locations.update({_id: locationId}, {$set: location});
        if (updateStatus === 1) {
            sendLocationNotification('location.updated', oldLocation, userId)
        }
        return Locations.findOne(locationId);

    }
});

function sendLocationNotification(event, location, user, message){
    Meteor.defer(function(){
        let nObject = {};
        nObject.event = event;
        nObject.userId = user;
        nObject.objectId = location._id;
        nObject.groupId = location._groupId;
        if (message) {
            nObject.message = message;
        }
        Meteor.call("notifications/sendNotification", nObject);
    });
}
