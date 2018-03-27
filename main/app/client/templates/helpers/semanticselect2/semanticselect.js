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
});

Template.semanticselect2.onDestroyed(function () {
});
