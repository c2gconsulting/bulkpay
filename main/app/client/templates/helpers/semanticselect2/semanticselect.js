/*****************************************************************************/
/* Selectpicker: Event Handlers */
/*****************************************************************************/
Template.semanticselect2.events({

});

/*****************************************************************************/
/* Selectpicker: Helpers */
/*****************************************************************************/
Template.semanticselect2.helpers({
});

/*****************************************************************************/
/* Selectpicker: Lifecycle Hooks */
/*****************************************************************************/
Template.semanticselect2.onCreated(function () {
});

Template.semanticselect2.onRendered(function () {
	self.$('select.dropdown').dropdown({
		forceSelection: true
	});
	// console.log('this.data.value', this.data)
	// if (this.data && typeof this.data === 'string') {
	// 	self.$('select.dropdown').dropdown('set selected', this.data);
	// }

	// self.$('select.dropdown').dropdown('set selected', this.data.value);
});

Template.semanticselect2.onDestroyed(function () {
});
