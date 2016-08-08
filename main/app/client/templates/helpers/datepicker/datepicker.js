/*****************************************************************************/
/* datepicker: Event Handlers */
/*****************************************************************************/
Template.datepicker.events({
});

/*****************************************************************************/
/* Datepicker: Helpers */
/*****************************************************************************/
Template.datepicker.helpers({
});

/*****************************************************************************/
/* datepicker: Lifecycle Hooks */
/*****************************************************************************/
Template.datepicker.onCreated(function () {
});

Template.datepicker.onRendered(function () {
	let options = {format: 'DD MMM YYYY'};
	if (this.data) options.defaultDate = this.data;
	this.$('.datepicker').datetimepicker(options);
});

Template.datepicker.onDestroyed(function () {
});
