if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true,
        version: 'v1'
    });

    /*{
     "name": "Abuja Depot Finished Goods Warehouse",
     "originLocationId": "ABJ-DP-FG",
     "address1": "",
     "address2": "",
     "city": "ABJ",
     "region": "",
     "postal": "1",
     "country": "NG",
     "selfManaged": true
     }*/


    Api.addRoute('locations', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let doc = this.bodyParams;
                let user = this.request.headers["x-user-id"];
                if (typeof doc.originLocationId !== 'string'){
                    return {statusCode: 400, body: {status: "failed", data: {message: "originLocationId is invalid"}}}
                }
                if (group&& Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let locationContext = Core.Schemas.Location.namedContext("locationData");
                        locationContext.validate(doc);
                        if (locationContext.isValid()){
                            let location = Locations.findOne({originLocationId: doc.originLocationId});
                            if (location){
                                delete  doc.originLocationId;
                                let state = Locations.update(location._id, {$set: doc});
                                if (state === 1){
                                    res = {status: 'success', data: {message: 'Location updated'}}
                                } else {
                                    res = {statusCode: 400, status: 'failed', data: {message: 'Failed to update location'}};
                                }
                            } else {
                                let locationId = Locations.insert(doc);
                                if (locationId){
                                    res = {status: 'success', data: {message: 'Location successfully created'}}
                                } else {
                                    res = {statusCode: 400, status: 'failed', data: {message: 'Failed to create location'}};
                                }
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: locationContext._invalidKeys}}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('locations/:id', {authRequired: true}, {
        put: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let doc = this.bodyParams;
                let user = this.request.headers["x-user-id"];
                let originLocationId = this.urlParams.id;
                check(doc, Core.Schemas.Location);
                if (group&& Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let locationContext = Core.Schemas.Location.namedContext("locationData");
                        locationContext.validate(doc);
                        if (locationContext.isValid()){
                            let location = Locations.findOne({originLocationId: originLocationId});
                            if (location){
                                let state = Locations.update({originLocationId: originLocationId}, {$set: doc});
                                if (state === 1){
                                    res = {status: 'success', data: {message: 'Location successfully updated'}}
                                } else {
                                    res = {statusCode: 400, status: 'failed', data: {message: 'Location not found'}};
                                }
                            } else {
                                res = {statusCode: 404, status: 'failed', data: {message: 'Location not found'}};
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: locationContext._invalidKeys}}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        },

        delete: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let doc = this.bodyParams;
                let user = this.request.headers["x-user-id"];
                let originLocationId = this.urlParams.id;
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let location = Locations.findOne({originLocationId: originLocationId});
                        if (location){
                            Locations.remove(location._id);
                            res = {status: 'success', data: {message: 'Location successfully removed'}}
                        } else {
                            res = {statusCode: 404, status: 'failed', data: {message: 'Location not found'}};
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('locations/batch-insert', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let documents = this.bodyParams;
                if (!_.isArray(documents)){
                    return  {statusCode: 404, body: {status: "failed", data: {message: "Document must be an array"}}};
                }
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let errors = [];
                        _.each(documents, function (doc, index) {
                            if (typeof doc.originLocationId !== 'string'){
                                errors.push({id: index, error: "originLocationId is invalid"})
                            }

                            let availableLocation = Locations.findOne({originLocationId: doc.originLocationId});
                            if (availableLocation){
                                errors.push({id: doc.originLocationId, error: "This location already exists"})
                            }

                            let locationContext = Core.Schemas.Location.namedContext("locationData");
                            locationContext.validate(doc);
                            if (!locationContext.isValid()){
                                errors.push({id: doc.originLocationId, error: locationContext._invalidKeys})
                            }
                        });
                        if (errors.length > 0) {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                        } else {
                            Locations.insertMultiple(documents);
                            res = {status: 'success', data: {message: 'Batch operation completed'}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });
}
