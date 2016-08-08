/**
 * PriceList Schema
 */
Core.Schemas.PriceList = new SimpleSchema({
    _id: {
        type: String,
        optional: true,
        autoValue: Core.schemaIdAutoValue
    },
    code: {
        type: String,
        optional: true,
        autoValue: function () {
            if (this.siblingField('_id').isSet) return this.siblingField('_id').value;
        }
    },
    startDate: {
        type: Date,
        optional: true
    },
    endDate: {
        type: Date,
        optional: true
    },
    originCode: {
        type: String,
        optional: true
    }
});

/**
 * PriceListGroup Schema
 */
Core.Schemas.PriceListGroup = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    originCode: {
        type: String,
        optional: true,
        denyUpdate: true
    },
    code: {
        type: String,
        optional: true,
        autoValue: function () {
            if (!this.isSet && (this.isInsert || this.isUpsert)) {
                let currentPriceList = PriceListGroups.findOne({}, {
                    sort: {
                        code: -1
                    }
                });
                let newCode = currentPriceList ? Number(currentPriceList.code) + 10 : 10;
                if (this.isInsert) {
                    return (newCode).toString();
                } else {
                    return {
                        $setOnInsert: (newCode).toString()
                    };
                }
            }
        },
        denyUpdate: true
    },
    name: {
        type: String,
        optional: true
    },
    isDefault: {
        type: Boolean,
        optional: true
    },
    currencyISO: {
        type: String // always maintain currencyISO
    },
    customerGroupCodes: {
        type: [String], // all the customer groups this pricelist applies to. If empty, applies to ALL
        optional: true
    },
    priceLists: {
        type: [Core.Schemas.PriceList],
        optional: true
    }
});
