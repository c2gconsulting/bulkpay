Meteor.methods({
    "parseTravelCityUpload": function(data, businessId){
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

        let dataLength = data.length;

        for (let i = 0; i < dataLength; i++) {
            let item = data[i];
            // let employeeId = item.EmployeeUniqueId;
            // let LeaveBalance = item.LeaveBalanceInDays;
            let CityName = item.name;
            // console.log("CityName")
            // console.log(CityName)
            let PerDiemCost = item.perdiem;
            // console.log("PerDiemCost")
            // console.log(PerDiemCost)
            let GroundTransport = item.groundTransport;
            // console.log("GroundTransport")
            // console.log(GroundTransport)
            let AirportPickup = item.airportPickupDropOffCost;
            // console.log("AirportPickup")
            // console.log(AirportPickup)
            let Currency = item.currency;
            let International = item.isInternational;
            let NotificationList =item.notificationEmail;

            if(!PerDiemCost || isNaN(PerDiemCost)) {
                item.ErrorLine = (i + 1)
                item.Error = "Per diem cost is not a number"
                skipped.push(item);
                skippedCount += 1
            } else {
                let PerDiemCostAsNumber = parseFloat(PerDiemCost)

                // if(employeeId && employeeId.trim().length > 0) {
                //     let employee = Meteor.users.findOne({_id: employeeId})
                //     if(employee) {
                        try {
                            Travelcities.insert({
                                businessId: businessId,
                                name: CityName,
                                perdiem: PerDiemCostAsNumber,
                                groundTransport: GroundTransport,
                                airportPickupDropOffCost: AirportPickup,
                                currency: Currency,
                                isInternational: International,
                                notificationEmail: NotificationList,

                            });
                            successCount += 1
                        } catch (dbException) {
                            item.ErrorLine = (i + 1)
                            item.Error = dbException.message;
                            errors.push(item);
                            errorCount += 1
                        }
                    // } else {
                    //     item.ErrorLine = (i + 1)
                    //     item.Error = "Employee does not exist"
                    //     skipped.push(item);
                    //     skippedCount += 1
                    // }
                 //} else {
                //     item.ErrorLine = (i + 1)
                //     item.Error = "Employee id was not specified"
                //     skipped.push(item);
                //     skippedCount += 1
                // }
            }
        }
        console.log(`Travel City upload complete!`)
        return {skippedCount: skippedCount, skipped: skipped, success: successCount, failed: errorCount, errors: errors}
    }
});
