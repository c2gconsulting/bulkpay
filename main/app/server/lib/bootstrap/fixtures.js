/*
 * instantiate loader
 */
this.Loader = new DataLoader();

/**
 * getDomain
 * local helper for creating admin users
 * @param {String} requestUrl - url
 * @return {String} domain name stripped from requestUrl
 */
function getDomain(requestUrl) {
    let url = requestUrl || process.env.ROOT_URL;
    let domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
    return domain;
}

/**
 * CoreRegistry createDefaultAdminUser
 * @summary Method that creates default admin user
 * Settings load precendence:
 *  1. settings in meteor.settings
 *  2. environment variables
 */

CoreRegistry.createDefaultAdminUser = function (tenantId, domain, email, username) {
    domain = domain || Core.getDefaultDomain();
    tenantId = tenantId || Core.getDefaultTenantId();
    const options = {};
    const defaultAdminRoles = ["admin/all"];

    // defaults use either env or generated
    options.email = email || "baseadmin@bulkpay.co"; // temporary
    options.username = username || "baseadmin"; // username
    options.password = process.env.BASE_ADMIN_PASS || '&nSuWhShGo!';
    options.firstname = 'Raymond';
    options.lastname = 'Bolton';
    options.tenantId = tenantId;

    // if an admin user has already been created, we'll exit
    if (Accounts.findUserByEmail(options.email)) {
        return;
    }
    // create the new admin user
    let accountId = Accounts.createUser(options);
    // notify user that admin was created
    Core.Log.warn(
        `\n *********************************
      \n  IMPORTANT! DEFAULT ADMIN INFO
      \n  EMAIL/LOGIN: ${options.email}
      \n ********************************* \n\n`);

    // account email should print on console
    /*
     try {
     Accounts.sendVerificationEmail(accountId);
     } catch (_error) {
     Core.Log.warn(
     "Unable to send admin account verification email.", _error);
     }
     */

    /*
     Tenants.update(tenantId, {
     $addToSet: {
     emails: {
     address: options.email,
     verified: true
     }
     }
     });
     */

    Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), Roles.GLOBAL_GROUP);
};

CoreRegistry.createDefaultSelfServiceUser = function () {
    const options = {};
    const domain = Core.getDefaultDomain();
    const defaultTimeRoles = ["leaves/manage", "expenses/manage"];
    const defaultEssroles = ["ess/all"];
    const tenantId = Core.getDefaultTenantId();

    // if an equivalent user has already been created, we'll exit
    if (Roles.getUsersInRole(defaultEssroles).count() !== 0) {
        return;
    }
    // defaults use either env or generated
    options.email = "essuser@bulkpay.co"; // temporary
    options.username = "selfservice"; // username
    options.password = process.env.BASE_ADMIN_PASS || "&nSuWhShGo!";
    options.firstname = 'Cynthia';
    options.lastname = 'Dawing';
    options.tenantId = tenantId;

    // if an admin user has already been created, we'll exit
    if (Accounts.findUserByEmail(options.email)) {
        return;
    }
    // create the new self service user
    let accountId = Accounts.createUser(options);
    // notify user that admin was created
    Core.Log.warn(
        `\n *********************************
      \n  IMPORTANT! SelfService User INFO
      \n  EMAIL/LOGIN: ${options.email}
      \n  PASSWORD: ${options.password}
      \n ********************************* \n\n`);

    // account email should print on console
    /*
     try {
     Accounts.sendVerificationEmail(accountId);
     } catch (_error) {
     Core.Log.warn(
     "Unable to send  account verification email.", _error);
     }
     */

    /*
     Tenants.update(tenantId, {
     $addToSet: {
     emails: {
     address: options.email,
     verified: true
     }
     }
     });
     */

    Roles.setUserRoles(accountId, _.uniq(defaultEssroles), 'ZbnpKieBkQEKrBmku');

    Roles.setUserRoles(accountId, _.uniq(defaultTimeRoles), Roles.GLOBAL_GROUP);
};

