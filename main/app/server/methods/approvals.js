/**
 *  Promotions Methods
 */
Meteor.methods({
    /**
     * approvals/applyRulesToOrder
     * @summary apply rule order promotions
     * @param {Object} order - order body
     * @return {Object} returns promotions apply result
     */
    "approvals/applyRulesToOrder": function(order, documentType) {
        // check(order, Core.Schemas.Order);
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        if (order) {

            let approvals = Approvals.find({
                status: "active", documentType: documentType
            }, {
                fields: {
                    rules: 1,
                    name: 1
                }
            }).fetch();

            let items = [];
            let groupedItems = _.groupBy(items, function (el) {
                return el.variantId
            });
            let variantIds = _.keys(groupedItems);

            _.each(variantIds, function (v) {
                _.reduce(groupedItems[v], function (el1, el2) {
                    let item = {};
                    item.variantId = el1.variantId;
                    item.quantity = el1.quantity + el2.quantity;
                    item.price = el1.price;
                    item.taxRateOverride = el1.taxRateOverride;
                    items.push(item)
                });
            });
            let variant_ids = _.map(order.items, function (obj) {
                return obj.variantId;
            });
            let variants = ProductVariants.find({_id: {$in: variant_ids}}).fetch();

            let promotionResult = [];
            let requireApproval = false;
            if (approvals) {
                _.each(approvals, function (approval) {
                    _.each(approval.rules, function (rule) {
                        let parent;
                        let param = ApprovalParameters.findOne({_id: rule.approvalParameterId});
                        if (param.lookUpObject){
                            parent = eval(param.lookUpObject).findOne(rule.subParamValue);
                        }
                        if (order.hasOwnProperty(param.parameterNameInParentSchema)) {
                            if (testRuleOperator(order[param.parameterNameInParentSchema], rule.value, rule.operator)) {
                                requireApproval = true;
                                Core.Log.info(`[Approval Review] required: ${requireApproval}, for ${param.parameterNameInParentSchema} ${rule.operator} ${rule.value}`);
                            }
                        } else {
                            if (rule.subParamValue) {
                                if (parent) {
                                    let parentId = parent._id;
                                    switch (param.lookUpObject) {
                                        case 'ProductVariants':
                                            if (documentType === "Order"){
                                                _.each(order.items, function(item) {
                                                    if (evaluateItemRule(item, rule, param, variants, order.stockLocationId)) {
                                                        requireApproval = true;
                                                        Core.Log.info(`[Approval Review] order: ${order.orderNumber}, required: ${requireApproval}, for ${param.parameterNameInParentSchema} ${rule.operator} ${rule.value}, item: ${item.originVariantCode}`);
                                                    }
                                                });
                                                _.each(items, function(item) {
                                                    if (evaluateItemRule(item, rule, param, variants, order.stockLocationId)) {
                                                        requireApproval = true;
                                                        Core.Log.info(`[Approval Review] order: ${order.orderNumber}, required: ${requireApproval}, for ${param.parameterNameInParentSchema} ${rule.operator} ${rule.value}, item: ${item.originVariantCode} `);
                                                    }
                                                });
                                            }
                                            break;
                                    }
                                }
                            } else if (param.lookUpObject) {
                                switch (param.lookUpObject) {
                                    case 'ProductVariants':
                                        if (documentType === "Order") {
                                            _.each(order.items, function(item) {
                                                if (evaluateItemRule(item, rule, param, variants, order.stockLocationId)) {
                                                    requireApproval = true;
                                                    Core.Log.info(`[Approval Review] order: ${order.orderNumber}, required: ${requireApproval}, for ${param.parameterNameInParentSchema} ${rule.operator} ${rule.value}, item: ${item.originVariantCode} `);
                                                }
                                            });
                                            _.each(items, function (item) {
                                                if (evaluateItemRule(item, rule, param, variants, order.stockLocationId)) {
                                                    requireApproval = true;
                                                    Core.Log.info(`[Approval Review] order: ${order.orderNumber}, required: ${requireApproval}, for ${param.parameterNameInParentSchema} ${rule.operator} ${rule.value}, item: ${item.originVariantCode} `);
                                                }
                                            });
                                        }
                                        break;

                                    case 'Orders':
                                        if (documentType === "ReturnOrder"){
                                            let oOrder = Orders.findOne({orderNumber: order.orderNumber});
                                            if (oOrder){
                                                _.each(order.items, function (item) {
                                                    let iItem = _.find(oOrder.items, function(i) {return i._id === item.orderItemId});
                                                    if (iItem){
                                                        if (evaluateRule(item.quantity, iItem.quantity, rule, param)) {
                                                            requireApproval = true;
                                                            Core.Log.info(`[Approval Review] order: ${order.orderNumber}, required: ${requireApproval}, for ${rule.name} ${rule.operator} ${rule.value !== null && rule.value !== undefined ? rule.value : iItem.quantity}, item: ${item.originVariantCode} `);
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                }
                            }else {
                                //Calculate order quantity and value
                                let quantity = 0, value = 0;
                                _.each(order.items, function (item) {
                                    quantity += item.quantity;
                                });

                                value = order.total;
                                if (evaluateRule(quantity, value, rule, param)){
                                    requireApproval = true;
                                    Core.Log.info(`[Approval Review] order: ${order.orderNumber}, required: ${requireApproval}, for ${rule.name} ${rule.operator} ${rule.value !== null && rule.value !== undefined ? rule.value : value} order quantity or  value`);
                                }
                            }
                        }
                    });
                });
            }

            return requireApproval
        }
    }
})

function testRuleOperator(left, right, operator) {
    let test;
    switch (operator) {
        case 'is':
            test = left === right;
            break;
        case 'before':
            test = left < right;
            break;
        case 'after':
            test = left > right;
            break;
        case 'exactly':
            test = left === right;
            break;
        case 'less-than':
            test = left < right;
            break;
        case 'greater-than':
            test = left > right;
            break;
        default:
            test = false;
    }
    return test;
}

function evaluateItemRule(item, rule, parameters, variants, locationId) {
    let value = item.quantity * item.price * (100 + item.taxRateOverride) / 100;
    if (parameters.parameterNameInParentSchema == 'quantity' && testRuleOperator(item.quantity, rule.value, rule.operator)) {
        return true
    } else if (parameters.parameterNameInParentSchema == 'value' && testRuleOperator(value, rule.value, rule.operator)) {
        return true
    } else if (parameters.parameterNameInParentSchema === "stockOnHand"){
        if (rule.value !== null && rule.value !== undefined && rule.value !== "available" && testRuleOperator(item.quantity, rule.value, rule.operator)){
            return true
        } else if (rule.value === "available") {
            let variant = _.find(variants, function (v) {
                return v._id === item.variantId
            });
            if (variant) {
                let variantLocation = _.find(variant.locations, function (location) {
                    return location.locationId === locationId
                });
                if (variantLocation) {
                    return testRuleOperator(item.quantity, variantLocation.stockOnHand, rule.operator)
                }
            }
        }
    } else if (parameters.parameterNameInParentSchema === "discount" && testRuleOperator(item.discount, rule.value, rule.operator)){
        return true
    } else {
        return false
    }
}

function evaluateRule(quantity, value, rule, param){
    if (rule.value !== null && rule.value !== undefined){
        if (param.parameterNameInParentSchema === 'quantity' && testRuleOperator(quantity, rule.value, rule.operator)) {
            return true
        } else if (param.parameterNameInParentSchema === 'value' && testRuleOperator(value, rule.value, rule.operator)) {
            return true
        } else {
            return false
        }
    } else if (param.parameterNameInParentSchema === "stockOnHand" && testRuleOperator(quantity, value, rule.operator)) {
        return true
    } else {
        return false
    }
}