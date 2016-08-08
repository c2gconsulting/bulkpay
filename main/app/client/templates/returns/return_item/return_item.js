/*****************************************************************************/
/* ReturnItem: Event Handlers */
/*****************************************************************************/
Template.ReturnItem.events({
});

/*****************************************************************************/
/* ReturnItem: Helpers */
/*****************************************************************************/
Template.ReturnItem.helpers({
	discount: function() {
		return  this.discount || 0;
	},
	itemTotal: function() {
		let discount = this.discount || 0;
		return (this.quantity * this.price) * ((100 - discount)/100);
	}
});

/*****************************************************************************/
/* ReturnItem: Lifecycle Hooks */
/*****************************************************************************/
Template.ReturnItem.onCreated(function () {
});

Template.ReturnItem.onRendered(function () {
});

Template.ReturnItem.onDestroyed(function () {
});
