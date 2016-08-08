if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true,
        version: 'v1'
    });


    Api.addRoute('invoices', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let doc = this.bodyParams;
                doc.dueAt = new Date(doc.dueAt);
                doc.shipAt = new Date(doc.shipAt);
                doc.issuedAt = new Date(doc.issuedAt);
                let user = this.request.headers["x-user-id"];
                doc.userId = user;
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    let errors = [];
                        Partitioner.bindUserGroup(user, function () {
                            if (doc.orderNumber){
                                let order = Orders.findOne({orderNumber: doc.orderNumber});
                                if (order){
                                    _.each(doc.items, function(item){
                                        let variant = ProductVariants.findOne({originVariantCode: item.originVariantCode});
                                        if (variant){
                                            item.variantId = variant._id
                                        } else {
                                            errors.push({id: item.originVariantCode, error: 'Product variant not found'})
                                        }
                                    });
                                    let invoiceContext = Core.Schemas.Invoice.namedContext("invoiceData");
                                    invoiceContext.validate(doc);
                                    if (invoiceContext.isValid()){
                                        if (errors.length > 0){
                                            res =  {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                                        } else {
                                            Core.createInvoice(doc, user, function(err, success){
                                                if (err){
                                                    res = {statusCode: 400, body: {status: "failed", data: {message: err}}}
                                                } else {
                                                    res = {statusCode: 200, body: {status: "success", data: {message: "Invoice created",  details: success}}}
                                                }
                                            });
                                        }
                                    } else {
                                        res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: invoiceContext._invalidKeys}}}
                                    }
                                } else {
                                   res = {statusCode: 404, body: {status: "failed", data: {message: "Order not found"}}};
                                }
                            } else {
                                res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid order number"}}}
                            }

                        });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}};
            }
        }}
    });
}
