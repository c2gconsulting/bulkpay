if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true,
        version: 'v1'
    });

    /*{
     "name": "Cow Bell",
     "originBrandId": "ABJ-DP-FG",
     }*/


    Api.addRoute('brands', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let doc = this.bodyParams;
                let user = this.request.headers["x-user-id"];
                if (typeof doc.originBrandId !== 'string'){
                    return {statusCode: 400, body: {status: "failed", data: {message: "originBrandId is invalid"}}}
                }
                if (group&& Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let brandContext = Core.Schemas.Brand.namedContext("brandData");
                        brandContext.validate(doc);
                        if (brandContext.isValid()){
                            let brand = Brands.findOne({originBrandId: doc.originBrandId});
                            if (brand){
                                delete  doc.originBrandId;
                                let state = Brands.update(brand._id, {$set: doc});
                                if (state === 1){
                                    res = {status: 'success', data: {message: 'Brand updated'}}
                                } else {
                                    res = {statusCode: 400, status: 'failed', data: {message: 'Failed to update brand'}};
                                }
                            } else {
                                let brandId = Brands.insert(doc);
                                if (brandId){
                                    res = {status: 'success', data: {message: 'Brand successfully created'}}
                                } else {
                                    res = {statusCode: 400, status: 'failed', data: {message: 'Failed to create Brand'}};
                                }
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: brandContext._invalidKeys}}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('brands/:id', {authRequired: true}, {
        put: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let doc = this.bodyParams;
                let user = this.request.headers["x-user-id"];
                let originBrandId = this.urlParams.id;
                if (group&& Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let brandContext = Core.Schemas.Brand.namedContext("brandData");
                        brandContext.validate(doc);
                        if (brandContext.isValid()){
                            let brand = Brands.findOne({originBrandId: originBrandId});
                            if (brand){
                                let state = Brands.update({originBrandId: originBrandId}, {$set: doc});
                                if (state === 1){
                                    res = {status: 'success', data: {message: 'Brand successfully updated'}}
                                } else {
                                    res = {statusCode: 400, status: 'failed', data: {message: 'Failed to update brand'}};
                                }
                            } else {
                               res = {statusCode: 404, status: 'failed', data: {message: 'Brand not found'}};
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: brandContext._invalidKeys}}}
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
                let originBrandId = this.urlParams.id;
                if (group&& Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let brand = Brands.findOne({originBrandId: originBrandId});
                        if (brand){
                            Brands.remove(brand._id);
                            res = {status: 'success', data: {message: 'Brand successfully removed'}}
                        } else {
                            res = {statusCode: 400, status: 'failed', data: {message: 'Brand not found'}};
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('brands/batch-insert', {authRequired: true}, {
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
                            if (typeof doc.originBrandId !== 'string'){
                                errors.push({id: index, error: "originBrandId is invalid"})
                            }

                            let availableBrand = Brands.findOne({originBrandId: doc.originBrandId});
                            if (availableBrand){
                                errors.push({id: doc.originBrandId, error: "This brand already exists"})
                            }

                            let brandContext = Core.Schemas.Brand.namedContext("brandData");
                            brandContext.validate(doc);
                            if (!brandContext.isValid()){
                                errors.push({id: doc.originBrandId, error: brandContext._invalidKeys})
                            }
                        });
                        if (errors.length > 0) {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                        } else {
                            Brands.insertMultiple(documents);
                            res = {status: 'success', data: {message: 'Batch operation completed'}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });
}
