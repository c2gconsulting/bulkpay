if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true,
        version: 'v1'
    });


    Api.addRoute('payments', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                doc.paidAt = new Date(doc.paidAt);
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    if (doc.reference) {
                        Partitioner.bindUserGroup(user, function () {
                            let paymentContext = Core.Schemas.Payment.namedContext("paymentData");
                            paymentContext.validate(doc);
                            if (paymentContext.isValid()){
                                let order = Orders.findOne({orderNumber: doc.orderNumber});
                                if (order) {
                                    if (order.status !== "cancelled"){
                                        doc.orderId = order._id;
                                        doc.createdBy = user;
                                        Core.createPayment(doc, user, function (err, success) {
                                            if (err){
                                                res = {statusCode: 400, body: {status: "failed", data: {message: err}}}
                                            } else {
                                                res = {statusCode: 200, body: {status: "success", data: {message: "Payment created",  details: success}}}
                                            }
                                        });
                                    } else {
                                        res = {statusCode: 400, body: {status: 'failed', data: {message: 'Order cancelled'}}}
                                    }
                                } else {
                                    res = {statusCode: 404, body: {status: 'failed', data: {message: 'Order for this payment was not found'}}};
                                }
                            } else {
                                res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: paymentContext._invalidKeys}}}
                            }
                        });
                    } else {
                        res = {statusCode: 400, body: {status: "failed", data: {message: "Payment must have a payment reference"}}}
                    }
                    if (res)     return res;
                } else {
                    return {statusCode: 404, body: {status: 'failed', data: {message: 'Tenant not found'}}};
                }
            }
        }
    });
}
