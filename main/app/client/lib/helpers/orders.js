/**
 * orderStatusStyle
 * @summary return textStyles for Orders.status
 * @param {String} status
 * @return {String} returns textStyle
 */
Template.registerHelper("orderStatusStyle", function (status) {
	if (status === 'open') return 'text-warning';
	if (status === 'accepted') return 'text-info';
	if (status === 'shipped') return 'text-success';
	if (status === 'cancelled') return 'text-danger';
});

/**
 * purchaseOrderStatusStyle
 * @summary return textStyles for Orders.status
 * @param {String} status
 * @return {String} returns textStyle
 */
Template.registerHelper("purchaseOrderStatusStyle", function (status) {
	if (status === 'open') return 'text-warning';
	if (status === 'received') return 'text-info';
});

/**
 * paymentStatusStyle
 * @summary return textStyles for Orders.paymentStatus
 * @param {String} status
 * @return {String} returns textStyle
 */
Template.registerHelper("paymentStatusStyle", function (status) {
  	if (status === 'unpaid') return 'text-danger';
	if (status === 'paid') return 'text-success';
	if (status === 'partial') return 'text-warning';
});


/**
 * approvalStatusStyle
 * @summary return textStyles for Orders.approvalStatus
 * @param {String} status
 * @return {String} returns textStyle
 */
Template.registerHelper("approvalStatusStyle", function (status) {
	if (status === 'pending') return 'text-danger';
	if (status === 'approved') return 'text-success';
	if (status === 'rejected') return 'text-warning';
});


/**
 * openOrderCount
 */
Template.registerHelper('openOrderCount', function(){
  let openOrders = Counts.findOne('OPEN_ORDERS');
  if (openOrders) return openOrders.count > 0 ? openOrders.count : '';
});

/**
 * totalOrderCount
 */
Template.registerHelper('totalOrderCount', function(){
  let totalOrders = Counts.findOne('TOTAL_ORDERS');
  if (totalOrders) return totalOrders.count;
});

/**
 * pickupMessage
 */
Template.registerHelper('pickupMessage', function(isPickup){
  if (isPickup) return 'Items will be picked up';
  return 'Items will be delivered';
});

/**
 * orderTypes
 */
Template.registerHelper('orderTypes', function(){
  return OrderTypes.find().fetch();
});

/**
 * registerHelper printLocation
 */
Template.registerHelper('printLocation', function(locationId) {
    try {
			let theLocation = Locations.findOne({_id: locationId}).name;
			return theLocation ? theLocation : 'Unspecified';
		} catch (e) {
			return 'Unspecified';
		}
});

/**
 * registerHelper printOrderType
 */
Template.registerHelper('printOrderType', function(orderTypeCode) {
    try {
			let theOrderType = OrderTypes.findOne({code: orderTypeCode}).name;
			return theOrderType ? theOrderType : 'Standard';
		} catch (e) {
			return 'Standard';
		}
});



/**
 * locations
 */
Template.registerHelper('locations', function(){
  return Locations.find({}, {sort: {name: 1}}).fetch();
});

/**
 * locations
 */
Template.registerHelper('editableLocations', function(){
	let groups = Core.getAuthorizedGroups(Meteor.userId(), Core.Permissions.ORDERS_MANAGE);
	if (!groups) return;

	let selector = {};
	if (_.isArray(groups)) selector = { _id: { $in: groups }};
  	return Locations.find(selector, {sort: {name: 1}}).fetch();
});
