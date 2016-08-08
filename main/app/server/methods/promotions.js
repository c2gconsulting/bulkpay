/**
 *  Promotions Methods
 */
Meteor.methods({

  /**
   * promotions/createParameter
   * @summary when we create a new promotion parameter and attach all the necessary fields
   * @param {Object} promotion - optional promotion object
   * @return {String} return insert result
   */

  "promotions/createParameter": function(promotionParameter) {
    let userId = Meteor.userId();
    
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    try {
      check(promotionParameter, Core.Schemas.PromotionParamater);
    } catch (e) {
      throw new Meteor.Error(401, "There's invalid data in your promotion parameter. Please correct and retry");
    }
    // Check if user has access to manage promotions
    if (Core.hasPromotionAccess(userId)) {
      // must have promotions/manage permissions
      this.unblock();

      return PromotionParamaters.insert(promotionParameter);
    } else {
      throw new Meteor.Error(403, "You are not authorized to create an promotion for this location");
    }
  },

  /**
   * promotions/updateParameter
   * @summary when we update a new promotion parameter and attach all the necessary fields
   * @param {Object} promotion - optional promotion object
   * @return {String} return update result
   */

  "promotions/updateParameter": function(promotionParameterId, update, userId) {
    userId = userId || Meteor.userId();
    if (update) {
      // Check if user has access to manage promotions
      if (Core.hasPromotionAccess(userId)) {
        // must have promotions/manage permissions
        this.unblock();

        return PromotionParamaters.update(promotionParameterId, {
          $set: update
        });

      } else {
        throw new Meteor.Error(403, "You are not authorized to create an promotion for this location");
      }
    }
  },

  /**
   * promotions/deleteParameter
   * @summary when we delete a new promotion parameter and attach all the necessary fields
   * @param {Object} promotion - optional promotion object
   * @return {String} return delete result
   */

  "promotions/deleteParameter": function(promotionParameterId, userId) {
    userId = userId || Meteor.userId();
    if (update) {
      // Check if user has access to manage promotions
      if (Core.hasPromotionAccess(userId)) {
        // must have promotions/manage permissions
        this.unblock();
        let promotions = Promotions.find({
          "rules.promotionParameterId": promotionParameterId
        }, {
          fields: {
            rules: {
              $elemMatch: {
                promotionParameterId: promotionParameterId
              }
            }
          }
        });

        if (!_.isEmpty(promotions)) {
          return new Meteor.Error(400, "Promotion paramenter is already in use");
        }

        return PromotionParamaters.remove(promotionParameterId);

      } else {
        throw new Meteor.Error(403, "You are not authorized to create an promotion for this location");
      }
    }
  },

  /**
   * promotions/createPromotion
   * @summary when we create a new promotion attach all the necessary fields
   * @param {Object} promotion - optional promotion object
   * @return {String} return insert result
   */
  "promotions/create": function(promotion, userId) {
    userId = userId || Meteor.userId();
    promotion.userId = userId;
    let timezone = Core.getTimezone(userId);

    try {
      check(promotion, Core.Schemas.Promotion);
    } catch (e) {
      console.log(e)
      throw new Meteor.Error(401, "There's invalid data in your promotion. Please correct and retry");
    }

    if (promotion.startDate) {
      promotion.startDate = moment(promotion.startDate).tz(timezone).startOf('day').toDate();
    }

    if (promotion.endDate) {
      promotion.endDate = moment(promotion.endDate).tz(timezone).endOf('day').toDate();
    }

    // Check if user has access to manage promotions
    if (Core.hasPromotionAccess(userId)) {
        // must have promotions/manage permissions
      this.unblock();
      let promoId = Promotions.insert(promotion);
      let promo = Promotions.findOne(promoId)
      if (promoId) {
        sendPromotionNotification("promotion.created", promo, userId);
      }
      return promoId;
    } else {
      throw new Meteor.Error(403, "You are not authorized to create an promotion for this location");
    }
  },

  /**
   * promotions/update
   * @summary update promotion
   * @param {String} promotionId - promotionId to update
   * @returns {String} returns update results
   */
  "promotions/update": function(promoId, promotion, userId) {
    userId = userId || Meteor.userId();
    let timezone = Core.getTimezone(userId);

    try {
      check(promotion, Core.Schemas.Promotion);
    } catch (e) {
      console.log(e)
      throw new Meteor.Error(401, "There's invalid data in your promotion. Please correct and retry");
    }

    delete promotion._id;
    delete promotion.createdAt;
    delete promotion.userId;
    delete promotion.createdBy;

    if (promotion.startDate) {
      promotion.startDate = moment(promotion.startDate).tz(timezone).startOf('day').toDate();
    }

    if (promotion.endDate) {
      promotion.endDate = moment(promotion.endDate).tz(timezone).endOf('day').toDate();
    }

    // Check if user has access to manage promotions
    if (Core.hasPromotionAccess(userId)) {
      // must have promotions/manage permissions
      this.unblock();

      return Promotions.update({ _id: promoId }, { $set: promotion });
    } else {
      throw new Meteor.Error(403, "Access Denied");
    }
  },

  /**
   * promotions/updateStatus
   * @summary updateStatus orderItem
   * @param {String} promotionId - promotionId to update status
   * @returns {String} returns update results
   */
  "promotions/updateStatus": function(promotionId, status, userId) {
    userId = userId || Meteor.userId();

    // Check if user has access to manage promotions
    if (Core.hasPromotionApprovalAccess(userId)) {
      // must have promotions/manage permissions
      this.unblock();
      if (status === "active") {
        let approval = {
          approvedBy: userId,
          approvedAt: new Date
        };
        let updateStatus = Promotions.update({ _id: promotionId }, { $set: { status: status }, $addToSet: { approvals: approval } });
        if (updateStatus) {
          let promo = Promotions.findOne(promotionId);
          sendPromotionNotification("promotion.approved", promo, userId);
        }
        return true
      } else {
        return Promotions.update({ _id: promotionId }, { $set: { status: status } })
      }
    } else {
      throw new Meteor.Error(403, "You are not authorized to update promotions for this location");
    }
  },

  /**
   * promotions/delete
   * @summary delete promotion
   * @param {String} promotionId - add rule to promotionId
   * @return {String} returns promotions delete result
   */
  "promotions/delete": function(promotionId, userId) {
    check(promotionId, String);

    userId = userId || Meteor.userId();

    // Check if user has access to manage promotions
    if (Core.hasPromotionAccess(userId)) {
      // must have promotions/manage permissions
      this.unblock();

      return Promotions.remove(promotionId);
    } else {
      throw new Meteor.Error(403, "You are not authorized to delete promotions for this location");
    }
  },
  /**
   * promotions/addRule
   * @summary adds rules to promotions
   * @param {String} promotionId - add rule to promotionId
   * @param {Object} rule - rule body
   * @return {String} returns promotions update result
   */
  "promotions/addRule": function(promotionId, rule) {
    check(rule, Core.Schemas.PromotionRule);
    check(promotionId, String);
    return Promotions.update(promotionId, {
      $addToSet: {
        rules: rule
      }
    });
  },
  /**
   * promotions/updateRule
   * @summary update rules to promotions
   * @param {String} promotionId - add rule to promotionId
   * @param {Object} rule - rule body
   * @return {String} returns promotions update result
   */
  "promotions/updateRule": function(promotionId, rule) {
    check(rule, Core.Schemas.PromotionRule);
    check(promotionId, String);
    return Promotions.update({
      "_id": promotionId,
      "rules._id": rule._id
    }, {
      $set: {
        "rules.$": rule
      }
    });
  },
  /**
   * promotions/deleteRule
   * @summary delete rules to promotions
   * @param {String} promotionId - add rule to promotionId
   * @param {Object} rule - rule body
   * @return {String} returns promotions update result
   */
  "promotions/deleteRule": function(promotionId, rule) {
    check(rule, Core.Schemas.PromotionRule);
    check(promotionId, String);
    return Promotions.update({
      "_id": promotionId,
      "rules._id": rule._id
    }, {
      $pull: {
        "rules": {
          _id: rule._id
        }
      }
    });
  },
  /**
   * promotions/addReward
   * @summary adds rewards to promotions
   * @param {String} promotionId - add rewards to promotionId
   * @param {Object} reward - rule body
   * @return {String} returns promotions update result
   */
  "promotions/addReward": function(promotionId, reward) {
    check(reward, Core.Schemas.PromotionReward);
    check(promotionId, String);
    return Promotions.update(promotionId, {
      $addToSet: {
        rewards: reward
      }
    });
  },
  /**
   * promotions/updateReward
   * @summary update rewards to promotions
   * @param {String} promotionId - add reward to promotionId
   * @param {Object} reward - reward body
   * @return {String} returns promotions update result
   */
  "promotions/updateReward": function(promotionId, reward) {
    check(reward, Core.Schemas.PromotionReward);
    check(promotionId, String);
    return Promotions.remove({
      "_id": promotionId,
      "rewards._id": reward._id
    }, {
      $set: {
        "rewards.$": reward
      }
    });
  },
  /**
   * promotions/deleteReward
   * @summary delete rewards to promotions
   * @param {String} promotionId - add reward to promotionId
   * @param {Object} reward - reward body
   * @return {String} returns promotions update result
   */
  "promotions/deleteReward": function(promotionId, reward) {
    check(reward, Core.Schemas.PromotionReward);
    check(promotionId, String);
    return Promotions.update({
      "_id": promotionId,
      "rewards._id": reward._id
    }, {
      $pull: {
        "rewards": {
          _id: reward._id
        }
      }
    });
  },

  /**
   * rebates/updateStatus
   * @summary updateStatus
   * @param {String} rebateId - rebateId to update status
   * @returns {String} returns update results
   */
  "rebates/updateStatus": function(rebateId, status, userId) {
    userId = userId || Meteor.userId();

    // Check if user has access to manage promotions
    if (Core.hasRebateAccess(userId)) {
      // must have rebates/manage permissions
      this.unblock();

      return PromotionRebates.update({ _id: rebateId }, { $set: { status: status, userId: userId } })
    } else {
      throw new Meteor.Error(403, "You are not authorized to update rebates for this location");
    }
  },

  /**
   * promotions/applyRulesToOrder
   * @summary apply rule to order
   * @param {Object} order - order body
   * @return {Object} returns promotions apply result
   */
  "promotions/applyRulesToOrder": function(order) {
    let promotion = [];
    
    Core.applyPromotionsToOrder(order, function(err, res){
      if (res){
        promotion = res
      }
    });

    return promotion
    
  },

  /**
   * promotions/applyRulesToOrder
   * @summary apply rule to order
   * @param {Object} order - order body
   * @return {Object} returns promotions apply result
   */
  "promotions/applySupplierPromotionsToOrder": function(order, supplierId) {
    let promotion = [];

    let supplier = Companies.findOne(supplierId);

    if (supplier){
      Partitioner.bindGroup(supplier.tenantId, function(){
        Core.applyPromotionsToOrder(order, function(err, res){
          if (res){
            promotion = res
          }
        });
      })
    }

    return promotion

  },

  "promotions/getPromotions": function (searchText, options) {
    check(searchText, String);

    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    options = options || {};
    options.limit = 10;
    options.fields = {
      "name": 1
    };
    options.sort = { name: 1 };

    if(searchText && searchText.length > 0) {
      var regExp = Core.buildRegExp(searchText);
      var selector = {  $or: [
          {name: regExp}
        ]};
      return Promotions.find(selector, options).fetch();
    }

  },

  "promotions/getExportData": function (options) {
    check(options, Object);
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    if (Core.hasRebateAccess(this.userId)) {
      this.unblock();

      let userId = this.userId;
      let timezone = Core.getTimezone(userId);
      let fields = {
        'customerName': 1,
        'customerNumber': 1,
        'status': 1,
        'orderNumber': 1,
        'rebateNumber': 1,
        'promotionName': 1,
        'createdAt': 1,
        'type': 1,
        'value': 1
      };
      // retrieve locations user is authorized for

      let dates = options["createdAt"];

      if (dates && dates["$gte"]){
        dates["$gte"] = moment(dates["$gte"]).startOf("day").tz(timezone).toDate();
      }

      if (dates && dates["$lte"]){
        dates["$lte"] = moment(dates["$lte"]).endOf('day').tz(timezone).toDate();
      }
      if (options && options["$or"] && options["$or"].length <= 0){
        delete options["$or"]
      }


      let rebates = PromotionRebates.find(options, {
        fields: fields
      }).fetch();

      let rewardTypeCodes = _.uniq(_.pluck(rebates, "type"));


      let data = [];

      let rebateTypes = PromotionRewardSubTypes.find({code: {$in: rewardTypeCodes}}).fetch();
      let typeData = {};

      _.each(rebateTypes, function (t) {
        typeData[t.code] = {
          name: t.name
        };
      });


      function getRebateType(code) {
        if (!code) return "Unspecified";
        return typeData[code] ? typeData[code].name : "Unspecified"
      }

      _.each(rebates, function (rebate) {
        data.push([
          rebate.rebateNumber,
          rebate.orderNumber,
          rebate.createdAt,
          getRebateType(rebate.type),
          rebate.status,
          rebate.customerName,
          rebate.promotionName,
          rebate.value
        ]);
      });
      return data
    } else {
      throw new Meteor.Error(401, "Unauthorized");
    }

  }
});


