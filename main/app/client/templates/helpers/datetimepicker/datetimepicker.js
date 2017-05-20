/*****************************************************************************/
/* datetimepicker: Event Handlers */
/*****************************************************************************/
Template.datetimepicker.events({
});

/*****************************************************************************/
/* datetimepicker: Helpers */
/*****************************************************************************/
Template.datetimepicker.helpers({
});

/*****************************************************************************/
/* datetimepicker: Lifecycle Hooks */
/*****************************************************************************/
Template.datetimepicker.onCreated(function () {
});

Template.datetimepicker.onRendered(function () {
	let options = {format: 'DD MMM YYYY HH:mm:ss'};
	if (this.data) 
      options.defaultDate = this.data;
	this.$('.datetimepicker').datetimepicker(options);
});

Template.datetimepicker.onDestroyed(function () {
});

