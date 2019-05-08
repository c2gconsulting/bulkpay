import _ from 'underscore';

/*****************************************************************************/
/* LeaveCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveCreate.events({
    'change #startDate': function(e, tmpl) {
        let start = $("#startDate").val();
        let end = $("#endDate").val();
        if (start && end){
            // let duration = tmpl.getNumberOfWeekDays(start, end)

            let durationAsDaysAndHours = tmpl.prettifyDurationOfWeekDaysInDaysAndHours(start, end)
            // console.log("durationAsDaysAndHours is:")
            // console.log(durationAsDaysAndHours)
            $("#duration").val(durationAsDaysAndHours)
        }
    },
    'change #endDate': function(e, tmpl) {
        let start = $("#startDate").val();
        let end = $("#endDate").val();
        if (start && end){
            // let duration = tmpl.getNumberOfWeekDays(start, end)

            let durationAsDaysAndHours = tmpl.prettifyDurationOfWeekDaysInDaysAndHours(start, end)
            // console.log("durationAsDaysAndHours is:")
            // console.log(durationAsDaysAndHours)
            $("#duration").val(durationAsDaysAndHours)
        }
    },
    'change #allowLeavesInHours': function(e, tmpl) {
        let allowLeavesInHours = $('#allowLeavesInHours').is(":checked")
        if(allowLeavesInHours) {
            Template.instance().isAllowingHoursLeave.set(true)
        } else {
            Template.instance().isAllowingHoursLeave.set(false)
        }
    },
    'click #LeaveCreate': (e, tmpl) => {
        e.preventDefault()

        let start = $("#startDate").val();
        if(!start || start.length === 0) {
            tmpl.inputErrorMsg.set("Please select a start date")
            return
        }
        let startDateObj = moment(start).toDate()
        let endDateObj = null

        let durationAsNumber = 0

        let allowLeavesInHours = $('#allowLeavesInHours').is(":checked")
        let selectedLeaveType = $('#leaveTypes').val()

        let reliever = Core.returnSelection($('[name="employee"]'))

        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        let isRelieverEnabledForLeaveRequests = false;
        if(businessUnitCustomConfig) {
            isRelieverEnabledForLeaveRequests = businessUnitCustomConfig.isRelieverEnabledForLeaveRequests
        }

        if(allowLeavesInHours) {
            let duration = $('#duration').val();
            console.log("duration is")
            console.log(duration)
            durationAsNumber = parseInt(duration)

            if(isNaN(durationAsNumber)) {
                tmpl.inputErrorMsg.set("Please enter the duration of leave(in hours)")
                return
            } else if(durationAsNumber < 1) {
                tmpl.inputErrorMsg.set("Please enter the duration of leave(in hours) greater than zero")
                return
            } else {
                endDateObj = moment(start).add(duration, 'hour').toDate()
            }
        } else {
            let end = $("#endDate").val();
            if(!end || end.length === 0) {
                tmpl.inputErrorMsg.set("Please select a end date")
                return
            }
            const endDateMoment = moment(end);
            if(endDateMoment.hour() === 0 && endDateMoment.minute() === 0) {
                endDateMoment.endOf('day')
            }
            endDateObj = endDateMoment.toDate()
            console.log(`endDateObj: `, endDateObj)

          //  durationAsNumber = tmpl.getDurationOfWeekDays(start, endDateMoment) // in days
            durationAsNumber = Session.get('numberOfHoursInPeriodWeekDays') / 24 // in days
            console.log(`durationAsNumber: `, durationAsNumber)
        }
        console.log(`durationAsNumber: `, durationAsNumber)
        // let start1 = $("#startDate").val();
        // let end1 = $("#endDate").val();
        // if (start1 && end1){
        //     // let duration = tmpl.getNumberOfWeekDays(start, end)
        //
        //     let durationAsDaysAndHours = tmpl.prettifyDurationOfWeekDaysInDaysAndHours(start1, end1)
        //     console.log("durationAsDaysAndHours is:")
        //     console.log(durationAsDaysAndHours)
        //     $("#duration").val(durationAsDaysAndHours)
        //   }

        if(!selectedLeaveType || selectedLeaveType.length === 0) {
            tmpl.inputErrorMsg.set("Please select a leave type")
            return
        }
        let description = $('#description').val() || "";
        //--
        let leaveDoc = {
            employeeId: Meteor.userId(),
            startDate: startDateObj,
            endDate: endDateObj,
            type: selectedLeaveType,
            description: description,
            businessId: Session.get('context')
        }

        if(allowLeavesInHours) {
            leaveDoc.duration = durationAsNumber / 24
            leaveDoc.durationInHours = durationAsNumber
        } else {
            leaveDoc.duration = durationAsNumber
            leaveDoc.durationInHours = durationAsNumber * 24

        }

        let leaveType = LeaveTypes.findOne(selectedLeaveType)
        if(!leaveType) {
            tmpl.inputErrorMsg.set("Could not find leave type details on the system.")
        } else {
            if(!isNaN(leaveType.maximumDuration)) {
                if(leaveDoc.duration <= leaveType.maximumDuration) {
                    if(isRelieverEnabledForLeaveRequests) {
                        if(reliever && reliever.length > 0) {
                            leaveDoc.relieverUserId = reliever[0];
                        }
                    }
                    //--
                    let currentYear = moment().year()
                    let currentYearAsNumber = parseInt(currentYear)

                    Meteor.call('leave/create', leaveDoc, currentYearAsNumber, function(err, res) {
                        if(!err) {
                            swal('Successful', "Leave request successful", 'success')
                        } else {
                            swal('Error', err.reason, 'error')
                        }
                    })
                } else {
                    tmpl.inputErrorMsg.set(`Duration is more than the maximum allowed for the leave type: ${leaveType.maximumDuration} days.`)
                }
            } else {
                tmpl.inputErrorMsg.set("Maximum duration of leave type is not a number in the system")
            }
        }
    }
});

/*****************************************************************************/
/* LeaveCreate: Helpers */
/*****************************************************************************/
Template.LeaveCreate.helpers({
    'leaveTypes': function () {
        let allLeaveTypes = LeaveTypes.find().fetch() || []
        let user = Meteor.users.findOne(Meteor.userId())

        if(user) {
            let userPaygrade = user.employeeProfile.employment.paygrade

            let allowedLeaveTypes = []

            allLeaveTypes.forEach(aLeaveType => {
                let allowedPaygrades = aLeaveType.payGradeIds

                let isLeaveTypeAllowed = _.find(allowedPaygrades, aPayGrade => {
                    return aPayGrade === userPaygrade
                })
                if(isLeaveTypeAllowed) {
                    allowedLeaveTypes.push(aLeaveType)
                }
            })
            return allowedLeaveTypes
        } else {
            return []
        }
    },
    inputErrorMsg: function() {
        return Template.instance().inputErrorMsg.get()
    },
    leaveInDaysMode : function() {
        return !Template.instance().isAllowingHoursLeave.get()
    },
    isHourLeaveRequestsEnabled: function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isHourLeaveRequestsEnabled
        }
    },
    numberOfLeaveDaysLeft: function() {
        return Template.instance().numberOfLeaveDaysLeft.get() || '---'
    },
    usedLeaveDays: function() {
        return Template.instance().usedLeaveDays.get() || '---'
    },
    availableLeaveDays: function() {
        return Template.instance().availableLeaveDays.get() || '---'
    },
    startOfToday: function() {
        return moment().startOf('day').toDate()
    },
    endOfToday: function() {
        return moment().startOf('day').toDate()
    },
    isRelieverEnabledForLeaveRequests: function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isRelieverEnabledForLeaveRequests
        }
    },
    'employees': () => {
        return Meteor.users.find({
            "employee": true,
            'employeeProfile.employment.status': 'Active'
        });
    },
    'showAccruedDays': () => {
        let user = Meteor.users.findOne(Meteor.userId())
        if(user) {
            let userPaygrade = user.employeeProfile.employment.paygrade
            let payGrade = PayGrades.findOne({_id: userPaygrade})
            if(payGrade) {
                if(!payGrade.leaveRequest) {
                    return true
                } else {
                    return payGrade.leaveRequest === 'Limited'
                }
            }
        }
    }
});


