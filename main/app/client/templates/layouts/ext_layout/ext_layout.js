/*****************************************************************************/
/* ExtLayout: Event Handlers */
/*****************************************************************************/
Template.ExtLayout.events({
});

/*****************************************************************************/
/* ExtLayout: Helpers */
/*****************************************************************************/
Template.ExtLayout.helpers({
	thisYear: function(){
		return new Date().getFullYear();
	},
	adminEmail: function() {
		let tenant = Tenants.findOne({});
		if(tenant && tenant.adminEmail) {
			return tenant.adminEmail;
		}
	}
});

/*****************************************************************************/
/* ExtLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.ExtLayout.onCreated(function () {
});

Template.ExtLayout.onRendered(function () {
});

Template.ExtLayout.onDestroyed(function () {
});