_.extend(Core, {
  applyPromotionsToOrder: function(order, callback){
    if (order) {
      //check that the order does not belong to an order type excluded by the tenant
      let excludedOrderTypes = Core.getExcludedPromotionOrderTypes(order.userId) ? Core.getExcludedPromotionOrderTypes(order.userId) : [];
      if (!isExcludedOrderType(order, excludedOrderTypes)) {
        let promotions = Promotions.find({
          status: "active",
          startDate: { $lte: order.issuedAt },
          endDate: { $gte: order.issuedAt }
        }, {
          fields: { rules: 1, name: 1 }
        }).fetch();

        let promotionResult = [];

        if (promotions) {
          _.each(promotions, function(promotion) {
            let unQualified = [],
                multiple;
            _.each(promotion.rules, function(rule) {
              if (order.hasOwnProperty(rule.parameterNameInParentSchema)) {
                if (!testRuleOperator(order[rule.parameterNameInParentSchema], rule.value, rule.operator)) {
                  unQualified.push(rule);
                }
              } else {
                let quantity = 0,
                    value = 0;
                if (rule.subParamValue) {
                  //handle cummultive promotions
                  if (rule.to && rule.from) {
                    // get orders within date range
                    let orders = getCummulativeOrder(rule, order.customerId, excludedOrderTypes);

                    let param = PromotionParameters.findOne(rule.promotionParameterId, { fields: { lookUpObject: 1 } });
                    let parent = eval(param.lookUpObject).findOne({ _id: rule.subParamValue }, { fields: { _id: 1 } });

                    if (parent) {
                      let parentId = parent._id;
                      switch (param.lookUpObject) {
                        case 'ProductVariants':
                          // get item value and quantity in orders
                          _.each(orders, function(order) {
                            //filter variant in orders
                            let items = _.filter(order.items, function(item) {
                              return item.variantId == parentId && !item.IsPromo;
                            });

                            quantity += getItemQtyInOrder(items);
                            value += getItemValueInOrder(items);
                          });

                          evaluateRule(quantity, value, rule, unQualified);
                          break;

                        case 'Products':
                          // get item value and quantity in orders
                          _.each(orders, function(order) {
                            //filter products in orders
                            let items = _.filter(order.items, function(item) {
                              let product = ProductVariants.findOne({ _id: item.variantId, IsPromo: false }, { fields: { productId: 1 } });
                              if (product)
                                return product.productId == parentId;
                            });

                            quantity += getItemQtyInOrder(items);
                            value += getItemValueInOrder(items);
                          });

                          evaluateRule(quantity, value, rule, unQualified);
                          break;
                        case 'Brands':
                          // get item value and quantity in orders
                          _.each(orders, function(order) {
                            //filter brands in orders
                            let items = _.filter(order.items, function(item) {
                              let product = ProductVariants.findOne({ _id: item.variantId, IsPromo: false }, { fields: { productId: 1 } });
                              if (product) {
                                let brand = Products.findOne({ _id: product.productId }, { fields: { brandId: 1 } });
                                if (brand)
                                  return brand.brandId == parentId;
                              }
                            });

                            quantity += getItemQtyInOrder(items);
                            value += getItemValueInOrder(items);
                          });

                          evaluateRule(quantity, value, rule, unQualified);
                          break;
                      }
                    } else unQualified.push(rule);
                  } else {
                    //non cummulative promotions
                    let param = PromotionParameters.findOne(rule.promotionParameterId, { fields: { lookUpObject: 1 } });
                    let parent = eval(param.lookUpObject).findOne({ _id: rule.subParamValue }, { fields: { _id: 1 } });

                    if (parent) {
                      let parentId = parent._id,
                          multipleVal;
                      switch (param.lookUpObject) {
                        case 'ProductVariants':

                          //filter variant in orders
                          let items = _.filter(order.items, function(item) {
                            return item.variantId == parentId;
                          });

                          quantity = getItemQtyInOrder(items);
                          value = getItemValueInOrder(items);

                          multipleVal = evaluateRule(quantity, value, rule, unQualified);
                          multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;

                          //special case for multiple
                          if (rule.operator == 'multiple-of' && !_.findWhere(order.items, { variantId: parentId })) {
                            unQualified.push(rule);
                          }
                          break;
                        case 'Products':
                          _.each(order.items, function(item) {
                            let variantId = item.variantId;
                            let product = ProductVariants.findOne({ _id: variantId }, { fields: { productId: 1 } });
                            if (product) {
                              let productId = product.productId;
                              if (parentId == productId) {
                                quantity += item.quantity;
                                value += item.quantity * item.price * (100 + item.taxRateOverride) / 100;
                              }
                            }
                          });
                          multipleVal = evaluateRule(quantity, value, rule, unQualified);
                          multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;
                          break;

                        case 'Brands':
                          _.each(order.items, function(item) {
                            let variantId = item.variantId;
                            let product = ProductVariants.findOne({ _id: variantId }, { fields: { productId: 1 } });
                            if (product) {
                              let productId = product.productId;
                              let brand = Products.findOne({ _id: productId }, { fields: { brandId: 1 } });
                              if (brand) {
                                let brandId = brand.brandId;
                                if (parentId == brandId) {
                                  quantity += item.quantity;
                                  value += item.quantity * item.price * (100 + item.taxRateOverride) / 100;
                                }
                              }
                            }
                          });
                          multipleVal = evaluateRule(quantity, value, rule, unQualified);
                          multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;
                          break;
                      }
                    } else unQualified.push(rule);
                  }
                } else {
                  if (rule.to && rule.from) {
                    //non cummulative promotions
                    let param = PromotionParameters.findOne(rule.promotionParameterId, { fields: { lookUpObject: 1 } });
                    let parent = eval(param.lookUpObject).findOne({ _id: rule.subParamValue }, { fields: { _id: 1 } });

                    if (parent) {
                      // get orders within date range
                      let orders = getCummulativeOrder(rule, order.customerId, excludedOrderTypes);
                      _.each(orders, function(order) {
                        //remove promo quantities
                        order.items = _.filter(order.items, function(item) {
                          return item.variantId == parent._id && !item.IsPromo;
                        });
                        quantity += getOrderQty(order);
                        value += order.subTotal;
                      })
                      evaluateRule(quantity, value, rule, unQualified);
                    }
                  } else {
                    //Calculate order quantity and value
                    quantity = getOrderQty(order);
                    value = order.subTotal;
                    let multipleVal = evaluateRule(quantity, value, rule, unQualified);
                    multiple = multiple == undefined ? multipleVal : multiple > multipleVal ? multipleVal : multiple;
                  }
                }
              }
            });
            if (_.isEmpty(unQualified)) {
              promotionResult.push({ id: promotion._id, multiple: multiple });
            } else {
              //Advise customer on thow to qaulify to these promotion rules
              // console.log(unQualified);
            }
          });
        }

        let qualifiedPromoIds = _.pluck(promotionResult, 'id');
        let promo = Promotions.find({
          _id: { $in: qualifiedPromoIds }
        }, {
          fields: {
            priority: 1,
            exclusive: 1,
            currency: 1,
            rewards: 1
          },
          transform: function(doc) {
            doc.rewards = _.map(doc.rewards, function(reward, index) {
              //get the multiple value
              let multiple = 1,
                  currentPromo = _.findWhere(promotionResult, { id: doc._id });
              if (currentPromo)
                multiple = currentPromo.multiple;

              reward.value = evaluateRewardValue(reward, order, multiple);
              delete reward.previewSubType;
              delete reward.previewUom;
              delete reward.previewSubTypeValue;
              return reward;
            });
            return  doc
          }
        }).fetch();
        callback(null, promo);
      } else return callback(null, []);
    }
  }
});

