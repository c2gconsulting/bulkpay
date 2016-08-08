Core.Schemas.CreditHold = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    customerId: {
        type: String,
        denyUpdate: true
    },
    customerNumber: {
        type: String,
        denyUpdate: true,
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
    orderId: {
        type: String,
        denyUpdate: true
    },
    orderNumber: {
        type: Number,
        denyUpdate: true,
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
    amount: {
        type: Number,
        decimal: true,
        min: 0,
        custom: function(){
            let orderId = this.field('customerId').value;
            let amount = this.field('amount').value;
            if (orderId){
                let order = Orders.findOne(orderId);
                if  (order) {
                    if (amount > order.total){
                        return "invalid-amount";
                    }
                }
            }
        }
    },
    currency: {
        type: Object,
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
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            return new Date
        }
    }
});


Core.Schemas.CustomerHold = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    customerId: {
        type: String,
        denyUpdate: true
    },
    customerNumber: {
        type: String,
        denyUpdate: true,
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
    orderId: {
        type: String,
        denyUpdate: true
    },
    orderNumber: {
        type: Number,
        denyUpdate: true,
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
    amount: {
        type: Number,
        decimal: true,
        min: 0,
        custom: function(){
            let orderId = this.field('customerId').value;
            let amount = this.field('amount').value;
            if (orderId){
                let order = Orders.findOne(orderId);
                if  (order) {
                    if (amount > order.total){
                        return "invalid-amount";
                    }
                }
            }
        }
    },
    currency: {
        type: Object,
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
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            return new Date
        }
    }
});

SimpleSchema.messages({
    "invalid-amount": "The amount cannot be greater than order amount"
});

/**
 * Core.Schemas.CustomerTransaction
 */
Core.Schemas.CustomerTransaction = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    customerId: {
        type: String,
        denyUpdate: true,
        optional: true,
        autoValue: function(){
            if (!this.isSet){
                let originCustomerNumber = this.field("originCustomerNumber").value;
                if (originCustomerNumber){
                    let customer = Customers.find({customerNumber: originCustomerNumber});
                    if (customer){
                        return customer._id
                    }
                }

            }
        }
    },
    customerName: {
        type: String,
        denyUpdate: true,
        optional: true,
        autoValue: function(){
            if (!this.isSet){
                let originCustomerNumber = this.field("originCustomerNumber").value;
                if (originCustomerNumber){
                    let customer = Customers.find({customerNumber: originCustomerNumber});
                    if (customer){
                        return customer.name
                    }
                }

            }
        }
    },
    postingDate: {
        type: Date,
        denyUpdate: true
    },
    originDocumentNo: {
        type: String,
        denyUpdate: true,
        autoValue: function(){
            let documentNumber = this.field("originDocumentNo").value;
            if (this.isInsert) {
                return documentNumber;
            } else {
                return {
                    $setOnInsert: documentNumber
                };
            }
        }
    },
    originCustomerNumber: {
        type: String,
        optional: true
    },
    invoiceId: {
        type: String,
        optional: true,
        autoValue:  function () {
            let transactionType = this.field("transactionType").value;
            let reference = this.field("reference").value;
            let invoiceNumber = Number(reference);
            if (transactionType === "invoices" && reference) {
                let invoice = Invoices.findOne({invoiceNumber: invoiceNumber });
                if (invoice){
                    return invoice._id
                }
            }
        }
    },
    paymentId: {
        type: String,
        optional: true,
        autoValue:  function () {
            let transactionType = this.field("transactionType").value;
            let reference = this.field("reference").value;
            if (transactionType === "payments" && reference) {
                let payment = Payments.findOne({reference: reference});
                if (payment){
                    return payment._id
                }
            }
        }
    },
    reference: {
        type: String,
        autoValue: function() {
          if (this.isSet) return this.value.toUpperCase(); //convert to uppercase
        },
        optional: true
    },
    transactionType: {
        type: String,
        allowedValues: ['payments', 'rebates', 'invoices', 'other_credits', 'other_debits'],
        index: 1,
        denyUpdate: true
    },
    orderId: {
        type: String,
        optional: true,
        autoValue:  function () {
            let transactionType = this.field("transactionType").value;
            let reference = this.field("reference").value;
            if (transactionType === "payments" && reference) {
                let payment = Payments.findOne({reference: reference});
                if (payment) return payment.orderId;
            }
        }
    },
    orderNumber: {
        type: Number,
        optional: true,
        autoValue:  function () {
            let transactionType = this.field("transactionType").value;
            let reference = this.field("reference").value;
            if (transactionType === "payments" && reference) {
                let payment = Payments.findOne({reference: reference});
                if (payment) return payment.orderNumber;
            }
        }
    },
    narration: {
        type: String,
        optional: true
    },
    amountFC: {
        type: Number,
        decimal: true,
        denyUpdate: true,
        optional: true
    },
    amount: {
        type: Number,
        decimal: true,
        denyUpdate: true
    },
    currency: {
        type: Object,
        denyUpdate: true
    },
    "currency.iso": {
        type: String
    },
    "currency.symbol": {
        type: String,
        optional: true
    },
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            return new Date
        }
    },
    isOpen: {
        type: Boolean,
        defaultValue: true,
        optional: true
    }
});