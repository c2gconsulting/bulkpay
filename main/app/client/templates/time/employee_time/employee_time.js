/*****************************************************************************/
/* EmployeeTime: Event Handlers */
/*****************************************************************************/
//import _ from 'underscore';

Template.EmployeeTime.events({

});

/*****************************************************************************/
/* EmployeeTime: Helpers */
/*****************************************************************************/
Template.EmployeeTime.helpers({
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
/* EmployeeTime: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTime.onCreated(function () {
    let self = this;

    self.dict = new ReactiveDict();
    self.businessUnitCustomConfig = new ReactiveVar()

    let businessId = Session.get('context')

    let positionsSubs = self.subscribe('getPositions', businessId)

    Meteor.call('BusinessUnitCustomConfig/getConfig', businessId, function(err, res) {
        if(!err) {
            self.businessUnitCustomConfig.set(res)
        }
    })
});

Template.EmployeeTime.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this;

    self.autorun(function(){
        let events = [];
        const leaves = Leaves.find({employeeId: Meteor.userId()}).fetch();
        const times = TimeWritings.find({employeeId: Meteor.userId()}).fetch();

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
            // obj.title = user + "-" + x.activity;
            obj.title = user;

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
                let theWeekDays = self.getWeekDaysFromFullCalender(date, endDate)
                //console.log(`The weekdays: ${JSON.stringify(theWeekDays)}`)

                Modal.show('TimeCreate2', theWeekDays);
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
        console.log(`Number of days: ${numberOfDays}`)

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        let businessUnitCustomConfig = self.businessUnitCustomConfig.get()

        while (numberOfDays > 0) {
            if(businessUnitCustomConfig.isWeekendTimeWritingEnabled) {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone                
            } else {
                if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                    weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
                }
            }

            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        return weekDates
    }
});


Template.EmployeeTime.onDestroyed(function () {
    Modal.hide('selectedEvent')
});
