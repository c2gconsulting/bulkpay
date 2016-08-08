/**
 *  Promotions Methods
 */
Meteor.methods({
    /**
     * companies/getCompanies
     * @summary returns companies that fit search criteria
     * @param {String} searchText - text to search for
     * @param {Object} options - proposed query projections
     * @returns {Collection} returns collection of found items
     */
    "companies/getCompanies": function (searchText, options) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(searchText, String);

        this.unblock();

        options = options || {};
        options.limit = 10;
        options.fields = {
            "name": 1,
            "description": 1
            // "customerNumber": 1
        };
        options.sort = { name: 1 };

        if(searchText && searchText.length > 0) {
            var regExp = Core.buildRegExp(searchText);
            var selector = { $and: [
                { blocked: { $ne: true }}, {customerType: 'supplier'},
                { $or: [
                    // {customerNumber: regExp},
                    {name: regExp},
                    {description: regExp},
                    // {originCustomerId: regExp},
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
            return Companies.find(selector, options).fetch();
        }
    },

    /**
     * companies/getSingleCompany
     * @summary returns single company
     * @param {String} companyId - id of company to search
     * @returns {Object} returns found company document
     */
    "companies/getSingleCompany": function (companyId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(companyId, String);
        this.unblock();
        return Companies.findOne({_id: companyId});
    }

});

