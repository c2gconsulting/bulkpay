/*****************************************************************************/
/* datepicker: Event Handlers */
/*****************************************************************************/
Template.datepicker2.events({
});

/*****************************************************************************/
/* Datepicker: Helpers */
/*****************************************************************************/
Template.datepicker2.helpers({
});

/*****************************************************************************/
/* datepicker: Lifecycle Hooks */
/*****************************************************************************/
Template.datepicker2.onCreated(function () {
});

Template.datepicker2.onRendered(function () {
	let options = {format: 'DD MMM YYYY', minDate: new Date()};
	if (this.data) options.defaultDate = this.data;
	this.$('.datepicker').datetimepicker(options);
});

Template.datepicker2.onDestroyed(function () {
});


/*****************************************************************************/
/* transformableDatepicker: Lifecycle Hooks */
/*****************************************************************************/
Template.transformableDatepicker2.onCreated(function () {
});

Template.transformableDatepicker2.onRendered(function () {
	let options = {format: 'YYYY-MM-DD'};
	if (this.data) options.defaultDate = this.data;
	this.$('.datepicker').datetimepicker(options);
});

Template.transformableDatepicker2.onDestroyed(function () {
});
