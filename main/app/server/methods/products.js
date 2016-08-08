/**
 *  Variant Methods
 */
Meteor.methods({
  /**
   * products/getVariants
   * @summary returns variants that fit search criteria
   * @param {String} searchText - text to search for
   * @param {String} locationId - location to return qty for
   * @param {Number} priceListCode - price list to return pricing for
   * @param {Object} options - proposed query projections
   * @returns {Collection} returns collection of found items
   */
  "products/getVariants": function (searchText, locationId, priceListCodes, options) {
    check(searchText, String);
    check(locationId, String);
    priceListCodes = priceListCodes || [];
    
    this.unblock();
    
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    
    options = options || {};
    options.limit = 10;
    options.fields = {
                      locations: {
                        $elemMatch: { 'locationId': locationId }
                      },
                      variantPrices: {
                        $elemMatch: { 'priceListCode': { $in: priceListCodes }}
                      }
                    };
     
    if(searchText && searchText.length > 0) {
      var regExp = Core.buildRegExp(searchText);
      var selector = { $and: [
        { blocked: { $ne: true }},
        { sellable: { $ne: false }},
        {$or: [
          {code: regExp},
          {name: regExp},
          {upc: regExp},
          {supplierCode: regExp},
          {description: regExp}
        ]}
      ]};

      return ProductVariants.find(selector, options).fetch();
       
    } 
   
  },

  /**
   * products/getVariants
   * @summary returns variants that fit search criteria
   * @param {String} searchText - text to search for
   * @param {String} locationId - location to return qty for
   * @param {String} locationId - location to return qty for
   * @param {Number} supplierId - Id of the supplier
   * @param {Object} options - proposed query projections
   * @returns {Collection} returns collection of found items
   */
  "products/getSupplierVariants": function (supplierId, searchText, locationId, priceListCodes, options) {
    console.log(arguments)
    check(searchText, String);
    check(locationId, String);
    priceListCodes = priceListCodes || [];

    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    let supplier = Companies.findOne(supplierId);
    let variants = [];
    
    options = options || {};
    options.limit = 10;
    options.fields = {
      locations: {
        $elemMatch: { 'locationId': locationId }
      },
      variantPrices: {
        $elemMatch: { 'priceListCode': { $in: priceListCodes }}
      }
    };

    if(searchText && searchText.length > 0) {
      var regExp = Core.buildRegExp(searchText);
      var selector = { $and: [
        { blocked: { $ne: true }},
        { sellable: { $ne: false }},
        {$or: [
          {code: regExp},
          {name: regExp},
          {upc: regExp},
          {supplierCode: regExp},
          {description: regExp}
        ]}
      ]};
      if (supplier){
        Partitioner.bindGroup(supplier.tenantId, function(){
         variants = ProductVariants.find(selector, options).fetch();
        }) 
      }
    }
    
    return variants

  },


  /**
   * products/getVariants
   * @summary returns variants that fit search criteria
   * @param {String} searchText - text to search for
   * @param {Object} options - proposed query projections
   * @returns {Collection} returns collection of found items
   */
  "products/getAllVariants": function (searchText, options) {
    check(searchText, String);

    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    options = options || {};
    options.limit = 10;
    options.sort = { name: 1 };

    if(searchText && searchText.length > 0) {
      var regExp = Core.buildRegExp(searchText);
      var selector =
      {$or: [
        {code: regExp},
        {name: regExp},
        {upc: regExp},
        {supplierCode: regExp},
        {description: regExp}
      ]};

      return ProductVariants.find(selector, options).fetch();

    }

  }
}); 

  
