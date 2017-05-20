/*****************************************************************************/
/* EmployeeEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeeEntry.events({
});

/*****************************************************************************/
/* EmployeeEntry: Helpers */
/*****************************************************************************/
Template.EmployeeEntry.helpers({
    positionName: (id) => {
        let entity = EntityObjects.findOne({_id: id})
        if(entity) {
            return entity.name
        }
    },
    "images": (id) => {
        return UserImages.findOne({_id: id});
    }
});

/*****************************************************************************/
/* EmployeeEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEntry.onCreated(function () {
    let self = this ;
});

Template.EmployeeEntry.onRendered(function () {
});

Template.EmployeeEntry.onDestroyed(function () {
});
