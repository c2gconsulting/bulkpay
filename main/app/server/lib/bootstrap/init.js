/**
 * Application Startup
 * Core Server Configuration
 */

/**
 * configure bunyan logging module for reaction server
 * See: https://github.com/trentm/node-bunyan#levels
 */
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
const mode = process.env.NODE_ENV || "production";
let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

if (isDebug === true || mode === "development" && isDebug !== false) {
  if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
    isDebug = isDebug.toUpperCase();
  }
  if (!_.contains(levels, isDebug)) {
    isDebug = "WARN";
  }
}

if (process.env.VELOCITY_CI === "1") {
  formatOut = process.stdout;
} else {
  formatOut = logger.format({
    outputMode: "short",
    levelInString: false
  });
}

Core.Log = logger.bunyan.createLogger({
  name: "core",
  stream: isDebug !== "DEBUG" ? formatOut : process.stdout,
  level: "debug"
});

// set logging level
Core.Log.level(isDebug);

/**
 * Core methods (server)
 */

_.extend(Core, {
  init: function () {

    try {
      CoreRegistry.initData();
    } catch (error) {
      Core.Log.error("initData: ", error.message);
    }


    return true;
  },

  initSettings: function () {
    //Meteor.settings.intercom = {
    //  "secret": process.env.INTERCOM_APP_SECRET,
    //  "apikey": process.env.INTERCOM_APIKEY
    //};
    //
    //Meteor.settings.public.intercom = {
    //  "id": process.env.INTERCOM_APP_ID
    //};
    //
    //
    //make env vars available to client
    //allowEnv({
    //    INTERCOM_APP_ID: 1
    //})
    //
    //return true;
  },
  initAccount: function() {
    Accounts.emailTemplates.siteName = process.env.MAIL_SITE_NAME || "BulkPay™";
    Accounts.emailTemplates.from = process.env.MAIL_FROM || "BulkPay™ Team <no-reply@bulkpay.co>";

    Accounts.emailTemplates.enrollAccount.html = function (user, url) {
      console.log('login url as', url);
      let tenantDomain = Core.getCurrentDomain(user._id);
      let baseDomain = Core.getDefaultDomain();
      let tenantUrl = url.replace(baseDomain, tenantDomain);
      SSR.compileTemplate("enrollAccountNotification", Assets.getText("emailTemplates/enrollAccountNotification.html"));
      return SSR.render("enrollAccountNotification", {
              homepage: Meteor.absoluteUrl(),
              tenant: user.group,
              user: user.profile.fullName,
              thisYear: new Date().getFullYear(),
              url: url
            });
    };

    Accounts.config({
      sendVerificationEmail: true
    });
  },
  buildRegExp: function(searchText) {
    // temporary, upgrade
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
  },

  getCurrentTenantCursor: function (userId) {
    if (userId){
      let tenantId = Partitioner.getUserGroup(userId);
      let cursor = Tenants.find({
        _id: tenantId
      });
      if (!cursor.count()) {
        Core.Log.error(`Invalid tenant info for user ${this.userId}`);
      }
      return cursor;
    }
    
  },
  getCurrentTenant: function (userId) {
    let cursor = this.getCurrentTenantCursor(userId);
    let collection = cursor ? cursor.fetch() : [];
    if (collection.length > 0) return collection[0];
  },
  getTenantId: function (checkUserId) {
    let userId = checkUserId || this.userId;
    if (userId) return Partitioner.getUserGroup(userId);
  },
  getCurrentDomain: function (userId) {
    let tenant  = this.getCurrentTenant(userId);
    if (tenant)
      return tenant.domains[0];
  },
  getDefaultTenant: function () {
    let domain = this.getDefaultDomain();
    let cursor = Tenants.find({
      domains: domain
    }, {
      limit: 1
    });
    let collection = cursor ? cursor.fetch() : [];
    if (collection.length > 0) return collection[0];
  },
  getDefaultTenantId: function () {
    let tenant = this.getDefaultTenant();
    if (tenant)
      return tenant._id;
  },
  getDefaultDomain: function () {
    if (Meteor.absoluteUrl()) {
      return Meteor.absoluteUrl().split("/")[2].split(":")[0];
    }
    return "localhost";
  },
  checkUserTenant: function (tenantId, userId) {
    return userId ? tenantId === Partitioner.getUserGroup(userId) : false;
  },
  getApprovalSettings: function(userId) {
    let tenant = this.getCurrentTenant(userId);
    if (tenant && tenant.settings) {
        return tenant.settings.approvals
    }
  },
  getTenantBaseCurrency: function (userId) {
    let tenant = this.getCurrentTenant(userId);
    if (tenant) {
        return tenant.baseCurrency;
    }
  },

  getAllRounding: function(userId){
    let tenant = this.getCurrentTenant(userId);
    if(tenant && tenant.settings){
        return tenant.settings.rounding;
    }
  },
  getPromotionSettings: function(userId) {
    let tenant = this.getCurrentTenant(userId);
    if(tenant && tenant.settings) {
        return tenant.settings.promotions;
    }
  },
  /*
  * Get excluded promotions order types for 
  * @param {String} userId - userId, defaults to Meteor.userId()
  * @return {Array} Array - excluded order types code
  **/
  getExcludedPromotionOrderTypes: function(userId) {
    userId = userId || this.userId;
    let promotionSettings = Core.getPromotionSettings(userId);
    if (promotionSettings){
      return promotionSettings.excludedOrderTypes;
    }
  },

  startWebHooksJobs: function () {
    return webHookJobs.startJobServer();
  }

  /*,
  configureMailUrl: function (user, password, host, port) {
    let tenantMail = Packages.findOne({
      tenantId: this.getTenantId(),
      name: "core"
    }).settings.mail;
    let processUrl = process.env.MAIL_URL;
    let settingsUrl = Meteor.settings.MAIL_URL;
    if (user && password && host && port) {
      let mailString = `smtp://${user}:${password}@${host}:${port}/`;
      mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (tenantMail.user && tenantMail.password && tenantMail.host &&
      tenantMail.port) {
      Core.Log.info("setting default mail url to: " + tenantMail
        .host);
      let mailString =
        'smtp://${tenantMail.user}:${tenantMail.password}@${tenantMail.host}:${tenantMail.port}/';
      let mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (settingsUrl && !processUrl) {
      let mailUrl = processUrl = settingsUrl;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    }
    if (!process.env.MAIL_URL) {
      Core.Log.warn(
        "Mail server not configured. Unable to send email.");
      return false;
    }
  }*/
});

// Method Check Helper
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};

/*
 * Execute start up data load
 */

Meteor.startup(function () {
  Core.initSettings();
  Core.initAccount(); 
  Core.init();
  Core.startWebHooksJobs()
});
