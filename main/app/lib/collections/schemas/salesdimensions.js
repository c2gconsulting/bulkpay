/**
 * SalesArea Schema
 * SalesArea represent the higher dimension for locations
 */
Core.Schemas.SalesArea = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String
    },
    country: {
        type: String,
        index: false,
        max: 2
    },
    code: {
        type: String,
        autoValue: function () {
            let originAreaCode = this.field('originAreaCode').value;
            if (originAreaCode){
                return originAreaCode;
            } else {
                if (this.isInsert || this.isUpsert) {
                    let currentSalesArea = SalesAreas.findOne({}, {
                        sort: {
                            code: -1
                        }
                    });
                    let newDoc = currentSalesArea ? Number(currentSalesArea.code) + 1 : 100;
                    if (this.isInsert) {
                        return (newDoc).toString();
                    } else {
                        return {
                            $setOnInsert: (newDoc).toString()
                        };
                    }
                }
            }
        },
        optional: true,
        denyUpdate: true
    },
    originAreaCode: {
        type: String,
        optional: true,
        denyUpdate: true
    },
    isDefault: {
        type: Boolean,
        defaultValue: false,
        optional: true 
    }
});
