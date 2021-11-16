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
	const minDate = (this.data && this.data.minDate) || this.data || new Date()
	let options = {format: 'DD MMM YYYY', minDate: minDate};
	if (this.data && this.data.minDate) options.defaultDate = minDate;
	else options.defaultDate = this.data;
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
	const minDate = (this.data && this.data.minDate) || this.data || new Date()
	let options = {format: 'DD MMM YYYY', minDate: minDate};
	if (this.data && this.data.minDate) options.defaultDate = minDate;
	else options.defaultDate = this.data;
	this.$('.datepicker').datetimepicker(options);
});

Template.transformableDatepicker2.onDestroyed(function () {
});
