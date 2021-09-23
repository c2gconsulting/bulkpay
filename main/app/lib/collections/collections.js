
/**
 * TD Core Collections
 * Maintain collections available from the main service
 *
 */


/**
 * Core transform collections
 *
 * transform methods used to return cart calculated values
 * cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
 * are calculated by a transformation on the collection
 * and are available to use in template as cart.xxx
 * in template: {{cart.cartCount}}
 * in code: Cart.findOne().cartTotal()
 */

/*
 Core.Helpers.cartTransform = {
 cartCount: function () {
 let count = 0;
 if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
 for (let items of this.items) {
 count += items.quantity;
 }
 }
 return count;
 },
 cartShipping: function () {
 let shippingTotal = 0;
 // loop through the cart.shipping, sum shipments.
 if (this.shipping) {
 for (let shipment of this.shipping) {
 shippingTotal += shipment.shipmentMethod.rate;
 }
 }
 return parseFloat(shippingTotal);
 },
 cartSubTotal: function () {
 let subtotal = 0;
 if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
 for (let items of this.items) {
 subtotal += items.quantity * items.variants.price;
 }
 }
 subtotal = subtotal.toFixed(2);
 return subtotal;
 },
 cartTaxes: function () {
 let subtotal = 0;
 if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
 for (let items of this.items) {
 let tax = this.tax || 0;
 subtotal += items.variants.price * tax;
 }
 }
 subtotal = subtotal.toFixed(2);
 return subtotal;
 },
 cartDiscounts: function () {
 return "0.00";
 },
 cartTotal: function () {
 let total;
 let subtotal = 0;
 let shippingTotal = 0;
 if (this.items) {
 for (let items of this.items) {
 subtotal += items.quantity * items.variants.price;
 }
 }
 // loop through the cart.shipping, sum shipments.
 if (this.shipping) {
 for (let shipment of this.shipping) {
 shippingTotal += shipment.shipmentMethod.rate;
 }
 }

 shippingTotal = parseFloat(shippingTotal);
 if (!isNaN(shippingTotal)) {
 subtotal = subtotal + shippingTotal;
 }
 total = subtotal.toFixed(2);
 return total;
 }
 }; */

/**
 * Core Collections Attachments
 */
Attachments = new Mongo.Collection("attachments");
// Partitioner.partitionCollection(Attachments);
Attachments.attachSchema(Core.Schemas.Attachment);

/**
 * Core Collections ApprovalsConfigs
 */
ApprovalsConfigs = new Mongo.Collection("approvalsconfigs");
// Partitioner.partitionCollection(ApprovalsConfigs);
ApprovalsConfigs.attachSchema(Core.Schemas.ApprovalsConfigs);

/**
 * Core Collections Businesses
 */
Businesses = new Mongo.Collection("businesses");
Partitioner.partitionCollection(Businesses, {index: {userId: 1}});
Businesses.attachSchema(Core.Schemas.Business);

/**
 * Core Collections BusinessUnitCustomConfigs
 */
BusinessUnitCustomConfigs = new Mongo.Collection("businessunitcustomconfigs");
// Partitioner.partitionCollection(BusinessUnitCustomConfigs);
BusinessUnitCustomConfigs.attachSchema(Core.Schemas.BusinessUnitCustomConfig);

/**
 * Core Collections SapBusinessUnitConfigs
 */
SapBusinessUnitConfigs = new Mongo.Collection("sapbusinessunitconfigs");
Partitioner.partitionCollection(SapBusinessUnitConfigs);
SapBusinessUnitConfigs.attachSchema(Core.Schemas.SapBusinessUnitConfig);

/**
 * Core Collections BusinessUnits
 */
BusinessUnits = new Mongo.Collection("businessunits");
Partitioner.partitionCollection(BusinessUnits);
BusinessUnits.attachSchema(Core.Schemas.BusinessUnit);

/**
 * Core Collections Departments
 */
Departments = new Mongo.Collection("departments");
Partitioner.partitionCollection(Departments);
Departments.attachSchema(Core.Schemas.Department);

/**
 * Core Collections Divisions
 */
Divisions = new Mongo.Collection("divisions");
Partitioner.partitionCollection(Divisions);
Divisions.attachSchema(Core.Schemas.Division);

/**
 * Core Collections Employees
 */
Employees = new Mongo.Collection("employees");
Partitioner.partitionCollection(Employees);
Employees.attachSchema(Core.Schemas.Employee);

/**
 * Core Collections Expenses
 */
Expenses = new Mongo.Collection("expenses");
Partitioner.partitionCollection(Expenses);
Expenses.attachSchema(Core.Schemas.Expense);

