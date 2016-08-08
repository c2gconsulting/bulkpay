/*****************************************************************************/
/* Selectpicker: Event Handlers */
/*****************************************************************************/
Template.selectpicker.events({
	
});

/*****************************************************************************/
/* Selectpicker: Helpers */
/*****************************************************************************/
Template.selectpicker.helpers({
});

/*****************************************************************************/
/* Selectpicker: Lifecycle Hooks */
/*****************************************************************************/
Template.selectpicker.onCreated(function () {
});

Template.selectpicker.onRendered(function () {
	let options = {};
	if (this.data) {
		options.style = this.data.style || '';
		options.size = this.data.size || '';
	}
	self.$('.selectpicker').selectpicker(options);
	
});

Template.selectpicker.onDestroyed(function () {
});
