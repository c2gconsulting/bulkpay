/*****************************************************************************/
/* ApproveEmployeeTime: Event Handlers */
/*****************************************************************************/
//import _ from 'underscore';
Template.ApproveEmployeeTime.events({

});


Template.registerHelper('trimString', function(passedString, startstring, endstring) {
    if(passedString) {
        var theString = passedString.substring( startstring, endstring );
        return new Handlebars.SafeString(theString)
    }
});

/*****************************************************************************/
/* ApproveEmployeeTime: Helpers */
/*****************************************************************************/
Template.ApproveEmployeeTime.helpers({
    'supervisee': () => {
        return Template.instance().supervisees.get()
    },
    'self': () => {
        return Meteor.users.findOne({_id: Meteor.userId()});
    },
    'selected': () => {
        return Template.instance().dict.get('selected');
    },
    'getPositionDescription': (id) => {
        let positionEntity = EntityObjects.findOne({_id: id})
        return positionEntity ? positionEntity.name : '---';
    }
});

/*****************************************************************************/
/* ApproveEmployeeTime: Lifecycle Hooks */
/*****************************************************************************/
Template.ApproveEmployeeTime.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();

    self.supervisees = new ReactiveVar();

    let businessId = Session.get('context')

    let positionsSubs = self.subscribe('getPositions', businessId)
    let allEmployeeSubs = self.subscribe('allEmployees', businessId)

    self.getSupervisees = function() {
        let user = Meteor.user()
        let businessId = Session.get('context')
        let allSuperviseeIds = []

        if(user.employeeProfile && user.employeeProfile.employment) {
            let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
                return x._id
            });


            Meteor.users.find().fetch({businessIds: businessId}).forEach(aUser => {
                let userPositionId = aUser.employeeProfile.employment.position
                if(positions.indexOf(userPositionId) !== -1) {
                    allSuperviseeIds.push(aUser._id)
                }
            });
        }
        return allSuperviseeIds
    }

    self.getDurationOfWeekDaysInHours = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        let endDateMoment = moment(endDate)
        //--
        let numberOfHoursInPeriod = endDateMoment.diff(startDateMoment, 'hours')
        let numberOfHoursInPeriodWeekDays = numberOfHoursInPeriod
        //--
        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays > 0) {
            if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            } else {
                numberOfHoursInPeriodWeekDays -= (24)
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        return numberOfHoursInPeriodWeekDays
    }

    self.autorun(function(){
        let timesAndLeavesSubs = self.subscribe('alltimedata', businessId)   // This gives us leaves and times of supervisees

        if(positionsSubs.ready() && timesAndLeavesSubs.ready() && allEmployeeSubs.ready()) {
            let supervisees = Meteor.users.find({_id: {$in: self.getSupervisees()}}).fetch()
            self.supervisees.set(supervisees)
        }
    })
});

