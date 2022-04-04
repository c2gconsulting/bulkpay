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


// import axios from 'axios'

// let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

// const winston = require("winston");
// const logger = winston.createLogger({
//   level: "warn",
//   format: winston.format.json(),
//   defaultMeta: { service: "user-service" },
//   transports: [
//     //
//     // - Write to all logs with level `info` and below to `combined.log`
//     // - Write all logs error (and below) to `error.log`.
//     //
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     }),
//   ],
// });

// Core.Log = logger;

Core.PowerQueue = { add: () => {}, run: () => { }}
// new PowerQueue({ 
//   isPaused: true,
//   onEnded: () => { 
//     console.log(`Queue event processing done!`) 
//   }
// });

// // set logging level
// Core.Log.level(isDebug);

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
    
    // Commented this to help ensure employees with same email are not inserted
    // Meteor.users._dropIndex("emails.address_1");
    Meteor.users._ensureIndex({"emails.address":1}, {unique:true});

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
    Accounts.emailTemplates.siteName = process.env.MAIL_SITE_NAME || "OILSERV TRIPS™";
    Accounts.emailTemplates.from = process.env.MAIL_FROM || "OILSERV TRIPS™ Team <no-reply@bulkpay.co>";

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

    Accounts.urls.resetPassword = function(token) {
      return Meteor.absoluteUrl('resetPassword/' + token);
    };
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
        console.log(`tenantId: `, tenantId)
        Core.Log.error(`Invalid tenant info for user ${this.userId}`);
        console.log(`userId: `, userId)
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
  },

  fixPartitionProblems: function() {
    let allUsers = Meteor.users.find({}).fetch() || []

    let firstStepOfUsersWithoutGroup = 0
    let secondStepOfUsersWithoutGroup = 0

    Partitioner.directOperation(() => {
      allUsers.forEach(aUser => {
        if(aUser.group) {
          if(!Partitioner.getUserGroup(aUser._id)) {
            Partitioner.setUserGroup(aUser._id, aUser.group);
          }
        } else {
          console.log(`user has no group. User _id: `, aUser._id)
          firstStepOfUsersWithoutGroup += 1

          if(aUser.businessIds && aUser.businessIds[0]) {
            let businessUnit = BusinessUnits.findOne(aUser.businessIds[0])
            if(businessUnit) {
              if(businessUnit._groupId) {
                Meteor.users.update({_id: aUser._id}, {$set: {
                  group: businessUnit._groupId
                }})
                Partitioner.setUserGroup(aUser._id, businessUnit._groupId);
              } else {
                secondStepOfUsersWithoutGroup += 1
              }
            }
          }
        }
      })
    })

    console.log(`firstStepOfUsersWithoutGroup: `, firstStepOfUsersWithoutGroup)
    console.log(`secondStepOfUsersWithoutGroup: `, secondStepOfUsersWithoutGroup)    
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
  // console.log('Assets.getText("data/locations.json")', Assets.getText("data/entityObject.json"))
  SyncedCron.start();
  if (Meteor.isServer) {
    // Import EMPLOYEES, COST CENTERS, AND PROJECTS
    if (process.env.IMPORT_OILSERV_DATA !== 'false') {
      console.log('SEEDING DATA')
      Core.apiClient("employees", Loader.loadEmployeeData, () => {
        Core.apiClient("costcenters", Loader.loadCostCenterData, () => {
          Core.apiClient("projects", Loader.loadProjectData, () => {})
        })
      })
    }

    // Import Employees, Cost centers, and projects
    // console.log('process.env.IMPORT_EMPLOYEE_OILSERV_DATA', typeof process.env.IMPORT_EMPLOYEE_OILSERV_DATA)
    // if (process.env.IMPORT_EMPLOYEE_OILSERV_DATA) {
    // Core.apiClient("employees", Loader.loadEmployeeData, () => {})
    // }

    const MAIL_URL = process.env.MAIL_URL.split('@smtp');
    if (!MAIL_URL) return
    const [username_pass, smtp_url] = MAIL_URL;
    const [username, pass] = username_pass.split('com:');
    const NEW_MAIL_URL = `${username}com:${encodeURIComponent(pass)}@smtp${smtp_url}`;
    process.env.MAIL_URL = NEW_MAIL_URL

    console.log('process.env.MAIL_URL', process.env.MAIL_URL)
    console.log('process.env.IMPORT_OILSERV_DATA', process.env.IMPORT_OILSERV_DATA)
    console.log('process.env.OILSERV_SAP_INTEGRATION_URL', process.env.OILSERV_SAP_INTEGRATION_URL);
    console.log('process.env.OILSERV_SAP_INTEGRATION_COOKIE_API_KEY', process.env.OILSERV_SAP_INTEGRATION_COOKIE_API_KEY);
    console.log('process.env.OILSERV_SAP_INTEGRATION_AUTH_KEY', process.env.OILSERV_SAP_INTEGRATION_AUTH_KEY);
  }
  // Core.fixPartitionProblems();
});
