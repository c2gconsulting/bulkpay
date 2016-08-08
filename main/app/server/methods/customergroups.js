Meteor.methods({
    "customergroups/create": function (doc) {

        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();
        let customerGroup;
        Core.createCustomerGroup(doc, Meteor.userId(), function(err, res){
            if (err){
                throw new Meteor.Error(403, err)
            } else {
                customerGroup = res
            }
        });
        return customerGroup
    },

    "customergroups/update": function (doc, userId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(doc, Core.Schemas.CustomerGroup);
        let user = userId || Meteor.userId();
        let userGroups = Core.getAuthorizedGroups(user, "pricelists/maintain");
        if (userGroups && _.isArray(userGroups) || userGroups === Roles.GLOBAL_GROUP) {
            this.unblock();
            let groupId = CustomerGroups.update(doc._id, {$set: doc});
            if (groupId){
                return groupId
            }
        }else {
            throw new Meteor.Error(403, "Access Denied");
        }
    },

    "customergroups/topCustomerGroups": function (duration) {
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
            { $match: { _groupId: tenantId, status: {$ne: "cancelled"}, issuedAt: { $gte: firstDuration } } },
            { $group: { _id: "$customerGroup", totalAmount: { $sum: "$total" } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);

        previousDuration = Orders.aggregate([
            { $match: { _groupId: tenantId, status: {$ne: "cancelled"}, issuedAt: { $gte: previousDurationStart, $lte: previousDurationEnd } } },
            { $group: { _id: "$customerGroup", totalAmount: { $sum: "$total" } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);

        // enrich customer group objects
        _.each(currentDuration, function(c) {
            if (c) {
                let customerGroup = CustomerGroups.findOne({code: c._id});
                c.name = customerGroup ? customerGroup.name : 'Other';
            }
        });

        _.each(previousDuration, function(c) {
            if (c) {
                let customerGroup = CustomerGroups.findOne({code: c._id});
                c.name = customerGroup ? customerGroup.name : 'Other';
            }
        });

        let data = {};
        data.currentTopCustomerGroups = currentDuration;
        data.previousTopCustomerGroups = previousDuration;
        return data;
    }
});

_.extend(Core, {
    createCustomerGroup: function (doc, userId, callback) {
        let user = Meteor.users.findOne(userId);
        if (user){
            check(doc, Core.Schemas.CustomerGroup);
            let userGroups = Core.getAuthorizedGroups(user, "pricelists/maintain");
            if (userGroups && _.isArray(userGroups) || userGroups === Roles.GLOBAL_GROUP) {
                if (doc.originGroupCode) {
                    let customerGroup = CustomerGroups.findOne({originGroupCode: doc.originGroupCode});
                    if (customerGroup) {
                        delete doc.originGroupCode;
                        CustomerGroups.update(customerGroup._id, {$set: doc});
                        return callback(null, {customerGroupId: customerGroup._id})
                    } else {
                        let groupId = CustomerGroups.insert(doc);
                        if (groupId){
                            return callback(null, {customerGroupId: groupId})
                        }
                    }
                } else {
                    let groupId = CustomerGroups.insert(doc);
                    if (groupId){
                        return callback(null, {customerGroupId: groupId})
                    }
                }
            }else {
                return callback("Unauthorized", null)
            }
        } else {
           return callback("Unauthorized", null)
        }
    }
})