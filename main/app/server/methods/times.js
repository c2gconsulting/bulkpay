let TimeRecordHelper = {

    getEmployeeNameById: function(employeeId){
        return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
    }, 
    
    sendTimeRecordEmail: function (currentTimeRecord, emailTo, emailSubject) {
        // try {
        //     const travelType = currentTimeRecord.type === "Return"?'Return Trip':'Multiple Stops';
        //     const returnDate = currentTimeRecord.type === "Return"?currentTimeRecord.trips[0].returnDate:currentTimeRecord.trips[currentTimeRecord.trips.length-1].departureDate;
        //     let itenerary = TimeRecordHelper.getTravelcityName(currentTimeRecord.trips[0].fromId) + " - " + TimeRecordHelper.getTravelcityName(currentTimeRecord.trips[0].toId);
        //     if (currentTimeRecord.type === "Multiple"){
        //         for (i = 1; i < currentTimeRecord.trips.length; i++) {
        //             itenerary += " - " + TimeRecordHelper.getTravelcityName(currentTimeRecord.trips[i].toId);
        //         }
        //     }
        let timeRecordCheckedoffShoreWeek = (val) => {
            if(val == "monday"){
                return currentTimeRecord.offShoreWeek.monday === true ? checked="checked" : '';
            } else if(val == "tuesday"){
                return currentTimeRecord.offShoreWeek.tuesday === true ? checked="checked" : '';
            } else if(val == "wednesday"){
                return currentTimeRecord.offShoreWeek.wednesday === true ? checked="checked" : '';
            } else if(val == "thursday"){
                return currentTimeRecord.offShoreWeek.thursday === true ? checked="checked" : '';
            } else if(val == "friday"){
                return currentTimeRecord.offShoreWeek.friday === true ? checked="checked" : '';
            } else if(val == "saturday"){
                return currentTimeRecord.offShoreWeek.saturday === true ? checked="checked" : '';
            } else if(val == "sunday"){
                return currentTimeRecord.offShoreWeek.sunday === true ? checked="checked" : '';
            }
        };
        
        let timeRecordCheckedonShoreWeek = (val) => {
            if(val == "monday"){
                return currentTimeRecord.onShoreWeek.monday === true ? checked="checked" : '';
            } else if(val == "tuesday"){
                return currentTimeRecord.onShoreWeek.tuesday === true ? checked="checked" : '';
            } else if(val == "wednesday"){
                return currentTimeRecord.onShoreWeek.wednesday === true ? checked="checked" : '';
            } else if(val == "thursday"){
                return currentTimeRecord.onShoreWeek.thursday === true ? checked="checked" : '';
            } else if(val == "friday"){
                return currentTimeRecord.onShoreWeek.friday === true ? checked="checked" : '';
            } else if(val == "saturday"){
                return currentTimeRecord.onShoreWeek.saturday === true ? checked="checked" : '';
            } else if(val == "sunday"){
                return currentTimeRecord.onShoreWeek.sunday === true ? checked="checked" : '';
            }
        }
        
        let timeRecordCheckedVehicle = (val) => {
            if(val == "monday"){
                return currentTimeRecord.vehicle.monday === true ? checked="checked" : '';
            } else if(val == "tuesday"){
                return currentTimeRecord.vehicle.tuesday === true ? checked="checked" : '';
            } else if(val == "wednesday"){
                return currentTimeRecord.vehicle.wednesday === true ? checked="checked" : '';
            } else if(val == "thursday"){
                return currentTimeRecord.vehicle.thursday === true ? checked="checked" : '';
            } else if(val == "friday"){
                return currentTimeRecord.vehicle.friday === true ? checked="checked" : '';
            } else if(val == "saturday"){
                return currentTimeRecord.vehicle.saturday === true ? checked="checked" : '';
            } else if(val == "sunday"){
                return currentTimeRecord.vehicle.sunday === true ? checked="checked" : '';
            }
        }

        let getMonth = function (index) {
            if (index == 1) {
                return 'January'
            } else if (index == 2) {
                return 'Feburary'
            } else if (index == 2) {
                return 'March'
            } else if (index == 4) {
                return 'April'
            } else if (index == 5) {
                return 'May'
            } else if (index == 6) {
                return 'June'
            } else if (index == 7) {
                return 'July'
            } else if (index == 8) {
                return 'August'
            } else if (index == 9) {
                return 'September'
            } else if (index == 10) {
                return 'October'
            } else if (index == 11) {
                return 'November'
            } else if (index == 12) {
                return 'December'
            }
        }

            //Todo, itenerary, employee full name
            SSR.compileTemplate("TimeRecordNotification", Assets.getText("emailTemplates/TimeRecordNotification.html"));
            Email.send({
                to: emailTo,
                from: "BulkPay™ Team <bulkpay@c2gconsulting.com>",
                subject: emailSubject,
                html: SSR.render("TimeRecordNotification", {
                    employeeFullName: TimeRecordHelper.getEmployeeNameById(currentTimeRecord.createdBy),
                    year:currentTimeRecord.period.year,
                    month:getMonth(currentTimeRecord.period.month),
                    week:currentTimeRecord.period.weekIndex,
                    totalDaysWorked:currentTimeRecord.totalDaysWorked,
                    offshoreDays:currentTimeRecord.totalDaysWorkedOffShore,
                    onshoreDays:currentTimeRecord.totalDaysWorkedOnshore,
                    timeRecordCheckedVehicleMonday: timeRecordCheckedVehicle("monday"),
                    timeRecordCheckedVehicleTuesday: timeRecordCheckedVehicle("tuesday"),
                    timeRecordCheckedVehicleWednesday: timeRecordCheckedVehicle("wednesday"),
                    timeRecordCheckedVehicleThursday: timeRecordCheckedVehicle("thursday"),
                    timeRecordCheckedVehicleFriday: timeRecordCheckedVehicle("friday"),
                    timeRecordCheckedVehicleSaturday: timeRecordCheckedVehicle("saturday"),
                    timeRecordCheckedVehicleSunday: timeRecordCheckedVehicle("sunday"),

                    timeRecordCheckedoffShoreWeekMonday: timeRecordCheckedoffShoreWeek("monday"),
                    timeRecordCheckedoffShoreWeekTuesday: timeRecordCheckedoffShoreWeek("tuesday"),
                    timeRecordCheckedoffShoreWeekWednesday: timeRecordCheckedoffShoreWeek("wednesday"),
                    timeRecordCheckedoffShoreWeekThursday: timeRecordCheckedoffShoreWeek("thursday"),
                    timeRecordCheckedoffShoreWeekFriday: timeRecordCheckedoffShoreWeek("friday"),
                    timeRecordCheckedoffShoreWeekSaturday: timeRecordCheckedoffShoreWeek("saturday"),
                    timeRecordCheckedoffShoreWeekSunday: timeRecordCheckedoffShoreWeek("sunday"),

                    timeRecordCheckedonShoreWeekMonday: timeRecordCheckedonShoreWeek("monday"),
                    timeRecordCheckedonShoreWeekTuesday: timeRecordCheckedonShoreWeek("tuesday"),
                    timeRecordCheckedonShoreWeekWednesday: timeRecordCheckedonShoreWeek("wednesday"),
                    timeRecordCheckedonShoreWeekThursday: timeRecordCheckedonShoreWeek("thursday"),
                    timeRecordCheckedonShoreWeekFriday: timeRecordCheckedonShoreWeek("friday"),
                    timeRecordCheckedonShoreWeekSaturday: timeRecordCheckedonShoreWeek("saturday"),
                    timeRecordCheckedonShoreWeekSunday: timeRecordCheckedonShoreWeek("sunday"),

                    status: currentTimeRecord.status,
                    chargeCode: currentTimeRecord.chargeCode,
                    projectCode: currentTimeRecord.projectCode,
                    actionUrl:  Meteor.absoluteUrl() + 'business/' + currentTimeRecord.businessId + '/timerecord/printrequisition?requisitionId=' + currentTimeRecord._id

                })
            });

            return true
        // } catch(e) {
        //     console.log(e);
        //     //throw new Meteor.Error(401, e.message);
        // }
    },
}

