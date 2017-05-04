/*****************************************************************************/
/* LeaveCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveCreate.events({
});

/*****************************************************************************/
/* LeaveCreate: Helpers */
/*****************************************************************************/
Template.LeaveCreate.helpers({
    'leaveTypes': function () {
        let leaveTypes = LeaveTypes.find().fetch();
        let returnedArray = [];
        _.each(leaveTypes, function(leave){
            returnedArray.push({label: leave.name, value: leave._id})
        });
        return returnedArray
    },
    'businessIdHelper': () => {
        return Session.get('context')
    },
    'formType': () => {
        if(Template.instance().data)
            return "leaveForm";
        return "updateLeaveForm";
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    }
});


/*****************************************************************************/
/* LeaveCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
    //subscribe to leave types that user belongs to
    self.subscribe('employeeLeaveTypes', Session.get('context'));
});

Template.LeaveCreate.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();

    //disable submit temporary fix
    $('#LeaveCreate').prop('disabled', true);
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


        $("#type,#endDate,#startDate").on("change", function () {
            let duration = parseInt($("#duration").val());
            let selectedType = $('#type').val();
            if (duration && selectedType){
                let selectedQuota = parseInt(LeaveTypes.findOne({_id: selectedType}).maximumDuration);
                //get remaining quota of employee.
                //validate using autoform validation or custom function
                if(duration > selectedQuota){
                    $(this).addClass('errorValidation');
                    $("#duration").addClass('errorValidation');
                    $('#LeaveCreate').prop('disabled', true);
                } else {
                    $('#endDate').removeClass('errorValidation');
                    $('#startDate').removeClass('errorValidation');
                    $('#type').removeClass('errorValidation');
                    $("#duration").removeClass('errorValidation');
                    $('#LeaveCreate').prop('disabled', false);
                }
            }
        });
    });
});

Template.LeaveCreate.onDestroyed(function () {
});
