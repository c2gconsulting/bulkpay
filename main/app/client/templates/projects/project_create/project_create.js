/*****************************************************************************/
/* ProjectCreate: Event Handlers */
/*****************************************************************************/
Template.ProjectCreate.events({
});

/*****************************************************************************/
/* ProjectCreate: Helpers */
/*****************************************************************************/
Template.ProjectCreate.helpers({
    'positions': () => {
        return EntityObjects.find().fetch().map(x => {
            return {label: x.name, value: x._id}
        })
    },

    'status': () => {
        return [{label: "Active", value: "Active"},{label: "Inactive", value: "Inactive"}];
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    },
    'formType': () => {
        if(Template.instance().data)
            return "projectForm";
        return "updateProjectForm";
    },
    'data': () => {
        return Template.instance().data? true:false;
    }
});



/*****************************************************************************/
/* ProjectCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.ProjectCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
    //subscribe to positions and paygrades
    self.subscribe('getPositions', Session.get('context'));

});

Template.ProjectCreate.onRendered(function () {
    let self = this;
    $('select.dropdown').dropdown();

});

Template.ProjectCreate.onDestroyed(function () {
});