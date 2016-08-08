/*****************************************************************************/
/* popover: Event Handlers */
/*****************************************************************************/
Template.popover.events({
});

/*****************************************************************************/
/* Popover: Helpers */
/*****************************************************************************/
Template.popover.helpers({
});

/*****************************************************************************/
/* Popover: Lifecycle Hooks */
/*****************************************************************************/
Template.popover.onCreated(function () {
});

Template.popover.onRendered(function () {
    let ptrigger = this.data || 'hover';
    this.$('[data-toggle="popover"]').popover({
        placement : 'auto bottom',
        trigger: ptrigger,
        container: 'body'
    });
});

Template.popover.onDestroyed(function () {
});
