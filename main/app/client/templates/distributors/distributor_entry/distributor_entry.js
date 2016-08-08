/*****************************************************************************/
/* OrderEntry: Event Handlers */
/*****************************************************************************/
Template.DistributorEntry.events({
	'click .distributor-entry': function(e, tmpl) {
		Router.go('distributors.detail', {_id: this._id});
	}
});

/*****************************************************************************/
/* OrderEntry: Helpers */
/*****************************************************************************/
Template.DistributorEntry.helpers({
	prettyStatus: function() {
		return s.capitalize(this.status);
	},
	textStyle: function() {
		if (this.status === 'accepted') return 'text-info';
		if (this.status === 'active') return 'text-success';
		if (this.status === 'cancelled') return 'text-danger';
	},
	prettyCreatedAt: function() {
		return moment(this.createdAt).format('DD/MM/YYYY');
	},
	activeBillingAddress: function(){
	  return currentBillingAddress(this.addressBook);
	},
	group: function(){
		return CustomerGroups.findOne({code: this.groupCode})
	}
});

