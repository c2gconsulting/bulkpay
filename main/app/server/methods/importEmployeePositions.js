Meteor.methods({
    "parseEmployeePositionsUpload": function(data, businessId){
        check(data, Array);
        check(businessId, String);

        this.unblock()

        let successCount = 0;
        let skipped = [];
        let skippedCount = 0;
        let errorCount = 0;
        let errors = [];
        //--
        _.each(data, function (d, index) {
            if (Object.keys(d).length === 1) {
                data.splice(index, 1);
            }
        });

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            item.businessId = businessId;
            //console.log(`Employee document: ${JSON.stringify(employeeDocument)}`)

            let doesPositionExist = EntityObjects.findOne({});

            if (doesPositionExist){
                console.log(`Position id does not exist`)
                item.ErrorLine = (i + 1)
                item.Error = "That position id does not exist"
                skipped.push(item);
                skippedCount += 1
            } else {
                try {

                    successCount += 1
                } catch(dbException) {
                    item.ErrorLine = (i + 1)
                    item.Error = dbException.message;
                    errors.push(item);
                    errorCount += 1
                }
            }
        }
        console.log(`Employee positions upload complete!`)
        return {skippedCount: skippedCount, skipped: skipped, success: successCount, failed: errorCount, errors: errors}
    }
});
