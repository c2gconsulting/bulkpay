/**
 * CustomerGroup Schema
 * CustomerGroups is a customer classification dimension
 */
Core.Schemas.CustomerGroup = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String
    },
    code: {
      type: String,
      autoValue: function () {
          let originGroupCode = this.field('originGroupCode').value;
          if (originGroupCode) {
            return originGroupCode
          } else {
            return this.field('code').value;
              /*if (this.isInsert || this.isUpsert) {
                  let customerGroup = CustomerGroups.findOne({}, {
                      sort: {
                          code: -1
                      }
                  });
                  let newCode = customerGroup ? Number(customerGroup.code) + 10 : 10;
                  if (this.isInsert) {
                      return newCode;
                  } else {
                      return {
                          $setOnInsert: newCode
                      };
                  }
              }*/
          }
      },
      denyUpdate: true
    },
    isPickupDefault: {
      type: Boolean,
      defaultValue: true,
      optional: true
    },
    originGroupCode: {
        type: String,
        optional: true
    }
});

/**
 * Customer Account Schema
 * records of customer account updates -> credit limit, debit amount, credit amount, balance, rebates, d createdDate
 */
Core.Schemas.CustomerAccount = new SimpleSchema({
  currentBalance: {
      type: Number,
      label: "Current Balance",
      decimal: true,
      optional: true
  },
  currentDeposits: {
      type: Number,
      min: 0,
      label: "Current Deposits",
      decimal: true,
      optional: true
  },
  currentRebates: {
      type: Number,
      min: 0,
      label: "Current Rebates",
      decimal: true,
      optional: true
  },
  creditAmount: {
      type: Number,
      min: 0,
      label: "Credit Amount",
      decimal: true,
      optional: true
  },
  debitAmount: {
      type: Number,
      min: 0,
      label: "Debit Amount",
      decimal: true,
      optional: true
  },
  valueDate: {
    type: Date,
    optional: true,
      autoValue: function () {
          if (this.isSet){
              return new Date(this.value)
          } else {
              return new Date
          }
      }
  },
  remainingCreditLimit: {
    type: Number,
    min: 0,
    label: "Remaining credit limit",
    decimal: true,
    optional: true
  }
});



/**
 * Customer Company Schema
 * holds customer company details
 */
Core.Schemas.CustomerCompany = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    optional: true
  },
  address: {
    type: String,
    label: "Address",
    optional: true
  },
  phone: {
    type: String,
    label: "Phone",
    optional: true
  }
});



/**
 * Customers Schema
 */
Core.Schemas.Customer = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    defaultValue: "active",
    optional: true
  },
  customerNumber: {
    type: String,
    index: 1,
    autoValue: Core.schemaCustomerNextSeqNumber,
    optional: true, // to enable pre-validation
    denyUpdate: true
  },
  originCustomerId: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    label: "Name",
    index: 1
  },
  description: {
    type: String,
    optional: true
  },
  title: {
    type: String,
    label: "Title",
    optional: true
  },
  addressBook: {
    type: [Core.Schemas.Address],
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phone: {
    type: String,
    optional: true
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  groupCode: {
    type: String,
    optional: true
  },
  customerGroup: {
    type: String,
    index: 1,
    autoValue: function() {
      if (this.field('groupCode').isSet) {
        let customerGroup = CustomerGroups.findOne({ code: this.field('groupCode').value });
        if (customerGroup) {
          return customerGroup.name;
        }
      }
    },
    optional: true
  },
  customerType: {
    type: String,
    allowedValues: ["distributor", "wholesaler", "retailer", "consumer"],
    defaultValue: "distributor",
    optional: true
  },
  locale: {
    type: String,
    defaultValue: "en"
  },
  timezone: {
    type: String,
    optional: true
  },
  history: {
    type: [Core.Schemas.History],
    optional: true
  },
  company: {
    type: Core.Schemas.CustomerCompany,
    optional: true
  },
  account: {
    type: Core.Schemas.CustomerAccount,
    optional: true
  },
  accountUpdatedAt: {
    type: Date,
    autoValue: function () {
      if (this.field('account').isSet) {
        return new Date;
      }
    },
    optional: true
  },
  accountHistory: {
    type: [Object],
    optional: true,
    autoValue: function() {
      let account = this.field('account');
      if (account.isSet) {
        if (this.isInsert) {
          return [{
            createdAt: new Date(),
            account: account.value
          }];
        } else {
          return {
            $push: {
              createdAt: new Date(),
              account: account.value
            }
          };
        }
      }
    }
  },
  'accountHistory.$.createdAt': {
    type: Date,
    optional: true
  },
  'accountHistory.$.account': {
    type: Core.Schemas.CustomerAccount,
    optional: true
  },
  currency: {
        type: Object
  },
  "currency.iso": {
       type: String
  },
  "currency.symbol": {
        type: String,
        optional: true
  },
  direct: { // Direct customer, key for 2nd and 3rd tier extensions
    type: Boolean,
    defaultValue: true
  },
  blocked: {
    type: Boolean,
    defaultValue: false
  },
  defaultDiscountRate: {
    type: Number,
    decimal: true,
    optional: true
  },
  defaultPriceListCode: {
    type: String,
    optional: true
  },
  defaultPaymentTerm: {
    type: String,
    optional: true
  },
  defaultSalesLocationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  defaultAssigneeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  defaultTaxRate: {
    type: Number,
    decimal: true,
    optional: true
  },
  creditLimit: {
    type: Number,
    min: 0,
    label: "Credit Limit",
    decimal: true,
    optional: true
  },
  creditTerms: {
    type: String,
    min: 0,
    label: "Credit Terms",
    optional: true
  },
  searchTerms: {
    type: String,
    optional: true
  },
  createdBy: {
    type: String,
    autoValue: function () {
        let userId = this.value || this.userId;
        if (this.isInsert) {
            return  userId;
        } else if (this.isUpsert) {
            return {
                $setOnInsert: userId
            };
        }
    },
    denyUpdate: true,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      } else {
        this.unset();
      }
    },
    denyUpdate: true,
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date;
      }
    },
    optional: true
  },
  companyId: {
    type: String,
    optional: true
  }
});


