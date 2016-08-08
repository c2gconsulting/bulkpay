
Core.publish("ManagePayments", function (options, limit, sort) {
  let userId = this.userId;
  let timezone = Core.getTimezone(userId);
  let orderFields = {
    'customerName': 1,
    'customerId': 1,
    'userId': 1,
    'stockLocationId': 1,
    'salesLocationId': 1,
    'orderNumber': 1,
    'issuedAt': 1,
    'total': 1,
    'orderType': 1
  };

  let orderOptions = {};
  if (options['salesLocationId']) {
    orderOptions['salesLocationId'] = options['salesLocationId'];
  }
  if (options['stockLocationId']) {
    orderOptions['stockLocationId'] = options['stockLocationId'];
  }
  if (options['assigneeId']) {
    orderOptions['assigneeId'] = options['assigneeId'];
  }
  if (options['userId']) {
    orderOptions['userId'] = options['userId'];
  }
  if (options['orderType']) {
    orderOptions['orderType'] = options['orderType'];
  }


  let orderIds = [];
  if (!_.isEmpty(orderOptions)){
    let orders = Orders.find(orderOptions, {
      fields: orderFields
    }).fetch();
    orderIds = _.pluck(orders, '_id');
    orderIds = _.uniq(orderIds);
  }


  let paymentOptions = {};
  if (options['postingDate']) {
    paymentOptions['postingDate'] = options['postingDate'];
    if (paymentOptions && paymentOptions['postingDate']["$gte"]) {
      paymentOptions['postingDate']["$gte"] = moment(paymentOptions['postingDate']["$gte"]).startOf("day").tz(timezone).toDate();
    }
    if (paymentOptions && paymentOptions['postingDate']["$lte"]) {
      paymentOptions['postingDate']["$lte"] = moment(paymentOptions['postingDate']["$lte"]).endOf('day').tz(timezone).toDate();
    }
  }

  if (options['customerId']) {
    paymentOptions['customerId'] = options['customerId'];
  }
  
  paymentOptions['transactionType'] = "payments";

  if (_.isArray(orderIds) && orderIds.length > 0){
    paymentOptions['orderId'] = { $in: orderIds }; 
  }

  if (options && options["$or"] && options["$or"].length <= 0){
    delete options["$or"]
  }
   let paymentsCursor = CustomerTransactions.find(paymentOptions, {
     sort: sort, limit: limit
   });
   let paymentsData = paymentsCursor.fetch();
   let foundOrderIds = _.uniq(_.pluck(paymentsData, "orderId"));
   let customerIds = _.uniq(_.pluck(paymentsData, "customerId"))
  
   let orderCursor = Orders.find({_id: {$in: foundOrderIds}});
   let customerCursor = Customers.find({_id: {$in: customerIds}});
  return [ paymentsCursor, orderCursor, customerCursor];
 
  return this.ready();

});
