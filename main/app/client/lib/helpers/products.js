/**
 * variantInfo
 */
Template.registerHelper('variantInfo', function(variantId, field){
  if (!_.isString(field)) field = 'name'; // return variant name if no field specified
  let productVariant = ProductVariants.findOne(variantId);
  if (productVariant) return productVariant[field];
});

/**
 * variant Available Quantity
 */
Template.registerHelper('variantStockInfo', function(variantId, locationId){
  let productVariant = ProductVariants.findOne(variantId);
  if (productVariant){
    let location = _.find(productVariant.locations, function(location) {return location.locationId === locationId})
    if (location){
      return location.stockOnHand
    } else {
      return 0
    }
  }
});

/**
 * priceLists
 */
Template.registerHelper('priceLists', function(){
  return PriceListGroups.find();
});

/**
 * printPriceList
 */
Template.registerHelper('printPriceList', function(code){
  let pl = PriceListGroups.findOne({ 'code': code});
  if (pl) return pl.name;
});