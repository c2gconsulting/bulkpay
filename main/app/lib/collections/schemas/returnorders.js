/**
 * Return Reason Schema
 */
Core.Schemas.ReturnReason = new SimpleSchema({
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
    type: String,
    optional: true,
    autoValue: function () {
      let originCode = this.field('originCode').value;
      if (originCode) {
        return originCode
      } else {
        if (!this.isSet && (this.isInsert || this.isUpsert)) {
          let currentReason = ReturnReasons.findOne({}, {
            sort: {
              code: -1
            }
          });
          let newCode = currentReason ? Number(currentReason.code) + 10 : 10;
          if (this.isInsert) {
            return (newCode).toString();
          } else {
            return {
              $setOnInsert: (newCode).toString()
            };
          }
        }
      }
    },
    denyUpdate: true
  },
  reason: {
    type: String
  },
  originReasonCode: {
    type: String,
    optional: true,
    denyUpdate: true
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
 * ReturnOrderItems Schema
 * to create ReturnOrders collection
 * @see common/collections.collection.js
 */
Core.Schemas.ReturnOrderItem = new SimpleSchema({
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  orderItemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  discount: {
    type: Number,
    decimal: true,
    optional: true,
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
    min: 0
  },
  taxRateOverride: {
    type: Number,
    decimal: true,
    min: 0,
    optional: true
  },
  variantId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
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
  isPromo: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  returnReason: {
    type: String,
    optional: true
  },
  reasonCode: {
    type: String,
    optional: true
  },
  originReasonCode: {
    type: String,
    optional: true,
    autoValue: function() {
      let reasonCode = this.siblingField("reasonCode").value;
      if (reasonCode){
        let returnReason = ReturnReasons.findOne({code: reasonCode});
        if (returnReason){
          return returnReason.originReasonCode
        }
      }
    }
  },
  uom: {
    type: String,
    optional:true
  }
});


/**
 * ReturnOrder Schema
 * @see common/collections.collection.js
 */
Core.Schemas.ReturnOrder = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  returnOrderNumber: {
    type: Number,
    index: 1,
    optional: true,
    autoValue: Core.schemaReturnOrderNextSeqNumber,
    denyUpdate: true
  },
  customerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  orderNumber: {
    type: Number,
    autoValue: function() {
      if (this.field('orderId').value) {
        let currentOrder = Orders.findOne(this.field('orderId').value);
        if (currentOrder) {
          return currentOrder.orderNumber;
        }
      }
    },
    optional: true
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
  orderId: {
    type: String,
    index: 1
  },
  userId: {
    type: String,
    index: 1,
    autoValue: function() {
      if (this.isSet && Meteor.isServer) {
        return this.value;
      } else {
        return this.userId;
      }
    },
    optional: true
  },
  salesLocationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    autoValue: function() {
      if (!this.isSet) {
          let orderNumber = this.field('orderNumber').value;
          let orderId = this.field('orderId').value;
          let order;
          if(orderNumber){
              order = Orders.findOne({orderNumber: orderNumber});
          } else if(orderId) {
              order = Orders.findOne(orderId);
          }
          if (order) {
              return order.salesLocationId;
          }
      }
    },
    optional: true
  },

  assigneeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoValue: function() {
      if (!this.isSet) {
        let orderNumber = this.field('orderNumber').value;
        let orderId = this.field('orderId').value;
        let order;
        if(orderNumber){
          order = Orders.findOne({orderNumber: orderNumber});
        } else if(orderId) {
          order = Orders.findOne(orderId);
        }
        if (order) {
          return order.assigneeId;
        }
      }
    }
  },
  originAssigneeCode: {
    type: String,
    autoValue: function() {
      if (!this.isSet) {
        let orderNumber = this.field('orderNumber').value;
        let orderId = this.field('orderId').value;
        let order;
        if(orderNumber){
          order = Orders.findOne({orderNumber: orderNumber});
        } else if(orderId) {
          order = Orders.findOne(orderId);
        }
        if (order) {
          return order.originAssigneeCode;
        }
      }
    },
    optional: true
  },

  stockLocationId: {
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
          return location.originLocationId
        }
      }
    },
    optional:true
  },
  originStockLocationId: {
    type: String,
    autoValue: function() {
      let locationId = this.field("stockLocationId").value;
      if (locationId){
        let location = Locations.findOne(locationId);
        if (location){
          return location.originLocationId
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
  status: {
    type: String,
    allowedValues: ["pending", "approved", "rejected"],
    index: 1,
    optional: true,
    autoValue: function () {
      if (this.isInsert && !this.isSet) {
        return "approved";
      } else if (this.isUpsert && !this.isSet) {
        return {
          $setOnInsert: "approved"
        };
      }
    }
  },
  issuedAt: {
    type: Date,
    optional: true
  },
  approvals: {
    type: [Core.Schemas.OrderApproval],
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true,
    autoValue: function() {
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
    autoValue: function() {
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
  taxRate: {
    type: Number,
    decimal: true,
    optional: true
  },
  discounts: {
    type: Number,
    decimal: true,
    autoValue: function() {
      if (this.field('items').isSet && (this.isInsert || this.isUpsert)) {
        let total = this.field('total').value || 0;
        let orderId = this.field('orderId').value;
        
        if(orderId) {
          let order = Orders.findOne(orderId);
          if (order) {
            let discounts = order.total === 0 ? 0 : (total / order.total) * order.discounts;
            if (this.isInsert) {
              return discounts;
            } else if (this.isUpsert) {
              return {
                $setOnInsert: discounts
              }
            }
          }
        }
      }
    },
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
  items: {
    type: [Core.Schemas.ReturnOrderItem],
    minCount: 1
  },
  isPickup: {
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  createdBy: {
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        return  this.userId;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: this.userId
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
      // check for new ReturnOrder event
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

        if (this.field("status").isSet) {
          let order = ReturnOrders.findOne(this.docId);
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

      }
    }
  }

});
