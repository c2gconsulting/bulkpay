
/**
 * Order Types Schema
 */
Core.Schemas.OrderType = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  sort: {
    type: Number,
    min: 0,
    optional: true
  },
  code: {
    type: Number,
    autoValue: function () {
      if (this.isInsert || this.isUpsert) {
        let orderType = OrderTypes.findOne({}, {
          sort: {
            code: -1 
            }
        });
        let newCode = orderType ? orderType.code + 10 : 10;
        if (this.isInsert) {
            return newCode;
        } else {
            return {
              $setOnInsert: newCode
            };
        }
      }  
    },
    denyUpdate: true
  },
  name: {
    type: String
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    denyUpdate: true
  }
});

/**
 * Order Types Schema
 */
Core.Schemas.OrderApproval = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  approvedBy: {
    type: String,
    optional: true
  },
  approvedAt: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert && !this.isSet) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  isAutoApproved: {
    type: Boolean,
    optional: true,
    autoValue: function () {
      let status = this.field("approvalStatus").value;
      let approvedBy = this.siblingField("approvedBy").value;
      if (status && status === "approved" && !approvedBy){
        return true
      } else {
        return false
      }
    },
    custom: function() {
      let approvedBy = this.siblingField("approvedBy").value;
      let isAutoApproved =  this.siblingField("isAutoApproved").value;
      if (approvedBy && isAutoApproved){
        return "cannotAutoApprove";
      }
    }
  }
});

/**
 * Order History Schema
 */
Core.Schemas.History = new SimpleSchema({
  event: {
    type: String
  },
  newValue: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  }
});

/**
 * Order Note Schema
 */
Core.Schemas.Note = new SimpleSchema({
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  body: {
    type: String
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  createdAt: {
    type: Date,
    optional: true
  }
});

/**
 * OrderItems Schema
 * to create Orders collection
 * @see common/collections.collection.js
 */
Core.Schemas.OrderItem = new SimpleSchema({
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  discount: {
    type: Number,
    optional: true,
    decimal: true,
    min: 0
  },
  freeForm: {
    type: String,
    optional: true
  },
  price: {
    type: Number,
    decimal: true,
    min: 0
  },
  quantity: {
    type: Number, 
    min: 1
  },
  taxRateOverride: {
    type: Number,
    decimal: true,
    min: 0,
    optional:true
  },
  variantId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    custom: function () {
      let variantId = this.siblingField("variantId").value;
      let variant = ProductVariants.findOne(variantId);
      if (variant && variant.blocked) {
          return "itemBlocked";
      }
    }
  },
  originVariantCode: {
    type: String,
    autoValue: function() {
      let variantId = this.siblingField("variantId").value;
      if (variantId){
        let variant = ProductVariants.findOne(variantId);
        if (variant){
          return variant.originVariantCode
        }
      }
    },
    optional:true
  },
  status: {
    type: String,
    allowedValues: ["open", "shipped", "returned", "deleted"],
    defaultValue: "open",
    optional: true,
    custom: function () {
      let order = Orders.findOne(this.docId);
      if (order){
        if (this.isSet && this.value === "deleted") {
          let item = _.findWhere(order.items, {_id: this.siblingField("_id").value});
          if (item && item.status !== "open"){
            return "cannotDelete";
          }
        }
        if (this.isSet && this.value === "returned") {
          let item = _.findWhere(order.items, {_id: this.siblingField("_id").value});
          if (item && item.status !== "shipped"){
            return "cannotReturn";
          }
        }
      }
    }
  },
  isPromo: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  uom: {
    type: String,
    optional:true
  }
});


/**
 * Order Schema
 * @see common/collections.collection.js
 */
