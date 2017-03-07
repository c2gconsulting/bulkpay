/*****************************************************************************/
/* TimeCreate: Event Handlers */
/*****************************************************************************/
Template.TimeCreate.events({
    'change [name="project"]': (e,tmpl) => {
        let project = $(e.target).val();
        tmpl.project.set(project);
    },
    'change [name="costCenter"]': (e,tmpl) => {
        let center = $(e.target).val();
        tmpl.costCenter.set(center);
    },
    'change [name="costElement"]': (e, tmpl) => {
        let selected = $(e.target).val();
        if(selected)
            Template.instance().selectedElement.set(selected);
    }
});

/*****************************************************************************/
/* TimeCreate: Helpers */
/*****************************************************************************/
Template.TimeCreate.helpers({
    'projects': function () {
        const projects = Projects.find().fetch().map(x => {
            return {label: x.name, value: x._id};
        });
        return projects;
    },
    'costCenters': function () {
        const centers = EntityObjects.find({otype: 'Unit'}).fetch().map(x => {
            return {label: x.name, value: x._id};
        });
        return centers;
    },
    'projectSelected': function() {
        return Template.instance().selectedElement.get() === "Project";
    },
    'costCenterSelected': function() {
        return Template.instance().selectedElement.get() === "costCenter";
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
    },
    'projectActivities': () => {
        const id = Template.instance().project.get();
        const project = Projects.findOne({_id: id});
        const activities = [];
        if(project && project.hasOwnProperty('activities')){
           project.activities.forEach(x => {
               if(x)
                activities.push({label: `${x.fullcode} - ${x.description}`, value: `${x.fullcode} - ${x.description}`});
           })
        }
        return activities;
    },
    'costCenterActivities': () => {
        const id = Template.instance().costCenter.get();
        const costCenter = EntityObjects.findOne({_id: id});
        const activities = [];
        if(costCenter && costCenter.hasOwnProperty('activities')){
            costCenter.activities.forEach(x => {
                if(x)
                    activities.push({label: `${x.fullcode} - ${x.description}`, value: `${x.fullcode} - ${x.description}`});
            })
        }
        return activities;
    }
});


/*****************************************************************************/
/* TimeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
    self.project = new ReactiveVar();
    self.costCenter = new ReactiveVar();
    self.selectedElement = new ReactiveVar("Project");
    //subscribe to leave types that user belongs to
    self.subscribe('employeeprojects', Session.get('context'));
    self.subscribe('getCostElement', Session.get('context'));
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
    //

    self.autorun(function() {
        if (!self.profile.get('duration')){
            let propertyType = self.$("#duration").val();
            self.profile.set('duration', propertyType);
        }
        $("#startTime").on("change", function () {
            let start = $("#startTime").val();
            let end = $("#endTime").val();
            const breakflag = $('#includeBreak').is(':checked') === true? 1 : -1;
            console.log('loggin field value as ', $('#includeBreak').val() );
            if (start && end){
                start = moment(start);
                end = moment(end);
                const duration = moment.duration(end.diff(start));
                let hours = duration.asHours();
                if (breakflag)
                    hours -= 1;
                $("#duration").val(hours);
                if (hours <= 12){
                    $('#TimeCreate').prop('disabled', false);
                }
            }
        });
        $("#endTime").on("change", function () {
            let start = $("#startTime").val();
            let end = $("#endTime").val();
            const breakflag = $('#includeBreak').is(':checked') === true? 1 : -1;
            console.log('loggin field value as ', $('#includeBreak').val() );
            if (start && end){
                start = moment(start);
                end = moment(end);
                const duration = moment.duration(end.diff(start));
                let hours = duration.asHours();
                if (breakflag)
                    hours -= 1;
                $("#duration").val(hours);
                if (hours >= 1 && hours <= 12){
                    $('#TimeCreate').prop('disabled', false);
                }
            }
        });

        $("#includeBreak").on("change", function () {
            let start = $("#startTime").val();
            let end = $("#endTime").val();
            const breakflag = $('#includeBreak').is(':checked');
            console.log('loggin field value as ', $('#includeBreak').val() );
            if (start && end){
                start = moment(start);
                end = moment(end);
                const duration = moment.duration(end.diff(start));
                let hours = duration.asHours();
                if (breakflag)
                    hours -= 1;
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