/**
 * Core Collections History
 */
History = new Mongo.Collection("history");
Partitioner.partitionCollection(History);
History.attachSchema(Core.Schemas.History);

/**
 * Core Collections Jobs
 */
Jobs = new Mongo.Collection("jobs");
Partitioner.partitionCollection(Jobs);
Jobs.attachSchema(Core.Schemas.Job);

/**
 * Core Collections Leaves
 */
Leaves = new Mongo.Collection("leaves");
Partitioner.partitionCollection(Leaves);
Leaves.attachSchema(Core.Schemas.Leave);

/**
 * Core Collections HmoPlanChangeRequests
 */
HmoPlanChangeRequests = new Mongo.Collection("hmoplanchangerequests");
Partitioner.partitionCollection(HmoPlanChangeRequests);
HmoPlanChangeRequests.attachSchema(Core.Schemas.HmoPlanChangeRequest);

/**
 * Core Collections LeaveEntitlements
 */
LeaveEntitlements = new Mongo.Collection("leaveentitlements");
Partitioner.partitionCollection(LeaveEntitlements);
LeaveEntitlements.attachSchema(Core.Schemas.LeaveEntitlement);

/**
 * Core Collections SupplementaryLeaves
 */
SupplementaryLeaves = new Mongo.Collection("supplementaryleaves");
Partitioner.partitionCollection(SupplementaryLeaves);
SupplementaryLeaves.attachSchema(Core.Schemas.SupplementaryLeave);

/**
 * Core Collections UserLeaveEntitlement
 */
UserLeaveEntitlements = new Mongo.Collection("userleaveentitlements");
Partitioner.partitionCollection(UserLeaveEntitlements);
UserLeaveEntitlements.attachSchema(Core.Schemas.UserLeaveEntitlement);

/**
 * Core Collections entityObject
 */
EntityObjects = new Mongo.Collection("entity_objects");
Partitioner.partitionCollection(EntityObjects);
EntityObjects.attachSchema(Core.Schemas.EntityObject);

/**
 * Core Collections Loans
 */
Loans = new Mongo.Collection("loans");
Partitioner.partitionCollection(Loans);
Loans.attachSchema(Core.Schemas.Loan);

/**
 * Core Collections Loans2
 */
Loans2 = new Mongo.Collection("loans2");
Partitioner.partitionCollection(Loans2);
Loans2.attachSchema(Core.Schemas.Loans2);


/**
 * Core Collections OneOffs
 */
OneOffs = new Mongo.Collection("oneoffs");
Partitioner.partitionCollection(OneOffs);
OneOffs.attachSchema(Core.Schemas.OneOff);

/**
 * Core Collections PayGrades
 */
PayGrades = new Mongo.Collection("paygrades");
Partitioner.partitionCollection(PayGrades);
PayGrades.attachSchema(Core.Schemas.PayGrade);

/**
 * Core Collections paytypes
 */
PayTypes = new Mongo.Collection("paytypes");
Partitioner.partitionCollection(PayTypes);
PayTypes.attachSchema(Core.Schemas.PayType);

/**
 * Core Collections PayGroups
 */
PayGroups = new Mongo.Collection("paygroups");
Partitioner.partitionCollection(PayGroups);
PayGroups.attachSchema(Core.Schemas.PayGroup);

/**
 * Core Collections PaymentRules
 */
PaymentRules = new Mongo.Collection("paymentrules");
Partitioner.partitionCollection(PaymentRules);
PaymentRules.attachSchema(Core.Schemas.PaymentRule);


/**
 * Core Collections Payruns
 */
Payruns = new Mongo.Collection("payruns");
Partitioner.partitionCollection(Payruns);
Payruns.attachSchema(Core.Schemas.Payrun);

/**
 * Core Collections PayResults --- has logs and other stuffs
 */
PayResults = new Mongo.Collection("payresults");
Partitioner.partitionCollection(PayResults);
// PayResults.attachSchema(Core.Schemas.PayResult);

/**
 * Core Collections PostedPayrunResults
 */
PostedPayrunResults = new Mongo.Collection("postedpayrunresults");
Partitioner.partitionCollection(PostedPayrunResults);
PostedPayrunResults.attachSchema(Core.Schemas.PostedPayrunResult);

/**
 * Core Collections Pensions
 */
Pensions = new Mongo.Collection("pensions");
Partitioner.partitionCollection(Pensions);
Pensions.attachSchema(Core.Schemas.Pension);

/**
 * Core Collections Pensions
 */
PensionManagers = new Mongo.Collection("pensionmanagers");
Partitioner.partitionCollection(PensionManagers);
PensionManagers.attachSchema(Core.Schemas.PensionManager);

