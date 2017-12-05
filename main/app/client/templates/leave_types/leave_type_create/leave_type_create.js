/*****************************************************************************/
/* LeaveTypeCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveTypeCreate.events({
    'change [name="payGradeIds"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));

        let oldSelected = tmpl.selectedPaygrades.get() || [];

        if(selected.length < oldSelected.length) {
            let diff = _.difference(oldSelected, selected);
            let businessId = Session.get('context');

            let selectedPaygrades = PayGrades.find({
                _id: {$in: diff},
                businessId: businessId,
            }).fetch() || [];
            // console.log(`selectedPaygrades: `, selectedPaygrades)
    
            let positionIdsInPaygrades = _.pluck(selectedPaygrades, 'positions') || []
            let flattenedPositionIds = _.flatten(positionIdsInPaygrades)
    
            _.each(flattenedPositionIds, anAllowedPositionId => {
                tmpl.$("a[data-value=" + anAllowedPositionId + "]").remove();
            })
        }
        tmpl.selectedPaygrades.set(selected);
    },
});

/*****************************************************************************/
/* LeaveTypeCreate: Helpers */
/*****************************************************************************/
Template.LeaveTypeCreate.helpers({
    leaveTypes: function () {
        let leaveTypes = LeaveTypes.find().fetch();
        let returnedArray = [];
        _.each(leaveTypes, function(leave){
            returnedArray.push({label: leave.name, value: leave._id})
        });
        return returnedArray
    },
    'payGrades': () => {
        return PayGrades.find().fetch().map(x => {
            return {label: x.code, value: x._id}
        })
    },
    'allowedPositions': () => {
        if(Template.instance().data && Template.instance().data.positionIds && !Template.instance().selectedPaygrades.get()) {
            let positionIds = Template.instance().data.positionIds || []
            return EntityObjects.find({
                _id: {$in: positionIds}
            }).fetch().map(x => {
                return {label: x.name, value: x._id}
            })
        } else {
            let selectedPaygradeIds = Template.instance().selectedPaygrades.get() || [];
            if(selectedPaygradeIds.length === 0) {
                return []
            }
    
            let businessId = Session.get('context');
    
            let selectedPaygrades = PayGrades.find({
                _id: {$in: selectedPaygradeIds},
                businessId: businessId,
            }).fetch() || [];
            // console.log(`selectedPaygrades: `, selectedPaygrades)
    
            let positionIdsInPaygrades = _.pluck(selectedPaygrades, 'positions') || []
            let flattenedPositionIds = _.flatten(positionIdsInPaygrades)
            // console.log(`flattenedPositionIds: `, flattenedPositionIds)
    
            return EntityObjects.find({
                _id: {$in: flattenedPositionIds},
                businessId: businessId,
            }).fetch().map(x => {
                return {label: x.name, value: x._id}
            })
        }
    },
    // 'positions': () => {
    //     return EntityObjects.find().fetch().map(x => {
    //         return {label: x.name, value: x._id}
    //     })
    // },
    'businessIdHelper': () => {
        return Session.get('context')
    },
    
    'status': () => {
        return [{label: "Active", value: "Active"},{label: "Inactive", value: "Inactive"}];
    },
    'gender': () => {
        return [{label:'Male', value:'Male'},{label:'Female', value:'Female'},{label:'All', value:'All'}];
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    },
    'formType': () => {
        if(Template.instance().data)
            return "leavesTypesForm";
        return "updateLeaveTypesForm";
    },
    'data': () => {
        return Template.instance().data ? true:false;
    }
});



/*****************************************************************************/
/* LeaveTypeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveTypeCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();

    self.selectedPaygrades = new ReactiveVar()
    self.selectedPositions = new ReactiveVar()
    
    if(Template.instance().data) {
        // self.selectedPaygrades.set(Template.instance().data.payGradeIds || [])
        self.selectedPositions.set(Template.instance().data.positionIds || [])
    }
    //subscribe to positions and paygrades
    self.subscribe('getPositions', Session.get('context'));
    self.subscribe('paygrades', Session.get('context'));
});

Template.LeaveTypeCreate.onRendered(function () {
    let self = this;
    $('select.dropdown').dropdown();

    let start = $("#startDate").val();
    let end = $("#endDate").val();
    if (start && end){
        start = moment(start);
        end = moment(end);
        let duration = end.diff(start, 'days');
        $("#duration").val(duration <= 0 ? 0 : duration)
    }

    self.autorun(function() {
        if (!self.profile.get('duration')){
            let propertyType = self.$("#duration").val();
            self.profile.set('duration', propertyType)
        }
        $("#startDate").on("change", function () {
            let start = $("#startDate").val();
            let end = $("#endDate").val();
            if (start && end){
                start = moment(start);
                end = moment(end);
                let duration = end.diff(start, 'days');
                $("#duration").val(duration <= 0 ? 0 : duration)
            }
        });
        $("#endDate").on("change", function () {
            let start = $("#startDate").val();
            let end = $("#endDate").val();
            if (start && end){
                start = moment(start);
                end = moment(end);
                let duration = end.diff(start, 'days');
                $("#duration").val(duration <= 0 ? 0 : duration)
            }
        });
    });
});

Template.LeaveTypeCreate.onDestroyed(function () {
});