function testRuleOperator(left, right, operator) {
  let test;
  left = left.toString();
  right = right.toString();
  switch (operator) {
    case 'is':
      test = left == right;
      break;
    case 'before':
      test = left < right;
      break;
    case 'after':
      test = left > right;
      break;
    case 'exactly':
      test = left == right;
      break;
    case 'less-than':
      test = parseFloat(left) < parseFloat(right);
      break;
    case 'greater-than':
      test = parseFloat(left) > parseFloat(right);
      break;
    case 'multiple-of':
      if (right > 0)
        test = Math.floor(left / right) > 0;
      break;
    case 'cummulative':
      test = left >= right;
      break;
    default:
      test = false;
  }
  return test;
}

function getMultipleFactor(left, right, operator) {
  let multiple = 1;
  switch (operator) {
    case 'multiple-of':
      if (right > 0)
        multiple = Math.floor(left / right) > 1 ? Math.floor(left / right) : multiple;
      break;
  }
  return multiple;
}

function evaluateRule(quantity, value, rule, unQualified) {
  let multiple;
  if (rule.parameterNameInParentSchema == 'quantity') {
    if (!testRuleOperator(quantity, rule.value, rule.operator))
      unQualified.push(rule);

    multiple = getMultipleFactor(quantity, rule.value, rule.operator);

  } else if (rule.parameterNameInParentSchema == 'value') {
    if (!testRuleOperator(value, rule.value, rule.operator))
      unQualified.push(rule);

    multiple = getMultipleFactor(value, rule.value, rule.operator);
  } else unQualified.push(rule);
  return multiple;
}

