/*****************************************************************************/
/* TimeCreate: Event Handlers */
/*****************************************************************************/
Template.TimeCreate.events({
    'change [name="costElement"]': (e, tmpl) => {
        let selected = $(e.target).val();
        if(selected)
            Template.instance().selectedElement.set(selected);
    },
    'change [name="project"]': (e,tmpl) => {
        let project = $(e.target).val();
        tmpl.project.set(project);
    },
    'change [name="costCenter"]': (e,tmpl) => {
        let center = $(e.target).val();
        tmpl.costCenter.set(center);
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
        // console.log("projects: " + JSON.stringify(projects));

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
        let activities = Activities.find({type: "project", unitOrProjectId: id}).fetch();

        let activitiesForDisplay = activities.map(x => {
            return {
                label: `${x.fullcode} - ${x.description}`,
                value: x._id
            };
        })
        return activitiesForDisplay;
    },
    'costCenterActivities': () => {
        const id = Template.instance().costCenter.get();
        let activities = Activities.find({type: "unit", unitOrProjectId: id}).fetch();

        let activitiesForDisplay = activities.map(x => {
            return {
                label: `${x.fullcode} - ${x.description}`,
                value: x._id
            };
        })
        return activitiesForDisplay;
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

    self.subscribe('employeeprojects', Session.get('context'));
    self.subscribe('getCostElement', Session.get('context'));

    //--
    self.autorun(function(){
        if(self.project.get()) {
            self.subscribe('activities', "project", self.project.get());
        }
        if(self.costCenter.get()) {
            self.subscribe('activities', "unit", self.costCenter.get());
        }
    });
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
                
                let hoursToTwoDecimals = parseFloat(hours).toFixed(2);
                $("#duration").val(hoursToTwoDecimals);
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
                
                let hoursToTwoDecimals = parseFloat(hours).toFixed(2);
                $("#duration").val(hoursToTwoDecimals);
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
                
                let hoursToTwoDecimals = parseFloat(hours).toFixed(2);
                $("#duration").val(hoursToTwoDecimalshours);
                if (hours >= 1 && hours <= 12){
                    $('#TimeCreate').prop('disabled', false);
                }
            }
        });

    });
});

Template.TimeCreate.onDestroyed(function () {
});
