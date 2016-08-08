/**
 * PaymentTerm Schema
 */

Core.Schemas.PaymentTerm = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    index: 1,
    optional: true
  },
  dueInDays: {
    type: Number,
    optional: true,
    min: 0
  },
  status: {
    type: String,
    defaultValue: "active",
    optional: true
  }
});



/**
 * InvoiceItem Schema
 * populate with order.items that are added to an invoice
 */
Core.Schemas.InvoiceItem = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    autoValue: Core.schemaIdAutoValue
  },
  orderItemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  quantity: {
    type: Number,
    min: 0
  },
  price: {
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
  orderPrice: {
    type: Number,
    decimal: true,
    optional: true,
    min: 0
  },
  discount: {
    type: Number,
    decimal: true,
    optional: true,
    min: 0
  },
  taxRateOverride: {
    type: Number,
    decimal: true,
    min: 0,
    optional: true

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
 * Invoice Note Schema
 */
Core.Schemas.InvoiceNote = new SimpleSchema({
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
 * Invoice History Schema
 */
Core.Schemas.InvoiceHistory = new SimpleSchema({
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
 * Invoice Schema
 */
Core.Schemas.Invoice = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  invoiceNumber: {
    type: Number,
    index: 1,
    autoValue: Core.schemaInvoiceNextSeqNumber,
    optional: true, // to enable pre-validation
    denyUpdate: true
  },
  orderNumber: {
    type: Number,
    autoValue: function() {
        if (!this.isSet) {
           let orderId = this.field('orderId').value;
           if(orderId) {
              let order = Orders.findOne(orderId);
              if (order) {
                  return order.orderNumber;
              }
           }
        }
    },
    optional: true
  },
  customerId: {
    type: String,
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
          return order.customerId;
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
    index: 1,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.field('orderNumber').value && !this.isSet) {
        let currentOrder = Orders.findOne({orderNumber: this.field('orderNumber').value});
        if (currentOrder) {
          return currentOrder._id;
        }
      }
    },
    optional: true
  },
  issuedAt: {
    type: Date,
    optional: true,
    autoValue: function() {
      if (!this.isSet && this.isInsert) {
          return new Date
      }
    }
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
    denyUpdate: true,
    optional: true
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
  status: {
    type: String,
    allowedValues: ["paid", "unpaid"],
    defaultValue: "paid",
    optional: true
  },
  invoicedAt: {
    type: Date,
    optional: true
  },
  shipAt: {
    type: Date,
    optional: true
  },
  dueAt: {
    type: Date,
    optional: true
  },
  items: {
    type: [Core.Schemas.InvoiceItem],
    minCount: 1
  },
  comment: {
    type: String,
    optional: true
  },
  currency: {
    type: Object,
    optional: true,
    autoValue: function() {
      let orderNumber = this.field('orderNumber').value;
      let orderId = this.field('orderId').value;
      let order;
      if(orderNumber){
          order = Orders.findOne({orderNumber: orderNumber});
      } else if(orderId) {
          order = Orders.findOne(orderId);
      }
      if (order && this.isInsert) {
          return {
              symbol: order.currency.symbol,
              iso: order.currency.iso
          };
      }
    }
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
  "currency.iso": {
    type: String
  },
  "currency.symbol": {
    type: String,
    optional: true
  },
  shippingAddressId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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
             return order.shippingAddressId;
         }
       }
    },
    optional: true
  },
  billingAddressId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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
              return order.billingAddressId;
          }
      }
    },
    optional: true
  },
  exchangeRate: {
    type: Number,
    decimal: true,
    defaultValue: 1.0,
    optional: true
  },
  taxRate: {
    type: Number,
    decimal: true,
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
              return order.taxRate;
          }
      }
    }
  },
  discounts: {
    type: Number,
    decimal: true,
    autoValue: function() {
      if (this.field('items').isSet && (this.isInsert || this.isUpsert)) {
        let total = Core.getDocumentRawTotal(this.field('items').value);
        let orderId = this.field('orderId').value;
        
        if(orderId) {
          let order = Orders.findOne(orderId);
          if (order) {
            let discounts = order.total === 0 ? 0 : (total / order.rawTotal()) * order.discounts;
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
  paymentTerm: { // copy over the actual name of the PaymentTerm
    type: String,
    optional: true
  },
  notes: {
    type: [Core.Schemas.InvoiceNote],
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
  stockLocationId: {
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
              return order.stockLocationId;
          }
      }
    },
    optional: true
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
  reference: {
    type: String,
    optional: true
  },
  createdBy: {
    type: String,
    autoValue: function () {
      let userId = this.value || this.userId;
      if (this.isInsert) {
        return  userId;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: userId
        };
      }
    },
    denyUpdate: true,
    optional: true
  },
  history: {
    type: [Core.Schemas.InvoiceHistory],
    optional: true,
    autoValue: function() {
      // check for new order event
      if (this.isInsert) {
        return [{
          event: "CREATE",
          userId: this.field("userId").value,
          createdAt: new Date
        }];
      } else {
        if (this.field("status").isSet) {
          // deposits change event
          return {
            $push: {
              event: "STATUS_CHANGE",
              newValue: this.field("status").value,
              userId: this.field("userId").value,
              createdAt: new Date
            }
          };
        }
      }
    }
  }
});
