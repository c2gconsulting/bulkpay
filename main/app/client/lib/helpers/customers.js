/**
 * customerInfo
 */
Template.registerHelper('customerInfo', function(customerId, field){
  if (!_.isString(field)) field = 'name'; // return customer name if no field specified
  let customer = Customers.findOne(customerId);
  if (customer) return customer[field];
});

/**
 * customerAccountMoney
 */
Template.registerHelper('customerAccountMoney', function(customerId, field){
  if (!_.isString(field)) field = 'availableBalance'; // return customer availableBalance if no field specified
  let customer = Customers.findOne(customerId);
  if (customer && _.isNumber(customer['account'][field])) {
    let amount = customer['account'][field];
    let formattedAmount = Core.numberWithCommas(amount); 
    return formattedAmount;
  }
});

Template.registerHelper('pendingDistributorsCount', function(){
  let pendingDistributors = Counts.findOne('PENDING_CUSTOMERS');
  if (pendingDistributors) return pendingDistributors.count > 0 ? pendingDistributors.count : '';
});

Template.registerHelper('totalCustomerCount', function(){
  let totalCustomers = Counts.findOne('TOTAL_CUSTOMERS');
  if (totalCustomers) return totalCustomers.count;
});

/**
 * customerAddresses  
 */		
Template.registerHelper('customerAddresses', function(id){
  let customer = Customers.findOne(id); 
  if (customer) return customer.addressBook; 
});

Template.registerHelper('formattedAddresses', function(address){
  if (address){
    if (address.company && address.address1 && address.country && address.state && address.city){
      return address.company + "<br/>" + address.address1 + "<br/>" + address.city + ", " + address.state +", " + address.country
    } else if (address.company && address.address1 && address.country){
      return address.company + "<br/>" + address.address1 + "<br/>" + address.country
    } else if (address.company && address.address1){
      return address.company + "<br/>" + address.address1
    } else if (address.company){
      return address.company
    } else {
      return ""
    }
  }
});

Template.registerHelper('truncate', function(text, options){
  let limit = options.hash.limit || 46;
  let omitter = options.hash.omitter || "..."
  if (text && text.length > limit){
    text = text.substr(0, limit - 3) + omitter;
  }
  return text;
});