Meteor.methods({

    "time/create": function(time) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        this.unblock();


        let customConfig = BusinessUnitCustomConfigs.findOne({businessId: time.businessId})
        if(customConfig) {
            if(customConfig.maxHoursInDayForTimeWritingPerLocationEnabled) {
                if(time.locationId) {
                    const location = EntityObjects.findOne({_id: time.locationId})
                    if(location) {
                        const maxHoursInDayForTimeWriting = location.maxHoursInDayForTimeWriting

                        if(time.duration > maxHoursInDayForTimeWriting) {
                            throw new Meteor.Error(401, `You can't record time more than: ${maxHoursInDayForTimeWriting} hour(s) for location: ${location.name}`);
                        }
                    }
                }
            }
        }

        try {
            TimeWritings.insert(time);
            return true
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, e.message);
        }
    },
    "time/markAsSeen": function(businessUnitId, timeId){
        check(businessUnitId, String);
        this.unblock()

        let timeRecord = TimeWritings.findOne({_id: timeId})
        if(timeRecord && timeRecord.employeeId === Meteor.userId()) {
            TimeWritings.update(timeId, {$set: {isApprovalStatusSeenByCreator: true}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that time record")
        }
    },
    "time/delete": function(timeId){
        this.unblock()

        let timeRecord = TimeWritings.findOne({_id: timeId})
        if(timeRecord && timeRecord.employeeId === Meteor.userId()) {
            if(timeRecord.status) {
                if(timeRecord.status === 'Approved' || timeRecord.status === 'Rejected') {
                    throw new Meteor.Error(401, `Unauthorized. Time record has already been ${timeRecord.status.toLowerCase()}`)
                } else {
                    TimeWritings.remove({_id: timeId})
                    return true;
                }
            } else {
                TimeWritings.remove({_id: timeId})
                return true;
            }
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that time record")
        }
    },
    "timeRecord/create": function(currentTimeRecord){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(currentTimeRecord.businessId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a time record because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        if(currentTimeRecord._id){

            TimeRecord.update(currentTimeRecord._id, {$set: currentTimeRecord})
            console.log("currentTimeRecord")
            console.log(currentTimeRecord)
        }else{
            currentTimeRecord._id = TimeRecord.insert(currentTimeRecord);
            console.log('currentTimeRecord is', currentTimeRecord)
            let otherPartiesEmail = "bulkpay@c2gconsulting.com";

            const createdBy = Meteor.users.findOne(currentTimeRecord.createdBy);
            const supervisor = Meteor.users.findOne(currentTimeRecord.supervisorId);
            let createdByEmail = "";
            let supervisorEmail = "";
            let createdByName = "Employee"
            let supervisorName = "Supervisor"
            const createdBySubject = "New time record for " + createdBy.profile.fullName;
            const supervisorSubject = "Please approve time record for " + createdBy.profile.fullName;


            if (createdBy.emails.length > 0){
                createdByEmail = createdBy.emails[0].address;
                createdByEmail = createdByEmail + "," + otherPartiesEmail;
                console.log(createdByEmail);
            }

            if (supervisor.emails.length > 0){
                supervisorEmail = supervisor.emails[0].address;
                supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
                console.log(supervisorEmail);
            }

            //Send to requestor
            TimeRecordHelper.sendTimeRecordEmail(currentTimeRecord, createdByEmail, createdBySubject);

            //Send to Supervisor
            TimeRecordHelper.sendTimeRecordEmail(currentTimeRecord, supervisorEmail, supervisorSubject);

        }

        return true;
    },
    "timeRecord/supervisorApprovals": function(currentTimeRecord){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(currentTimeRecord.businessId, String);
        this.unblock()


        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a time record because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        if(currentTimeRecord._id){
            TimeRecord.update(currentTimeRecord._id, {$set: currentTimeRecord})



        }else{
            let result = TimeRecord.insert(currentTimeRecord);
        }

        return true;
    },
})
