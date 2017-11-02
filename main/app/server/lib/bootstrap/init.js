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
  },

  sendProcurementRequisitionNeedsTreatment: function(supervisorFullName, supervisorEmail, createdByFullName, 
    description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
    // console.log(`arguments: `, arguments)
    try {
        SSR.compileTemplate("procurementRequisitionNotificationForTreatment", Assets.getText("emailTemplates/procurementRequisitionNotificationForTreatment.html"));
        
        Email.send({
            to: supervisorEmail,
            from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
            subject: "Procurement Requisition approved and needs to be treated",
            html: SSR.render("procurementRequisitionNotificationForTreatment", {
                user: supervisorFullName,
                createdBy: createdByFullName,
                description: description,
                unit: unitName,
                dateRequired: dateRequired,
                reason: requisitionReason,
                approvalsPageUrl: approvalsPageUrl
            })
        });
        return true
    } catch(e) {
        throw new Meteor.Error(401, e.message);
    }
  },
  sendTravelRequestNeedsTreatment: function(supervisorFullName, supervisorEmail, createdByFullName, 
      description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
    try {
        SSR.compileTemplate("travelRequisitionNotificationForTreatment", Assets.getText("emailTemplates/travelRequisitionNotificationForTreatment.html"));
        
        Email.send({
            to: supervisorEmail,
            from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
            subject: "Travel Request approved and needs to be treated",
            html: SSR.render("travelRequisitionNotificationForTreatment", {
                user: supervisorFullName,
                createdBy: createdByFullName,
                description: description,
                unit: unitName,
                dateRequired: dateRequired,
                reason: requisitionReason,
                approvalsPageUrl: approvalsPageUrl
            })
        });
        return true
    } catch(e) {
        throw new Meteor.Error(401, e.message);
    }
  },
  processPartiallyApprovedProcurements: function() {
    let businessUnitId = 'tgC7zYJf9ceSBmoT9'

    Partitioner.directOperation(function() {
      let partiallyApprovedProcurements = ProcurementRequisitions.find({
        $or: [{'status': 'PartiallyApproved'}, {'status': 'PartiallyRejected'}],
        businessUnitId: businessUnitId
      }).fetch();

      let createdByUserIds = _.pluck(partiallyApprovedProcurements, 'createdBy')

      let allCreators = Meteor.users.find({_id: {$in: createdByUserIds}}).fetch();
      let creatorPositionIds = []

      _.each(allCreators, aUser => {
        let userPositionId = aUser.employeeProfile.employment.position
        creatorPositionIds.push(userPositionId)
      })

      let creatorPositions = EntityObjects.find({_id: {$in: creatorPositionIds}}).fetch();

      let numProcurementsThatShouldBeApprovedOrRejected = 0

      _.each(partiallyApprovedProcurements, aProcurement => {
        let createdByUserId = aProcurement.createdBy;
        let user = _.find(allCreators, aCreator => aCreator._id === createdByUserId)
        if(user) {
          let userPosition = _.find(creatorPositions, aPosition => aPosition._id === user.employeeProfile.employment.position)
          if(userPosition) {
            if(userPosition.properties.alternateSupervisor) {
              numProcurementsThatShouldBeApprovedOrRejected += 1

              if(aProcurement.status === 'PartiallyApproved') {
                ProcurementRequisitions.update(aProcurement._id, {$set: {
                  status: 'Approved'
                }})

                let usersWithProcurementTreatRole = Meteor.users.find({
                  businessIds: businessUnitId,
                  'roles.__global_roles__': Core.Permissions.PROCUREMENT_REQUISITION_TREAT
                }).fetch()
                try {
                    let createdBy = Meteor.users.findOne(aProcurement.createdBy)                
                    let createdByEmail = createdBy.emails[0].address;
                    let createdByFullName = createdBy.profile.fullName
                    let unit = EntityObjects.findOne({_id: aProcurement.unitId, otype: 'Unit'})
                    let unitName = unit.name
                    let dateRequired = ''
                    if(aProcurement.dateRequired) {
                        dateRequired = moment(aProcurement.dateRequired).format('DD/MM/YYYY')
                    }
                    let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/procurementrequisitions/treatlist`
                    //--
                    if(usersWithProcurementTreatRole && usersWithProcurementTreatRole.length > 0) {
                      _.each(usersWithProcurementTreatRole, function(procurementTreater) {
                          let supervisorEmail =  procurementTreater.emails[0].address;
                          
                          Core.sendProcurementRequisitionNeedsTreatment(
                              procurementTreater.profile.fullName,
                              supervisorEmail, createdByFullName, 
                              aProcurement.description, 
                              unitName,
                              dateRequired,
                              aProcurement.requisitionReason,
                              approvalsPageUrl)
                      })
                    }
                } catch(errorInSendingEmail) {
                    console.log(errorInSendingEmail)
                }
              } else if(aProcurement.status === 'PartiallyRejected') {
                ProcurementRequisitions.update(aProcurement._id, {$set: {
                  status: 'Rejected'
                }})
              }
            }
          }
        }
      })
      console.log(`numProcurementsThatShouldBeApprovedOrRejected: `, numProcurementsThatShouldBeApprovedOrRejected)
    })
  },
  processPartiallyApprovedTravelRequests: function() {
    let businessUnitId = 'tgC7zYJf9ceSBmoT9'

    Partitioner.directOperation(function() {
      let partiallyApprovedTravelRequests = TravelRequisitions.find({
        $or: [{'status': 'PartiallyApproved'}, {'status': 'PartiallyRejected'}],
        businessUnitId: businessUnitId
      }).fetch();

      let createdByUserIds = _.pluck(partiallyApprovedTravelRequests, 'createdBy')

      let allCreators = Meteor.users.find({_id: {$in: createdByUserIds}}).fetch();
      let creatorPositionIds = []

      _.each(allCreators, aUser => {
        let userPositionId = aUser.employeeProfile.employment.position
        creatorPositionIds.push(userPositionId)
      })

      let creatorPositions = EntityObjects.find({_id: {$in: creatorPositionIds}}).fetch();

      let numTravelRequestsThatShouldBeApprovedOrRejected = 0

      _.each(partiallyApprovedTravelRequests, travelRequestDoc => {
        let createdByUserId = travelRequestDoc.createdBy;
        let user = _.find(allCreators, aCreator => aCreator._id === createdByUserId)
        if(user) {
          let userPosition = _.find(creatorPositions, aPosition => aPosition._id === user.employeeProfile.employment.position)
          if(userPosition) {
            if(userPosition.properties.alternateSupervisor) {
              numTravelRequestsThatShouldBeApprovedOrRejected += 1

              if(travelRequestDoc.status === 'PartiallyApproved') {
                // TravelRequisitions.update(travelRequestDoc._id, {$set: {
                //   status: 'Approved'
                // }})

                let usersWithTravelTreatRole = Meteor.users.find({
                  businessIds: businessUnitId,
                  'roles.__global_roles__': Core.Permissions.TRAVEL_REQUISITION_TREAT
                }).fetch()

                try {
                    let createdBy = Meteor.users.findOne(travelRequestDoc.createdBy)
                    let createdByEmail = createdBy.emails[0].address;
                    let createdByFullName = createdBy.profile.fullName
                    let unit = EntityObjects.findOne({_id: travelRequestDoc.unitId, otype: 'Unit'})
                    let unitName = unit.name
                    let dateRequired = ''
                    if(travelRequestDoc.dateRequired) {
                        dateRequired = moment(travelRequestDoc.dateRequired).format('DD/MM/YYYY')
                    }
                    let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/travelrequests/treatlist`
                    //--
                    if(usersWithTravelTreatRole && usersWithTravelTreatRole.length > 0) {
                        _.each(usersWithTravelTreatRole, function(travelRequestTreater) {
                            let supervisorEmail =  travelRequestTreater.emails[0].address;
                            
                            TravelRequestHelper.sendRequisitionNeedsTreatment(
                                travelRequestTreater.profile.fullName,
                                supervisorEmail, createdByFullName, 
                                travelRequestDoc.description, 
                                unitName,
                                dateRequired,
                                travelRequestDoc.requisitionReason,
                                approvalsPageUrl)
                        })
                    }
                } catch(errorInSendingEmail) {
                    console.log(errorInSendingEmail)
                }
              } else if(travelRequestDoc.status === 'PartiallyRejected') {
                // TravelRequisitions.update(travelRequestDoc._id, {$set: {
                //   status: 'Rejected'
                // }})
              }
            }
          }
        }
      })
      console.log(`numTravelRequestsThatShouldBeApprovedOrRejected: `, numTravelRequestsThatShouldBeApprovedOrRejected)

    })
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

  Core.processPartiallyApprovedProcurements();
  //Core.processPartiallyApprovedTravelRequests();
});
