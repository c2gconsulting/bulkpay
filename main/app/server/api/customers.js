if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true,
        version: 'v1'
    });


    // Maps to: /api/v1/customers/:id
    Api.addRoute('customers/:id', {authRequired: true}, {
        get: function () {
            let group = this.request.headers['x-tenant-id'];
            let user = this.request.headers['x-user-id'];
            let originCustomerId = this.urlParams.id;
            if (group && Core.checkUserTenant(group, user)) {
                let res;
                Partitioner.bindUserGroup(user, function () {
                    let customer =  Customers.findOne({originCustomerId: originCustomerId});
                    if (customer){
                        res = customer
                    } else {
                        res = {statusCode: 404, body: {status: "failed", data: {message: "Customer not found"}}}
                    }
                });
                if (res)     return res;
            } else {
                return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}};
            }
        },

        delete: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let originCustomerId = this.urlParams.id;
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let customer = Customers.findOne({originCustomerId: originCustomerId});
                        if (customer){
                            let order = Orders.findOne({customerId: customer._id});
                            if (order){
                                res = {statusCode: 400, body: {status: "failed", data: {message: "You cannot delete a customer that has transactions"}}}
                            } else {
                                Customers.remove(customer._id);
                                res = {statusCode: 200, body: {status: "success", data: {message: "Customer deleted"}}}
                            }
                        } else {
                            res = {statusCode: 404, body: {status: "failed", data: {message: "Sorry could not find customer"}}}
                        }
                    });
                    if (res)  return res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}} ;
                }
            }
        },
        put: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let originCustomerId = this.urlParams.id;
                let doc = this.bodyParams;
                doc.account.valueDate = new Date(doc.account.valueDate);
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        if (doc.originSalesLocationCode){
                            let location = Locations.findOne({originLocationId: doc.originSalesLocationCode});
                            if (location){
                                doc.defaultSalesLocationId = location._id
                            } else {
                                return {statusCode: 404, body: {status: "failed", data: {message: "Location not found"}}}
                            }
                        }
                        delete doc.originSalesLocationCode;
                        let customerContext = Core.Schemas.Customer.namedContext("customerData");
                        customerContext.validate(doc);
                        if (customerContext.isValid()){
                            let customer = Customers.findOne({originCustomerId: originCustomerId});
                            if (customer) {
                                let addresses = doc.addressBook;
                                _.each(addresses, function(address){
                                    let existingAddress = _.find(customer.addressBook, function(a){ return a.originAddressId == address.originAddressId; });
                                    if (existingAddress){
                                        address._id = existingAddress._id
                                    }
                                });
                                let state = Customers.update({originCustomerId: originCustomerId}, {$set: doc});
                                if (state === 1){
                                    res = {statusCode: 200, body: {status: "success", data: {message: "Customer updated"}}}
                                } else {
                                    res = {statusCode: 400, body: {status: "failed", data: {message: "Cannot update customer"}}}
                                }
                            } else {
                                res =  {statusCode: 404, body: {status: "failed", data: {message: "Customer not found"}}}
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: customerContext._invalidKeys}}}
                        }
                    });
                    if (res)  return res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}}
                }
            }
        }
    });


    Api.addRoute('customers/batch-insert', {authRequired: true}, {
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
                        _.each(documents, function (doc, indexC) {
                            doc.createdBy = user;
                            if (typeof doc.originCustomerId !== 'string'){
                                errors.push({id: indexC, error: "OriginCustomerId is invalid"})
                            }
                            doc.account.valueDate = new Date(doc.account.valueDate);
                            if (doc.originSalesLocationCode){
                                let location = Locations.findOne({originLocationId: doc.originSalesLocationCode});
                                if (location){
                                    doc.defaultSalesLocationId = location._id;
                                    delete doc.originSalesLocationCode;
                                } else {
                                    errors.push({id: doc.originCustomerId, error: "Location not found"})
                                }
                            }
                            if (doc.originAsigneeCode){
                                let user = Meteor.users.findOne({"salesProfile.originCode": doc.originAssigneeCode})
                                if (user) {
                                    doc.defaultAssigneeId = user._id
                                }
                                delete doc.originAsigneeCode
                            }
                            let customerContext = Core.Schemas.Customer.namedContext("customerData");
                            customerContext.validate(doc);
                            if (!customerContext.isValid()){
                                errors.push({id: doc.originCustomerId, error: customerContext._invalidKeys})
                            }
                            let customer = Customers.findOne({originCustomerId: doc.originCustomerId});
                            if(customer) {
                                errors.push({id: doc.originCustomerId, error: "Customer already exists."})
                            }
                        });
                       if (errors.length > 0){
                           res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                       } else {

                           Customers.insertMultiple(documents);
                           res = {statusCode: 200, body: {status: "success", data: {message: "Batch operation successful"}}}
                       }
                    });
                    if (res)     return  res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}};
                }
            }
        }
    });

    Api.addRoute('customers', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];

                this.bodyParams.account.valueDate = new Date(this.bodyParams.account.valueDate);
                let doc = this.bodyParams;
                if (typeof doc.originCustomerId !== 'string'){
                    return {statusCode: 404, body: {status: "failed", data: {message: "OriginCustomerId is invalid"}}}
                }
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let errors = [];

                        if (doc.originSalesLocationCode){
                            let location = Locations.findOne({originLocationId: doc.originSalesLocationCode});
                            if (location){
                              doc.defaultSalesLocationId = location._id
                            } else {
                                return {statusCode: 404, body: {status: "failed", data: {message: "Location not found"}}}
                            }
                            delete doc.originSalesLocationCode;
                        }

                        if (doc.originAssigneeCode){
                            let user = Meteor.users.findOne({"salesProfile.originCode": doc.originAssigneeCode})
                            if (user) {
                                doc.defaultAssigneeId = user._id
                            }
                            delete doc.originAssigneeCode
                        }

                        let customerContext = Core.Schemas.Customer.namedContext("customerData");
                        customerContext.validate(doc);
                        if (customerContext.isValid()){
                            let customer = Customers.findOne({originCustomerId: doc.originCustomerId});
                            if (customer){
                                let addresses = doc.addressBook;
                                _.each(addresses, function(address, index){
                                    if (typeof address.originAddressId !== 'string'){
                                       errors.push({id: index, error: "OriginAddressId is invalid"})
                                    }
                                    let existingAddress = _.find(customer.addressBook, function(a){ return a.originAddressId == address.originAddressId; });
                                    if (existingAddress){
                                        address._id = existingAddress._id;
                                    }
                                });
                                if (errors.length > 0){
                                  res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                                } else {
                                    delete doc.originCustomerId;
                                    let customerId = Customers.update({_id: customer._id}, {$set: doc});
                                    if (customerId){
                                        res = {statusCode: 200, body: {status: "success", data: {message: "Customer updated"}}}
                                    } else {
                                        res = {statusCode: 400, body: {status: "failed", data: {message: "Cannot update customer"}}}
                                    }
                                }
                            } else{
                                _.each(doc.addressBook, function(address, index){
                                    if (typeof address.originAddressId !== 'string'){
                                        errors.push({id: index, error: "OriginAddressId is invalid"})
                                    }
                                });
                                if (errors.length > 0){
                                    res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                                } else {
                                    doc.createdBy = user;
                                    let customerId =  Customers.insert(doc);
                                    if (customerId){
                                        res = {statusCode: 200, body: {status: "success", data: {message: "Customer created"}}}
                                    } else {
                                        res = {statusCode: 400, body: {status: "failed", data: {message: "Cannot create customer"}}}
                                    }
                                }
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: customerContext._invalidKeys}}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}} ;
                }
            }
        }
    });

    Api.addRoute('customers/:id/transactions', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                let originCustomerId = this.urlParams.id;
                doc.postingDate = new Date(doc.postingDate);
                if (group  && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let transactionContext = Core.Schemas.CustomerTransaction.namedContext("transactionData");
                        transactionContext.validate(doc);
                        if (transactionContext.isValid()){
                            let customer =  Customers.findOne({customerNumber: originCustomerId});
                            if (customer){
                                doc.customerId = customer._id;
                                let transaction = CustomerTransactions.findOne({originDocumentNo: doc.originDocumentNo});
                                if (transaction){
                                    let updateDoc = {};
                                    updateDoc.isOpen = doc.isOpen;
                                    updateDoc.narration = doc.narration;
                                    updateDoc.reference = doc.reference;
                                    let state =  CustomerTransactions.update({originDocumentNo: doc.originDocumentNo}, {$set: updateDoc});
                                    if (state === 1){
                                        res = {statusCode: 200, body: {status: "success", data: {message: "Transaction updated"}}}
                                    } else {
                                        res = {statusCode: 400, body: {status: "failed", data: {message: "failed to update transaction"}}}
                                    }
                                } else {
                                    let transactionId =  CustomerTransactions.insert(doc);
                                    if (transactionId) {
                                        res = {statusCode: 200, body: {status: "success", data: {message: "Transaction created", id: transactionId}}}
                                    } else {
                                        res = {statusCode: 400, body: {status: "failed", data: {message: "failed to create transaction"}}}
                                    }
                                }
                            } else {
                                res = {statusCode: 404, body: {status: "failed", data: {message: "Customer not found"}}};
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: transactionContext._invalidKeys}}}
                        }
                    });
                    if (res)    return res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}} ;
                }
            }
        }
    });


    Api.addRoute('customers/:id/addresses', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                let originCustomerId = this.urlParams.id;
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    let errors = []
                    Partitioner.bindUserGroup(user, function () {
                        let addressContext = Core.Schemas.Address.namedContext("addressData");
                        addressContext.validate(doc);
                        if (addressContext.isValid()){
                            let customer = Customers.findOne({originCustomerId: originCustomerId});
                            if (customer) {
                                let existingAddress = _.find(customer.addressBook, function(a){ return a.originAddressId == doc.originAddressId; });
                                if (existingAddress){
                                    doc._id = existingAddress._id
                                }
                                let customerId = customer._id;
                                if (doc.isShippingDefault || doc.isBillingDefault) {
                                    if (doc.isShippingDefault) {
                                        Customers.update({
                                            "_id": customerId,
                                            "addressBook.isShippingDefault": true
                                        }, {
                                            $set: {
                                                "addressBook.$.isShippingDefault": false
                                            }
                                        });
                                    }
                                    if (doc.isBillingDefault) {
                                        Customers.update({
                                            "_id": customerId,
                                            "addressBook.isBillingDefault": true
                                        }, {
                                            $set: {
                                                "addressBook.$.isBillingDefault": false
                                            }
                                        });
                                    }
                                }
                                if (typeof doc.originAddressId !== 'string'){
                                    errors.push({error: "OriginAddressId is invalid"})
                                }

                                if (errors.length > 0){
                                    res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                                } else {
                                    let existingAddresses = _.find(customer.addressBook, function(a){ return a.originAddressId == doc.originAddressId; });
                                    if (existingAddresses){
                                       doc._id = existingAddresses._id;
                                       let state = Customers.update({_id: customerId, "addressBook._id": doc._id},
                                            {
                                                "$set": {
                                                    'addressBook.$.phone': doc.phone,
                                                    'addressBook.$.isBillingDefault': doc.isBillingDefault,
                                                    'addressBook.$.postal': doc.postal,
                                                    'addressBook.$.company': doc.company,
                                                    'addressBook.$.state': doc.state,
                                                    'addressBook.$.isCommercial': doc.isCommercial,
                                                    'addressBook.$.address1': doc.address1,
                                                    'addressBook.$.address2': doc.address2,
                                                    'addressBook.$.fullName': doc.fullName,
                                                    'addressBook.$.isShippingDefault': doc.isShippingDefault,
                                                    'addressBook.$.city': doc.city,
                                                    'addressBook.$.country': doc.country
                                                }
                                            });
                                        if (state === 1){
                                            res = {statusCode: 200, body: {status: "success", data: {message: "Customer address updated"}}}
                                        } else {
                                            res = {statusCode: 400, body: {status: "failed", data: {message: "Failed to update customer address"}}}
                                        }
                                    } else {
                                        let state   = Customers.update(customerId, {$addToSet: {"addressBook": doc}});
                                        if (state === 1){
                                            res = {statusCode: 200, body: {status: "success", data: {message: "Customer address created"}}}
                                        } else {
                                            res = {statusCode: 400, body: {status: "failed", data: {message: "Failed to create customer address"}}}
                                        }
                                    }
                                }
                            } else {
                                res = {statusCode: 404, body: {status: "failed", data: {message: "customer Not found"}}}
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: addressContext._invalidKeys}}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}};
                }
            }
        }
    });

    Api.addRoute('customers/:id/accounts', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let originCustomerId = this.urlParams.id;
                let doc = this.bodyParams;
                doc.valueDate = new Date(doc.valueDate);
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let accountContext = Core.Schemas.CustomerAccount.namedContext("accountData");
                        accountContext.validate(doc);
                        if (accountContext.isValid()){
                            let customer = Customers.findOne({originCustomerId: originCustomerId});
                            if (customer) {
                                let state = Customers.update(customer._id, {$set: {"account": doc}});
                                if (state === 1) {
                                    res = {statusCode: 200, body: {status: "success", data: {message: "Customer account updated"}}}
                                } else {
                                    res = {statusCode: 400, body: {status: "failed", data: {message: "Failed to update customer account"}}}
                                }
                            } else {
                                res = {statusCode: 404, body: {status: "failed", data: {message: "customer Not found"}}}
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: accountContext._invalidKeys}}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, body: {status: "failed", data: {message: "Tenant not found"}}};
                }
            }
        }
    });
}