/*****************************************************************************/
/* LeaveCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveCreate.onCreated(function () {
    let self = this;
    let businessId = Session.get('context')



    self.profile = new ReactiveDict();
    self.isAllowingHoursLeave = new ReactiveVar();
    self.isAllowingHoursLeave.set(false)

    self.isHourLeaveRequestsEnabled = new ReactiveVar()

    self.numberOfLeaveDaysLeft = new ReactiveVar();
    self.usedLeaveDays = new ReactiveVar();
    self.availableLeaveDays = new ReactiveVar();


    self.businessUnitCustomConfig = new ReactiveVar()

    self.inputErrorMsg = new ReactiveVar()

    self.subscribe("activeEmployees", businessId);
    self.subscribe("paygrades", businessId);

    self.getNumberOfWeekDays = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        let endDateMoment = moment(endDate)

        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays >= 0) {
            let businessUnitCustomConfig = self.businessUnitCustomConfig.get()

            if(businessUnitCustomConfig && !businessUnitCustomConfig.isWeekendIncludedInLeaveRequests) {
                if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                    weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
                }
            } else {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        let numOfWeekDays = weekDates.length + 1

        return weekDates.length
    }


    self.getDurationOfWeekDaysInHours = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        startDateMoment.add(1, 'hours');       // There is a reason for adding 1 hour

        let endDateMoment = moment(endDate)
         endDateMoment.add(1, 'hours');
        if(endDateMoment.hour() === 0 && endDateMoment.minute() === 0) {
            endDateMoment.endOf('day')
        }
        //--
        let numberOfHoursInPeriod = endDateMoment.diff(startDateMoment, 'hours')
        console.log(`numberOfHoursInPeriod: `, numberOfHoursInPeriod)
        let numberOfHoursInPeriodWeekDays = numberOfHoursInPeriod
        // console.log(`numberOfHoursInPeriodWeekDays1: `, numberOfHoursInPeriodWeekDays)

        //--
        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')
        console.log(`numberOfDays: `, numberOfDays)

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays >= 0) {
            let businessUnitCustomConfig = self.businessUnitCustomConfig.get()

            if(businessUnitCustomConfig && !businessUnitCustomConfig.isWeekendIncludedInLeaveRequests) {
                if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                    console.log(`will add this day: `, startDateMomentClone._d)
                    weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
                } else {
                    console.log(`will subtract 24 hours for this day: `, startDateMomentClone._d)
                    moment(startDateMomentClone)
                    numberOfHoursInPeriodWeekDays -= (24)
                }
            } else {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        // console.log(`numberOfHoursInPeriodWeekDays2: `, numberOfHoursInPeriodWeekDays)
        Session.set('numberOfHoursInPeriodWeekDays', numberOfHoursInPeriodWeekDays)
        return numberOfHoursInPeriodWeekDays
    }

    self.getDurationOfWeekDays = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        let endDateMoment = moment(endDate)
        if(endDateMoment.hour() === 0 && endDateMoment.minute() === 0) {
            endDateMoment.endOf('day')
        }
        //--
        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')
        let numberOfLeaveDaysToAward = 0
        console.log(`numberOfLeaveDaysToAward: `, numberOfLeaveDaysToAward)

        let startDateMomentClone = moment(startDateMoment); // use a clone

        while (numberOfDays > 0) {
            let businessUnitCustomConfig = self.businessUnitCustomConfig.get()

            if(!businessUnitCustomConfig.isWeekendIncludedInLeaveRequests) {
                if (startDateMomentClone.isoWeekday() !== 6 || startDateMomentClone.isoWeekday() !== 7) {
                    numberOfLeaveDaysToAward += 1
                }
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        console.log(`numberOfLeaveDaysToAward: `, numberOfLeaveDaysToAward)

        return numberOfLeaveDaysToAward
    }

    self.prettifyDurationOfWeekDaysInDaysAndHours = function(startDate, endDate) {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            if(businessUnitCustomConfig.isHourLeaveRequestsEnabled) {
                let durationInHours = self.getDurationOfWeekDaysInHours(startDate, endDate)
                let numberOfDaysInHours = Math.floor(durationInHours / 24)

                if(numberOfDaysInHours < 1) {
                    return durationInHours + ' hours'
                } else {
                    let hoursLeft = (durationInHours - (numberOfDaysInHours * 24))
                    let durationPrettified = numberOfDaysInHours + ' day(s), ' + hoursLeft + ' hours'
                    return durationPrettified
                }
            } else {
                let durationInDays = self.getNumberOfWeekDays(startDate, endDate)
                return durationInDays
            }
        }
    }

    self.setLeaveDaysLeftBasedOnFixedEntitlement = function() {
        Meteor.call("userleaveentitlements/get", Meteor.userId(), function(err, userLeaveEntitlement) {
            if(userLeaveEntitlement) {
                let userDaysLeftHistory = userLeaveEntitlement.leaveDaysLeft
                let currentYear = moment().year()
                let currentYearAsNumber = parseInt(currentYear)

                let foundDaysLeftInYear = _.find(userDaysLeftHistory, (aYearData, indexOfYear) => {
                    if(aYearData.year === currentYearAsNumber) {
                        indexOfFoundYear = indexOfYear
                        return true
                    }
                })
                if(foundDaysLeftInYear) {
                    self.numberOfLeaveDaysLeft.set(foundDaysLeftInYear.daysLeft)
                }
            }
        });
    }

    self.setLeaveDaysLeftBasedOnDaysWorked = function() {
        let suppLeavesForUser = SupplementaryLeaves.findOne({businessId: businessId, employees: {$in: [Meteor.userId()]}});
        console.log("suppLeavesForUser is:");
        console.log(suppLeavesForUser);
        // let LeaveBalanceInDays = suppLeavesForUser.numberOfLeaveDays
        // console.log("suppLeavesForUser.numberOfLeaveDays is:");
        // console.log(suppLeavesForUser.numberOfLeaveDays);



        let user = Meteor.users.findOne(Meteor.userId())
        let numberOfDaysSinceResumption = 0
        // if(user) {
        //     let hireDate = user.employeeProfile.employment.hireDate
        //     if(hireDate) {
        //         let hireDateAsMoment = moment(hireDate)
        //
        //        numberOfDaysSinceResumption = moment().diff(hireDateAsMoment, 'days')
        //     }
        //  }

        if(user) {
      //      let hireDate = user.employeeProfile.employment.hireDate
            let hireDate = "2019-03-22T00:00:00.000Z"
            if(hireDate) {
                let hireDateAsMoment = moment(hireDate)
               numberOfDaysSinceResumption = moment().diff(hireDateAsMoment, 'days')
            }
         }

        let leaveTypesWithoutDeduction = LeaveTypes.find({
            deductFromAnnualLeave: false
        }).fetch();

       // let leaveBalance = supplementaryleaves.find({numberOfLeaveDays:numberOfLeaveDays}).fetch();
       //
        let theLeaveTypeIds = _.pluck(leaveTypesWithoutDeduction, '_id');
             let hoursOfLeaveApproved = 0
        let userApprovedLeaves = Leaves.find({
            businessId: businessId,
            employeeId: Meteor.userId(),
            approvalStatus: 'Approved',
          //  type: {$nin: theLeaveTypeIds}
        }).fetch();

        userApprovedLeaves.forEach(aLeave => {
            hoursOfLeaveApproved += aLeave.durationInHours
        })
        //--
        let numSupplementaryLeaveDays = 0
        if(suppLeavesForUser) {
            numSupplementaryLeaveDays = suppLeavesForUser.numberOfLeaveDays
            // console.log("numSupplementaryLeaveDays is:");
            // console.log(numSupplementaryLeaveDays);
        }


        //--
        let numberOfLeaveDaysLeft = (0.056 * numberOfDaysSinceResumption)
        // let usedLeaveDays = (hoursOfLeaveApproved / 24) + numSupplementaryLeaveDays

        let usedLeaveDays = (hoursOfLeaveApproved / 24)
        // console.log("usedLeaveDays is:");
        // console.log(usedLeaveDays);

        let availableLeaveDays = (numberOfLeaveDaysLeft) - (usedLeaveDays) + (numSupplementaryLeaveDays);






        self.numberOfLeaveDaysLeft.set(numberOfLeaveDaysLeft.toFixed(2))
        self.usedLeaveDays.set(usedLeaveDays.toFixed(2))
        self.availableLeaveDays.set(availableLeaveDays.toFixed(2))

    }


    self.subscribe('employeeLeaveTypes', businessId);
    let employeeApprovedLeavesSub = self.subscribe('employeeApprovedLeaves', businessId)
    let suppLeavesForUserSub = self.subscribe('supplementaryLeaveForUser', businessId, Meteor.userId())

    self.autorun(function() {
        if(employeeApprovedLeavesSub.ready() && suppLeavesForUserSub.ready()) {
            Meteor.call('BusinessUnitCustomConfig/getConfig', businessId, function(err, businessUnitCustomConfig) {
                self.businessUnitCustomConfig.set(businessUnitCustomConfig)

                if(businessUnitCustomConfig.leaveDaysAccrual === 'FixedLeaveEntitlement') {
                    self.setLeaveDaysLeftBasedOnFixedEntitlement()
                } else if(businessUnitCustomConfig.leaveDaysAccrual === 'NumberOfDaysWorked') {
                    self.setLeaveDaysLeftBasedOnDaysWorked()
                }
            })
        }
    })
});

Template.LeaveCreate.onRendered(function () {
    let self = this;
    // self.$('select.dropdown').dropdown();

    //disable submit temporary fix
    // $('#LeaveCreate').prop('disabled', true);

    let start = $("#startDate").val();
    let end = $("#endDate").val();
    if (start && end){
        let duration = self.getNumberOfWeekDays(start, end)
        $("#duration").val(duration <= 0 ? 0 : duration + ' day(s)')
    }

    self.autorun(function() {
        if (!self.profile.get('duration')){
            let propertyType = self.$("#duration").val();
            self.profile.set('duration', propertyType)
        }
        $("#type,#endDate,#startDate").on("change", function () {
            let duration = parseInt($("#duration").val());
            let selectedType = $('#type').val();

            if (duration && selectedType){
                let selectedQuota = parseInt(LeaveTypes.findOne({_id: selectedType}).maximumDuration);
                //get remaining quota of employee.
                //validate using autoform validation or custom function
                if(duration > selectedQuota){
                    $(this).addClass('errorValidation');
                    $("#duration").addClass('errorValidation');
                    $('#LeaveCreate').prop('disabled', true);
                } else {
                    $('#endDate').removeClass('errorValidation');
                    $('#startDate').removeClass('errorValidation');
                    $('#type').removeClass('errorValidation');
                    $("#duration").removeClass('errorValidation');
                    $('#LeaveCreate').prop('disabled', false);
                }
            }
        });
    });
});

Template.LeaveCreate.onDestroyed(function () {
});
