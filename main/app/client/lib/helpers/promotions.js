/**
 * orderStatusStyle
 * @summary return textStyles for Orders.status
 * @param {String} status
 * @return {String} returns textStyle
 */
Template.registerHelper("promotionStatusStyle", function (status) {
	if (status === 'suspended') {
		return 'text-warning';
	} else if (status === 'pending') {
		return 'small';
	}  else if (status === 'active') {
		return 'text-success';
	} else if (status === 'ended') {
		return 'text-danger';
	}
});
