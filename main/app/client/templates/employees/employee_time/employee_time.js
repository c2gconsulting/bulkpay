/*****************************************************************************/
/* EmployeeTime: Event Handlers */
/*****************************************************************************/
Template.EmployeeTime.events({
    'click .fc-day': (e,tmpl) => {
        swal('success', "you just cliked a day", "succes");
    }
});

/*****************************************************************************/
/* EmployeeTime: Helpers */
/*****************************************************************************/
Template.EmployeeTime.helpers({
});

/*****************************************************************************/
/* EmployeeTime: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTime.onCreated(function () {
    //subscribe to all time and leave events

});

Template.EmployeeTime.onRendered(function () {
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true
    });
});


Template.EmployeeTime.onDestroyed(function () {
});
