if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true
    });


    Api.addRoute('v1/customer-groups', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let userId = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                if (group && Core.checkUserTenant(group, userId)) {
                    let res;
                        Partitioner.bindUserGroup(userId, function () {
                            Core.createCustomerGroup(doc, userId, function (err, success) {
                                if (err){
                                    res = {statusCode: 400, status: 'failed', data: {message: 'failed to create customer group', error: err}}
                                } else {
                                    res = {status: 'success', data: {message: 'Customer group created'}};
                                }
                            });
                        });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('v1/pricelists', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let userId = this.request.headers['x-user-id'];
                let doc = this.bodyParams;

                let docId = this.urlParams.id;
                if (!_.isArray(doc.items)){
                    return  {statusCode: 404, body: {status: "failed", data: {message: "Document must be an array"}}};
                }
                if (group && Core.checkUserTenant(group, userId)) {
                    let res;
                    Partitioner.bindUserGroup(userId, function () {
                        Core.updatePriceList(doc, userId, function (err, success) {
                            if (err){
                                res = {statusCode: 400, status: 'failed', data: {message: 'Done with errors', error: err}}
                            } else {
                                res = {status: 'success', data: {message: 'Pricelist updated'}};
                            }
                        });
                    });
                    if (res)     return res;
                } else {
                    return {status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });
}