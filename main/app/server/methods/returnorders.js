 /**
  * Reaction Order Methods
  */
 Meteor.methods({
   /**
    * returnorders/create
    * @summary when we create a new returnorder attach all the necessary fields
    * @param {Object} returnorder - optional returnorder object
    * @return {String} return insert result
    */

   "returnorders/create": function(doc) {
     let userId = Meteor.userId();
     check(doc, Core.Schemas.ReturnOrder);
     this.unblock();
     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }
     // Check if user is authorized to create return orders
     if (Core.hasReturnOrderAccess(userId, doc.salesLocationId)) {
      let order = Orders.findOne({orderNumber: doc.orderNumber});

      if (order) {
         let oItems = order.items;
         let iItems = doc.items;

         /*
         let iItems = [];
         let groupedItems = _.groupBy(invoiceItems, function (el) {
           return el.variantId
         });
         let variantIds = _.keys(groupedItems);

         _.each(variantIds, function (v) {
           iItems.push (_.reduce(groupedItems[v], function (el1, el2) {
             return _.extend(el2, {quantity: el1.quantity + el2.quantity})
           }));
         });
         */

         let newItems = [];
         let rnItems = [];
         let updatedItems = [];

         _.each (iItems, function (iItem) {
           _.reduce(_.filter(oItems, function (el) {
             return el._id === iItem.orderItemId && el.status === "shipped";
           }), function (remQty, o2) {
             let rem = 0;
             if (remQty > 0) {
               rem = remQty < o2.quantity ? 0 : remQty - o2.quantity;
               if (remQty < o2.quantity) {
                 let newItem = _.extend({}, o2);
                 newItem.quantity = o2.quantity - remQty;
                 delete newItem._id;
                 newItems.push(newItem);
                 _.extend(o2, {quantity: remQty, status: "returned"});
                 updatedItems.push(o2);
               } else {
                 o2.status = "returned";
                 updatedItems.push(o2)
               }
               let rnItem = _.extend({}, iItem);
               rnItem.quantity = o2.quantity;
               rnItem.orderItemId = o2._id;
               rnItem.price = o2.price;
               rnItem.discount = o2.discount || 0;
               rnItem.uom = o2.uom;
               rnItem.taxRateOverride = o2.taxRateOverride || 0;
               rnItem.isPromo = o2.isPromo;
               rnItems.push(rnItem)
             }
             return rem;
           }, iItem.quantity);
         });

         doc.items = rnItems;
         doc.taxRate = order.taxRate;

         if (rnItems.length > 0) {
           let returnOrder = ReturnOrders.insert(doc);
           if (!returnOrder) {
             throw new Meteor.Error(403, "Cannot create return order");
           }
           if (updatedItems.length > 0) {
             _.each(updatedItems, function( item ) {
               Orders.update({_id: doc.orderId, "items._id": item._id},
                   {
                     "$set": {
                       'items.$.status': item.status,
                       'items.$.quantity': item.quantity
                     }
                   })
             })
           }
           if (newItems.length > 0) {
             Orders.update({_id: order._id}, {$addToSet: {items: {$each: newItems}}});
           }
           let newReturnOrder = ReturnOrders.findOne(returnOrder);
           sendReturnNotification("returnorder.created", newReturnOrder, userId);
           return { _id: returnOrder, returnOrderNumber: newReturnOrder.returnOrderNumber };
         } else {
           throw new Meteor.Error(403, "There are no items to return order. It could be these items have already been returned.");
         }

       } else {
         throw new Meteor.Error(403, "Order not found");
       }
     } else {
       throw new Meteor.Error(403, "Access Denied");
     }
   },

   /**
    * returnorders/update
    * @summary update returnorder
    * @param {String} returnorderId - returnorderId to update 
    * @returns {String} returns update results
    */
   "returnorders/update": function(userId, returnOrderId, returnOrder) {
     check(returnOrder, Match.Optional(Object));
     check(returnOrder, Core.Schemas.ReturnOrder);
     check(userId, String);

     // Check if user is authorized to create return orders
     if (Core.hasReturnOrderAccess(userId, returnOrder.salesLocationId)) {
       // must have returnorders/manage permissions
       this.unblock();

       if (returnOrder) {
         return ReturnOrders.update({
           _id: returnOrderId
         }, {
           $set: returnOrder
         })
       }
     } else {
       throw new Meteor.Error(403, "Access Denied");
     }
   },


   /**
    * returnorders/updateStatus
    * @summary updateStatus returnorderItem
    * @param {String} returnorderId - returnorderId to update status
    * @returns {String} returns update results
    */
   "returnorders/updateStatus": function(userId, returnOrderId, status) {
     check(userId, String);
     check(returnOrderId, String);
     check(status, String);

     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }

     this.unblock();

     let returnOrder = ReturnOrders.findOne(returnOrderId)
     if (returnOrder) {
      // Check if user is authorized to create return orders
      if (Core.hasReturnOrderAccess(userId, returnOrder.salesLocationId)) {
   
       return ReturnOrders.update({
         _id: returnOrderId
       }, {
         $set: {
           status: status
         }
       });
      } else {
        throw new Meteor.Error(403, "Access Denied");
      }
     } else {
       throw new Meteor.Error(404, "Return Order not found");
     }
   
   },

   /**
    * returnorders/updateItemStatus
    * @summary updateItemStatus returnOrderId
    * @param {String} itemId - itemId to update status
    * @returns {String} returns update results
    */
   "returnorders/updateItemStatus": function(userId, returnOrderId, itemId, status) {
     check(itemId, String);
     check(returnOrderId, String);
     check(userId, String);
     check(status, String);

     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }

     // Check if user is authorized to create return orders
     if (Core.hasReturnOrderAccess(userId)) {
       // must have returnorders/manage permissions
       this.unblock();

       ReturnOrders.update({
         "_id": returnOrderId,
         "items._id": itemId
       }, {
         "$set": {
           'items.$.status': status
         }
       });
       return true;
     } else {
       throw new Meteor.Error(403, "Access Denied");
     }
   },


   /**
    * returnorder/addItem
    * @summary add returnorderItem
    * @param {object} item
    * @return {String} returns added Item
    */
   "returnorders/addItem": function(returnOrderId, item) {
     check(item, Object);
     check(item, Core.Schemas.ReturnOrderItem);

     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }

     // Check if user is authorized to create return orders
     if (Core.hasReturnOrderAccess(userId)) {
       // must have returnOrders/manage permissions
       this.unblock();

       return ReturnOrders.update({
         _id: returnOrderId
       }, {
         $addToSet: {
           items: item
         }
       }, {
         validate: false
       });
     } else {
       throw new Meteor.Error(403, "Access Denied");
     }
   },


  /**
   * returneorders/addNote
   * @summary adds returneorders note to returneorders
   * @param {String} orderId - add note to returneordersid
   * @param {String} message - Note body
   * @return {String} returns order update result
   */
  "returnorders/addNote": function (returnOrderId, message) {
    check(returnOrderId, String);
    check(message, String);
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    return ReturnOrders.update(returnOrderId, {
      $addToSet: {
        notes: {
          body: message,
          userId: Meteor.userId(),
          createdAt: new Date()
        }
      }
    })
  },

   "returnorders/approve": function(returnId, message, approvalStatus){
     check(returnId, String);
     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }
     // if a order object was provided and valid schema
     let userId = Meteor.userId();
     let returnOrder = ReturnOrders.findOne({_id:  returnId});
     if (returnOrder) {
     if (Core.hasReturnApprovalAccess(userId, returnOrder.salesLocationId)) {
       this.unblock();
         let approval = {
           approvedBy: userId,
           approvedAt: new Date,
           message: message,
           isAutoApproved: false
         };

         ReturnOrders.update({_id: returnId}, {$set: {status: approvalStatus}, $addToSet: {approvals: approval}})

         if (message){
           let  note = {
             body: message,
             userId: Meteor.userId(),
             createdAt: new Date()
           };
           ReturnOrders.update({_id: returnId}, {$addToSet: {notes: note}})
         }

         sendReturnNotification("returnorder.approvals", returnOrder, userId);
         return {_id: returnId, orderNumber: returnOrder.returnOrderNumber};
     } else {
       throw new Meteor.Error(403, "Access Denied");
     }
     }else {
       throw new Meteor.Error(404, "Return order not found")
     }
   },

   "returnorders/totalSales": function (duration){
     let userId = Meteor.userId();
     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }
     let tenantId = Core.getTenantId(userId);

     let options = {}
     options["status"] = {$ne: "cancelled"};
     let firstDuration, previousDurationStart, previousDurationEnd, currentDuration, previousDuration;
     let today = new Date;
     let previousYear = moment().subtract(1, 'years').startOf('year');
     let todayInPreviousYear = moment(today).subtract(1, 'years');
     let thisYear = (new Date()).getFullYear();
     let start = new Date("1/1/" + thisYear);
     let defaultStart = moment(start.valueOf());
     let firstQuarter = moment().subtract(4, 'months')._d;
     let startOfFirstQuarter = moment(firstQuarter).startOf('day')._d;
     let secondQuarter = moment(startOfFirstQuarter).subtract(4, 'months')._d;
     let currentMonth =  moment().startOf("month")._d;
     let endOfCurrentMonth = moment().endOf("month")._d;
     let previousMonth = moment(endOfCurrentMonth).subtract(1, 'months').startOf('month')._d;
     let endOfPreviousMonth = moment(previousMonth).endOf("month")._d;
     let currentWeek = moment().startOf('week')._d;
     let previousWeek = moment().subtract(1, 'weeks').startOf('week')._d;
     let endOfPreviousWeek = moment().subtract(1, 'weeks').endOf('week')._d;
     let previousDay = moment().subtract(1, 'days').startOf('day')._d;
     let endOfPreviousDay = moment().subtract(1, 'days').endOf('day')._d;
     let currentDay = moment().startOf('day')._d;

     if (duration === "Year"){
       firstDuration  = defaultStart._d;
       previousDurationStart =  previousYear._d;
       previousDurationEnd =  todayInPreviousYear._d
     }

     if (duration === "Month"){
       firstDuration  =  currentMonth;
       previousDurationStart =  previousMonth;
       previousDurationEnd =  endOfPreviousMonth
     }

     if (duration === "Week"){
       firstDuration  =  currentWeek;
       previousDurationStart =  previousWeek;
       previousDurationEnd =  endOfPreviousWeek
     }

     if (duration === "Today"){
       firstDuration  =  currentDay;
       previousDurationStart =  previousDay;
       previousDurationEnd =  endOfPreviousDay
     }


     if (duration !== "All"){
       currentDuration = ReturnOrders.aggregate([
         {"$match": {_groupId: tenantId, status: {$ne: "cancelled"}, issuedAt: {$gte: firstDuration}}},
         { $group: {_id: null, totalAmount: { $sum: "$total" }, count: { $sum: 1 } } }
       ]);

       previousDuration = ReturnOrders.aggregate([
         {"$match": {_groupId: tenantId, status: {$ne: "cancelled"}, issuedAt: {$gte: previousDurationStart, $lte: previousDurationEnd}}},
         { $group: {_id: null, totalAmount: { $sum: "$total" }, count: { $sum: 1 } } }
       ]);

     } else {
       currentDuration = ReturnOrders.aggregate([
         {"$match": {_groupId: tenantId}},
         { $group: {_id: null, totalAmount: { $sum: "$total" }, count: { $sum: 1 } } }
       ]);
     }

     let data = {};
     data.currentDuration = currentDuration;
     data.previousDuration = previousDuration;
     return data
   },

   "returnorders/returnsData": function(filterConditions){
     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }
    let status = [];
    let userId = Meteor.userId();
    let tenantId = Core.getTenantId(userId);
    let timezone = Core.getTimezone(userId);

    let definedStatus = ["approved", "rejected", "pending"];

    if (_.isArray(filterConditions.status) && filterConditions.status.length > 0)
      _.each(definedStatus, function(s){
        let foundStatus =  _.find(filterConditions.status, function(c){ return s === c });
        if (foundStatus){
          status.push(foundStatus)
        }
      });

    let options = {_groupId: tenantId};
    
    if(status.length > 0) 
      options["$or"] = getFilterConditions(status);

    let startDate, endDate;
     if (filterConditions.startDate){
       startDate = moment(filterConditions.startDate).startOf("day").tz(timezone)._d;
     }
     if (filterConditions.endDate){
       endDate = moment(filterConditions.endDate).endOf('day').tz(timezone)._d;
     }
    if (startDate && endDate){
      options["issuedAt"] = {$gte : startDate, $lt : endDate}
    } else if (startDate){
      options["issuedAt"] = {$gte : startDate}
    } else if (endDate) {
      options["issuedAt"] = {$lt : endDate}
    } else {
      delete options["issuedAt"]
    }

    let elementsFilter = {};
    let projection = {};
    projection["$project"] = {};
    let projectionOptions = projection["$project"];
    projectionOptions["date"] = "$issuedAt";
    projectionOptions["y"] = {"$year": "$issuedAt"};
    projectionOptions["period"] = {"$month": "$issuedAt"};
    projectionOptions["amount"] = "$total";
    projectionOptions["t"] = "$taxes";
    let groupOptions =  {
      "period": "$period",
      year: { $year: "$date"},
      month: { $month : "$date"}
    };


    if (filterConditions.duration && filterConditions.duration === "month"){
      projectionOptions["period"] = {"$month": "$issuedAt"};

    }

    if (filterConditions.duration && filterConditions.duration === "week"){
      projectionOptions["period"] = {"$week": "$issuedAt"};
    }

    if (filterConditions.duration && filterConditions.duration === "day"){
      projectionOptions["period"] = {"$dayOfMonth": "$issuedAt"};
    }

    if (status.length > 0){
      elementsFilter["status"] = {$in: status};
      projectionOptions["status"] = "$status"
    }

    let returnorders = ReturnOrders.aggregate([
      {"$match": options},
      projection,
      {
        "$group": {
          "_id": groupOptions,
          count: {
            "$sum": 1
          },
          totalAmount: { $sum: "$amount" },
          taxes: { $sum: "$t" },
          average: { $avg: "$amount" }
        }
      }
    ]);

    let data = [];
    _.each(returnorders, function (returnorder) {
      let date;
      if (filterConditions.duration === "month"){
        date = moment().month(returnorder._id.period ).subtract(1, "month").year(returnorder._id.year);
      }

      if (filterConditions.duration === "week"){
        date = moment().week(returnorder._id.period).year(returnorder._id.year).month(returnorder._id.month ).subtract(1, "month");
      }

      if (filterConditions.duration === "day"){
        let stringDate = `${returnorder._id.month}-${returnorder._id.period}-${returnorder._id.year}`;
        date = new Date(stringDate);
        date = moment(date)
      }

      returnorder.date = date._d;
      returnorder.id = returnorder._id;
      delete returnorder._id;
      data.push(returnorder);
    });

    return data;
  },

  "returnorders/getReportData": function(filterConditions){
    check (filterConditions, Object);
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    let tenantId = Core.getTenantId(userId);
    let timezone = Core.getTimezone(userId);
    let reportType = filterConditions.reportType;
    let startDate = filterConditions.startDate;
    let endDate = filterConditions.endDate;
    let queryConditions = filterConditions.queryConditions || []
    let query = {_groupId: tenantId};

    if (filterConditions.startDate){
      startDate = moment(filterConditions.startDate).startOf("day").tz(timezone)._d;
    }
    if (filterConditions.endDate){
      endDate = moment(filterConditions.endDate).endOf('day').tz(timezone)._d;
    }

    if (startDate && endDate){
      query["issuedAt"] = {$gte: startDate, $lte: endDate}
    } else if (startDate && !endDate){
      query["issuedAt"] = {$gte: startDate}
    } else if (endDate && !startDate){
      query["issuedAt"] = {$lte: endDate}
    }

    if (queryConditions.length > 0){
      _.each(queryConditions, function(q){
        if (q.selectedOption === "Customer Name"){
          query["customerId"] = q.value
        }
        if (q.selectedOption === "Salesperson"){
          query["assigneeId"] = q.value
        }

        if (q.selectedOption === "Sales Location"){
          query["salesLocationId"] = q.value
        }

        if (q.selectedOption === "Product Variant/SKU"){
          query["items.variantId"] = q.value
        }
      })
    }


    let returnorders;
    if (reportType !== "Product Variant") {
      returnorders = ReturnOrders.aggregate([
        { $match: query },
        { $group: { _id: groupByReportType(reportType), totalAmount: { $sum: "$total" },
          count: {"$sum": 1},
          taxes: { $sum: "$taxes" },
          average: { $avg: "$total" }
        } },
        { $sort: { totalAmount: -1 } }
      ]);
    }
    if (reportType === "Product Variant") {
      returnorders = ReturnOrders.aggregate([
        { $match: query },
        { $unwind : "$items" },
        { $group: { _id: groupByReportType(reportType), totalAmount: { $sum: { $multiply: [ "$items.price", "$items.quantity" ] } },
          count: {"$sum": 1},
          taxes: { $sum: "$items.taxRateOverride" },
          average: { $avg: "$items.price" }
        } },
        { $sort: { totalAmount: -1 } }
      ]);
    }

    let data = [];
    _.each(returnorders, function (o) {
      if (reportType === "Customer"){
        let customer = Customers.findOne(o._id);
        o.label = customer ? customer.name : '';
      }

      if (reportType === "Location"){
        let location = Locations.findOne(o._id);
        o.label = location  ? location.name : '';
      }

      if (reportType === "Salesperson"){
        let assignee = Meteor.users.findOne(o._id);
        o.label = assignee && assignee.profile ? assignee.profile.fullName : '';
      }

      if (reportType === "Product Variant"){
        let variant = ProductVariants.findOne(o._id);
        o.label = variant ? variant.name : '';
      }
      data.push(o)
    });
    return data
  },

  "returnorders/getExportData": function (options) {
     if (!this.userId) {
       throw new Meteor.Error(401, "Unauthorized");
     }
     check(options, Object);
     this.unblock();
     let returnOrders = ReturnOrders.find(options).fetch();

     let userIds = _.pluck(returnOrders, "userId");
     let assigneeIds = _.pluck(returnOrders, "assigneeId");
     let allUserIds = _.union(userIds, assigneeIds);
     let locationIds = _.uniq(_.pluck(returnOrders, "salesLocationId"));

     let userData = {};
     let locationsData = {};
     let data = [];

      let users = Meteor.users.find({_id: {$in: userIds}}).fetch();

      _.each(users, function (user) {
        userData[user._id] = {
          username: user.username,
          email: user.emails[0].address,
          assigneeCode: user.salesProfile ? user.salesProfile.originCode : "",
          fullName: user.profile.fullName
        };
      });

    let locations = Locations.find({_id: {$in: locationIds}}).fetch();


    _.each(locations, function (location) {
      locationsData[location._id] = {
        name: location.name
      };
    });

     function getUser(userId) {
       if (!userId) return "";
       return userData[userId] ? userData[userId].fullName : "";
     }

     function getLocation(locationId) {
       if (!locationId) return "Unspecified";
       return locationsData[locationId] ? locationsData[locationId].name : "Unspecified"
     }

     _.each(returnOrders, function (returnorder) {
       data.push([
         returnorder.returnOrderNumber,
         getLocation(returnorder.salesLocationId),
         returnorder.issuedAt,
         returnorder.total,
         returnorder.status,
         returnorder.customerName,
         getUser(returnorder.assigneeId),
         getUser(returnorder.userId)
       ]);
     });


     return data
  }

});


 function sendReturnNotification(event, returnOrder, user){
   Meteor.defer(function(){
     let nObject = {};
     nObject.event = event;
     nObject.userId = user;
     nObject.objectId = returnOrder._id;
     nObject.groupId = returnOrder._groupId;
     Meteor.call("notifications/sendNotification", nObject);
   });
 }

 function getFilterConditions(status){
  let options = [];
  status = status || [];

  if (status.length > 0){
    options.push({
      "status": {$in: status}
    });
  } else {
    removeProperty(options, "status")
  }

  let newOptions = _.compact(options);
  return newOptions
}

function removeProperty(options, key){
  _.each(options, function(option, index) {
    if (option.hasOwnProperty(key)) {
      return options.splice(index, 1)
    }
  })
}

function groupByReportType(reportType) {
  if (reportType === "Customer") return "$customerId";
  if (reportType === "Location") return "$salesLocationId";
  if (reportType === "Salesperson") return "$assigneeId";
  if (reportType === "Product Variant") return "$items.variantId";
}

