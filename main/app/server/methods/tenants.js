/**
 * Tenant Methods
 */
Meteor.methods({
  /**
   * tenant/createTenant
   * @param {String} tenantAdminUserId - optionally create tenant for provided userId
   * @param {Object} tenant - optionally provide tenant object to customize
   * @return {String} return tenantId
   */
  "tenant/createTenant": function (tenantAdminUserId, tenant) {
    check(tenantAdminUserId, Match.Optional(String));
    check(tenant, Match.Optional(Object));
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    // must have owner access to create new tenants
    if (!Core.hasOwnerAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    let currentUser = Meteor.userId();
    let userId = tenantAdminUserId || Meteor.userId();
    let adminRoles = Roles.getRolesForUser(currentUser, Core.getTenantId());

    try {
      let tenantId = Factory.create("tenant")._id;
      Core.Log.info("Created tenant: ", tenantId);
      Roles.addUsersToRoles([currentUser, userId], adminRoles, tenantId);
      return tenantId;
    } catch (error) {
      return Core.Log.error("Failed to tenant/createTenant", error);
    }
  },

  /**
   * tenant/checkDomainExists
   * @param {String} domain - fully qualified domain name for the tenant
   * @return {Boolean} return true/false for tenant exists
   */
  "tenant/checkDomainExists": function (domain) {
    let tenant = Tenants.findOne({
      domains: domain
    });
    if (tenant) {
      return true;
    } else {
      console.log('No tenant for: ' + domain);
      return false;
    }

  },

  /**
   * tenant/getLocale
   * @summary determine user's countryCode and return locale object
   * determine local currency and conversion rate from tenant currency
   * @return {Object} returns user location and locale
   */
  "tenant/getLocale": function () {
    this.unblock();
    let exchangeRate;
    let clientAddress;
    let geo = new GeoCoder();
    let result = {};
    let defaultCountryCode = "NG";
    let localeCurrency = "NGN";
    // if called from server, ip won't be defined.
    if (this.connection !== null) {
      clientAddress = this.connection.clientAddress;
    } else {
      clientAddress = "127.0.0.1";
    }

    // get tenant locale/currency related data
    let tenant = Tenants.findOne(Core.getTenantId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });

    if (!tenant) {
      throw new Meteor.Error(
          "Failed to find tenant data. Unable to determine locale.");
    }
    // cofigure default defaultCountryCode
    // fallback to tenant settings
    if (tenant.addressBook) {
      if (tenant.addressBook.length >= 1) {
        if (tenant.addressBook[0].country) {
          defaultCountryCode = tenant.addressBook[0].country;
        }
      }
    }

    // countryCode either from geo or defaults
    let countryCode = defaultCountryCode.toUpperCase();

    // get currency rates
    result.currency = {};
    result.locale = tenant.locales.countries[countryCode];

    // check if locale has a currency defined
    if (result.locale) {
      if (result.locale.currency) {
        localeCurrency = result.locale.currency.split(",");
      }
    }

    // localeCurrency is an array of allowed currencies
    _.each(localeCurrency, function (currency) {
      if (tenant.currencies[currency]) {
        result.currency = tenant.currencies[currency];
        // only fetch rates if locale and tenant currency are not equal
        // if tenant.curency = locale currency the rate is 1
        if (tenant.currency !== currency) {
          result.currency.exchangeRate = Meteor.call(
              "tenant/getCurrencyRates", currency);

          if (!exchangeRate) {
            Core.Log.warn(
                "Failed to fetch rate exchange rates.");
          }
          result.currency.exchangeRate = exchangeRate.data;
        }
      }
    });
    // should contain rates, locale, currency
    return result;
  },

  /**
   * tenant/getCurrencyRates
   * @summary determine user's full location for autopopulating addresses
   * usage: Meteor.call("tenant/getCurrencyRates","USD")
   * @param {String} currency code
   * @return {Number} currency conversion rate
   */
  "tenant/getCurrencyRates": function (currency) {
    check(currency, String);
    this.unblock();

    let tenant = Tenants.findOne(Core.getTenantId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });

    let baseCurrency = tenant.currency || "USD";
    let tenantCurrencies = tenant.currencies;
    let tenantId = Core.getTenantId();

    // fetch tenant settings for api auth credentials
    let tenantSettings = Packages.findOne({
      tenantId: tenantId,
      name: "core"
    }, {
      fields: {
        settings: 1
      }
    });

    // tenant open exchange rates appId
    let openexchangeratesAppId = tenantSettings.settings.openexchangerates.appId;

    // update Tenants.currencies[currencyKey].rate
    // with current rates from Open Exchange Rates
    // warn if we don't have app_id, but default to 1
    if (!openexchangeratesAppId) {
      Core.Log.warn(
          "Open Exchange Rates AppId not configured. Configure for current rates."
      );
    } else {
      // we'll update all the available rates in Tenants.currencies whenever we get a rate request, using base currency
      let rateUrl =
          `https://openexchangerates.org/api/latest.json?base=${baseCurrency}&app_id=${openexchangeratesAppId}`;
      let rateResults = HTTP.get(rateUrl);
      let exchangeRates = rateResults.data.rates;

      _.each(tenantCurrencies, function (currencyConfig, currencyKey) {
        if (exchangeRates[currencyKey] !== undefined) {
          let rateUpdate = {};
          let collectionKey = `currencies.${currencyKey}.rate`;
          rateUpdate[collectionKey] = exchangeRates[currencyKey];
          Tenants.update(tenantId, {
            $set: rateUpdate
          });
        }
      });
      // return just the rate requested.
      return exchangeRates[currency];
    }
    // default conversion rate 1 to 1
    return 1;
  },

  /**
   * tenant/locateAddress
   * @summary determine user's full location for autopopulating addresses
   * @param {Number} latitude - latitude
   * @param {Number} longitude - longitude
   * @return {Object} returns address
   */
  "tenant/locateAddress": function (latitude, longitude) {
    check(latitude, Match.Optional(Number));
    check(longitude, Match.Optional(Number));
    let clientAddress;
    this.unblock();

    // if called from server, ip won't be defined.
    if (this.connection !== null) {
      clientAddress = this.connection.clientAddress;
    } else {
      clientAddress = "127.0.0.1";
    }

    // begin actual address lookups
    if (latitude !== null && longitude !== null) {
      let geo = new GeoCoder();
      return geo.reverse(latitude, longitude);
    }
    // geocode reverse ip lookup
    let geo = new GeoCoder();
    return geo.geoip(clientAddress);
  },

  /**
   * tenant/updateHeaderTags
   * @summary method to insert or update tag with hierarchy
   * @param {String} tagName will insert, tagName + tagId will update existing
   * @param {String} tagId - tagId to update
   * @param {String} currentTagId - currentTagId will update related/hierarchy
   * @return {Boolean} return true/false after insert
   */
  "tenant/updateHeaderTags": function (tagName, tagId, currentTagId) {
    check(tagName, String);
    check(tagId, Match.OneOf(String, null, void 0));
    check(currentTagId, Match.Optional(String));

    let newTagId;
    // must have 'core' permissions
    if (!Core.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let newTag = {
      slug: getSlug(tagName),
      name: tagName
    };

    let existingTag = Tags.findOne({
      name: tagName
    });

    if (tagId) {
      return Tags.update(tagId, {
        $set: newTag
      }, function () {
        Core.Log.info(
            `Changed name of tag ${tagId} to ${tagName}`);
        return true;
      });
    } else if (existingTag) {
      // if is currentTag
      if (currentTagId) {
        return Tags.update(currentTagId, {
          $addToSet: {
            relatedTagIds: existingTag._id
          }
        }, function () {
          Core.Log.info(
              `Added tag ${existingTag.name} to the related tags list for tag ${currentTagId}`
          );
          return true;
        });
      }
      // update existing tag
      return Tags.update(existingTag._id, {
        $set: {
          isTopLevel: true
        }
      }, function () {
        Core.Log.info('Marked tag "' + existingTag.name +
            '" as a top level tag');
        return true;
      });
    }
    // create newTags
    newTag.isTopLevel = !currentTagId;
    newTag.tenantId = Core.getTenantId();
    newTag.updatedAt = new Date();
    newTag.createdAt = new Date();
    newTagId = Tags.insert(newTag);
    if (currentTagId) {
      return Tags.update(currentTagId, {
        $addToSet: {
          relatedTagIds: newTagId
        }
      }, function () {
        Core.Log.info('Added tag "' + newTag.name +
            '" to the related tags list for tag ' + currentTagId);
        return true;
      });
    } else if (newTagId && !currentTagId) {
      Core.Log.info('Created tag "' + newTag.name + '"');
      return true;
    }
    throw new Meteor.Error(403, "Failed to update header tags.");
  },

  /**
   * tenant/removeHeaderTag
   * @param {String} tagId - method to remove tag navigation tags
   * @param {String} currentTagId - currentTagId
   * @return {String} returns remove result
   */
  "tenant/removeHeaderTag": function (tagId, currentTagId) {
    check(tagId, String);
    check(currentTagId, String);
    // must have core permissions
    if (!Core.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    // remove from related tag use
    Tags.update(currentTagId, {
      $pull: {
        relatedTagIds: tagId
      }
    });
    // check to see if tag is in use.
    let productCount = Products.find({
      hashtags: {
        $in: [tagId]
      }
    }).count();
    // check to see if in use as a related tag
    let relatedTagsCount = Tags.find({
      relatedTagIds: {
        $in: [tagId]
      }
    }).count();
    // not in use anywhere, delete it
    if (productCount === 0 && relatedTagsCount === 0) {
      return Tags.remove(tagId);
    }
    // unable to delete anything
    throw new Meteor.Error(403, "Unable to delete tags that are in use.");
  },

  /**
   * flushTranslations
   * @summary Helper method to remove all translations, and reload from jsonFiles
   * @return {undefined}
   */
  "flushTranslations": function () {
    if (!Core.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    Translations.remove({});
    Fixtures.loadI18n();
    Core.Log.info(Meteor.userId() + " Flushed Translations.");
    return;
  }
});