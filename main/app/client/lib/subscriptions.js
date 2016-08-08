/*
 * Core.session
 * Create persistent sessions for users
 * The server returns only one record, so findOne will return that record
 * Stores into client session all data contained in server session
 * supports reactivity when server changes the serverSession
 * Stores the server session id into local storage / cookies
 */
let currentSession;
let serverSession = Random.id();

Tracker.autorun(function () {
  currentSession = Session.get("sessionId") || amplify.store(
    "Core.session");
  if (!currentSession) {
    amplify.store("Core.session", serverSession);
    Session.set("sessionId", serverSession);
    currentSession = serverSession;
  }
});

Meteor.subscribe("Sessions", currentSession);

/**
 * Profile Subscriptions
 */
Meteor.subscribe("UserProfile", Meteor.userId());

/**
 * General Subscriptions
 */
Meteor.subscribe("Media");
Meteor.subscribe("Taxes");





// client: subscribe to the count for open items
Tracker.autorun(function () {
  Meteor.subscribe("OpenOrderCount");
  Meteor.subscribe("PendingCustomerCount");
  Meteor.subscribe("PendingReturnCount");
  Meteor.subscribe("UnpaidInvoiceCount");
});