function getOrderQty(order) {
  let quantity = 0;
  _.each(order.items, function(item) {
    quantity += item.quantity;
  });
  return quantity;
}

function evaluateRewardValue(reward, order, multiple) {
  let value = 0;
  switch (reward.uom) {
    case 'afa':
      value = reward.value;
      if (multiple && (reward.type == 'addOn' || reward.type == 'rebates'))
        value *= multiple;
      break;
    case 'tov':
      value = Math.round((reward.value * order.subTotal / 100) * 100) / 100;
      break;
    case 'pp':
      value = reward.value;
      break;
    case 'poo':
      value = Math.floor(reward.value * getOrderQty(order) / 100);
      break;
    case 'psc':
      //to be calculated when the shipping cost is captured
      break;
  }
  return value;
}

function getItemValueInOrder(items) {
  let value = 0;
  _.each(items, function(item) {
    value += item.quantity * item.price * (100 + item.taxRateOverride) / 100;
  });
  return value;
}

function getItemQtyInOrder(items) {
  let qty = 0;
  _.each(items, function(item) {
    qty += item.quantity;
  });
  return qty;
}

function getCummulativeOrder(rule, customerId, excludedOrderTypes) {
  excludedOrderTypes = excludedOrderTypes || [];
  return Orders.find({
    status: "shipped",
    customerId: customerId,
    orderType: {
      $nin: excludedOrderTypes
    },
    issuedAt: {
      $gte: rule.from,
      $lte: rule.to
    }
  }, {
    fields: {
      items: 1
    }
  }).fetch();
}


function sendPromotionNotification(event, promotion, user) {
  Meteor.defer(function() {
    let nObject = {};
    nObject.event = event;
    nObject.userId = user;
    nObject.objectId = promotion._id;
    nObject.groupId = promotion._groupId;
    Meteor.call("notifications/sendNotification", nObject);
  });
}

function isExcludedOrderType(order, excludedOrderTypes) {
  if (excludedOrderTypes && typeof excludedOrderTypes === "object") {
    return order.orderType && _.indexOf(excludedOrderTypes, order.orderType) > -1 ? true : false;
  } else return false;
};
