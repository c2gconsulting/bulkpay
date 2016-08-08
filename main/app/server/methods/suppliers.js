/*****************************************************************************/
/*  Server Methods */
/*****************************************************************************/

Meteor.methods({
  /**
   * supplier/createSupplier
   * @summary when we create a new supplier attach all the necessary fields
   * @param {Object} supplier - optional product object
   * @return {Object} return insert result
   */
  "suppliers/createSupplier": function (supplier) {

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();

    try {
      check(supplier, Core.Schemas.Supplier);
    } catch (e) {
      throw new Meteor.Error(401, "There's invalid data in your supplier. Please correct and retry");
    }

    this.unblock();

    let supplierId = Suppliers.insert(supplier);
    let newSupplier = Suppliers.findOne(supplierId);
    
    /*
     * TODO
     *
     *  Add functionality for sending newly created supplier to the admin
     *  micro-service pending approval by an authorized personnel
     *
     * */


    return {
      _id: supplierId,
      supplierNumber: newSupplier.supplierNumber
    };
  },

  /**
   * suppliers/updateSupplier
   * @summary customer update
   * @param {Object} supplier - supplier object
   * @param {Object} supplierId - id of supplier to be updated
   * @return {Boolean} return insert result
   */
  "suppliers/updateSupplier": function (supplier, supplierId) {

    if (!Meteor.userId()) {
      throw new Meteor.Error(404, "Unauthorized");
    }

    try {
      check(supplier, Core.Schemas.Supplier);
      check(supplierId, String);
    } catch (e) {
      throw new Meteor.Error(401, "There's invalid data in your supplier. Please correct and retry");
    }

    this.unblock();

    let currentSupplier = Suppliers.findOne(supplierId);
    if (currentSupplier) {
      delete supplier.createdAt;
      Suppliers.update({_id: currentCustomer._id}, {$set: supplier});
      return true
    } else {
      throw new Meteor.Error(404, "Supplier Not found");
    }
  },

  /**
   * suppliers/deleteSupplier
   * @summary delete a supplier
   * @param {String} supplierId - supplierId to delete
   * @returns {Boolean} returns delete result
   */
  "supplier/deleteSupplier": function (supplierId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(supplierId, String);
    this.unblock();

    let numRemoved = Suppliers.remove(supplierId);
    if (numRemoved > 0) {
      return true;
    }
    // return false if unable to delete
    return false;
  },

  /**
   * companies/getSuppliers
   * @summary returns suppliers that fit search criteria
   * @param {String} searchText - text to search for
   * @param {Object} options - proposed query projections
   * @returns {Collection} returns collection of found items
   */
  "suppliers/getSuppliers": function (searchText, options) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(searchText, String);

    this.unblock();

    options = options || {};
    options.limit = 10;
    options.fields = {
      "name": 1,
      "description": 1,
      "supplierNumber": 1
    };
    options.sort = { name: 1 };

    if(searchText && searchText.length > 0) {
      var regExp = Core.buildRegExp(searchText);
      var selector = { $and: [
        { blocked: { $ne: true }},
        { $or: [
          {customerNumber: regExp},
          {name: regExp},
          {originCustomerId: regExp},
          {title: regExp},
          {email: regExp},
          {url: regExp},
          {searchTerms: regExp},
          {'addressBook.fullName': regExp},
          {'addressBook.company': regExp},
          {'addressBook.address1': regExp},
          {'addressBook.address2': regExp},
          {'addressBook.state': regExp}
        ]}
      ]};
      return Suppliers.find(selector, options).fetch();
    }
  }
});




