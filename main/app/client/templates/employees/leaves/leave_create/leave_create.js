/*****************************************************************************/
/* LeaveCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveCreate.events({
});

/*****************************************************************************/
/* LeaveCreate: Helpers */
/*****************************************************************************/
Template.LeaveCreate.helpers({
    leaveTypes: function () {
        let leaveTypes = [{name: "maternity leave", _id: "234342342"},{name: "maternity not leave", _id: "234ere342342"}]//LeaveTypes.find().fetch();
        let returnedArray = [];
        _.each(leaveTypes, function(leave){
            returnedArray.push({label: leave.name, value: leave._id})
        });
        return returnedArray
    }
});


/*****************************************************************************/
/* LeaveCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
});

Template.LeaveCreate.onRendered(function () {
    let self = this;

    let start = $("#startDate").val();
    let end = $("#endDate").val()
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
            let end = $("#endDate").val()
            if (start && end){
                start = moment(start);
                end = moment(end);
                let duration = end.diff(start, 'days');
                $("#duration").val(duration <= 0 ? 0 : duration)
            }
        });
    });
});

Template.LeaveCreate.onDestroyed(function () {
});
