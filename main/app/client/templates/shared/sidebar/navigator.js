Template.navigator.onRendered(function () {

});

Template.navigator.helpers({
    'context': function(){
        return Session.get('context');
    },
    'currentUserId': function() {
        return Meteor.userId();
    }
});

Template.navlist.onRendered(function () {
    Deps.autorun(function () {
        initAll();
    });
});