/**
 * Core Collections Positions
 */
Positions = new Mongo.Collection("positions");
Partitioner.partitionCollection(Positions);
Positions.attachSchema(Core.Schemas.Position);

/**
 * Core Collections Tax
 */
Tax = new Mongo.Collection("tax");
Partitioner.partitionCollection(Tax);
Tax.attachSchema(Core.Schemas.Tax);

/**
 * Core Collections Tax
 */
TimeTracks = new Mongo.Collection("timetracks");
Partitioner.partitionCollection(TimeTracks);
TimeTracks.attachSchema(Core.Schemas.TimeTrack);

/**
 * Core Collections Tenants
 */
Tenants = new Mongo.Collection("tenants");
Tenants.attachSchema(Core.Schemas.Tenant);

/**
 * Core Collections Translations
 */
Translations = new Mongo.Collection("translations");
Translations.attachSchema(Core.Schemas.Translation);

/**
 * Core Collections Document Numbers
 */
DocumentNumbers = new Mongo.Collection("documentnumbers");
Partitioner.partitionCollection(DocumentNumbers);
DocumentNumbers.attachSchema(Core.Schemas.DocumentNumber);

/**
 * Core Collections Leave Types
 */
LeaveTypes = new Mongo.Collection("leavetypes");
Partitioner.partitionCollection(LeaveTypes);
LeaveTypes.attachSchema(Core.Schemas.LeaveType);

/**
 * Core Collections Leave Types
 */
TimeTypes = new Mongo.Collection("timetypes");
Partitioner.partitionCollection(TimeTypes);
TimeTypes.attachSchema(Core.Schemas.TimeType);

/**
 * Core Collections HmoPlans
 */
HmoPlans = new Mongo.Collection("hmoplans");
Partitioner.partitionCollection(HmoPlans);
HmoPlans.attachSchema(Core.Schemas.HmoPlan);


/**
 * Core Collections Addtional Payments
 */
AdditionalPayments = new Mongo.Collection("additionalpay");
Partitioner.partitionCollection(AdditionalPayments);
AdditionalPayments.attachSchema(Core.Schemas.AdditionalPayment);

/**
 * Core Collections Constants
 */
Constants = new Mongo.Collection("constants");
Partitioner.partitionCollection(Constants);
Constants.attachSchema(Core.Schemas.Constant);

/**
 * Core Collections Projects
 */
Projects = new Mongo.Collection("projects");
Partitioner.partitionCollection(Projects);
Projects.attachSchema(Core.Schemas.Project);

/**
 * Core Collections Activities
 */
Activities = new Mongo.Collection("activities");
Partitioner.partitionCollection(Activities);
Activities.attachSchema(Core.Schemas.Activity);


/**
 * Core Collections Currencies
 */
Currencies = new Mongo.Collection("currencies");
Partitioner.partitionCollection(Currencies);
Currencies.attachSchema(Core.Schemas.Currency);

/**
 * Core Collections Times
 */
Times = new Mongo.Collection("times");
Partitioner.partitionCollection(Times);
Times.attachSchema(Core.Schemas.Time);

/**
 * Core Collections TimeWritings
 */
TimeWritings = new Mongo.Collection("timewritings");
Partitioner.partitionCollection(TimeWritings);
TimeWritings.attachSchema(Core.Schemas.TimeWriting);

/**
 * Core Collections ProcurementRequisitions
 */
ProcurementRequisitions = new Mongo.Collection("procurementrequisitions");
Partitioner.partitionCollection(ProcurementRequisitions);
ProcurementRequisitions.attachSchema(Core.Schemas.ProcurementRequisition);

/**
 * Core Collections ProcurementRequisitions
 */
TravelRequisitions = new Mongo.Collection("travelrequisitions");
Partitioner.partitionCollection(TravelRequisitions);
TravelRequisitions.attachSchema(Core.Schemas.TravelRequisition);

TravelRequisition2s = new Mongo.Collection("travelrequisition2s");
Partitioner.partitionCollection(TravelRequisition2s);
TravelRequisition2s.attachSchema(Core.Schemas.TravelRequisition2);

TimeRecord = new Mongo.Collection("timerecord");
Partitioner.partitionCollection(TimeRecord);
TimeRecord.attachSchema(Core.Schemas.TimeRecord);
/**
 * Core Collections TravelRequest
 */
TravelRequests = new Mongo.Collection("travelrequests");
Partitioner.partitionCollection(TravelRequests);
TravelRequests.attachSchema(Core.Schemas.TravelRequest);
/**
 * Core Collections Travelcities
 */
