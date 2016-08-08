/**
 *  Order Methods
 */
Meteor.methods({

  /**
   * customers/createOrder
   * @summary when we create a new order attach all the necessary fields
   * @param {Object} order - optional order object
   * @return {String} return insert result
   */

  "orders/createOrder": function (order) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    
    try {
      check(order, Core.Schemas.Order);
    } catch (e) {
      throw new Meteor.Error(401, "There's invalid data in your order. Please correct and retry");
    }
    // if a order object was provided and valid schema
    if (Core.hasOrderAccess(userId, order.salesLocationId)) {
      // must have orders/manage permissions
      this.unblock();

      let orderId = Orders.insert(order);
      let newOrder = Orders.findOne(orderId);
      sendOrderNotification("order.created", newOrder, userId);
      return { _id: orderId, orderNumber: newOrder.orderNumber };
    } else {
      throw new Meteor.Error(403, "You are not authorized to create an order for this location");
    }
  },


  /**
   * orders/addNote
   * @summary adds order note to order
   * @param {String} orderId - add note to orderId
   * @param {String} message - Note body
   * @return {String} returns order update result
   */
  "orders/addNote": function (orderId, message) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(orderId, String);
    check(message, String);
    let order = Orders.findOne(orderId);
    let updateStatus = Orders.update(orderId, {
      $addToSet: {
        notes: {
          body: message,
          userId: Meteor.userId(),
          createdAt: new Date()
        }
      }
    });
    if (updateStatus === 1){
      sendOrderNotification("order.comments.created", order, Meteor.userId(), message)
    }
    return true
  },
  
  /**
   * orders/updateOrder
   * @summary update order
   * @param {String} orderId - orderId to update
   * @returns {String} returns update results
   */
  "orders/updateOrder": function (orderId, order, userId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(order, Core.Schemas.Order);
    userId = userId || Meteor.userId();
    delete order._id;
    delete order.orderNumber;
    delete order.userId;
    delete order.createdAt;
    delete order.paymentStatus;

    // if a order object was provided and valid schema
    if (Core.hasOrderAccess(userId, order.salesLocationId)) {
      // must have orders/manage permissions
      this.unblock();
      let fOrder = Orders.findOne(orderId);
      let updateStatus =  Orders.update({_id: orderId}, {$set: order});
      if (updateStatus === 1){
        sendOrderNotification("order.updated", fOrder, userId)
      }
      return Orders.findOne(orderId)
    } else {
      throw new Meteor.Error(403, "Access Denied");
    }
  },


  "orders/approveOrder": function(orderId, message, approvalStatus){
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(orderId, String);
    this.unblock();

    // if a order object was provided and valid schema
    let userId = Meteor.userId();
    let order = Orders.findOne({_id:  orderId});
    if (order) {
      if (Core.hasOrderApprovalAccess(userId, order.salesLocationId, String(order.orderType))) {
        // must have orders/manage permissions
        let approval = {
          approvedBy: userId,
          approvedAt: new Date,
          message: message,
          isAutoApproved: false
        };

        let updateStatus = Orders.update({_id: orderId}, {$set: {approvalStatus: approvalStatus}, $addToSet: {approvals: approval}})

        if (message){
          let  note = {
            body: message,
            userId: Meteor.userId(),
            createdAt: new Date()
          };
          Orders.update({_id: orderId}, {$addToSet: {notes: note}})
        }
        if(updateStatus === 1){
          sendOrderNotification("order.approvals", order, userId)
        }
        return {_id: orderId, orderNumber: order.orderNumber};
      } else {
        throw new Meteor.Error(403, "Access Denied");
      }
    } else {
      throw new Meteor.Error(403, "Order not found");
    }
  },


  /**
   * orders/updateStatus
   * @summary updateStatus orderItem
   * @param {String} orderId - orderId to update status
   * @returns {String} returns update results
   */
  "orders/updateStatus": function (orderId, status) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId =  Meteor.userId();
    
    let order = Orders.findOne(orderId);
    if (!order) throw new Meteor.Error(403, "The order you have specified is invalid");

    // if a order object was provided and valid schema
    if (Core.hasOrderAccess(userId, order.salesLocationId)) {
      // must have orders/manage permissions
      this.unblock();

      let updateStatus = Orders.update({_id: orderId}, {$set: {status: status}})
      if(updateStatus === 1){
        sendOrderNotification("order.status.updated", order, userId)
      }
      return true
    } else {
      throw new Meteor.Error(403, "You are not authorized to update orders for this location");
    }
  },

  /**
   * orders/updateItemStatus
   * @summary updateItemStatus orderItem
   * @param {String} itemId - itemId to update status
   * @returns {String} returns update results
   */
  "orders/updateItemStatus": function (orderId, itemId, status) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(itemId, String);
    check(orderId, String);
    check(status, String);
    
    if (status === 'deleted') throw new Meteor.Error(403, "Deleting an individual item has been deprecated. Edit the entire order to make this change");

    let userId = Meteor.userId();

    let order = Orders.findOne(orderId);
    if (!order) throw new Meteor.Error(403, "The order you have specified is invalid");

    if (Core.hasOrderAccess(userId, order.salesLocationId)) {
      this.unblock();

      Orders.update(
          { "_id": orderId, "items._id": itemId },
          {
            "$set": {
              'items.$.status': status
            }
          }
      );
      return true;
    } else {
      throw new Meteor.Error(403, "Access Denied");
    }
  },

  /**
   * orders/removeHolds
   * @summary remove all order credit and customer holds
   * @returns {String} returns true 
   */
  "orders/removeHolds": function (orderId, itemId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(orderId, String);

    let userId = Meteor.userId();

    let order = Orders.findOne(orderId);
    if (!order) throw new Meteor.Error(403, "The order you have specified is invalid");

    if (Core.hasAdminAccess(userId)) {
      this.unblock();

      CustomerHolds.remove({orderNumber: order.orderNumber});
      CreditHolds.remove({orderNumber: order.orderNumber});
      return true;
    } else {
      throw new Meteor.Error(403, "Access Denied");
    }
  },


  /**
   * orders/addItem
   * @summary add orderItem
   * @param {object} item
   * @return {String} returns added Item
   */
  "orders/addItem": function (orderId, item) {
    check(item, Core.Schemas.OrderItem);
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    
    let order = Orders.findOne(orderId);
    if (!order) throw new Meteor.Error(403, "The order you have specified is invalid");

    if (Core.hasOrderAccess(userId, order.salesLocationId)) {
      this.unblock();

      return Orders.update({_id: orderId}, {
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


  "orders/totalSales": function (duration){
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
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
      previousDurationEnd =  endOfPreviousMonth;
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
      currentDuration = Orders.aggregate([
        {"$match": {_groupId: tenantId, status: {$ne: "cancelled"}, issuedAt: {$gte: firstDuration}}},
        { $group: {_id: null, totalAmount: { $sum: "$total" }, count: { $sum: 1 } } }
      ]);

   
      previousDuration = Orders.aggregate([
        {"$match": {status: {$ne: "cancelled"}, _groupId: tenantId, issuedAt: {$gte: previousDurationStart, $lte: previousDurationEnd}}},
        { $group: {_id: null, totalAmount: { $sum: "$total" }, count: { $sum: 1 } } }
      ]);
   
    } else {
      currentDuration = Orders.aggregate([
        {"$match": {_groupId: tenantId, status: {$ne: "cancelled"}}},
        { $group: {_id: null, totalAmount: { $sum: "$total" }, count: { $sum: 1 } } }
      ]);
    }

    let data = {};
    data.currentDuration = currentDuration;
    data.previousDuration = previousDuration;
    return data
  },

  "orders/chart": function () {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    let tenantId = Core.getTenantId(userId);

    let beginingOfYear = moment().startOf("year")._d;
    return Orders.aggregate([
        {"$match": {_groupId: tenantId, status: {$ne: "cancelled"}, issuedAt: {$gte: beginingOfYear}}},
        {
          "$project": {
            "y": {
              "$year": "$issuedAt"
            },
            "m": {
              "$month": "$issuedAt"
            }
          }
        },
        {
          "$group": {
            "_id": {
              "month": "$m",
              "year": "$y"
            },
            count: {
              "$sum": 1
            }
          }
        }
    ]);
  },

  "orders/statusChart": function (duration) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    let tenantId = Core.getTenantId(userId);
 
    let  startDate, results;

    if (duration === "Year"){
      startDate = moment().startOf("year")._d;
    }

    if (duration === "Month"){
      startDate = moment().startOf("month")._d;
    }

    if (duration === "Week"){
      startDate  = moment().startOf("week")._d;
    }

    if (duration === "Today"){
      startDate = moment().startOf("day")._d;
    }

    if (duration !== "All"){
      results = Orders.aggregate([
        {"$match": {_groupId: tenantId, issuedAt: {$gte: startDate}}},
        {
          "$project": {
            "s": "$status"
          }
        },
        {
          "$group": {
            "_id": {
              "status": "$s"
            },
            total: {
              "$sum": 1
            }
          }
        }
      ]);
    } else {
      results = Orders.aggregate([
        {"$match": {_groupId: tenantId}},
        {
          "$project": {
            "s": "$status"
          }
        },
        {
          "$group": {
            "_id": {
              "status": "$s"
            },
            total: {
              "$sum": 1
            }
          }
        }
      ]);
    }

    let data = [];
    let filterStatus = ["open", "accepted", "shipped", "cancelled"];
    _.each(results, function (result) {
       data.push({status: result._id.status, total: result.total})
    });

    _.each(filterStatus, function(status){
      let s = _.find(data, function(d) {return d.status === status});
      if (!s){
        data.push({status: status, total: 0})
      }
    });
    
    return data
  },

    "orders/topCustomers": function (duration) {
      if (!this.userId) {
        throw new Meteor.Error(401, "Unauthorized");
      }
        let userId = Meteor.userId();
        let tenantId = Core.getTenantId(userId);

    
        let options = {};
        let firstDuration, previousDurationStart, previousDurationEnd, currentDuration, previousDuration;
        let today = new Date;
        let previousYear = moment().subtract(1, 'years').startOf('year');
        let todayInPreviousYear = moment(today).subtract(1, 'years');
        let thisYear = (new Date()).getFullYear();
        let start = new Date("1/1/" + thisYear);
        let defaultStart = moment(start.valueOf());
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

        if (duration === "Year") {
            firstDuration  = defaultStart._d;
            previousDurationStart =  previousYear._d;
            previousDurationEnd =  todayInPreviousYear._d;
        }

        if (duration === "Month") {
            firstDuration  =  currentMonth;
            previousDurationStart =  previousMonth;
            previousDurationEnd =  endOfPreviousMonth;
        }

        if (duration === "Week") {
            firstDuration  =  currentWeek;
            previousDurationStart =  previousWeek;
            previousDurationEnd =  endOfPreviousWeek;
        }

        if (duration === "Today") {
            firstDuration  =  currentDay;
            previousDurationStart =  previousDay;
            previousDurationEnd =  endOfPreviousDay;
        }

        currentDuration = Orders.aggregate([
            { $match: { _groupId: tenantId, paymentStatus: "paid", issuedAt: { $gte: firstDuration } } },
            { $group: { _id: "$customerName", totalAmount: { $sum: "$total" } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);

        previousDuration = Orders.aggregate([
            { $match: { _groupId: tenantId, paymentStatus: "paid", issuedAt: { $gte: previousDurationStart, $lte: previousDurationEnd } } },
            { $group: { _id: "$customerName", totalAmount: { $sum: "$total" } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);


        let data = {};
        data.currentTopCustomers = currentDuration;
        data.previousTopCustomers = previousDuration;
        return data;
    },

  "orders/salesData": function(filterConditions){
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    let status = [];
    let approvalStatus = [];
    let paymentStatus = [];
    let timezone = Core.getTimezone(userId);
    let tenantId = Core.getTenantId(userId);

    let definedStatus = ["accepted", "open", "shipped", "cancelled"];
    let defineApprovalStatus = ["approved", "rejected", "pending"];
    let definePaymentStatus = ["paid", "unpaid", "partial"];

    if (_.isArray(filterConditions.status) && filterConditions.status.length > 0)
      _.each(definedStatus, function(s){
        let foundStatus =  _.find(filterConditions.status, function(c){ return s === c });
        if (foundStatus){
          status.push(foundStatus)
        }
      });

    _.each(defineApprovalStatus, function(s){
      let foundStatus =  _.find(filterConditions.status, function(c){ return s === c });
      if (foundStatus){
        approvalStatus.push(foundStatus)
      }
    });

    _.each(definePaymentStatus, function(s){
      let foundStatus =  _.find(filterConditions.status, function(c){ return s === c });
      if (foundStatus){
        paymentStatus.push(foundStatus)
      }
    });

    let options = {_groupId: tenantId};
    if (approvalStatus.length > 0 || status.length > 0 || paymentStatus.length > 0) {
      options["$or"] = getFilterConditions(status, approvalStatus, paymentStatus);
    }
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

    if (approvalStatus.length > 0){
      elementsFilter["paymentStatus"] = {$in: paymentStatus};
      projectionOptions["paymentStatus"] = "$paymentStatus"
    }

    if (paymentStatus.length > 0){
      elementsFilter["approvalStatus"] = {$in: approvalStatus};
      projectionOptions["approvalStatus"] = "$approvalStatus"
    }


    let orders = Orders.aggregate([
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
    _.each(orders, function (order) {
      let date;
      if (filterConditions.duration === "month"){
        date = moment().month(order._id.period ).subtract(1, "month").year(order._id.year)
      }

      if (filterConditions.duration === "week"){
        date = moment().week(order._id.period).year(order._id.year).month(order._id.month ).subtract(1, "month")
      }

      if (filterConditions.duration === "day"){
        let stringDate = `${order._id.month}-${order._id.period}-${order._id.year}`;
        date = new Date(stringDate);
        date = moment(date)
      }

      order.date = date._d;
      order.id = order._id;
      delete order._id;
      data.push(order)
    });

    return data
  },

  "orders/getReportData": function(filterConditions){
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check (filterConditions, Object);
    let userId = Meteor.userId();
    let tenantId = Core.getTenantId(userId);
    let timezone = Core.getTimezone(userId);
    let reportType = filterConditions.reportType;
    let startDate = filterConditions.startDate;
    let endDate = filterConditions.endDate;
    let queryConditions = filterConditions.queryConditions || [];
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


    let orders;
    if (reportType !== "Product Variant") {
      orders = Orders.aggregate([
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
      orders = Orders.aggregate([
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
    _.each(orders, function (o) {
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

      if (reportType === "Price List Group"){
        o.label = o._id
      }

      if (reportType === "Product Variant"){
        let variant = ProductVariants.findOne(o._id);
        o.label = variant ? variant.name : '';
      }
      data.push(o)
    });
    return data
  },

  "orders/getExportData": function (options) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    check(options, Object);
    this.unblock();
    let orders = Orders.find(options).fetch();

    let userIds = _.pluck(orders, "userId");
    let assigneeIds = _.pluck(orders, "assigneeId");
    let allUserIds = _.union(userIds, assigneeIds);
    let salesLocationIds = _.uniq(_.pluck(orders, "salesLocationId"));
    let stockLocationIds = _.uniq(_.pluck(orders, "stockLocationId"));
    let locationIds = _.union(salesLocationIds, stockLocationIds);

    let locationsData = {};
    let data = [];
    let userData = {};

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

    _.each(orders, function (order) {
      data.push([
        order.orderNumber,
        getLocation(order.salesLocationId),
        getLocation(order.stockLocationId),
        order.issuedAt,
        order.total,
        getOrderType(order.orderType),
        order.status,
        order.approvalStatus,
        order.paymentStatus,
        order.customerName,
        getUser(order.assigneeId),
        getUser(order.userId)
      ]);
    });

    return data
  },
/*
  "orders/shipmentTracking": function (order, tracking) {
    check(order, Object);
    check(tracking, String);
    this.unblock();
    let orderId = order._id;

    Meteor.call("orders/addTracking", orderId, tracking);
    Meteor.call("orders/updateHistory", orderId, "Tracking Added",
      tracking);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow",
      "coreShipmentTracking", order._id);
  },

   

  // shipmentPrepare
  "orders/documentPrepare": function(order) {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreOrderDocuments", order._id);
    }
  },
  /!**
   * orders/shipmentPacking
   *
   * @summary trigger packing status
   * @param {Object} order - order object
   * @return {Object} return workflow result
   *!/
  "orders/shipmentPacking": function (order) {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreShipmentPacking", order._id);
    }
  },
  /!**
   * orders/processPayment
   *
   * @summary trigger processPayment and workflow update
   * @param {Object} order - order object
   * @return {Object} return this.processPayment result
   *!/
  "orders/processPayment": function (order) {
    check(order, Object);
    this.unblock();

    return Meteor.call("orders/processPayments", order._id, function (
      error,
      result) {
      if (result) {
        Meteor.call("workflow/pushOrderWorkflow",
          "coreOrderWorkflow", "coreProcessPayment", order._id);
        return this.processPayment(order);
      }
    });
  },
  /!**
   * orders/shipmentShipped
   *
   * @summary trigger shipmentShipped status and workflow update
   * @param {Object} order - order object
   * @return {Object} return workflow result
   *!/
  "orders/shipmentShipped": function (order) {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreShipmentShipped", order._id);
    }
  },
  /!**
   * orders/orderCompleted
   *
   * @summary trigger orderCompleted status and workflow update
   * @param {Object} order - order object
   * @return {Object} return this.orderCompleted result
   *!/
  "orders/orderCompleted": function (order) {
    check(order, Object);
    this.unblock();

    if (order) {
      Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreOrderCompleted", order._id);
      return this.orderCompleted(order);
    }
  },
  /!**
   * orders/addTracking
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} tracking - tracking id
   * @return {String} returns order update result
   *!/
  "orders/addTracking": function (orderId, tracking) {
    check(orderId, String);
    check(tracking, String);
    return Orders.update(orderId, {
      $addToSet: {
        "shipping.shipmentMethod.tracking": tracking
      }
    });
  },

  /!**
   * orders/addShipment
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} data - tracking id
   * @return {String} returns order update result
   *!/
  "orders/addShipment": function (orderId, data) {
    check(orderId, String);
    check(data, Object);

    // temp hack until we build out multiple payment handlers
    let cart = Cart.findOne(cartId);
    let shippingId = "";
    if (cart.shipping) {
      shippingId = cart.shipping[0]._id;
    }

    return Orders.update({
      "_id": orderId,
      "shipping._id": shippingId
    }, {
      $addToSet: {
        "shipping.shipments": data
      }
    });
  },

  /!**
   * orders/updateShipmentTracking
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} shipmentId - shipmentId
   * @param {String} tracking - add tracking to orderId
   * @return {String} returns order update result
   *!/
  "orders/updateShipmentTracking": function (orderId, shipmentId, tracking) {
    check(orderId, String);
    check(shipmentId, String);
    check(tracking, String);

    return Orders.update({
      "_id": orderId,
      "shipping._id": shipmentId
    }, {
      $set: {
        [`shipping.$.tracking`]: tracking
      }
    });
  },

  /!**
   * orders/addItemToShipment
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} shipmentId - shipmentId
   * @param {ShipmentItem} item - A ShipmentItem to add to a shipment
   * @return {String} returns order update result
   *!/
  "orders/addItemToShipment": function (orderId, shipmentId, item) {
    check(orderId, String);
    check(shipmentId, String);
    check(item, Object);

    return Orders.update({
      "_id": orderId,
      "shipping._id": shipmentId
    }, {
      $push: {
        "shipping.$.items": item
      }
    });
  },

  "orders/updateShipmentItem": function (orderId, shipmentId, item) {
    check(orderId, String);
    check(shipmentId, Number);
    check(item, Object);

    return Orders.update({
      "_id": orderId,
      "shipments._id": shipmentId
    }, {
      $addToSet: {
        "shipment.$.items": shipmentIndex
      }
    });
  },

  /!**
   * orders/addShipment
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} shipmentIndex - shipmentIndex
   * @return {String} returns order update result
   *!/
  "orders/removeShipment": function (orderId, shipmentIndex) {
    check(orderId, String);
    check(shipmentIndex, Number);
    Orders.update(orderId, {
      $unset: {
        [`shipments.${shipmentIndex}`]: 1
      }
    });
    return Orders.update(orderId, {
      $pull: {
        shipments: null
      }
    });
  },

  /!**
   * orders/addOrderEmail
   * @summary Adds email to order, used for guest users
   * @param {String} orderId - add tracking to orderId
   * @param {String} email - valid email address
   * @return {String} returns order update result
   *!/
  "orders/addOrderEmail": function (orderId, email) {
    check(orderId, String);
    check(email, String);
    return Orders.update(orderId, {
      $set: {
        email: email
      }
    });
  },
  /!**
   * orders/addOrderEmail
   * @summary Adds file, documents to order. use for packing slips, labels, customs docs, etc
   * @param {String} orderId - add tracking to orderId
   * @param {String} docId - CFS collection docId
   * @param {String} docType - CFS docType
   * @return {String} returns order update result
   *!/
  "orders/updateDocuments": function (orderId, docId, docType) {
    check(orderId, String);
    check(docId, String);
    check(docType, String);
    return Orders.update(orderId, {
      $addToSet: {
        documents: {
          docId: docId,
          docType: docType
        }
      }
    });
  },

  /!**
   * orders/updateHistory
   * @summary adds order history item for tracking and logging order updates
   * @param {String} orderId - add tracking to orderId
   * @param {String} event - workflow event
   * @param {String} value - event value
   * @return {String} returns order update result
   *!/
  "orders/updateHistory": function (orderId, event, value) {
    check(orderId, String);
    check(event, String);
    check(value, Match.Optional(String));
    return Orders.update(orderId, {
      $addToSet: {
        history: {
          event: event,
          value: value,
          userId: Meteor.userId(),
          updatedAt: new Date()
        }
      }
    });
  },

  /!**
   * orders/inventoryAdjust
   * adjust inventory when an order is placed
   * @param {String} orderId - add tracking to orderId
   * @return {null} no return value
   *!/
  "orders/inventoryAdjust": function (orderId) {
    check(orderId, String);
    let order = Orders.findOne(orderId);

    _.each(order.items, function (product) {
      Products.update({
        "_id": product.productId,
        "variants._id": product.variants._id
      }, {
        $inc: {
          "variants.$.inventoryQuantity": -product.quantity
        }
      });
    });
    return;
  },

  /!**
   * orders/capturePayments
   * @summary Finalize any payment where mode is "authorize"
   * and status is "approved", reprocess as "capture"
   * @todo: add tests working with new payment methods
   * @todo: refactor to use non Meteor.namespace
   * @param {String} orderId - add tracking to orderId
   * @return {null} no return value
   *!/
  "orders/capturePayments": function(orderId) {
    check(orderId, String);

    let order = Orders.findOne(orderId);

    // process order..payment.paymentMethod
    _.each(order.billing.paymentMethod, function (paymentMethod) {
      if (paymentMethod.mode === "authorize" && paymentMethod.status ===
        "approved" && paymentMethod.processor) {
        Meteor[paymentMethod.processor].capture(paymentMethod.transactionId,
          paymentMethod.amount,
          function (error, result) {
            let transactionId;

            if (result.capture) {
              transactionId = paymentMethod.transactionId;
              Orders.update({
                "_id": orderId,
                "billing.paymentMethod.transactionId": transactionId
              }, {
                $set: {
                  "payment.paymentMethod.$.transactionId": result
                    .capture.id,
                  "billing.paymentMethod.$.mode": "capture",
                  "billing.paymentMethod.$.status": "completed"
                }
              });
            } else {
              Core.Log.warn(
                "Failed to capture transaction.", order,
                paymentMethod.transactionId);
              throw new Meteor.Error(
                "Failed to capture transaction");
            }
          });
      }
    });
  }*/
});

function sendOrderNotification(event, order, user, message){
  Meteor.defer(function(){
    let nObject = {};
    nObject.event = event;
    nObject.userId = user;
    nObject.objectId = order._id;
    nObject.groupId = order._groupId;
    if (message){
      nObject.message = message;
    }
    Meteor.call("notifications/sendNotification", nObject);
  });
}


function getFilterConditions(status, approvalStatus, paymentStatus){
  let options = [];
  status = status || [];
  approvalStatus = approvalStatus || [];
  paymentStatus = paymentStatus || [];

  if (status.length > 0){
    options.push({
      "status": {$in: status}
    });
  } else {
    removeProperty(options, "status")
  }



  if (approvalStatus.length > 0) {
    let object = {
      approvalStatus: {
        $in: approvalStatus
      }
    };
    options.push(object);
  } else {
    removeProperty(options, "approvalStatus")
  }


  if (paymentStatus.length > 0) {
    options.push({
      "paymentStatus": {$in: paymentStatus}
    });
  } else {
    removeProperty(options, "paymentStatus")
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
  if (reportType === "Price List Group") return "$priceListName";
  if (reportType === "Location") return "$salesLocationId";
  if (reportType === "Salesperson") return "$assigneeId";
  if (reportType === "Product Variant") return "$items.variantId";
}

/*
function lookUpObject(reportType){
  if (reportType === "Customer"){
    return  {
      $lookup: {
        from: 'customers', localField: '_id', foreignField: '_id', as: 'customer'
      }
    }
  }

  if (reportType === "Location"){
    return  {
      $lookup: {
        from: 'locations', localField: '_id', foreignField: '_id', as: 'location'
      }
    }
  }

  if (reportType === "Salesperson"){
    return  {
      $lookup: {
        from: 'users', localField: '_id', foreignField: '_id', as: 'assignee'
      }
    }
  }

  if (reportType === "Price List Group"){
    return  {
      $lookup: {
        from: 'pricelistgroups', localField: '_id', foreignField: 'code', as: 'priceList'
      }
    }
  }

  if (reportType === "Product Variant"){
    return  {
      $lookup: {
        from: 'productvariants', localField: '_id', foreignField: '_id', as: 'variant'
      }
    }
  }
}
*/

function getLocation(locationId){
  let theLocation = Locations.findOne({_id: locationId});
  return theLocation ? theLocation.name : 'Unspecified';
}

function getOrderType(orderType){
  let orderT = OrderTypes.findOne({code: orderType});
  return orderT.name ? orderT.name :  ""
}

function getSalesPerson(userId){
  let user = Meteor.users.findOne(userId);
  return user ? user.profile.fullName : "None"
}

