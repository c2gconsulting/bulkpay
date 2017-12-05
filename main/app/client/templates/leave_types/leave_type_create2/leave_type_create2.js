import _ from 'underscore';

/*****************************************************************************/
/* LeaveTypeCreate2: Event Handlers */
/*****************************************************************************/
Template.LeaveTypeCreate2.events({
    
});

Template.registerHelper('equals',(a,b)=>{
    return a == b;
});

/*****************************************************************************/
/* LeaveTypeCreate2: Helpers */
/*****************************************************************************/
Template.LeaveTypeCreate2.helpers({
    selected(context, val) {
        if(Template.instance().data){
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    },
    isSelected(context, val) {
        if(Template.instance().data){
            return Template.instance().data[context] === val ? true : false;
        }
    },
    selectedObj: function (x) {
        if(Template.instance().data){
            let self = this;
            let selected;
            let prop = Template.instance().data[x];
            selected = _.find(prop, function(r) {
                return r ===  self._id;
            });
            if (selected){
                return "selected"
            }
        }
    },
    'modalHeaderTitle': function() {
        if(Template.instance().data){
            return "Update Leave Type"
        } else {
            return "Create Leave Types"
        }
    },
});


/*****************************************************************************/
/* LeaveTypeCreate2: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveTypeCreate2.onCreated(function () {
    let self = this;
    let businessId = Session.get('context')

    self.subscribe('getCostElement', businessId)

    if(self.data){

    }
});

Template.LeaveTypeCreate2.onRendered(function () {
    let self = this;


});

Template.LeaveTypeCreate2.onDestroyed(function () {
});
