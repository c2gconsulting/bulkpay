import accounting from 'accounting';

// exported, global/window scope
Core = {};
Core.Schemas = {};
Core.Helpers = {};
Core.MetaData = {};
Core.Locale = {};
Core.Log = {};

Core.SearchConnection = function(){}; //for now no search service on //Cluster.discoverConnection('search');

// registry
CoreRegistry = {};

Core.getSlug = function (slugString) {
    return Transliteration.slugify(slugString);
};

/*
 *  Extend global array object for efficient
 *  array data pagination
 */
Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize) {
        var R = [];
        for (var i = 0; i < this.length; i += chunkSize) {
            R.push(this.slice(i, i + chunkSize));
        }
        return R;
    }
});

/**
 * Match.OptionalOrNull
 * See Meteor Match methods
 * @param {String} pattern - match pattern
 * @return {Boolen} matches - void, null, or pattern
 */
Match.OptionalOrNull = function (pattern) {
    return Match.OneOf(void 0, null, pattern);
};
/*
 * extend Core and add common methods
 */
_.extend(Core, {
    /**
     * Core.schemaIdAutoValue
     * @summary used for schema injection autoValue
     * @example autoValue: Core.schemaIdAutoValue
     * @return {String} returns randomId
     */
    schemaIdAutoValue: function () {
        if (this.isSet && Meteor.isServer) {
            return this.value;
        } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
            return Random.id();
        }
        return this.unset();
    },

    /**
     * Core.schemaNextSeqNumber
     * @summary used for schemea injection for next seq number
     * @example nextSeqNumber: Core.schemaNextSeqNumber
     * @return {Number} returns next seq number
     */


    schemaNextSeqNumber: function (documentType, tenantId) {
        let docNumber = DocumentNumbers.findAndModify({
            query: {'documentType': documentType, '_groupId': tenantId },
            update: { $inc: { nextSeqNumber: 1 } }
        });
        return docNumber ? docNumber.nextSeqNumber : null;
    },

    schemaJobNextSeqNumber: function () {
        if (this.isInsert && Meteor.isServer) {
            let userId = this.field('userId').value || this.userId;
            return Core.schemaNextSeqNumber('job', Core.getTenantId(userId));
        }
    },

    schemaBusinessUnitNextSeqNumber: function () {
        if (this.isInsert && Meteor.isServer) {
            let userId = this.field('userId').value || this.userId;
            return Core.schemaNextSeqNumber('businessunit', Core.getTenantId(userId));

        }
    },

    schemaDivisionNextSeqNumber: function () {
        if (this.isInsert && Meteor.isServer) {
            let userId = this.field('userId').value || this.userId;
            return Core.schemaNextSeqNumber('division', Core.getTenantId(userId));
        }
    },

    schemaDepartmentNextSeqNumber: function () {
        if (this.isInsert && Meteor.isServer) {
            let userId = this.field('userId').value || this.userId;
            return Core.schemaNextSeqNumber('department', Core.getTenantId(userId));
        }
    },

    schemaPositionNextSeqNumber: function () {
        if (this.isInsert && Meteor.isServer) {
            let userId = this.field('userId').value || this.userId;
            return Core.schemaNextSeqNumber('position', Core.getTenantId(userId));
        }
    },

    schemaEmployeeNextSeqNumber: function () {
        if (this.isInsert && Meteor.isServer) {
            let userId = this.field('userId').value || this.userId;
            return Core.schemaNextSeqNumber('employee', Core.getTenantId(userId));
        }
    },

    /**
     * Core.numberWithCommas
     * @summary convert number to printable version with commas
     * @param {Number} x - number to be converted
     * @param {Number} num - number of decimals. Zero if omitted
     * @return {String} commarized pretty number
     */
    numberWithCommas: function(x, num) {
        return num ? accounting.formatNumber(x, num) : accounting.formatNumber(x);
        /*
         var parts = x.toString().split(".");
         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
         return parts.join(".");
         */
    },

    numberWithDecimals: function(x) {
        return accounting.formatNumber(x, 2);
    },

    /**
     * Core.hasPermission - user permissions checks
     * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
     * @param {String} checkUserId - userId, defaults to Meteor.userId()
     * @param {String} group - auth group to check for
     * @return {Boolean} Boolean - true if has permission
     */
    hasPermission: function (checkPermissions, checkUserId, group, readonly) {
        check(checkPermissions, Match.OneOf(String, Array));
        // use current user if userId is not provided
        let userId = checkUserId || this.userId;
        let permissions = [];

        // permissions can be either a string or an array
        // we'll force it into an array so we can add
        // admin roles
        if (!_.isArray(checkPermissions)) {
            permissions = [checkPermissions];
        } else {
            permissions = _.extend([], checkPermissions);
        }
        // Add admin/all or view/all roles to the permissions to check for
        let allAccessRole = readonly ? Core.Permissions.VIEW_ALL : Core.Permissions.ADMIN_ALL;

        if (_.isArray(allAccessRole)) {
            _.each(allAccessRole, function(role) {
                permissions.push(role);
            });
        } else {
            permissions.push(allAccessRole);
        }
        permissions = _.uniq(permissions);

        // check if userIsIntheRoles if group has been specified
        if (group) {
            if (Roles.userIsInRole(userId, permissions, group)) return true;
        } else if (Roles.userIsInRole(userId, permissions, Roles.GLOBAL_GROUP)) {
            return true;
        } else {
            // no group provided, check if user has permissions in any group
            let userGroups = [];

            _.each(permissions, function(permission) {
                userGroups = _.union(userGroups, Roles.getGroupsForUser(userId, permission));
            });

            if (userGroups.length > 0) return true;
        }

        // no specific permissions found, return false
        return false;
    },
    hasOwnerAccess: function (userId) {
        return this.hasPermission(Core.Permissions.TENANT_MAINTAIN, userId);
    },
    hasAdminAccess: function (userId) {
        return this.hasPermission(Core.Permissions.ADMIN_ALL, userId);
    },
    hasEmployeeAccess: function (userId) {
        return this.hasPermission(Core.Permissions.EMPLOYEE_MANAGE, userId);
    },
    hasRoleManageAccess: function (userId) {
        return this.hasPermission(Core.Permissions.ROLE_MANAGE, userId);
    },
    hasTimeApprovalAccess: function (userId) {
        return this.hasPermission(Core.Permissions.TIME_APPROVE, userId);
    },
    hasLeaveApprovalAccess: function (userId) {
        return this.hasPermission(Core.Permissions.LEAVE_APPROVE, userId);
    },
    hasLeaveManageAccess: function (userId) {
        return this.hasPermission(Core.Permissions.LEAVE_MANAGE, userId);
    },
    hasTimeManageAccess: function (userId) {
        return this.hasPermission(Core.Permissions.TIME_MANAGE, userId);
    },
    hasPayrollAccess: function (userId) {
        return this.hasPermission(Core.Permissions.PAYROLL_MANAGE, userId);
    },
    hasProcurementRequisitionApproveAccess: function (userId) {
        return this.hasPermission(Core.Permissions.PROCUREMENT_REQUISITION_APPROVE, userId);
    },
    hasTravelRequisitionApproveAccess: function (userId) {
        return this.hasPermission(Core.Permissions.TRAVEL_REQUISITION_APPROVE, userId);
    },
    hasSelfServiceAccess: function (userId) {
        return this.hasPermission(Core.Permissions.EMPLOYEE_SS, userId);
    },
    hasViewAllAccess: function (userId) {
        return this.hasPermission(Core.Permissions.VIEW_ALL, userId);
    },
    //hasOrderAccess: function (userId, group, readonly) {
    //    // check if user has orders/manage access for the location specified
    //    let orderPermissions = readonly ? Core.Permissions.ORDERS_VIEW : Core.Permissions.ORDERS_MANAGE;
    //    return this.hasPermission(orderPermissions, userId, group, readonly);
    //},
    //hasOrderApprovalAccess: function (userId, orderGroup, orderTypeGroup) {
    //    // check if user has orders/approve access for the salesArea specified, and ordertypes/approve for orderTypes
    //    return this.hasPermission(Core.Permissions.ORDERS_APPROVE, userId, orderGroup) && this.hasPermission(Core.Permissions.ORDERTYPES_APPROVE, userId, orderTypeGroup);
    //},
    //hasReturnApprovalAccess: function (userId, group) {
    //    // check if user has returnorder/approve access for the location specified
    //    // note: calling without a group specified returns true if user has access for ANY group
    //    return this.hasPermission(Core.Permissions.RETURNORDERS_APPROVE, userId, group);
    //},
    //hasReturnOrderAccess: function (userId, group, readonly) {
    //    // check if user has returns/manage access for the location specified
    //    let returnOrderPermissions = readonly ? Core.Permissions.RETURNORDERS_VIEW : Core.Permissions.RETURNORDERS_MANAGE;
    //    return this.hasPermission(returnOrderPermissions, userId, group, readonly);
    //},
    //hasCustomerAccess: function (userId, group, readonly) {
    //    // check if user has customers/maintain access for the location specified
    //    let customerPermissions = readonly ? Core.Permissions.CUSTOMERS_VIEW : Core.Permissions.CUSTOMERS_MAINTAIN;
    //    return this.hasPermission(customerPermissions, userId, group, readonly);
    //},
    //hasInvoiceAccess: function (userId, group, readonly) {
    //    // check if user has invoices/manage access for the location specified
    //    let invoicePermissions = readonly ? Core.Permissions.INVOICES_VIEW : Core.Permissions.INVOICES_MANAGE;
    //    return this.hasPermission(invoicePermissions, userId, group, readonly);
    //},
    //hasPromotionAccess: function (userId, group, readonly) {
    //    // check if user has promotions/manage access for the location specified
    //    let promotionPermissions = readonly ? Core.Permissions.PROMOTIONS_VIEW : Core.Permissions.PROMOTIONS_MANAGE;
    //    return this.hasPermission(promotionPermissions, userId, group, readonly);
    //},
    //hasPromotionApprovalAccess: function (userId, group) {
    //    // check if user has promotion/approve access for the location specified
    //    // note: calling without a group specified returns true if user has access for ANY group
    //    return this.hasPermission(Core.Permissions.PROMOTIONS_APPROVE, userId, group);
    //},
    //hasRebateAccess: function (userId, group, readonly) {
    //    // check if user has rebates/manage access for the location specified
    //    let rebatePermissions = readonly ? Core.Permissions.REBATES_VIEW : Core.Permissions.REBATES_MANAGE;
    //    return this.hasPermission(rebatePermissions, userId, group, readonly);
    //},

    /**
     * getAuthorizedGroups - check for authorized user groups
     * @param {String} checkUserId - userId, defaults to Meteor.userId()
     * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin/all"
     * @return {Boolean} Boolean - true if has permission
     */
    getAuthorizedGroups: function(checkUserId, checkPermissions) {
        // use current user if userId is not provided
        let userId = checkUserId || this.userId;
        let permissions = [];

        // permissions can be either a string or an array
        // we'll force it into an array if in a string
        if (!_.isArray(checkPermissions)) {
            permissions = [checkPermissions];
        } else {
            permissions = checkPermissions;
        }

        // check if user has view all or admin access
        if (Roles.userIsInRole(userId, Core.Permissions.VIEW_ALL)) return Roles.GLOBAL_GROUP;

        // no all access, check if user has unrestricted group access
        if (Roles.userIsInRole(userId, permissions, Roles.GLOBAL_GROUP)) return Roles.GLOBAL_GROUP;

        // no all access, return available groups
        let userGroups = [];

        _.each(permissions, function(permission) {
            userGroups = _.union(userGroups, Roles.getGroupsForUser(userId, permission));
        });

        if (userGroups.length > 0) return userGroups;

        // else, user does not have the permissions
        return false;
    },

    // Get rounding value for currentTenant matching same base currency iso
    getTenantRounding: function(currency, currentUserId) {
        let userId = currentUserId || this.userId;
        let rounding = Core.getAllRounding(userId);
        if (currency && rounding){
            return rounding[currency]
        }
    },

    // Round any value for a tenant based on current base currency form the settings
    roundMoney: function(value, currency, currentUserId){
        let userId = currentUserId || this.userId;
        let round = Core.getTenantRounding(currency, userId);
        if (round && round > 0){
            return  Math.round(value/round)*round;
        } else {
            return value
        }
    },

    // Calculate undiscounted document total amount
    getDocumentRawTotal: function(docItems) {
        let total = 0;
        if (docItems) {
            _.each(docItems, function(item) {
                let d = item.discount || 0;
                if (!item.isPromo && item.status !== 'deleted') {
                    total += ((item.quantity * item.price * ((100 - d)/100)));
                }
            });
        }
        return total;
    },

    // Get tenant TimeZone
    getTimezone: function(userId){
        let tenantId = Core.getTenantId(userId);
        if (tenantId){
            let tenant = Tenants.findOne(tenantId);
            if (tenant && tenant.timezone){
                return tenant.timezone
            } else {
                return "Africa/Lagos"
            }
        }
    },

    //get countries
    IsoCountries: function(){
        let isoCountries = [
            {'ccode' : 'AF', 'cname' : 'Afghanistan'},
            {'ccode' : 'AX', 'cname' : 'Aland Islands'},
            {'ccode' : 'AL', 'cname' : 'Albania'},
            {'ccode' : 'DZ', 'cname' : 'Algeria'},
            {'ccode' : 'AS', 'cname' : 'American Samoa'},
            {'ccode' : 'AD', 'cname' : 'Andorra'},
            {'ccode' : 'AO', 'cname' : 'Angola'},
            {'ccode' : 'AI', 'cname' : 'Anguilla'},
            {'ccode' : 'AQ', 'cname' : 'Antarctica'},
            {'ccode' : 'AG', 'cname' : 'Antigua And Barbuda'},
            {'ccode' : 'AR', 'cname' : 'Argentina'},
            {'ccode' : 'AM', 'cname' : 'Armenia'},
            {'ccode' : 'AW', 'cname' : 'Aruba'},
            {'ccode' : 'AU', 'cname' : 'Australia'},
            {'ccode' : 'AT', 'cname' : 'Austria'},
            {'ccode' : 'AZ', 'cname' : 'Azerbaijan'},
            {'ccode' : 'BS', 'cname' : 'Bahamas'},
            {'ccode' : 'BH', 'cname' : 'Bahrain'},
            {'ccode' : 'BD', 'cname' : 'Bangladesh'},
            {'ccode' : 'BB', 'cname' : 'Barbados'},
            {'ccode' : 'BY', 'cname' : 'Belarus'},
            {'ccode' : 'BE', 'cname' : 'Belgium'},
            {'ccode' : 'BZ', 'cname' : 'Belize'},
            {'ccode' : 'BJ', 'cname' : 'Benin'},
            {'ccode' : 'BM', 'cname' : 'Bermuda'},
            {'ccode' : 'BT', 'cname' : 'Bhutan'},
            {'ccode' : 'BO', 'cname' : 'Bolivia'},
            {'ccode' : 'BA', 'cname' : 'Bosnia And Herzegovina'},
            {'ccode' : 'BW', 'cname' : 'Botswana'},
            {'ccode' : 'BV', 'cname' : 'Bouvet Island'},
            {'ccode' : 'BR', 'cname' : 'Brazil'},
            {'ccode' : 'IO', 'cname' : 'British Indian Ocean Territory'},
            {'ccode' : 'BN', 'cname' : 'Brunei Darussalam'},
            {'ccode' : 'BG', 'cname' : 'Bulgaria'},
            {'ccode' : 'BF', 'cname' : 'Burkina Faso'},
            {'ccode' : 'BI', 'cname' : 'Burundi'},
            {'ccode' : 'KH', 'cname' : 'Cambodia'},
            {'ccode' : 'CM', 'cname' : 'Cameroon'},
            {'ccode' : 'CA', 'cname' : 'Canada'},
            {'ccode' : 'CV', 'cname' : 'Cape Verde'},
            {'ccode' : 'KY', 'cname' : 'Cayman Islands'},
            {'ccode' : 'CF', 'cname' : 'Central African Republic'},
            {'ccode' : 'TD', 'cname' : 'Chad'},
            {'ccode' : 'CL', 'cname' : 'Chile'},
            {'ccode' : 'CN', 'cname' : 'China'},
            {'ccode' : 'CX', 'cname' : 'Christmas Island'},
            {'ccode' : 'CC', 'cname' : 'Cocos (Keeling) Islands'},
            {'ccode' : 'CO', 'cname' : 'Colombia'},
            {'ccode' : 'KM', 'cname' : 'Comoros'},
            {'ccode' : 'CG', 'cname' : 'Congo'},
            {'ccode' : 'CD', 'cname' : 'Congo, Democratic Republic'},
            {'ccode' : 'CK', 'cname' : 'Cook Islands'},
            {'ccode' : 'CR', 'cname' : 'Costa Rica'},
            {'ccode' : 'CI', 'cname' : 'Cote D\'Ivoire'},
            {'ccode' : 'HR', 'cname' : 'Croatia'},
            {'ccode' : 'CU', 'cname' : 'Cuba'},
            {'ccode' : 'CY', 'cname' : 'Cyprus'},
            {'ccode' : 'CZ', 'cname' : 'Czech Republic'},
            {'ccode' : 'DK', 'cname' : 'Denmark'},
            {'ccode' : 'DJ', 'cname' : 'Djibouti'},
            {'ccode' : 'DM', 'cname' : 'Dominica'},
            {'ccode' : 'DO', 'cname' : 'Dominican Republic'},
            {'ccode' : 'EC', 'cname' : 'Ecuador'},
            {'ccode' : 'EG', 'cname' : 'Egypt'},
            {'ccode' : 'SV', 'cname' : 'El Salvador'},
            {'ccode' : 'GQ', 'cname' : 'Equatorial Guinea'},
            {'ccode' : 'ER', 'cname' : 'Eritrea'},
            {'ccode' : 'EE', 'cname' : 'Estonia'},
            {'ccode' : 'ET', 'cname' : 'Ethiopia'},
            {'ccode' : 'FK', 'cname' : 'Falkland Islands (Malvinas)'},
            {'ccode' : 'FO', 'cname' : 'Faroe Islands'},
            {'ccode' : 'FJ', 'cname' : 'Fiji'},
            {'ccode' : 'FI', 'cname' : 'Finland'},
            {'ccode' : 'FR', 'cname' : 'France'},
            {'ccode' : 'GF', 'cname' : 'French Guiana'},
            {'ccode' : 'PF', 'cname' : 'French Polynesia'},
            {'ccode' : 'TF', 'cname' : 'French Southern Territories'},
            {'ccode' : 'GA', 'cname' : 'Gabon'},
            {'ccode' : 'GM', 'cname' : 'Gambia'},
            {'ccode' : 'GE', 'cname' : 'Georgia'},
            {'ccode' : 'DE', 'cname' : 'Germany'},
            {'ccode' : 'GH', 'cname' : 'Ghana'},
            {'ccode' : 'GI', 'cname' : 'Gibraltar'},
            {'ccode' : 'GR', 'cname' : 'Greece'},
            {'ccode' : 'GL', 'cname' : 'Greenland'},
            {'ccode' : 'GD', 'cname' : 'Grenada'},
            {'ccode' : 'GP', 'cname' : 'Guadeloupe'},
            {'ccode' : 'GU', 'cname' : 'Guam'},
            {'ccode' : 'GT', 'cname' : 'Guatemala'},
            {'ccode' : 'GG', 'cname' : 'Guernsey'},
            {'ccode' : 'GN', 'cname' : 'Guinea'},
            {'ccode' : 'GW', 'cname' : 'Guinea-Bissau'},
            {'ccode' : 'GY', 'cname' : 'Guyana'},
            {'ccode' : 'HT', 'cname' : 'Haiti'},
            {'ccode' : 'HM', 'cname' : 'Heard Island & Mcdonald Islands'},
            {'ccode' : 'VA', 'cname' : 'Holy See (Vatican City State)'},
            {'ccode' : 'HN', 'cname' : 'Honduras'},
            {'ccode' : 'HK', 'cname' : 'Hong Kong'},
            {'ccode' : 'HU', 'cname' : 'Hungary'},
            {'ccode' : 'IS', 'cname' : 'Iceland'},
            {'ccode' : 'IN', 'cname' : 'India'},
            {'ccode' : 'ID', 'cname' : 'Indonesia'},
            {'ccode' : 'IR', 'cname' : 'Iran, Islamic Republic Of'},
            {'ccode' : 'IQ', 'cname' : 'Iraq'},
            {'ccode' : 'IE', 'cname' : 'Ireland'},
            {'ccode' : 'IM', 'cname' : 'Isle Of Man'},
            {'ccode' : 'IL', 'cname' : 'Israel'},
            {'ccode' : 'IT', 'cname' : 'Italy'},
            {'ccode' : 'JM', 'cname' : 'Jamaica'},
            {'ccode' : 'JP', 'cname' : 'Japan'},
            {'ccode' : 'JE', 'cname' : 'Jersey'},
            {'ccode' : 'JO', 'cname' : 'Jordan'},
            {'ccode' : 'KZ', 'cname' : 'Kazakhstan'},
            {'ccode' : 'KE', 'cname' : 'Kenya'},
            {'ccode' : 'KI', 'cname' : 'Kiribati'},
            {'ccode' : 'KR', 'cname' : 'Korea'},
            {'ccode' : 'KW', 'cname' : 'Kuwait'},
            {'ccode' : 'KG', 'cname' : 'Kyrgyzstan'},
            {'ccode' : 'LA', 'cname' : 'Lao People\'s Democratic Republic'},
            {'ccode' : 'LV', 'cname' : 'Latvia'},
            {'ccode' : 'LB', 'cname' : 'Lebanon'},
            {'ccode' : 'LS', 'cname' : 'Lesotho'},
            {'ccode' : 'LR', 'cname' : 'Liberia'},
            {'ccode' : 'LY', 'cname' : 'Libyan Arab Jamahiriya'},
            {'ccode' : 'LI', 'cname' : 'Liechtenstein'},
            {'ccode' : 'LT', 'cname' : 'Lithuania'},
            {'ccode' : 'LU', 'cname' : 'Luxembourg'},
            {'ccode' : 'MO', 'cname' : 'Macao'},
            {'ccode' : 'MK', 'cname' : 'Macedonia'},
            {'ccode' : 'MG', 'cname' : 'Madagascar'},
            {'ccode' : 'MW', 'cname' : 'Malawi'},
            {'ccode' : 'MY', 'cname' : 'Malaysia'},
            {'ccode' : 'MV', 'cname' : 'Maldives'},
            {'ccode' : 'ML', 'cname' : 'Mali'},
            {'ccode' : 'MT', 'cname' : 'Malta'},
            {'ccode' : 'MH', 'cname' : 'Marshall Islands'},
            {'ccode' : 'MQ', 'cname' : 'Martinique'},
            {'ccode' : 'MR', 'cname' : 'Mauritania'},
            {'ccode' : 'MU', 'cname' : 'Mauritius'},
            {'ccode' : 'YT', 'cname' : 'Mayotte'},
            {'ccode' : 'MX', 'cname' : 'Mexico'},
            {'ccode' : 'FM', 'cname' : 'Micronesia, Federated States Of'},
            {'ccode' : 'MD', 'cname' : 'Moldova'},
            {'ccode' : 'MC', 'cname' : 'Monaco'},
            {'ccode' : 'MN', 'cname' : 'Mongolia'},
            {'ccode' : 'ME', 'cname' : 'Montenegro'},
            {'ccode' : 'MS', 'cname' : 'Montserrat'},
            {'ccode' : 'MA', 'cname' : 'Morocco'},
            {'ccode' : 'MZ', 'cname' : 'Mozambique'},
            {'ccode' : 'MM', 'cname' : 'Myanmar'},
            {'ccode' : 'NA', 'cname' : 'Namibia'},
            {'ccode' : 'NR', 'cname' : 'Nauru'},
            {'ccode' : 'NP', 'cname' : 'Nepal'},
            {'ccode' : 'NL', 'cname' : 'Netherlands'},
            {'ccode' : 'AN', 'cname' : 'Netherlands Antilles'},
            {'ccode' : 'NC', 'cname' : 'New Caledonia'},
            {'ccode' : 'NZ', 'cname' : 'New Zealand'},
            {'ccode' : 'NI', 'cname' : 'Nicaragua'},
            {'ccode' : 'NE', 'cname' : 'Niger'},
            {'ccode' : 'NG', 'cname' : 'Nigeria'},
            {'ccode' : 'NU', 'cname' : 'Niue'},
            {'ccode' : 'NF', 'cname' : 'Norfolk Island'},
            {'ccode' : 'MP', 'cname' : 'Northern Mariana Islands'},
            {'ccode' : 'NO', 'cname' : 'Norway'},
            {'ccode' : 'OM', 'cname' : 'Oman'},
            {'ccode' : 'PK', 'cname' : 'Pakistan'},
            {'ccode' : 'PW', 'cname' : 'Palau'},
            {'ccode' : 'PS', 'cname' : 'Palestinian Territory, Occupied'},
            {'ccode' : 'PA', 'cname' : 'Panama'},
            {'ccode' : 'PG', 'cname' : 'Papua New Guinea'},
            {'ccode' : 'PY', 'cname' : 'Paraguay'},
            {'ccode' : 'PE', 'cname' : 'Peru'},
            {'ccode' : 'PH', 'cname' : 'Philippines'},
            {'ccode' : 'PN', 'cname' : 'Pitcairn'},
            {'ccode' : 'PL', 'cname' : 'Poland'},
            {'ccode' : 'PT', 'cname' : 'Portugal'},
            {'ccode' : 'PR', 'cname' : 'Puerto Rico'},
            {'ccode' : 'QA', 'cname' : 'Qatar'},
            {'ccode' : 'RE', 'cname' : 'Reunion'},
            {'ccode' : 'RO', 'cname' : 'Romania'},
            {'ccode' : 'RU', 'cname' : 'Russian Federation'},
            {'ccode' : 'RW', 'cname' : 'Rwanda'},
            {'ccode' : 'BL', 'cname' : 'Saint Barthelemy'},
            {'ccode' : 'SH', 'cname' : 'Saint Helena'},
            {'ccode' : 'KN', 'cname' : 'Saint Kitts And Nevis'},
            {'ccode' : 'LC', 'cname' : 'Saint Lucia'},
            {'ccode' : 'MF', 'cname' : 'Saint Martin'},
            {'ccode' : 'PM', 'cname' : 'Saint Pierre And Miquelon'},
            {'ccode' : 'VC', 'cname' : 'Saint Vincent And Grenadines'},
            {'ccode' : 'WS', 'cname' : 'Samoa'},
            {'ccode' : 'SM', 'cname' : 'San Marino'},
            {'ccode' : 'ST', 'cname' : 'Sao Tome And Principe'},
            {'ccode' : 'SA', 'cname' : 'Saudi Arabia'},
            {'ccode' : 'SN', 'cname' : 'Senegal'},
            {'ccode' : 'RS', 'cname' : 'Serbia'},
            {'ccode' : 'SC', 'cname' : 'Seychelles'},
            {'ccode' : 'SL', 'cname' : 'Sierra Leone'},
            {'ccode' : 'SG', 'cname' : 'Singapore'},
            {'ccode' : 'SK', 'cname' : 'Slovakia'},
            {'ccode' : 'SI', 'cname' : 'Slovenia'},
            {'ccode' : 'SB', 'cname' : 'Solomon Islands'},
            {'ccode' : 'SO', 'cname' : 'Somalia'},
            {'ccode' : 'ZA', 'cname' : 'South Africa'},
            {'ccode' : 'GS', 'cname' : 'South Georgia And Sandwich Isl.'},
            {'ccode' : 'ES', 'cname' : 'Spain'},
            {'ccode' : 'LK', 'cname' : 'Sri Lanka'},
            {'ccode' : 'SD', 'cname' : 'Sudan'},
            {'ccode' : 'SR', 'cname' : 'Suriname'},
            {'ccode' : 'SJ', 'cname' : 'Svalbard And Jan Mayen'},
            {'ccode' : 'SZ', 'cname' : 'Swaziland'},
            {'ccode' : 'SE', 'cname' : 'Sweden'},
            {'ccode' : 'CH', 'cname' : 'Switzerland'},
            {'ccode' : 'SY', 'cname' : 'Syrian Arab Republic'},
            {'ccode' : 'TW', 'cname' : 'Taiwan'},
            {'ccode' : 'TJ', 'cname' : 'Tajikistan'},
            {'ccode' : 'TZ', 'cname' : 'Tanzania'},
            {'ccode' : 'TH', 'cname' : 'Thailand'},
            {'ccode' : 'TL', 'cname' : 'Timor-Leste'},
            {'ccode' : 'TG', 'cname' : 'Togo'},
            {'ccode' : 'TK', 'cname' : 'Tokelau'},
            {'ccode' : 'TO', 'cname' : 'Tonga'},
            {'ccode' : 'TT', 'cname' : 'Trinidad And Tobago'},
            {'ccode' : 'TN', 'cname' : 'Tunisia'},
            {'ccode' : 'TR', 'cname' : 'Turkey'},
            {'ccode' : 'TM', 'cname' : 'Turkmenistan'},
            {'ccode' : 'TC', 'cname' : 'Turks And Caicos Islands'},
            {'ccode' : 'TV', 'cname' : 'Tuvalu'},
            {'ccode' : 'UG', 'cname' : 'Uganda'},
            {'ccode' : 'UA', 'cname' : 'Ukraine'},
            {'ccode' : 'AE', 'cname' : 'United Arab Emirates'},
            {'ccode' : 'GB', 'cname' : 'United Kingdom'},
            {'ccode' : 'US', 'cname' : 'United States'},
            {'ccode' : 'UM', 'cname' : 'United States Outlying Islands'},
            {'ccode' : 'UY', 'cname' : 'Uruguay'},
            {'ccode' : 'UZ', 'cname' : 'Uzbekistan'},
            {'ccode' : 'VU', 'cname' : 'Vanuatu'},
            {'ccode' : 'VE', 'cname' : 'Venezuela'},
            {'ccode' : 'VN', 'cname' : 'Viet Nam'},
            {'ccode' : 'VG', 'cname' : 'Virgin Islands, British'},
            {'ccode' : 'VI', 'cname' : 'Virgin Islands, U.S.'},
            {'ccode' : 'WF', 'cname' : 'Wallis And Futuna'},
            {'ccode' : 'EH', 'cname' : 'Western Sahara'},
            {'ccode' : 'YE', 'cname' : 'Yemen'},
            {'ccode' : 'ZM', 'cname' : 'Zambia'},
            {'ccode' : 'ZW', 'cname' : 'Zimbabwe'}
        ];
        return isoCountries
    },

    //Currencies
    currencies: function(){
        return ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT",
            "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYR", "BZD", "CAD", "CDF",
            "CHF", "CLP", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
            "INR", "NOK", "USD", "EUR", "ERN", "ETB", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GTQ", "HKD", "HRK", "HUF", "IDR",
            "ILS", "ISK", "JPY", "KRW", "KZT", "MAD", "MMK", "MRO", "MXN", "MYR", "NGN", "NZD", "PLN", "RUB", "SEK", "SGD", "THB",
            "TWD", "UAH", "XAF", "XCD", "XOF"]
    },

    //States.. this is just temporal since states will be dynamic based on country selection
    // for now lets just have states
    states: function(){
        return [
            {"code": "Abia", "name": "Abia"},
            {"code": "Adamawa", "name": "Adamawa"},
            {"code": "Akwa Ibom", "name": "Akwa Ibom "},
            {"code": "Anambra", "name": "Anambra"},
            {"code": "Bauchi", "name": "Bauchi"},
            {"code": "Bayelsa", "name": "Bayelsa"},
            {"code": "Benue", "name": "Benue"},
            {"code": "Borno", "name": "Borno"},
            {"code": "Cross River", "name": "Cross River"},
            {"code": "Delta", "name": "Delta"},
            {"code": "Ebonyi", "name": "Ebonyi"},
            {"code": "Edo", "name": "Edo"},
            {"code": "Ekiti", "name": "Ekiti"},
            {"code": "Enugu", "name": "Enugu"},
            {"code": "FCT", "name": "Federal Capital Territory"},
            {"code": "Gombe", "name": "Gombe"},
            {"code": "Imo", "name": "Imo"},
            {"code": "Jigawa", "name": "Jigawa"},
            {"code": "Kaduna", "name": "Kaduna"},
            {"code": "Kano", "name": "Kano"},
            {"code": "Katsina", "name": "Katsina"},
            {"code": "Kebbi", "name": "Kebbi"},
            {"code": "Kogi", "name": "Kogi"},
            {"code": "Kwara", "name": "Kwara"},
            {"code": "Lagos", "name": "Lagos"},
            {"code": "Nasarawa", "name": "Nasarawa"},
            {"code": "Niger", "name": "Niger"},
            {"code": "Ogun", "name": "Ogun"},
            {"code": "Ondo", "name": "Ondo"},
            {"code": "Osun", "name": "Osun"},
            {"code": "Oyo", "name": "Oyo"},
            {"code": "Plateau", "name": "Plateau"},
            {"code": "Rivers", "name": "Rivers"},
            {"code": "Sokoto", "name": "Sokoto"},
            {"code": "Taraba", "name": "Taraba"},
            {"code": "Yobe", "name": "Yobe"},
            {"code": "Zamfara", "name": "Zamfara"}
        ]

    },
    banks: function() {
        return [
            {name: 'Access Bank', code: "Access"},
            {name: 'Diamond Bank', code: "DIAMOND"},
            {name: 'Equitorial Trust Bank', code: "ETB"},
            {name: 'Eco Bank', code: "ECO"},
            {name: 'Fidelity Bank', code: "ETB"},
            {name: 'First Bank', code: "FBN"},
            {name: 'Guarantee Trust Bank', code: "GTB"},
            {name: 'Stanbic Ibtck Bank', code: "STANBIC"},
        ]
    },
    'months': function(){
        return [
            {name:'January',period: '01'},
            {name:'February',period: '02'},
            {name:'March',period: '03'},
            {name:'April',period: '04'},
            {name:'May',period: '05'},
            {name:'June',period: '06'},
            {name:'July',period: '07'},
            {name:'August',period: '08'},
            {name:'September',period: '09'},
            {name:'October',period: '10'},
            {name:'November',period: '11'},
            {name:'December',period: '12'}
        ];
    },
    'years': function(){
        //this is not the right thing to do .. used temporarily for getting years
        let years = [];
        for (let x = new Date().getFullYear() - 10; x < new Date().getFullYear() + 10; x++) {
            years.push(String(x));
        }
        return years;
    }
});
