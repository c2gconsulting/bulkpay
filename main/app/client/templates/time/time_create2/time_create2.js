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
    },
    'click .datesForTimeWriting': (e, tmpl) => {
        let element = e.currentTarget
        let dayIndex = element.getAttribute('data-dayNum')
        console.log(`dayIndex: ${dayIndex}`)

        tmpl.currentDayIndex.set(parseInt(dayIndex))
        let businessId = Session.get('context')

        let dayToFindTimesFor = tmpl.datesForTimeWriting.get()[dayIndex]
        console.log(`dayToFindTimesFor: ${JSON.stringify(dayToFindTimesFor)}`)

        Meteor.subscribe('timesForDay', businessId, dayToFindTimesFor)
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
    },
    'isTimeAvailableToTimeWriteForCurrentDay': function() {
        return Template.instance().hoursToTimeWriteForCurrentDay.get() > 0 ? true : false
    },
    'hoursToTimeWriteForCurrentDay': function() {
        return Template.instance().hoursToTimeWriteForCurrentDay.get()
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

    self.datesForTimeWriting = new ReactiveVar()
    self.datesForTimeWriting.set(self.data)
    console.log(`Dates for time writing: ${JSON.stringify(self.datesForTimeWriting.get())}`)

    self.currentDayIndex = new ReactiveVar()
    if(self.datesForTimeWriting.get().length > 0) {
        self.currentDayIndex.set(0)
    }

    self.hoursToTimeWriteForCurrentDay = new ReactiveVar()
    //self.hoursToTimeWriteForCurrentDay.set(8)

    self.subscribe('employeeprojects', Session.get('context'));
    self.subscribe('getCostElement', Session.get('context'));
    self.subscribe('AllActivities', Session.get('context'));

    //--
    self.autorun(function(){
        let currentDayIndex = self.currentDayIndex.get()

        let dayToFindTimesFor = self.datesForTimeWriting.get()[currentDayIndex]
        var dayStart = moment(dayToFindTimesFor).startOf('day'); // set to 12:00 am today
        var dayEnd = moment(dayToFindTimesFor).endOf('day'); // set to 23:59 pm today

        let timesRecordedForDay = Times.find({
            employeeId: Meteor.userId(), 
            day: {$gte: dayStart, $lt: dayEnd}
        }).fetch();
        console.log(`timesRecordedForDay: ${JSON.stringify(timesRecordedForDay)}`)

        let numberOfHoursTimewritedFor = 0
        timesRecordedForDay.forEach(aTime => {
            numberOfHoursTimewritedFor += aTime.duration
        })
        console.log(`numberOfHoursTimewritedFor: ${numberOfHoursTimewritedFor}`)
        self.hoursToTimeWriteForCurrentDay.set(8 - numberOfHoursTimewritedFor)
    });
});

Template.TimeCreate2.onRendered(function () {
    let self = this;
    //disable submit temporary fix
    $('#TimeCreate').prop('disabled', true);

    self.autorun(function() {
        $("#duration").on("change", function () {
            let duration = $("#duration").val();
            let hoursToTimeWriteForCurrentDay = self.hoursToTimeWriteForCurrentDay.get()

            if (duration){
                let durationAsHours = parseInt(duration)
                if (durationAsHours <= hoursToTimeWriteForCurrentDay){
                    $('#TimeCreate').prop('disabled', false);
                } else {
                  $('#TimeCreate').prop('disabled', true);
                }
            }
        });
    });
});

Template.TimeCreate2.onDestroyed(function () {
});