Core.Schemas.Order = new SimpleSchema({ 
  _id: {
    type: String,
    optional: true
  },
  orderNumber: {
    type: Number,
    index: 1,
    autoValue: Core.schemaOrderNextSeqNumber,
    optional: true, // to enable pre-validation
    denyUpdate: true
  },
  customerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    custom: function () {
      let customer = Customers.findOne(this.field('customerId').value);
      if (customer && customer.blocked){
        return "customerBlocked";
      }
    }
  },
  customerNumber: { 
    type: String,
    index: 1,
    autoValue: function() {
      if (this.field('customerId').value) {
        let currentCustomer = Customers.findOne(this.field('customerId').value);
        if (currentCustomer) {
          return currentCustomer.customerNumber;
        }
      }
    },
    optional: true
  },
  customerName: {
    type: String,
    index: 1,
    autoValue: function() {
      if (this.field('customerId').value) {
        let currentCustomer = Customers.findOne(this.field('customerId').value);
        if (currentCustomer) {
          return currentCustomer.name;
        }
      }
    },
    optional: true
  },
  customerGroup: {
    type: String,
    index: 1,
    autoValue: function() {
      if (this.field('customerId').value) {
        let currentCustomer = Customers.findOne(this.field('customerId').value);
        if (currentCustomer) {
          return currentCustomer.groupCode;
        }
      }
    },
    optional: true
  },
  shippingAddressId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  originShippingAddressId: {
    type: String,
    autoValue: function() {
      if (this.field('customerId').value) {
        let shippingAddressId = this.field('shippingAddressId').value
        let currentCustomer = Customers.findOne(this.field('customerId').value);
        if (currentCustomer && shippingAddressId) {
          let address = _.find(currentCustomer.addressBook, function (a) { return a._id === shippingAddressId })
          if (address) {
            return address.originAddressId
          }
        }
      }
    },
    optional: true
  },
  billingAddressId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  originBillingAddressId: {
    type: String,
    autoValue: function() {
      if (this.field('customerId').value) {
        let shippingAddressId = this.field('shippingAddressId').value;
        let billingAddressId = this.field('billingAddressId').value;
        if (shippingAddressId === billingAddressId){
          let originBillingAddressId = this.field('originShippingAddressId').value;
          if (originBillingAddressId){
            return originBillingAddressId
          }
        } else {
          let currentCustomer = Customers.findOne(this.field('customerId').value);
          if (currentCustomer && billingAddressId) {
            let address = _.find(currentCustomer.addressBook, function (a) { return a._id === billingAddressId });
            if (address) {
              return address.originAddressId
            }
          }
        }
      }
    },
    optional: true
  },
  userId: {
    type: String,
    index: 1,
    autoValue: function() {
      if (this.isInsert) {
        if (this.isSet && Meteor.isServer) {
          return this.value;
        } else {
          return this.userId;
        }
      }
    },
    optional: true,
    denyUpdate: true
  },
  assigneeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  originAssigneeCode: {
    type: String,
    autoValue: function() {
      let assigneeId = this.field("assigneeId").value;
      if (assigneeId){
        let assignee = Meteor.users.findOne(assigneeId);
        if (assignee && assignee.salesProfile && assignee.salesProfile.originCode){
          return assignee.salesProfile.originCode;
        }
      }
    },
    optional: true
  },
  salesLocationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  originSalesLocationId: {
    type: String,
    autoValue: function() {
      let locationId = this.field("salesLocationId").value;
      if (locationId){
        let location = Locations.findOne(locationId);
        if (location){
          return location.originLocationId;
        }
      }
    },
    optional:true
  },
  stockLocationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  originStockLocationId: {
    type: String,
    autoValue: function() {
      let locationId = this.field("stockLocationId").value;
      if (locationId){
        let location = Locations.findOne(locationId);
        if (location){
          return location.originLocationId;
        }
      }
    },
    optional:true
  },
  currency: {
    type: Object
  },
  "currency.iso": {
    type: String
  },
  "currency.symbol": {  
    type: String,
    optional: true
  },
  contactName: {
    type: String,
    optional: true
  },
  contactPhone: {
    type: String,
    optional: true
  },
  contactEmail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  comment: {
    type: String,
    optional: true
  },
  notes: {
    type: [Core.Schemas.Note],
    optional: true
  },
  reference: {
    type: String,
    optional: true
  },
  discounts: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    optional: true
  },
  shippingCosts: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    optional: true
  },
  subTotal: {
    type: Number,
    optional: true,
    decimal: true,
    autoValue: function(){
      if (this.field('items').isSet && (this.isInsert || this.isUpsert)) {
        let items = this.field('items').value;
        let userId = this.field('userId').value || this.userId;
        let discount = this.field('discounts').value || 0;
        let shippingCosts = this.field('shippingCosts').value || 0;
        let subTotal = 0;
        _.each(items, function(item) {
          let d = item.discount || 0;
          if (!item.isPromo && item.status !== 'deleted') {
            subTotal += ((item.quantity * item.price * ((100 - d)/100)));
          }
        });
        if (this.isInsert) {
          let currency = this.field("currency").value;
          return Core.roundMoney((subTotal + shippingCosts - discount), currency["iso"], userId); // reduce discount proportionately since taxes calculated pre-discount
        } else if (this.isUpsert) {
          let currency = this.field("currency").value;
          return {
            $setOnInsert: Core.roundMoney((subTotal + shippingCosts - discount), currency["iso"], userId)
          }
        }
      }
    }
  },
  taxes: {
    type: Number,
    optional: true,
    decimal: true,
    autoValue: function() {
      if (this.field('items').isSet && (this.isInsert || this.isUpsert)) {
        let items = this.field('items').value;
        let userId = this.field('userId').value || this.userId;
        let discount = this.field('discounts').value || 0;
        let shippingCosts = this.field('shippingCosts').value || 0;
        let taxes = 0;
        let subTotal = 0;
        let defaultTaxRate = this.field('taxRate').value || 0;
        _.each(items, function(item) {
          let d = item.discount || 0;
          let tax = _.isUndefined(item.taxRateOverride) ? defaultTaxRate : item.taxRateOverride;
          if (!item.isPromo && item.status !== 'deleted') {
            subTotal += ((item.quantity * item.price * ((100 - d)/100)));
            taxes += ((item.quantity * item.price * ((100 - d)/100))) * (tax/100);
          }
        });
        let effectiveTaxRate = subTotal ? taxes / subTotal : 0;

        if (this.isInsert) {
          let currency = this.field("currency").value;
          return Core.roundMoney(taxes + ((shippingCosts - discount) * effectiveTaxRate), currency["iso"], userId) // reduce discount proportionately since taxes calculated pre-discount
        } else if (this.isUpsert) {
          let currency = this.field("currency").value;
          return {
            $setOnInsert: Core.roundMoney(taxes + ((shippingCosts - discount) * effectiveTaxRate), currency["iso"], userId)
          }
        }
      }
    }
  },
  total: {
    type: Number,
    optional: true,
    decimal: true,
    min: 0,
    autoValue: function() {
      if (this.field('items').isSet && (this.isInsert || this.isUpsert)) {
        let subTotal = this.field('subTotal').value || 0;
        let taxes = this.field('taxes').value || 0;
        if (this.isInsert) {
          return subTotal + taxes;
        } else if (this.isUpsert) {
          return {
            $setOnInsert: subTotal + taxes
          }
        }
      }
    }
  },
  appliedCredits: {
    type: Number,
    optional: true,
    decimal: true,
    autoValue: function() {
      if (this.field("appliedCredits").isSet){
        let appliedCredits = this.field("appliedCredits").value;
        let total = this.field("total").value;
        return appliedCredits > total ? total : appliedCredits;
      }
    }
  },
  paymentStatus: {
    type: String,
    allowedValues: ["unpaid", "partial", "paid"],
    index: 1,
    autoValue: function () {
      if (this.isInsert || this.isUpsert) {
        let appliedCredits = this.field('appliedCredits').value || 0;
        let total = this.field('total').value || 0;
        let currentPayments = appliedCredits;
        let paymentStatus = 'unpaid';
        if (currentPayments > 0) {
          paymentStatus = currentPayments < total ? 'partial' : 'paid';
        }
        if (this.isInsert) {
          return paymentStatus;
        } else if (this.isUpsert) {
          return {
            $setOnInsert: paymentStatus
          };
        }
      }
    },
    optional: true
  },
  approvalStatus: {
    type: String,
    allowedValues: ["pending", "approved", "rejected"],
    index: 1,
    optional: true,
    autoValue: function () {
      if (this.isInsert && !this.isSet) {
        return "pending";
      } else if (this.isUpsert && !this.isSet) {
        return {
          $setOnInsert: "pending"
        };
      }
    }
  },
  isApproved: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      let approvalStatus = this.field('approvalStatus');
      if (approvalStatus.value === "approved") {
        return true;
      } else if (approvalStatus.isSet) {
        return false;
      }
    }
  },
  status: {
    type: String,
    allowedValues: ["open", "accepted", "shipped", "cancelled"],
    index: 1,
    optional: true,
    custom: function() {
      let order = Orders.findOne(this.docId);
      if (order && this.isSet && (this.value === "cancelled" && order.shippingStatus !== "pending")){
        return "cannotCancel";
      }
    },
    autoValue: function() {
      let paymentStatus = this.field('paymentStatus').value;
      let isApproved = this.field('isApproved').value;
      let status = "open";
      if (this.isInsert) {
        return status;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: status
        };
      }
    }
  },
  invoiceStatus: {
    type: String,
    defaultValue: "pending",
    allowedValues: ["pending", "partial", "invoiced"],
    index: 1,
    optional: true
  },
  shippingStatus: {
    type: String,
    defaultValue: "pending",
    allowedValues: ["pending", "processing", "shipped"],
    index: 1,
    optional: true
  },
  taxType: {
    type: String, 
    optional: true,
    allowedValues: ["exclusive", "inclusive"]
  },
  priceListCode: {
    type: String,
    optional: true
  },
  priceListName: {
    type: String,
    autoValue: function() {
      if (this.field('priceListCode').value) {
        let priceList = PriceListGroups.findOne({code: this.field('priceListCode').value});
        if (priceList) {
          return priceList.name;
        }
      }
    },
    optional: true
  },
  issuedAt: {
    type: Date,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return {
          $set: new Date
        };
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    optional: true
  },
  shipAt: {
    type: Date,
    optional: true
  },
  rawOrder: {
    type: String,
    optional: true
  },
  taxOverride: {
    type: Number, 
    decimal: true,
    optional: true
  },
  taxRate: {
    type: Number,
    decimal: true,
    optional: true
  },
  items: {
    type: [Core.Schemas.OrderItem],
    minCount: 1
  },
  orderType: {
    type: Number,
    index: 1
  },
  isPickup: {
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  clonedFrom: {
    type: Number,
    optional: true
  },
  hasPromotions: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  isCleared: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      let paymentStatus = this.field('paymentStatus').value;
      let isCleared = paymentStatus === "paid";
      if (this.isInsert) {
        return isCleared;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: isCleared
        };
      }
    }
  },
  approvals: {
    type: [Core.Schemas.OrderApproval],
    optional: true
  },
  createdBy: {
    type: String,
    autoValue: function () {
      let createdBy = this.field("userId").value;
      if (this.isInsert) {
        return  createdBy;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: createdBy
        };
      }
    },
    denyUpdate: true,
    optional: true
  },
  history: {
    type: [Core.Schemas.History],
    optional: true,
    autoValue: function() {
      // check for new order event
      if (this.isInsert) {
        return [{
          event: "CREATE",
          userId: this.userId,
          createdAt: new Date
        }];
      } else {
        
        if (this.field("items").isSet) {
          // item change event
          return {
            $push: {
              event: "ITEM_CHANGE",
              userId: this.userId,
              createdAt: new Date
            }
          };
        }

        
        if (this.field("appliedCredits").isSet) {
          // credits change event
          return {
            $push: {
              event: "CREDITS_CHANGE",
              newValue: this.field("appliedCredits").value.toString(),
              userId: this.userId,
              createdAt: new Date
            }
          };
        } 
        if (this.field("appliedRebates").isSet) {
          // rebates change event
          return {
            $push: {
              event: "REBATES_CHANGE",
              newValue: this.field("appliedRebates").value.toString(),
              userId: this.userId,
              createdAt: new Date
            }
          };
        } 
        if (this.field("appliedDeposits").isSet) {
          // deposits change event
          return {
            $push: {
              event: "DEPOSITS_CHANGE",
              newValue: this.field("appliedDeposits").value.toString(),
              userId: this.userId,
              createdAt: new Date
            }
          };
        } 
        if (this.field("status").isSet) {
          let order = Orders.findOne(this.docId);
          let status = this.field("status").value;
          if (order.status !== status){
            // deposits change event
            return {
              $push: {
                event: "STATUS_CHANGE",
                newValue: this.field("status").value,
                userId: this.userId,
                createdAt: new Date
              }
            };
          }
        } 
        if (this.field("paymentStatus").isSet) {
          // deposits change event
          return {
            $push: {
              event: "PAYMENTSTATUS_CHANGE",
              newValue: this.field("paymentStatus").value,
              userId: this.userId,
              createdAt: new Date
            }
          };
        } 
      }
      if (this.field("approvalStatus").isSet) {
        // deposits change event
        return {
          $push: {
            event: "APPROVALSTATUS_CHANGE",
            newValue: this.field("approvalStatus").value,
            userId: this.userId,
            createdAt: new Date
          }
        };
      }
    }
  }
});

SimpleSchema.messages({
  "cannotReturn": "You cannot return an item that is not shipped",
  "cannotDelete": "You cannot delete an item that is shipped or returned.",
  "cannotCancel": "You cannot cancel an order that is shipped",
  "customerBlocked": "You cannot place an order for a blocked customer",
  "itemBlocked": "You cannot place an order for a blocked item",
  "cannotAutoApprove": "You cannot auto approve an order that already approved by someone"
});




