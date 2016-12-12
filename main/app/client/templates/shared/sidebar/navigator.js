Template.navigator.onRendered(function () {

});

Template.navigator.helpers({
    'context': function(){
        return Session.get('context');
    }
});

Template.navlist.onRendered(function () {
    Deps.autorun(function () {
        initAll();
    });
});
