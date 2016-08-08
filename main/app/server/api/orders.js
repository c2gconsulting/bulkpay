if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true
    });


    // Maps to: /api/customers/:id
    Api.addRoute('v1/orders/:id', {authRequired: true}, {
        get: function () {
            let group = this.request.headers['x-tenant-id'];
            let user = this.request.headers['x-user-id'];
            let orderNumber = this.urlParams.id;
            if (group && Core.checkUserTenant(group, user)) {
                let res;
                Partitioner.bindUserGroup(user, function () {
                    let order = Orders.findOne({orderNumber: Number(orderNumber)});
                    if (order){
                        if (order.status !== "cancelled"){
                            order.paymentsTotal = order.payments();
                            order.balance = order.balance();
                            res = order
                        } else {
                            res = {statusCode: 400, body: {status: 'failed', data: {message: 'Order cancelled'}}}
                        }
                    } else {
                        res = {statusCode: 404, body: {status: 'failed', data: {message: 'Order not found'}}}
                    }
                });
                if (res)     return res;
            } else {
                return {statusCode: 404, body: {status: 'failed', data: {message: 'Tenant not found'}}};
            }

        },
        post: function () {
            let group = this.request.headers['x-tenant-id'];
            let user = this.request.headers['x-user-id'];
            let orderNumber = this.urlParams.id;
            if (group && Core.checkUserTenant(group, user)) {
                let res;
                Partitioner.bindUserGroup(user, function () {
                    let order = Orders.findOne({orderNumber: Number(orderNumber)});
                    if (order){
                        if (order.status !== "cancelled" && order.shippingStatus === "pending"){
                            let state =  Orders.update({_id: order._id}, {$set: {shippingStatus: "processing"}});
                            if (state === 1){
                                res = {statusCode: 200, body: {status: 'success', data: {message: 'Order shipping status set to processing'}}}
                            } else {
                                res = {statusCode: 400, body: {status: "failed", data: {message: "Cannot update order"}}}
                            }
                        } else {
                            res = {statusCode: 400, body: {status: 'failed', data: {message: 'Cannot process the order'}}}
                        }
                    } else {
                        res = {statusCode: 404, body: {status: 'failed', data: {message: 'Order not found'}}}
                    }
                });
                if (res)     return res;
            } else {
                return {statusCode: 404, body: {status: 'failed', data: {message: 'Tenant not found'}}};
            }

        }
    });

}