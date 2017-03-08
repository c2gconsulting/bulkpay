/*****************************************************************************/
/* EmployeeEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeeEntry.events({
});

/*****************************************************************************/
/* EmployeeEntry: Helpers */
/*****************************************************************************/
Template.EmployeeEntry.helpers({
    positionName: (id)=>{
        console.log('position id as', id);
        return EntityObjects.findOne({_id: id}).name;
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