/*
 * load core initialisation data
 */

CoreRegistry.initData = function () {
    let tenantId = Core.getDefaultTenantId();
    Loader.loadData(Tenants);

    // start checking once per second if Tenants collection is ready,
    // then load the rest of the fixtures when it is
    let wait = Meteor.setInterval(function () {
        if (!!Tenants.find().count()) {
            Meteor.clearInterval(wait);
            Loader.loadI18n(Translations);

            // create default users
            CoreRegistry.createDefaultAdminUser();
            CoreRegistry.createDefaultSelfServiceUser();

            // create document number range collections for all tenants
            let allTenants = Tenants.find().fetch();
            _.each(allTenants, function(tenant) {
              Loader.loadPartitionData(DocumentNumbers, tenant._id);
            });

            // load sample data for key collections

            //Loader.loadPartitionData(Companies);


            /*
             * load production data
             **/
            /*
             let tenant = EJSON.parse(Assets.getText("data/bootstrap/tenants.json"));
             if(tenant) {
             let pTenantId = tenant._id;
             if(!Tenants.findOne(pTenantId)){
             let result;
             try {
             result = Tenants.insert(tenant);
             } catch (err) {
             Core.Log.error("Error adding initialisation tenant " + ":", err.message);
             }
             if (result) {
             Core.Log.info(
             `Success importing tenant ${result}`
             );
             }
             }

             CoreRegistry.createDefaultAdminUser(pTenantId, tenant.domains[0], "pngadmin@tradedepot.co", "pngadmin");

             Loader.loadPartitionData(Locations, pTenantId, Assets.getText("data/bootstrap/locations.json"));
             Loader.loadPartitionData(SalesAreas, pTenantId, Assets.getText("data/bootstrap/salesareas.json"));
             Loader.loadPartitionData(OrderTypes, pTenantId, Assets.getText("data/bootstrap/ordertypes.json"));
             Loader.loadPartitionData(CustomerGroups, pTenantId, Assets.getText("data/bootstrap/customergroups.json"));
             Loader.loadPartitionData(PriceListGroups, pTenantId, Assets.getText("data/bootstrap/pricelistgroups.json"));
             Loader.loadPartitionData(ApprovalParameters, pTenantId, Assets.getText("data/bootstrap/approvalparameters.json"));
             Loader.loadPartitionData(Approvals, pTenantId, Assets.getText("data/bootstrap/approvals.json"));
             Loader.loadPartitionData(ReturnReasons, pTenantId, Assets.getText("data/bootstrap/returnreasons.json"));
             Loader.loadPartitionData(PaymentMethods, pTenantId, Assets.getText("data/bootstrap/paymentmethods.json"));
             Loader.loadPartitionData(PromotionParameters, pTenantId, Assets.getText("data/bootstrap/promotionparameters.json"));



             /*
             * Test on sandbox
             */
            /*
             pTenantId = Core.getDefaultTenantId();
             let users = EJSON.parse(Assets.getText("data/bootstrap/usr.json"));
             if(users){
             _.each(users, (user) => {
             let usr = Accounts.findUserByEmail(user.emails[0].address), userId;
             if(!usr) {
             try {
             user.group = pTenantId;
             userId = Meteor.users.insert(user);
             } catch (err) {
             Core.Log.error("Error finding user " + ":", err.message, user.profile.fullName);
             }
             if(userId) {
             try {
             Partitioner.setUserGroup(userId, pTenantId);
             } catch (err) {
             Core.Log.error("Error partioning user " + ":", err.message, user.profile.fullName);
             }

             try {
             Accounts.sendEnrollmentEmail(userId, user.emails[0].address);
             } catch (_error) {
             Core.Log.warn(
             "Unable to send user enrollment email.", _error, user.profile.fullName);
             }
             }
             }
             });
             }*/
            //}

            // initialization complete
            Core.Log.info('Bulkpay Core initialization finished.');
        }
    }, 1000);
};
