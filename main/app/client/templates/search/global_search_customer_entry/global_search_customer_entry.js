/*****************************************************************************/
/* GlobalSearchCustomerEntry: Event Handlers */
/*****************************************************************************/
Template.GlobalSearchCustomerEntry.events({});

/*****************************************************************************/
/* GlobalSearchCustomerEntry: Helpers */
/*****************************************************************************/
Template.GlobalSearchCustomerEntry.helpers({
    group: function () {
        return CustomerGroups.findOne({code: this.groupCode});
    }
});

/*****************************************************************************/
/* GlobalSearchCustomerEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.GlobalSearchCustomerEntry.onCreated(function() {});

Template.GlobalSearchCustomerEntry.onRendered(function() {});

Template.GlobalSearchCustomerEntry.onDestroyed(function() {});
