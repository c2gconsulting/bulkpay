/*****************************************************************************/
/*  Server Methods */
/*****************************************************************************/

Meteor.methods({
  /**
   * customers/createCustomer
   * @summary when we create a new customer attach all the necessary fields
   * @param {Object} customer - optional product object
   * @return {Object} return insert result
   */
  "customers/createCustomer": function (customer) {

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();

    try {
      check(customer, Core.Schemas.Customer);
    } catch (e) {
      throw new Meteor.Error(401, "There's invalid data in your customer. Please correct and retry");
    }

    this.unblock();

    let customerId = Customers.insert(customer);
    let newCustomer = Customers.findOne(customerId);
    sendCustomerNotification("customer.created", newCustomer, userId);

    /*
     * TODO
     *
     *  Add functionality for sending newly created customer to the admin
     *  micro-service pending approval by an authorized personnel
     *
     * */

    return {
      _id: customerId,
      customerNumber: newCustomer.customerNumber
    };
  },

  /**
   * customers/updateCustomer
   * @summary customer update
   * @param {Object} customer - customer object
   * @param {Object} customerId - id of customer to be updated
   * @return {Boolean} return insert result
   */
  "customers/updateCustomer": function (customer, customerId) {
    check(customer, Object);
    check(customerId, String);
    if (!Meteor.userId()) {
      throw new Meteor.Error(404, "Unauthorized");
    }
    let currentCustomer = Customers.findOne(customerId);
    if (currentCustomer) {
      Customers.update({_id: currentCustomer._id}, {
        $set: {
          "name": customer.name,
          "email": customer.email,
          "phone": customer.phone,
          "customerType": customer.customerType,
          "groupCode": customer.groupCode,
          "company": customer.company,
          "addressBook": customer.addressBook
        }
      });
      return true
    } else {
      throw new Meteor.Error(404, "Customer Not found");
    }
  },

  /**
   * customers/deleteCustomer
   * @summary delete a customer and unlink it from all media
   * @param {String} customerId - customerId to delete
   * @returns {Boolean} returns delete result
   */
  "customers/deleteCustomer": function (customerId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(customerId, String);
    this.unblock();

    let numRemoved = Products.remove(customerId);
    if (numRemoved > 0) {
      Media.update({
        "metadata.productId": customerId
      }, {
        $unset: {
          "metadata.productId": "",
          "metadata.variantId": "",
          "metadata.priority": ""
        }
      }, {
        multi: true
      });
      return true;
    }
    // return false if unable to delete
    return false;
  },

  /**
   * customers/updateCustomerField
   * @summary update single product field
   * @param {String} customerId - customerId to update
   * @param {String} field - key to update
   * @param {String} value - update property value
   * @return {String} returns update result
   */

  "customers/updateCustomerField": function (customerId, field, value) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(customerId, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean));
    this.unblock();

    let stringValue = EJSON.stringify(value);
    let update = EJSON.parse("{\"" + field + "\":" + stringValue + "}");

    return Customers.update(customerId, {
      $set: update
    });
  },


  /*
   * add new addresses to a customer
   */
  "customers/addressBookAdd": function (doc, customerId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(doc, Core.Schemas.Address);
    check(customerId, String);
    this.unblock();

    Core.Schemas.Address.clean(doc);
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
    Customers.upsert(customerId, {
      $addToSet: {
        "addressBook": doc
      }
    });
    return doc;
  },

  /*
   * update existing address in customer's profile
   */
  "customers/addressBookUpdate": function (doc, customerId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(doc, Core.Schemas.Address);
    check(customerId, String);
    this.unblock();

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
    Customers.update({
      "_id": customerId,
      "addressBook._id": doc._id
    }, {
      $set: {
        "addressBook.$": doc
      }
    });
    return doc;
  },

  /*  update single billing address  */
  "customers/updateBillingAddress": function (customerId, addressBookId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(customerId, String);
    check(addressBookId, String);
    Customers.update({_id: customerId, "addressBook.isBillingDefault": true}, {
      "$set": {
        'addressBook.$.isBillingDefault': false
      }
    }, {multi: true});

    Customers.update({_id: customerId, "addressBook._id": addressBookId}, {
      "$set": {
        'addressBook.$.isBillingDefault': true
      }
    })
  },

  /*create customer transaction*/

  "customers/createTransaction": function (doc) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(doc, Core.Schemas.CustomerTransaction);
    return CustomerTransactions.insert(doc);
  },


  "customers/updateShippingAddress": function (customerId, addressBookId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(customerId, String);
    check(addressBookId, String);
    Customers.update({_id: customerId, "addressBook.isShippingDefault": true}, {
      "$set": {
        'addressBook.$.isShippingDefault': false
      }
    }, {multi: true});

    Customers.update({_id: customerId, "addressBook._id": addressBookId}, {
      "$set": {
        'addressBook.$.isShippingDefault': true
      }
    });
  },

  "customers/updateDeliveryType": function (customerId, state) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(customerId, String);
    check(state, Boolean);
    Customers.update({_id: customerId}, {
      "$set": {
        'isPickupDefault': state
      }
    })
  },


  /*
   * remove existing address in customer's profile
   */
  "customers/addressBookRemove": function (doc, customerId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(doc, Core.Schemas.Address);
    check(customerId, String);
    this.unblock();

    Customers.update({
      "_id": customerId,
      "addressBook._id": doc._id
    }, {
      $pull: {
        "addressBook": {
          _id: doc._id
        }
      }
    });
    return doc;
  },

  /**
   * customers/getCustomers
   * @summary returns customers that fit search criteria
   * @param {String} searchText - text to search for
   * @param {Object} options - proposed query projections
   * @returns {Collection} returns collection of found items
   */
  "customers/getCustomers": function (searchText, options) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(searchText, String);

    this.unblock();

    options = options || {};
    options.limit = 10;
    options.fields = {
      "name": 1,
      "description": 1,
      "customerNumber": 1
    };
    options.sort = {name: 1};

    if (searchText && searchText.length > 0) {
      var regExp = Core.buildRegExp(searchText);
      var selector = {
        $and: [
          {blocked: {$ne: true}},
          {
            $or: [
              {customerNumber: regExp},
              {name: regExp},
              {originCustomerId: regExp},
              {title: regExp},
              {email: regExp},
              {url: regExp},
              {searchTerms: regExp},
              {'addressBook.fullName': regExp},
              {'addressBook.company': regExp},
              {'addressBook.address1': regExp},
              {'addressBook.address2': regExp},
              {'addressBook.state': regExp}
            ]
          }
        ]
      };

      return Customers.find(selector, options).fetch();
    }

  },

  "customers/orderschart": function (customerId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    let tenantId = Core.getTenantId(userId);

    let beginingOfYear = moment().startOf("year")._d;
    let today = new Date;
    let previousYear = moment().subtract(1, 'years').startOf('year');
    let todayInPreviousYear = moment(today).subtract(1, 'years');

    let currentData = Orders.aggregate([
      {
        "$match": {
          _groupId: tenantId,
          customerId: customerId,
          status: {$ne: "cancelled"},
          issuedAt: {$gte: beginingOfYear}
        }
      },
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

    let previousDuration = Orders.aggregate([
      {
        "$match": {
          status: {$ne: "cancelled"},
          _groupId: tenantId,
          customerId: customerId,
          issuedAt: {$gte: previousYear._d, $lte: todayInPreviousYear._d}
        }
      },
      {$group: {_id: null, totalAmount: {$sum: "$total"}, count: {$sum: 1}}}
    ]);

    let data = {};
    data.currentData = currentData;
    data.previousDuration = previousDuration;
    return data
  },

  "customers/transactionChart": function (customerId, transactionType1, transactionType2, transactionType3) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();
    let tenantId = Core.getTenantId(userId);
    let today = new Date;
    let previousYear = moment().subtract(1, 'years').startOf('year');
    let todayInPreviousYear = moment(today).subtract(1, 'years');
    let thisYear = (new Date()).getFullYear();
    let start = new Date("1/1/" + thisYear);

    let beginingOfYear = moment().startOf("year")._d;
    let currentData = Customers.aggregate([
      {"$match": {_id: customerId}},
      {$unwind: "$accountHistory"},
      {
        "$match": {
          "accountHistory.valueDate": {
            "$gte": beginingOfYear
          }
        }
      },
      {
        $project: {
          "month": {"$month": "$accountHistory.valueDate"},
          "amount": "$accountHistory." + transactionType1
        }
      },
      {
        $group: {
          _id: {month: "$month"},
          total: {$avg: "$amount"}
        }
      }
    ]);

    let data = {};
    data.currentData = currentData;
    return data;
  }

});


const sendCustomerNotification = (event, customer, user, message) => {
  Meteor.defer(function () {
    let nObject = {};
    nObject.event = event;
    nObject.userId = user;
    nObject.objectId = customer._id;
    nObject.groupId = customer._groupId;
    if (message) {
      nObject.message = message;
    }
    Meteor.call("notifications/sendNotification", nObject);
  });
};


