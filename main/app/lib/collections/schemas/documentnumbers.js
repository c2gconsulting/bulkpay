Core.Schemas.DocumentNumber = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    documentType: {
        type: String,
        denyUpdate: true
    },
    nextSeqNumber: {
        type: Number,
        index: 1,
        autoValue: function () {
            // initialise document number range with seed or with current next number if numbering already active
            if (this.isInsert || this.isUpsert) {
                let documentType = this.field('documentType').value;
                let collection, numberField, seed, typeset, nextSeqNumber;
                switch(documentType) {
                    case 'customer':
                        collection = Customers;
                        numberField = 'customerNumber';
                        seed = 1100000001;
                        typeset = true;
                        break;
                    case 'supplier':
                        collection = Suppliers;
                        numberField = 'supplierNumber';
                        seed = 9100000001;
                        typeset = true;
                        break;
                    case 'order':
                        collection = Orders;
                        numberField = 'orderNumber';
                        seed = 4100000001;
                        typeset = true;
                        break;
                    case 'return_order':
                        collection = ReturnOrders;
                        numberField = 'returnOrderNumber';
                        seed = 6100000001;
                        typeset = true;
                        break;
                    case 'purchase_order':
                        collection = PurchaseOrders;
                        numberField = 'purchaseOrderNumber';
                        seed = 7100000001;
                        typeset = true;
                        break;
                    case 'invoice':
                        collection = Invoices;
                        numberField = 'invoiceNumber';
                        seed = 5100000001; 
                        typeset = true;
                        break;
                    case 'stock_transfer':
                        collection = StockTransfers;
                        numberField = 'stockTransferNumber';
                        seed = 8100000001;
                        typeset = true;
                        break;
                    case 'stock_adjustment':
                        collection = StockAdjustments;
                        numberField = 'stockAdjustmentNumber';
                        seed = 2100000001;
                        typeset = true;
                        break;
                }
                let options = { sort: {}};
                if (typeset) {
                    options.sort[numberField] = -1;
                    let currentDoc = collection.findOne({}, options);
                    nextSeqNumber = currentDoc && !_.isNaN(Number(currentDoc[numberField])) ? Number(currentDoc[numberField]) + 1 : seed;
                    if (this.isInsert) {
                        return nextSeqNumber;
                    } else if (this.isUpsert) {
                        return {
                          $setOnInsert: nextSeqNumber
                        };
                    }
                }
            }
        }
    },
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            return new Date
        }
    }
});