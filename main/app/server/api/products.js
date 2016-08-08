if (Meteor.isServer) {

    var Api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true,
        version: 'v1'
    });


    Api.addRoute('products/:id', {authRequired: true}, {
        get: function () {
            let group = this.request.headers['x-tenant-id'];
            let user = this.request.headers['x-user-id'];
            let originProductId = this.urlParams.id;
            if (group && Core.checkUserTenant(group, user)) {
                let res;
                Partitioner.bindUserGroup(user, function () {
                    let product =  Products.findOne({originProductId: originProductId});
                    if (product){
                        res = product
                    } else {
                        res = {statusCode: 404, status: 'failed', data: {message: 'Product not found'}};
                    }
                });
                if (res)     return res
            } else {
                return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
            }

        },
        delete: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let originProductId = this.urlParams.id;
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let product = Products.findOne({_id: originProductId});
                        if (product){
                            Products.remove(product._id);
                            res = {status: 'success', data: {message: 'Product deleted'}}
                        } else {
                            res  = {statusCode: 404, status: 'failed', message: 'Product not found'}
                        }
                    });
                    if (res)  return res;
                    else {
                        return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                    }
                }
            }},
        put: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let originProductId = this.urlParams.id;
                let doc = this.bodyParams;
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        if (doc.originBrandId) {
                            let brand = Brands.findOne({originBrandId: doc.originBrandId});
                            if (brand) {
                                doc.brandId = brand._id;
                                delete doc.originBrandId
                            } else {
                                res =  {statusCode: 404,
                                    body: {status: 'failed', message: "Brand not found"}
                                };
                                return res
                            }
                        }
                        let productContext = Core.Schemas.Product.namedContext("productData");
                        productContext.validate(doc);
                        if (productContext.isValid()){
                            let product = Products.findOne({originProductId: originProductId});
                            if (product) {
                                let productId = Products.update({originProductId: originProductId}, {$set: doc});
                                if (productId) {
                                    res =  {statusCode: 200,
                                        body: {status: 'success', message: "Product updated"}
                                    };
                                } else {
                                    res =  {statusCode: 404,
                                        body: {status: 'failed', message: "Product not update failed"}
                                    };
                                }
                            } else {
                                res =  {statusCode: 404,
                                    body: {status: 'failed', message: "Product not found"}
                                };
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: productContext._invalidKeys}}}
                        }
                    });
                    if (res)  return res;
                    else {
                        return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                    }

                }
            }
        }
    });


    Api.addRoute('products/batch-insert', {authRequired: true}, {
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
                    let errors = [];
                    Partitioner.bindUserGroup(user, function () {
                        _.each(documents, function (doc, indexC) {
                            doc.createdBy = user
                            if (typeof doc.originProductId !== 'string'){
                                errors.push({id: indexC, error: "OriginProductId is invalid"})
                            }
                            let availableProduct = Products.findOne({originProductId: doc.originProductId});
                            if (availableProduct){
                                errors.push({id: doc.originProductId, error: "This product already exists"})
                            }
                            if(doc.originBrandId){
                                let brand = Brands.findOne({originBrandId: doc.originBrandId});
                                if (brand){
                                    doc.brandId = brand._id;
                                    delete doc.originBrandId
                                } else {
                                    errors.push({id: doc.originBrandId, error: "Brand not found"})
                                }
                            }
                            let productContext = Core.Schemas.Product.namedContext("productData");
                            productContext.validate(doc);
                            if (!productContext.isValid()){
                                errors.push({id: doc.originProductId, error: productContext._invalidKeys})
                            }
                        });
                        if (errors.length > 0 ){
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                        } else {
                            Products.insertMultiple(documents);
                            res =  {statusCode: 200,
                                body: {status: 'success', message: "Batch operation completed"}
                            };
                        }
                    });
                    if (res)     return res;
                } else {
                    return {status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('products', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                if (typeof doc.originProductId !== 'string'){
                    return {statusCode: 400, body: {status: "failed", data: {message: "originProductId is invalid"}}}
                }
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let productContext = Core.Schemas.Product.namedContext("productData");
                        productContext.validate(doc);
                        if (productContext.isValid()){
                        if(doc.originBrandId){
                            let brand = Brands.findOne({originBrandId: doc.originBrandId});
                            if (brand){
                                doc.brandId = brand._id;
                                delete doc.originBrandId
                            } else {
                                res =  {statusCode: 404,
                                    body: {status: 'failed', message: "Brand not found. Please ensure to " +
                                    "import your brands with the brand " +
                                    "api and try again." + " " + doc.originBrandId}
                                };
                            }
                        }
                        let availableProduct = Products.findOne({originProductId: doc.originProductId});
                        if (availableProduct){
                            let productId = Products.update({originProductId: doc.originProductId}, {$set: doc});
                            if (productId) {
                                res =  {statusCode: 200,
                                    body: {status: 'success', message: "Product updated"}
                                };
                            } else {
                                res =  {statusCode: 404,
                                    body: {status: 'failed', message: "Product not update failed"}
                                };
                            }
                        } else {
                                doc.createdBy = user;
                                let product =  Products.insert(doc);
                                if (product){
                                    res =  {statusCode: 200,
                                        body: {status: 'success', message: "Product inserted"}
                                    };
                                } else {
                                    res =  {statusCode: 404,
                                        body: {status: 'failed', message: "Cannot create product"}
                                    }
                                }
                            }
                        } else {
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: productContext._invalidKeys}}}
                        }
                    });
                    if (res)     return res;
                } else {
                    return {status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('products/:id/variants', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                let originProductId = this.urlParams.id;
                if (typeof doc.originVariantCode !== 'string'){
                    return {statusCode: 400, body: {status: "failed", data: {message: "originVariantCode is invalid"}}}
                }
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let errors = [];
                        _.each(doc.locations, function(location){
                            let variantLocation = Locations.findOne({originLocationId: location.originLocationId});
                            if (variantLocation){
                                location.locationId = variantLocation._id;
                                delete location.originLocationId
                            } else {
                                errors.push({id: location.originLocationId, message: "Location not found" })
                            }
                        });
                        if (doc.variantPrices){
                            _.each(doc.variantPrices, function(variantPrice){
                                let priceList = PriceLists.findOne({code: variantPrice.priceListCode});
                                if (!priceList){
                                    errors.push({id: variantPrice.priceListCode, message: "Pricelist not found" })
                                }
                            });
                        }
                        if (errors.length > 0){
                            res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data", errors: errors}}}
                        } else {
                            let product =  Products.findOne({originProductId: originProductId});
                            if (product) {
                                doc.productId = product._id;
                            let productVariantContext = Core.Schemas.ProductVariant.namedContext("productVariantData");
                            productVariantContext.validate(doc);
                            if (productVariantContext.isValid()){
                                    let availableVariant = ProductVariants.findOne({originVariantCode: doc.originVariantCode});
                                    if (availableVariant){
                                        delete doc.originVariantCode;
                                        let productVariant =  ProductVariants.update({_id: availableVariant._id}, {$set: doc});
                                        if (productVariant){
                                            res =  {statusCode: 200,
                                                body: {status: 'success', message: 'Product variant updated'}
                                            };
                                        } else {
                                            res =  {statusCode: 404,
                                                body: {status: 'failed', message: 'Failed to update product variant'}
                                            };
                                        }
                                    } else {
                                        let variant =  ProductVariants.insert(doc);
                                        if (variant){
                                            res =  {statusCode: 200,
                                                body: {status: 'success', message:  'Product variant created'}
                                            };
                                        } else {
                                            res =  {statusCode: 404,
                                                body: {status: 'success', message:  'Failed to create product variant'}
                                            };
                                        }
                                    }
                            } else {
                                res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: productVariantContext._invalidKeys}}}
                            }
                            } else {
                                res =  {statusCode: 404,
                                    body: {status: 'failed', message:  'Product cannot be found'}
                                };
                            }
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });

    Api.addRoute('variants/batch-insert', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                if (!_.isArray(doc)){
                    return  {statusCode: 400, body: {status: "failed", data: {message: "Document must be an array"}}};
                }
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    let errorMessages = [];
                    Partitioner.bindUserGroup(user, function () {
                            _.each(documents, function (doc, index) {
                                if (typeof doc.originVariantCode !== 'string'){
                                    errorMessages.push({id: index, error: "originVariantCode is invalid"})
                                }
                                _.each(doc.locations, function(location){
                                    let variantLocation = Locations.findOne({originLocationId: location.originLocationId});
                                    if (!variantLocation){
                                        errorMessages.push({id: doc.originVariantCode, message: "Location not found"})
                                    }
                                });

                                if (doc.variantPrices){
                                    _.each(doc.variantPrices, function(variantPrice){
                                        let priceList = PriceLists.findOne({code: variantPrice.priceListCode});
                                        if (!priceList){
                                            errorMessages.push({id: doc.originVariantCode, message: "Pricelist not found"})
                                        }
                                    });
                                }

                                let product =  Products.findOne({originProductId: doc.originProductId});
                                if (!product){
                                    errorMessages.push({id: doc.originVariantCode, message: "Product not found"})
                                }

                                let availableVariant = ProductVariants.findOne({originVariantCode: doc.originVariantCode});

                                if (availableVariant){
                                    errorMessages.push({id: doc.originVariantCode, message: "Product variant already exists"})
                                }
                                let productVariantContext = Core.Schemas.ProductVariant.namedContext("productVariantData");
                                productVariantContext.validate(doc);
                                if (!productVariantContext.isValid()){
                                    errorMessages.push({id: doc.originCustomerId, error: productVariantContext._invalidKeys})
                                }
                            });

                        if (errorMessages.length > 0){
                            res =  {statusCode: 400,
                                body: {status: 'failed', message: 'Batch insert failed with error(s)', errors: errorMessages}
                            };
                        } else {
                            ProductVariants.insertMultiple(doc);
                            res =  {statusCode: 200,
                                body: {status: 'success', message: "Batch operation completed"}
                            };
                        }

                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 400, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        }
    });





    Api.addRoute('product-variants/:id/locations', {authRequired: true}, {
        post: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                let variantCode = this.urlParams.id;
                if (typeof doc.originLocationId !== 'string'){
                    return {statusCode: 400, body: {status: "failed", data: {message: "originLocationId is invalid"}}}
                }
                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let location = Locations.findOne({originLocationId: doc.originLocationId});
                        if (location){
                            let variant =  ProductVariants.findOne({originVariantCode: variantCode});
                            if (variant) {
                                let variantLocation = _.findWhere(variant.locations, {locationId: location._id});
                                if (variantLocation){
                                    res = {status: 'failed', data: {message: 'Location already exists'}}
                                } else {
                                    doc.locationId = location._id;
                                    delete doc.originLocationId;

                                    let variantLocationContext = Core.Schemas.VariantLocation.namedContext("variantLocationData");
                                    variantLocationContext.validate(doc);
                                    if (variantLocationContext.isValid()){
                                        let updateStatus =  ProductVariants.update({_id: variant._id},
                                            {
                                                "$addToSet": {locations: doc}
                                            });
                                        if (updateStatus){
                                            res =  {statusCode: 200,
                                                body: {status: 'success', message: 'Stock updated'}
                                            };
                                        } else {
                                            res =  {statusCode: 404,
                                                body: {status: 'failed', message: 'Failed to update stock'}
                                            };
                                        }
                                    } else {
                                        res = {statusCode: 400, body: {status: "failed", data: {message: "Invalid data ", errors: variantLocationContext._invalidKeys}}}
                                    }
                                }
                            } else {
                                res =  {statusCode: 404,
                                    body: {status: 'failed', message: 'Variant cannot be found'}
                                };
                            }
                        } else {
                            res =  {statusCode: 404,
                                body: {status: 'failed', message: 'Location  not found'}
                            };
                        }
                    });
                    if (res)     return res;
                } else {
                    return {statusCode: 404, status: 'failed', data: {message: 'Tenant not found'}};
                }
            }
        },

        put: {
            action: function () {
                let group = this.request.headers['x-tenant-id'];
                let user = this.request.headers['x-user-id'];
                let doc = this.bodyParams;
                let variantCode = this.urlParams.id;

                if (typeof doc.stockOnHand !== 'number'){
                    return {statusCode: 400, body: {status: "failed", data: {message: "StockOnHand is invalid"}}}
                }
                if (typeof doc.originLocationId !== 'string'){
                    return {statusCode: 400, body: {status: "failed", data: {message: "originLocationId is invalid"}}}
                }

                if (group && Core.checkUserTenant(group, user)) {
                    let res;
                    Partitioner.bindUserGroup(user, function () {
                        let location = Locations.findOne({originLocationId: doc.originLocationId});
                        if (location){
                            let variant =  ProductVariants.findOne({originVariantCode: variantCode});
                            if (variant) {
                                let variantLocation = _.findWhere(variant.locations, {locationId: location._id});
                                if (variantLocation){
                                    let updateStatus =  ProductVariants.update({_id: variant._id, "locations.locationId": location._id},
                                        {
                                            "$set": {
                                                'locations.$.stockOnHand': doc.stockOnHand
                                            }
                                        });
                                    if (updateStatus){
                                        res =  {statusCode: 200,
                                            body: {status: 'success', message: 'Stock updated'}
                                        };
                                    } else {
                                        res =  {statusCode: 404,
                                            body: {status: 'failed', message: 'Failed to update stock'}
                                        };
                                    }
                                } else {
                                    res =  {statusCode: 404,
                                        body: {status: 'failed', message: 'Location  not found for this variant'}
                                    };
                                }
                            } else {
                                res =  {statusCode: 404,
                                    body: {status: 'failed', message: 'Product variant  not found'}
                                };
                            }
                        } else {
                            res =  {statusCode: 404,
                                body: {status: 'failed', message: 'Location  not found'}
                            };
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