/**
 * Promotions
 */
Core.publish("Promotions", function(status, limit) {
  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.PROMOTIONS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    return Promotions.find({ groupCode: { $in: userGroups }, status: status }, {
      limit: limit
    });
  } else if (userGroups === Roles.GLOBAL_GROUP) {
    return [Promotions.find({ status: status }, {
      limit: limit
    })];
  } else {
    return this.ready();
  }
});

/**
 * Promotion Rebates
 */
Core.publish("PromotionRebates", function(status, limit) {
  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.REBATES_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    return PromotionRebates.find({ groupCode: { $in: userGroups }, applied: status }, {
      limit: limit
    });
  } else if (userGroups === Roles.GLOBAL_GROUP) {
    return [PromotionRebates.find({ status: status }, {
      limit: limit
    })];
  } else {
    return this.ready();
  }
});

/**
 * Single Promotion
 */

Core.publish("Promotion", function(id) {
  // retrieve item first before permission check to avoid multi-lookups
  return Promotions.find({
    _id: id
  });

});

/**
 * Promotion Parameters
 */
Core.publish("PromotionParameters", function(searchText) {
  if (searchText && searchText.length > 0) {
    var regExp = Core.buildRegExp(searchText);
    var selector = {
      $and: [{
        $or: [
          { name: regExp },
          { lookUpObject: regExp },
          { friendlyName: regExp }
        ]
      }]
    };

    return PromotionParameters.find(selector);
  } else {
    return PromotionParameters.find();
  }
});

/**
 * Single Promotion Parameter
 */
Core.publish("PromotionParameter", function(id) {
  return PromotionParameters.find({
    _id: id
  });
});


Core.publish("ManageRebates", function (options, limit, sort) {
  let userId = this.userId;
  let timezone = Core.getTimezone(userId);
  let fields = {
    'customerName': 1,
    'customerNumber': 1,
    'customerId': 1,
    'status': 1,
    'orderNumber': 1,
    'rebateNumber': 1,
    'orderId': 1,
    'promotionName': 1,
    'promotionId': 1,
    'createdAt': 1,
    'createdBy': 1,
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

  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.REBATES_VIEW);
  if (userGroups && _.isArray(userGroups) || userGroups === Roles.GLOBAL_GROUP) {
    return PromotionRebates.find(options, {
      fields: fields, sort: sort, limit: limit
    });
  } else {
    return this.ready();
  }

});

/**
 * Single Promotion RewardsSubType
 */
Core.publish("PromotionRewardsSubType", function() {
  return PromotionRewardSubTypes.find();
});
