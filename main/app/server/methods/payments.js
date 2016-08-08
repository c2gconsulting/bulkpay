/**
 *  Payment Methods
 */
Meteor.methods({

  /**
   * payments/createPayment
   * @summary create a new payment
   * @param {Object} payment - payment object
   * @return {String} return insert result
   */

   
  "payments/createPayment": function (payment) {
    this.unblock();
    if (Meteor.userId()){
      let result;
      Core.createPayment(payment, Meteor.userId(), function (err, res) {
        if (err){
          throw new Meteor.Error(403, err)
        } else {
          result = res
        }
      });
      return result
    } else {
      throw new Meteor.Error(403, "Unauthorized");
    }
  },

  "payments/getExportData": function (options) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(options, Object);
    this.unblock();
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
    if (!_.isEmpty(orderOptions)) {
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

    if (_.isArray(orderIds) && orderIds.length > 0) {
      paymentOptions['orderId'] = {$in: orderIds};
    }

    if (options && options["$or"] && options["$or"].length <= 0) {
      delete options["$or"]
    }
    let payments = CustomerTransactions.find(paymentOptions).fetch();
    let foundOrderIds = _.uniq(_.pluck(payments, "orderId"));
    let customerIds = _.uniq(_.pluck(payments, "customerId"));

    let customerData = {};
    let orderData = {};

    let orders = Orders.find({_id: {$in: foundOrderIds}}).fetch();
    let customers = Customers.find({_id: {$in: customerIds}}).fetch();

    _.each(customers, function (customer) {
      customerData[customer._id] = {
        name: customer.name
      };
    });

    _.each(orders, function (order) {
      orderData[order._id] = {
        orderNumber: order.orderNumber
      };
    });

    let data = [];

    function getCustomer(customerId) {
      return customerData[customerId] ? customerData[customerId].name : "Unspecified"
    }

    function getOrder(orderId) {
      return orderData[orderId] ? orderData[orderId].orderNumber : "Unspecified"
    }

    _.each(payments, function (payment) {
      data.push([
        getOrder(payment.orderId),
        payment.narration,
        payment.reference,
        payment.amount,
        getCustomer(payment.customerId),
        moment(payment.postingDate).toDate()
      ]);
    });

    return data
  }


});


_.extend(Core, {
  createPayment: function (payment, userId, callback) {
    let user = Meteor.users.findOne(userId);
    if (user){
      try {
        check(payment, Core.Schemas.Payment);
      } catch (e) {
        console.log(e);
        Core.Log.error("There's invalid data in your payment. Please correct and retry");
        return callback("There's invalid data in your payment. Please correct and retry", null);
      }
      // if a payment object was provided and valid schema
      //let userGroups = Core.getAuthorizedGroups(userId, "orders/manage");
      let order = Orders.findOne(payment.orderId);
      if (!order) {
        Core.Log.error("The order you have tried to create a payment for is invalid");
        return callback("The order you have tried to create a payment for is invalid", null);
      }

      if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        // must have orders/manage permissions
        let paymentId = Payments.insert(payment);
        let newPayment = Payments.findOne(paymentId);
        if (newPayment){
          sendPaymentNotification("payment.created", newPayment, userId)
        }
        return callback(null, {paymentId: paymentId})
      } else {
        Core.Log.error("You are not authorized to create a payment for this location");
        return callback("You are not authorized to create a payment for this location", null);
      }
    } else {
      Core.Log.error("You are not authorized to create a payment for this location");
      return callback("You are not authorized to create a payment", null);
    }
  }
})


function sendPaymentNotification(event, payment, user){
  Meteor.defer(function(){
    let nObject = {};
    nObject.event = event;
    nObject.userId = user;
    nObject.objectId = payment._id;
    nObject.groupId = payment._groupId;
    Meteor.call("notifications/sendNotification", nObject);
  });
}
