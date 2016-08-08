/**
 * openOrderCount  
 */		
Template.registerHelper('pendingReturnCount', function(){
  let pendingReturns = Counts.findOne('PENDING_RETURNS');
  if (pendingReturns) return pendingReturns.count > 0 ? pendingReturns.count : '';
});


Template.registerHelper("returnStatusStyle", function (status) {
    if (status === 'approved') return 'text-success';
    if (status === 'pending') return 'text-warning';
});
