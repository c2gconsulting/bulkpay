/*****************************************************************************/
/* OrderEntry: Event Handlers */
/*****************************************************************************/
Template.OrderEntry.events({
	'click .order-entry': function(e, tmpl) {
		Router.go('orders.detail', {_id: this._id});
	}
});

/*****************************************************************************/
/* OrderEntry: Helpers */
/*****************************************************************************/
Template.OrderEntry.helpers({
	orderType: function () {
		let orderT = OrderTypes.findOne({code: this.orderType});
		return orderT.name ? orderT.name :  ""
	}
});

/*****************************************************************************/
/* OrderEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.OrderEntry.onCreated(function () {
});

Template.OrderEntry.onRendered(function () {
});

Template.OrderEntry.onDestroyed(function () {
});
