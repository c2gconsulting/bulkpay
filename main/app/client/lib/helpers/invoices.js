Template.registerHelper("invoiceStatusStyle", function (status) {
    if (status === 'paid') return 'text-success';
    if (status === 'unpaid') return 'text-danger';
});

/**
 * paymentStatusStyle
 * @summary return textStyles for Orders.paymentStatus
 * @param {String} status
 * @return {String} returns textStyle
 */
Template.registerHelper("paymentStatusStyle", function (status) {
    if (status === 'unpaid') return 'text-warning';
    if (status === 'paid') return 'text-success';
});

/**
 * unpaidInvoiceCount  
 */		
Template.registerHelper('unpaidInvoiceCount', function(){
  let unpaidInvoices = Counts.findOne('UNPAID_INVOICES');
  if (unpaidInvoices) return unpaidInvoices.count > 0 ? unpaidInvoices.count : '';
});
