/*****************************************************************************/
/* TimeCreate2: Event Handlers */
/*****************************************************************************/
Template.TimeCreate2.events({
    'change [name="costElement"]': (e, tmpl) => {
        let selected = $(e.target).val();
        if(selected)
            Template.instance().selectedElement.set(selected);
    },
    'change [name="projects"]': (e,tmpl) => {
        let project = $(e.target).val();
        tmpl.project.set(project);
    },
    'change [name="costCenters"]': (e,tmpl) => {
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
    },
    'click #TimeCreate': (e, tmpl) => {
        e.preventDefault()

        let costElement = $('[name="costElement"]:checked').val();
        console.log(`costElement: ${JSON.stringify(costElement)}`)

        let costElementId = null
        if(costElement) {
            if(costElement === 'project') {
                costElementId = $('[name="projects"]').val();
            } else if(costElement === 'costCenter') {
                costElementId = $('[name="costCenters"]').val();
            }
        }
        console.log(`costElementId: ${JSON.stringify(costElementId)}`)
        if(!costElementId || costElementId.length === 0) {
            if(costElement === 'project') {
                swal('Validation error', "Please select a project", 'error')
            } else if(costElement === 'costCenter') {
                swal('Validation error', "Please select a cost center", 'error')
            }
            return
        }
        let activityId = $('[name="activities"]').val();
        console.log(`activityId: ${JSON.stringify(activityId)}`)
        if(!activityId || activityId.length === 0) {
            swal('Validation error', "Please select an activity", 'error')
            return
        }

        let currentDayIndex = Template.instance().currentDayIndex.get()
        let datesForTimeWriting = Template.instance().datesForTimeWriting.get()
        let day = datesForTimeWriting[currentDayIndex]
        console.log(`day: ${JSON.stringify(day)}`)

        let duration = $('#duration').val();
        console.log(`duration: ${duration}`)
        let durationAsNumber = parseInt(duration)

        let hoursToTimeWriteForCurrentDay = tmpl.hoursToTimeWriteForCurrentDay.get()
        if(durationAsNumber > hoursToTimeWriteForCurrentDay) {
            swal('Validation error', "You cannot record time more than 8 hours on the smae day", 'error')
            return
        }

        let note = $('#note').val() || "";
        console.log(`note: ${note}`)
        //--
        let timeDoc = {
            employeeId: Meteor.userId(),
            activity: activityId,
            day: day,
            duration: durationAsNumber,
            note: note,
            businessId: Session.get('context')
        }
        if(costElement === 'project') {
            timeDoc.project = costElementId
        } else if(costElement === 'costCenter') {
            timeDoc.costCenter = costElementId
        }
        console.log(`timeDoc: ${JSON.stringify(timeDoc)}`)
        //--
        Meteor.call('time/create', timeDoc, function(err, res) {
            if(!err) {
                swal('Successful', "Time recorded successful", 'success')
            } else {
                swal('Error', err.reason, 'error')
            }
        })
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
        return Template.instance().selectedElement.get() === "project";
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
    self.selectedElement = new ReactiveVar("project");

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
        if(!self.subscriptionsReady()) {
            return
        }

        let currentDayIndex = self.currentDayIndex.get()

        let dayToFindTimesFor = self.datesForTimeWriting.get()[currentDayIndex]
        console.log(`dayToFindTimesFor: ${JSON.stringify(dayToFindTimesFor)}`)
        var dayStart = moment(dayToFindTimesFor).startOf('day').toDate();
        var dayEnd = moment(dayToFindTimesFor).endOf('day').toDate();

        let timesRecordedForDay = TimeWritings.find({
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

    // $('#TimeCreate').prop('disabled', true);

    // self.autorun(function() {
    //     $("#duration").on("change", function () {
    //         let duration = $("#duration").val();
    //         console.log(`[onRendered] duration: ${duration}`)
    //         let hoursToTimeWriteForCurrentDay = self.hoursToTimeWriteForCurrentDay.get()

    //         if (duration){
    //             let durationAsHours = parseInt(duration)
    //             if (durationAsHours <= hoursToTimeWriteForCurrentDay){
    //                 $('#TimeCreate').prop('disabled', false);
    //             } else {
    //               $('#TimeCreate').prop('disabled', true);
    //             }
    //         }
    //     });
    // });
});

Template.TimeCreate2.onDestroyed(function () {
});
