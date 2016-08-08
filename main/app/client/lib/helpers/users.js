/**
 * userFullName  
 */		
Template.registerHelper('userFullName', function(userId){
  userId = userId || Meteor.userId();
  let user = Meteor.users.findOne(userId);
  if (user) return user.profile.fullName;
}); 

/**
 * userCreatedAt  
 */		
Template.registerHelper('userCreatedAt', function(userId){
  userId = userId || Meteor.userId();
  let user = Meteor.users.findOne(userId);
  if (user && user.createdAt) return Math.round(user.createdAt.getTime() / 1000);
}); 




/**
 * currentUserEmail  
 */		
Template.registerHelper('currentUserEmail', function(){
  if (Meteor.user() && Meteor.user().emails) return Meteor.user().emails[0].address;
}); 


/**
 * userInfo
 */
Template.registerHelper('userInfo', function(userId, field){
  if (!_.isString(field)) field = 'name'; // return customer name if no field specified
  let user = Meteor.users.findOne(userId);
  if (user) return user[field];
});