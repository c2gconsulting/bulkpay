

Template.header.onRendered(function () {

});

Template.header.helpers({
    'context': function(){
        return Session.get('context');
    },
    'currentUserId': function() {
        return Meteor.userId();
    }
});
