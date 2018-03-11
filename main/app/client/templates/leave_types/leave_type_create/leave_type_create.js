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
    // 'click #selectAllPositions': (e, tmpl) => {
    //     e.preventDefault();
    //     console.log(`clicky clicky`)

    //     const businessId = Session.get('context')

    //     if(tmpl.$('.positions div.hidden').length < 1) {
    //         tmpl.$('.positions').append('<div class="menu transition hidden" tabindex="-1"></div>')
    //     }

    //     EntityObjects.find({
    //         otype: 'Position',
    //         businessId: businessId,
    //     }).fetch().forEach(position => {
    //         tmpl.$('.positions').append(`<a class="ui label transition visible" data-value="${position._id}" style="display: inline-block !important;">${position.name}<i class="delete icon"></i></a>`)

    //         tmpl.$('.positions div.hidden').append(`<div class="item" data-value="${position._id}">${position.name}</div>`)
    //     })

    //     tmpl.$('.positions i.delete').click(() => {
    //         $(this).closest('a').remove();
    //     })
    // }
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
        if(Template.instance().data && Template.instance().data.positionIds 
            && (!Template.instance().data.payGradeIds || !Template.instance().data.payGradeIds.length === 0)) {
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
        self.selectedPaygrades.set(Template.instance().data.payGradeIds || [])
        self.selectedPositions.set(Template.instance().data.positionIds || [])
    }
    //subscribe to positions and paygrades
    self.subscribe('getPositions', Session.get('context'));
    self.subscribe('paygrades', Session.get('context'));

    self.canNowPrefittyDropdowns = new ReactiveVar();


    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            self.canNowPrefittyDropdowns.set(true)
        }
    })
});

Template.LeaveTypeCreate.onRendered(function () {
    let self = this;

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

        if(self.canNowPrefittyDropdowns.get()) {
            console.log(`canNowPrefittyDropdowns: `, true)
            setTimeout(function() {
                $('select.dropdown').dropdown();                
            }, 1000)
        } else {
            console.log(`canNowPrefittyDropdowns: `, false)            
        }
    });
});

Template.LeaveTypeCreate.onDestroyed(function () {
});