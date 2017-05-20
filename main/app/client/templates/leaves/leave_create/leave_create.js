/*****************************************************************************/
/* LeaveCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveCreate.events({
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

        let duration = $('#duration').val();
        let durationAsNumber = parseInt(duration)

        let allowLeavesInHours = $('#allowLeavesInHours').is(":checked")
        let selectedLeaveType = $('#leaveTypes').val()

        if(allowLeavesInHours) {
            if(isNaN(durationAsNumber)) {
                tmpl.inputErrorMsg.set("Please enter in the duration of leave(in hours)")
                return
            } else if(durationAsNumber < 1) {
                tmpl.inputErrorMsg.set("Please enter in the duration of leave(in hours) greater than zero")
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
            endDateObj = moment(end).toDate()
        }
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
    }
});

/*****************************************************************************/
/* LeaveCreate: Helpers */
/*****************************************************************************/
Template.LeaveCreate.helpers({
    'leaveTypes': function () {
        return LeaveTypes.find()
    },
    inputErrorMsg: function() {
        return Template.instance().inputErrorMsg.get()
    },
    leaveInDaysMode : function() {
        return !Template.instance().isAllowingHoursLeave.get()
    }
});


/*****************************************************************************/
/* LeaveCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
    self.isAllowingHoursLeave = new ReactiveVar();
    self.isAllowingHoursLeave.set(false)

    self.inputErrorMsg = new ReactiveVar()

    self.subscribe('employeeLeaveTypes', Session.get('context'));

    self.getNumberOfWeekDays = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        let endDateMoment = moment(endDate)

        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')
        console.log(`Number of days: ${numberOfDays}`)

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays > 0) {
            if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        return weekDates.length + 1
    }
});

Template.LeaveCreate.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();

    //disable submit temporary fix
    // $('#LeaveCreate').prop('disabled', true);

    let start = $("#startDate").val();
    let end = $("#endDate").val();
    if (start && end){
        let duration = self.getNumberOfWeekDays(start, end)
        $("#duration").val(duration <= 0 ? 0 : duration)
    }

    self.autorun(function() {
        if (!self.profile.get('duration')){
            let propertyType = self.$("#duration").val();
            self.profile.set('duration', propertyType)
        }
        $("#startDate").on("change", function () {
            let start = $("#startDate").val();
            let end = $("#endDate").val();
            if (start && end){
                let duration = self.getNumberOfWeekDays(start, end)
                $("#duration").val(duration <= 0 ? 0 : duration)
            }
        });
        $("#endDate").on("change", function () {
            let start = $("#startDate").val();
            let end = $("#endDate").val();
            if (start && end){
                let duration = self.getNumberOfWeekDays(start, end)
                $("#duration").val(duration <= 0 ? 0 : duration)
            }
        });


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
