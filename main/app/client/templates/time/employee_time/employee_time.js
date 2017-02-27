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
    'supervisee': () => {
        return Meteor.users.find().fetch().filter(x => {
            return x._id !== Meteor.userId();
        });
    },
    'self': () => {
        return Meteor.users.findOne({_id: Meteor.userId()});
    },
    'selected': () => {
        return Template.instance().dict.get('selected');
    }
});

/*****************************************************************************/
/* EmployeeTime: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTime.onCreated(function () {
    //subscribe to employees that is under user
    let self = this;
    self.dict = new ReactiveDict();


});

Template.EmployeeTime.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this;
    self.autorun(function(){
        let events = [];
        const leaves = Leaves.find({}).fetch();
        const times = Times.find({}).fetch();
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
            obj.type = 'Times';
            obj.title = user + "-" + x.activity;
            obj.start = moment(x.startTime).format('YYYY-MM-DDTHH:mm:ss');
            obj.end = moment(x.endTime).format('YYYY-MM-DDTHH:mm:ss');
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
                default: '_',
                navLinks: true, // can click day/week names to navigate views
                selectable: true,
                selectHelper: true,
                select: function(start, end) {
                    let date = start.format('MM/DD/YYYY');
                    Session.set('startdate', date);
                    Modal.show('TimeCreate');
                },
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                events: events,
                eventClick: function(event) {
                    if (event._id) {
                        self.dict.set('selected', {type: event.type, id: event._id});
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
});


Template.EmployeeTime.onDestroyed(function () {
});