Travelcities =new Mongo.Collection("travelcities");
//Partitioner.partitionCollection(Travelcities);
Travelcities.attachSchema(Core.Schemas.Travelcity);

/**
 * Core Collections Hotel
 */
Hotels = new Mongo.Collection("hotels");
//Partitioner.partitionCollection(Hotels);
Hotels.attachSchema(Core.Schemas.Hotel);


/**
 * Core Collections StaffCategory
 */
StaffCategories = new Mongo.Collection("staffcategories");
//Partitioner.partitionCollection(StaffCategories);
StaffCategories.attachSchema(Core.Schemas.StaffCategory);


/**
 * Core Collections Budget
 */
Budgets = new Mongo.Collection("budgets");
//Partitioner.partitionCollection(Budgets);
Budgets.attachSchema(Core.Schemas.Budget);

/**
 * Core Collections Budget
 */
Airlines = new Mongo.Collection("airlines");
//Partitioner.partitionCollection(Airlines);
Airlines.attachSchema(Core.Schemas.Airline);


EmailSettings = new Mongo.Collection("emailsettings");
//Partitioner.partitionCollection(EmailSettings);
EmailSettings.attachSchema(Core.Schemas.EmailSetting);
/**
 *
 * Core Collections Budget
 */
Flightroutes = new Mongo.Collection("flightroutes");
//Partitioner.partitionCollection(Flightroutes);
Flightroutes.attachSchema(Core.Schemas.Flightroute);
/**
 * Core Collections ProcurementRequisitions
 */
PayrollApprovalConfigs = new Mongo.Collection("payrollapprovalconfig");
Partitioner.partitionCollection(PayrollApprovalConfigs);
PayrollApprovalConfigs.attachSchema(Core.Schemas.PayrollApprovalConfig);

SuccessFactorsIntegrationConfigs = new Mongo.Collection("successfactors_integration_configs");
Partitioner.partitionCollection(SuccessFactorsIntegrationConfigs);
SuccessFactorsIntegrationConfigs.attachSchema(Core.Schemas.SuccessFactorsIntegrationConfig);

SapHanaIntegrationConfigs = new Mongo.Collection("sap_hana_integration_configs");
Partitioner.partitionCollection(SapHanaIntegrationConfigs);
SapHanaIntegrationConfigs.attachSchema(Core.Schemas.SapHanaIntegrationConfig);

SuccessFactorsEvents = new Mongo.Collection("successfactors_events");
Partitioner.partitionCollection(SuccessFactorsEvents);
SuccessFactorsEvents.attachSchema(Core.Schemas.SuccessFactorsEvent);


LeaveTypes.allow({
    insert: function(userId, doc) {
        // only allow updating if you are logged in
        return Core.hasLeaveManageAccess(Meteor.userId());
    },
    update: function(userId, doc){
        //only allow if user has Admin access
        return Core.hasLeaveManageAccess(Meteor.userId());
    }
});

TimeTypes.allow({
    insert: function(userId, doc) {
        return true
    },
    update: function(userId, doc){
        return true;
    }
});

HmoPlans.allow({
    insert: function(userId, doc) {
        return true
    },
    update: function(userId, doc){
        return true;
    }
});

Leaves.allow({
    insert: function(userId, doc) {
        // only allow updating if you are logged in
        return doc.employeeId === Meteor.userId()
    },
    update: function(userId, doc) {
        // only allow updating if you are logged in
        return doc.employeeId === Meteor.userId()
    }
});

Projects.allow({
    insert: function(userId, doc) {
        // only allow updating if you are logged in
        return Core.hasTimeManageAccess(Meteor.userId());
    },
    update: function(userId, doc){
        //only allow if user has Admin access
        return Core.hasTimeManageAccess(Meteor.userId());
    }
});

Times.allow({
    insert: function(userId, doc) {
        // only allow updating if you are logged in
        return Core.hasSelfServiceAccess(Meteor.userId());
    },
    update: function(userId, doc){
        //only allow if user has Admin access
        return doc.employeeId === Meteor.userId();
    }
});

TimeWritings.allow({
    insert: function(userId, doc) {
        // only allow updating if you are logged in
        return Core.hasSelfServiceAccess(Meteor.userId());
    },
    update: function(userId, doc){
        //only allow if user has Admin access
        return doc.employeeId === Meteor.userId();
    }
});

Constants.allow({
    insert: function(userId, doc) {
        // only allow updating if you are logged in
        return Core.hasPayrollAccess(Meteor.userId());
    },
    update: function(userId, doc){
        //only allow if user has Admin access
        return Core.hasPayrollAccess(Meteor.userId());
    }
});