Template.ApproveEmployeeTime.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this;

    // var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
    let businessId = Session.get('context')

    self.autorun(function(){
        let events = [];
        const leaves = Leaves.find({employeeId: {$in: self.getSupervisees()}}).fetch();
        const times = TimeWritings.find({
            employeeId: {$in: self.getSupervisees()},
            // businessId: businessId
        }).fetch();

        leaves.forEach(x => {
            const user = Meteor.users.findOne({_id: x.employeeId}).profile.fullName;
            let leaveType = LeaveTypes.findOne({_id: x.type})
            if(leaveType) {
                const leaveDescription = LeaveTypes.findOne({_id: x.type}).name;
                const obj = {};
                obj._id = x._id;
                obj.type = 'Leaves';
                obj.title = user + "-" + leaveDescription;
                obj.start = moment(x.startDate).format('YYYY-MM-DDTHH:mm:ss');
                obj.end = moment(x.endDate).format('YYYY-MM-DDTHH:mm:ss');
                obj.constraint = 'businessHours';
                obj.color = getColor(x.approvalStatus);
                events.push(obj);
            }
        });
        times.forEach(x => {
            let user = Meteor.users.findOne({_id: x.employeeId}).profile.fullName;
            let obj = {};
            obj._id = x._id;
            obj.type = 'TimeWritings';
            obj.title = user + "-" + x.activity;

            var dayStart = moment(x.day).startOf('day').toDate(); // set to 12:00 am today
            var dayEnd = moment(x.day).endOf('day').toDate(); // set to 23:59 pm today

            // obj.start = moment(x.startTime).format('YYYY-MM-DDTHH:mm:ss');
            // obj.end = moment(x.endTime).format('YYYY-MM-DDTHH:mm:ss');
            obj.start = dayStart
            obj.end = dayEnd

            obj.constraint = 'businessHours';
            obj.color = getColor(x.status);
            events.push(obj);
        });

            if ( $('#calendar').children().length > 0 )
                $('#calendar').fullCalendar('destroy');

            $('#calendar').fullCalendar({
                header: {
                    // left: 'prev,next today',
                    left: 'prev,next',

                    center: 'title',
                    // right: 'month,agendaWeek,agendaDay,listMonth'
                    right: 'month,listMonth'
                },
                allDay: false,
                default: '_',
                navLinks: true, // can click day/week names to navigate views
                selectable: true,
                selectHelper: true,
                select: function(start, end) {
                    let date = start.format('MM/DD/YYYY');
                    let endDate = end.format('MM/DD/YYYY');
                    Session.set('startdate', date);

                    self.confirmApproveTimesBetweenPeriod(date, endDate)
                },
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                events: events,
                eventClick: function(event) {
                    if (event._id) {
                        // self.dict.set('selected', {type: event.type, id: event._id});
                        Modal.show('selectedEvent', {type: event.type, id: event._id})
                        return false;
                    }
                }
            });

    });

    function getColor(status){
        switch (status){
            case "Approved":
                return "#257e4a";
            case "Rejected":
                return "#990000";
            case "Open":
                return "#f0ad4e";
            case"Pending":
                return "#f0ad4e";
            default :
               return "#ccc";
        }
    }

    self.getWeekDaysFromFullCalender = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        startDateMoment.add(1, 'hours');       // There is a reason for adding 1 hour
        let endDateMoment = moment(endDate)
        endDateMoment.add(1, 'hours');

        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays > 0) {
            if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        return weekDates
    }

    self.confirmApproveTimesBetweenPeriod = function(startDate, endDate) {
        let theWeekDays = self.getDurationOfWeekDaysInHours(startDate, endDate)
        if(theWeekDays > 0) {
            let weekDaysAsDateObjs = self.getWeekDaysFromFullCalender(startDate, endDate)
            startDate = weekDaysAsDateObjs[0]
            endDate = weekDaysAsDateObjs[weekDaysAsDateObjs.length - 1]

            let startDateMoment = moment(startDate)
            startDate = startDateMoment.startOf('day').toDate()

            let endDateMoment = moment(endDate)
            endDate = endDateMoment.endOf('day').toDate()

            let employeeSuperviseeIds = self.getSupervisees()

            Modal.show('ApproveTimeOverview', {startDate, endDate, employeeSuperviseeIds})

            // swal({
            //     title: "Are you sure?",
            //     text: "This will approve all time-records in the selected period. This action cannot be reversed!",
            //     type: "warning",
            //     showCancelButton: true,
            //     confirmButtonColor: "#DD6B55",
            //     confirmButtonText: "Yes, Approve!",
            //     cancelButtonText: "No, cancel",
            //     closeOnConfirm: false,
            //     closeOnCancel: false
            // },
            // function(isConfirm) {
            //     if (isConfirm) {
            //         let businessId = Session.get('context')
            //         let startDateMoment = moment(startDate)
            //         startDate = startDateMoment.startOf('day').toDate()

            //         let endDateMoment = moment(endDate)
            //         endDate = endDateMoment.endOf('day').toDate()

            //         Meteor.call('approveTimeDataInPeriod', startDate, endDate, businessId, self.getSupervisees(), function(err, res){
            //             if(res){
            //                 swal('Success', 'Approvals were uccessful', 'success');
            //             } else {
            //                 swal('Approval Error', `error when approving time-records: ${err.message}`, 'error');
            //             }
            //         })
            //     } else {
            //         swal("Cancelled", "Approval action cancelled!", "error");
            //     }
            // });
        }
    }
});


Template.ApproveEmployeeTime.onDestroyed(function () {
    Modal.hide('selectedEvent')
});
