/*****************************************************************************/
/* TimeCreate: Event Handlers */
/*****************************************************************************/
Template.TimeCreate.events({
});

/*****************************************************************************/
/* TimeCreate: Helpers */
/*****************************************************************************/
Template.TimeCreate.helpers({
    'projects': function () {
        let projects = Projects.find().fetch().map(x => {
            return {label: x.name, value: x._id};
        });
        return projects;
    },
    'formType': () => {
        if(Template.instance().data)
            return "TimeForm";
        return "updateTimeForm";
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    }
});


/*****************************************************************************/
/* TimeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
    //subscribe to leave types that user belongs to
    self.subscribe('employeeprojects', Session.get('context'));
});

Template.TimeCreate.onRendered(function () {
    let self = this;
    //disable submit temporary fix
    $('#TimeCreate').prop('disabled', true);

    //set start and end time if no template data
    if(!Template.instance().data){
        let date = Session.get('startdate');
        $('#startTime').data('DateTimePicker').setDate(new Date(date));
        $('#endTime').data('DateTimePicker').setDate(new Date(date));
        let start = $("#startTime").val();
        let end = $("#endTime").val();
        if (start && end){
            start = moment(start);
            end = moment(end);
            var duration = moment.duration(end.diff(start));
            var hours = duration.asHours();
            $("#duration").val(hours);
            if (hours >= 1 && hours <= 12){
                $('#TimeCreate').prop('disabled', false);
            }
        }

    }

    self.autorun(function() {
        if (!self.profile.get('duration')){
            let propertyType = self.$("#duration").val();
            self.profile.set('duration', propertyType);
        }
        $("#startTime").on("change", function () {
            let start = $("#startTime").val();
            let end = $("#endTime").val();
            if (start && end){
                start = moment(start);
                end = moment(end);
                var duration = moment.duration(end.diff(start));
                var hours = duration.asHours();
                $("#duration").val(hours);
                if (hours <= 12){
                    $('#TimeCreate').prop('disabled', false);
                }
            }
        });
        $("#endTime").on("change", function () {
            let start = $("#startTime").val();
            let end = $("#endTime").val();
            if (start && end){
                start = moment(start);
                end = moment(end);
                var duration = moment.duration(end.diff(start));
                var hours = duration.asHours();
                $("#duration").val(hours);
                if (hours >= 1 && hours <= 12){
                    $('#TimeCreate').prop('disabled', false);
                }
            }
        });

    });
});

Template.TimeCreate.onDestroyed(function () {
});
