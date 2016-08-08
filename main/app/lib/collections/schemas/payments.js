/**
 * PymentMethod Schema
 */
Core.Schemas.PaymentMethod = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String 
    },
    code: {
        type: String,
        autoValue: function () {
            if (this.isInsert || this.isUpsert) {
                let paymentMethod = PaymentMethods.findOne({}, {
                    sort: {
                        code: -1
                    }
                });
                let newDoc = paymentMethod ? Number(paymentMethod.code) + 10 : 10;
                if (this.isInsert) {
                    return (newDoc).toString();
                } else {
                    return {
                        $setOnInsert: (newDoc).toString()
                    };
                }
            }
        },
        optional: true,
        denyUpdate: true
    },
    isCashInHand: {
        type: Boolean,
        defaultValue: true,
        optional: true
    }
});

/**
 * Payment Schema
 */

Core.Schemas.Payment = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  invoiceId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    optional: true
  },
  orderId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    optional: true,
    autoValue: function(){
      if (!this.isSet){
        let orderNumber = this.field('orderNumber').value;
        if (orderNumber){
          let order = Orders.findOne({orderNumber: orderNumber});
          if (order){
            return order._id
          }
        }
      }
    }
  },
  orderNumber: {
    type: Number,
    optional: true
  },
  amount: {
    type: Number,
    decimal: true // add autovalue to derive from exRt if unset
  },
  amountFC: {
    type: Number,
    decimal: true,
    optional: true // not provided necessarily if amount is in Base Currency
  },
  reference: {
    type: String,
    autoValue: function() {
      if (this.isSet) return this.value.toUpperCase(); //convert to uppercase
    },
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  isCashInHand: {
    type: Boolean,
    defaultValue: false
  },
  paymentMethod: {
    type: Object,
    optional: true
  },
  "paymentMethod.code": {  
    type: String
  },
  "paymentMethod.name": {
    type: String,
    autoValue: function() {
      if (this.isInsert && !this.isSet) {
        let code = this.field("paymentMethod.code").value;
        if (code){
          let paymentMethods = PaymentMethods.findOne({'code': code});
          if (paymentMethods){
            return paymentMethods.name;
          }
        }
      }
    }
  },
  status: {
    type: String,
    defaultValue: "active",
    optional: true
  },
  exchangeRate: {
    type: Number,
    decimal: true,
    defaultValue: 1.0,  // add autovalue to derive from amountFC/amount if unset
    optional: true
  },
  paidAt: {
    type: Date
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
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert && !this.isSet) {
        return new Date;
      }
      this.unset();
    },
    optional: true
  }
});
