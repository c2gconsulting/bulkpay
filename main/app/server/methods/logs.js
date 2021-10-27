
Meteor.methods({
    logToConsole: function(...msgs) {
        console.log(...msgs)
    },
    /**
     * customers/createCustomer
     * @summary Logs all write operations in the app
     * @param {Object} logObject - log information
     */
    "logs/createLog": function (logObject) {

        if ((!this.userId) && ((logObject.event !== 'logout') && (logObject.event !== 'set-password')) ) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        if (logObject) {
            logObject._id = new Mongo.ObjectID();
            logObject.createdAt = new Date();
            return Logs.insert(logObject);
        }
    },


    "logs/searchLogs": function (searchText, logsListFilter={}) {
        console.log('logs/searchLogs', searchText, logsListFilter)

        let startDate = moment().subtract(12, "months")._d;

        let filter = {

            $or: [
                { "event": { '$regex': `${searchText}`, '$options': 'i' } },
                { "collectionName": { '$regex': `${searchText}`, '$options': 'i' } },
                { "user.email": { '$regex': `${searchText}`, '$options': 'i' } },
            ]
        }

        if (
            logsListFilter.startDate &&
            logsListFilter.endDate >= logsListFilter.startDate
        ) {
            filter["createdAt"] = {
                $gte: logsListFilter.startDate,
                $lte: logsListFilter.endDate
            };
        } else if (
            logsListFilter.startDate &&
            logsListFilter.endDate < logsListFilter.startDate
        ) {
            filter["createdAt"] = {
                $gte: logsListFilter.startDate
            };
        } else {
            filter["createdAt"] = {
                $gte: startDate
            };
        }

        if (logsListFilter.events && logsListFilter.events.length > 0) {
            filter["event"] = { $in: logsListFilter.events };
        }


        if (logsListFilter.collections && logsListFilter.collections.length > 0) {
            filter["collectionName"] = { $in: logsListFilter.collections };
        }

        console.log('filter ', filter)


        return Logs.find(filter).fetch();
    },

    "user/getIP":function () {
        try {
            return HTTP.get( `http://gd.geobytes.com/GetCityDetails`);
        } catch(err) {
            throw err;
        }
    }

})

