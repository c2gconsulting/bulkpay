/*****************************************************************************/
/* EmployeeTime: Event Handlers */
/*****************************************************************************/
//import _ from 'underscore';
Template.EmployeeTime.events({

});


Template.registerHelper('trimString', function(passedString, startstring, endstring) {
    var theString = passedString.substring( startstring, endstring );
    return new Handlebars.SafeString(theString)
});

/*****************************************************************************/
/* EmployeeTime: Helpers */
/*****************************************************************************/
Template.EmployeeTime.helpers({
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
/* EmployeeTime: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTime.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();

    self.supervisees = new ReactiveVar();

    let businessId = Session.get('context')
    console.log(`business id: `, businessId)

    let positionsSubs = self.subscribe('getPositions', businessId)

    self.autorun(function(){
        if(positionsSubs.ready()) {
            let currentUser = Meteor.user()

            let superviseePositions = EntityObjects.find({
                otype: "Position", 
                $or: [
                    {'properties.supervisor': currentUser.employeeProfile.employment.position},
                    {'properties.alternateSupervisor': currentUser.employeeProfile.employment.position}
                ]
            }).fetch()
            
            let superviseePositionIds = superviseePositions.map(x => {
                return x._id
            });

            let supervisees = Meteor.users.find({'employeeProfile.employment.position': {$in: superviseePositionIds}}).fetch()
            self.supervisees.set(supervisees)
        }
    })
});

Template.EmployeeTime.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this;
    self.autorun(function(){
        let events = [];
        const leaves = Leaves.find({}).fetch();
        const times = TimeWritings.find({}).fetch();
        leaves.forEach(x => {
            const user = Meteor.users.findOne({_id: x.employeeId}).profile.fullName;
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
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay,listMonth'
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

        while (numberOfDays > 0) {
            if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
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
