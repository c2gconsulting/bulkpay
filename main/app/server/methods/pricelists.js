_.extend(Core, {
    updatePriceList:function (doc, userId, callback) {

        let user = Meteor.users.findOne(userId);
        if (userId){
            if (doc.resetPriceList){
                _.each(doc.items, function (i) {
                    let pg = PriceListGroups.findOne({originCode: i.priceListCode});
                    if (pg){
                        let pVariant = ProductVariants.findOne({code: i.originItemCode});
                        if (pVariant){
                            _.each(pg.priceLists, function (pr) {
                                let vPrice =  _.findWhere(pVariant.variantPrices, {priceListCode: pr._id});
                                if (vPrice) {
                                    ProductVariants.update({_id: pVariant._id}, {$pull: {"variantPrices": {"priceListCode": pr._id}}});
                                    PriceListGroups.update({_id: pg._id}, {$pull: {priceLists: pr}});
                                }
                            });
                        }
                    }
                });
            }

            let errors = [];
            _.each(doc.items, function(item, index){
                let startD = new Date(item.startDate);
                let endD = new Date(item.endDate);
                if (!(startD instanceof Date)){
                    errors.push({id: index, error: "Invalid start date"});
                }
                if (!(endD instanceof Date)){
                    errors.push({id: index, error: "Invalid end date"});
                }
                if (typeof item.priceListCode !== 'string'){
                    errors.push({id: index, error: "Invalid pricelist code"});
                }
                if (typeof item.value !== 'number'){
                    errors.push({id: index, error: "Value is not a number"});
                }
                let productVariant = ProductVariants.findOne({code: item.originItemCode});
                if (productVariant) {
                    let priceListCode = item.priceListCode;
                    let customerGroupCode = item.customerGroupCode;
                    let pricelist, p;
                    if (priceListCode && !customerGroupCode){
                        pricelist = PriceListGroups.findOne({originCode: priceListCode})
                    } else if (customerGroupCode && priceListCode) {
                        let availablePriceList = PriceListGroups.findOne({originCode: priceListCode});
                        if (availablePriceList) {
                            p = _.find(availablePriceList.priceLists, function(priceList) {return priceList.originCode === item.originPriceListCode});
                            pricelist = availablePriceList;
                            let mappedPrice = _.find(availablePriceList.customerGroupCodes, function(code){ return code  === item.customerGroupCode; });
                            if (!mappedPrice){
                                PriceListGroups.update({_id: availablePriceList._id}, {$addToSet: {customerGroupCodes: item.customerGroupCode}});
                            }
                            if (p && (p.startDate !== startD || p.endDate !== endD)){
                                PriceListGroups.update({_id: availablePriceList._id, "priceLists._id": p._id}, {$set:
                                {
                                    "priceLists.$.startDate": startD,
                                    "priceLists.$.endDate": endD
                                }
                                });
                            } else if (!p){
                                let pDoc = {};
                                pDoc.startDate = startD;
                                pDoc.endDate = endD;
                                pDoc.originCode = item.originPriceListCode;
                                PriceListGroups.update({_id: availablePriceList._id}, {$addToSet: {priceLists: pDoc}});
                                pricelist = PriceListGroups.findOne({originCode: priceListCode});
                                p = _.find(pricelist.priceLists, function(priceList) {return priceList.originCode === item.originPriceListCode});
                            }
                        }
                    } else {
                        errors.push({id: index, error: "Customer group code or price list code must be specified"});
                    }
                    if (pricelist){
                        let variantPrice;
                        if (p){
                            variantPrice =  _.findWhere(productVariant.variantPrices, {priceListCode: p._id});
                        }
                        if (variantPrice){
                            ProductVariants.update({_id: productVariant._id, "variantPrices.priceListCode": p._id},
                                {
                                    "$set": {
                                        'variantPrices.$.value': item.value
                                    }
                                });
                        } else {
                            if (p){
                                let newProperty = {};
                                newProperty.value = item.value;
                                newProperty.priceListCode = p._id;
                                ProductVariants.update({_id: productVariant._id},
                                    {
                                        "$addToSet": {
                                            'variantPrices': newProperty
                                        }
                                    });
                            }
                        }
                    } else {
                        let priceListDoc = {};
                        priceListDoc.priceLists = [{
                            startDate: startD,
                            endDate: endD,
                            originCode: item.originPriceListCode
                        }];
                        priceListDoc.originCode = item.priceListCode;
                        priceListDoc.name = item.priceListName;
                        if (typeof item.currencyISO !== 'string'){
                            errors.push({id: index, error: "Invalid currencyISO"});
                        }
                        priceListDoc.currencyISO = item.currencyISO;
                        priceListDoc.customerGroupCodes = [item.customerGroupCode];
                        let priceListContext = Core.Schemas.PriceListGroup.namedContext("priceListData");
                        priceListContext.validate(priceListDoc);
                        if (priceListContext.isValid()){
                            let newPriceList = PriceListGroups.insert(priceListDoc);
                            if (newPriceList){
                                let newProperty = {};
                                newProperty.value = item.value;
                                let priceListGroup = PriceListGroups.findOne(newPriceList);
                                let newPrice = _.find(priceListGroup.priceLists, function(priceList) {return priceList.originCode === item.originPriceListCode});
                                if (newPrice){
                                    newProperty.priceListCode = newPrice._id;
                                    ProductVariants.update({_id: productVariant._id},
                                        {
                                            "$addToSet": {
                                                'variantPrices': newProperty
                                            }
                                        });
                                }
                            }
                        } else {
                            errors.push({id: index, error: priceListContext._invalidKeys});
                        }
                    }
                } else {
                    errors.push({id: index, error: "Cannot find variant with code " + item.originItemCode });
                }
            });
            if (errors.length > 0 ){
                callback(errors, null);
            } else {
                callback(null, true);
            }
        } else {
            callback("Unauthorized", null)
        }
    }
})