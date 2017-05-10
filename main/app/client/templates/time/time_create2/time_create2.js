/*****************************************************************************/
/* TimeCreate2: Event Handlers */
/*****************************************************************************/
Template.TimeCreate2.events({
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

        console.log(`costCenter change: ${center}`)
    }
});

/*****************************************************************************/
/* TimeCreate2: Helpers */
/*****************************************************************************/
Template.TimeCreate2.helpers({
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
        console.log(`activitiesForDisplay: ${JSON.stringify(activitiesForDisplay)}`)
        return activitiesForDisplay;
    },
    'datesForTimeWriting': function() {
        return Template.instance().data
    },
    'getDayFromDate': function(date) {
        let theMoment = moment(date)
        return theMoment.format('D')
    },
    'currentDayIndex': function(date) {
        return Template.instance().currentDayIndex.get()
    }
});


/*****************************************************************************/
/* TimeCreate2: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeCreate2.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
    self.project = new ReactiveVar();
    self.costCenter = new ReactiveVar();
    self.selectedElement = new ReactiveVar("Project");

    let datesForTimeWriting = self.data
    console.log(`Dates for time writing: ${JSON.stringify(datesForTimeWriting)}`)

    self.currentDayIndex = new ReactiveVar()
    if(datesForTimeWriting && datesForTimeWriting.length > 0) {
        self.currentDayIndex.set(0)
    }

    self.subscribe('employeeprojects', Session.get('context'));
    self.subscribe('getCostElement', Session.get('context'));
    self.subscribe('AllActivities', Session.get('context'));

    //--
    self.autorun(function(){
        // if(self.project.get()) {
        //     self.subscribe('activities', "project", self.project.get());
        // }
        // if(self.costCenter.get()) {
        //     self.subscribe('activities', "unit", self.costCenter.get());
        // }
    });
});

Template.TimeCreate2.onRendered(function () {
    let self = this;
    //disable submit temporary fix
    $('#TimeCreate').prop('disabled', true);

    self.autorun(function() {
        $("#duration").on("change", function () {
            let duration = $("#duration").val();

            if (duration){
                let durationAsHours = parseInt(duration)
                if (durationAsHours >= 1 && durationAsHours <= 8){
                    $('#TimeCreate').prop('disabled', false);
                } else {
                  $('#TimeCreate').prop('disabled', true);
                }
            }
        });
    });
});

Template.TimeCreate.onDestroyed(function () {
});
