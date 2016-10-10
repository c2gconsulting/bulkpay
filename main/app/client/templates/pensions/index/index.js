/*****************************************************************************/
/* Pensions: Event Handlers */
/*****************************************************************************/
Template.Pensions.events({
    'click #pension-tab': (e,tmpl) => {
        $('#pension-tab').addClass('active');
        $('#PFA-tab').removeClass('active');
        //$('#pensionContext').html(null);
        //UI.insert( UI.render( Template.PensionIndex ), $('#pensionContext').get(0) );
        Session.set('pensionContext', null);
    },
    'click #PFA-tab': (e,tmpl) => {
        $('#PFA-tab').addClass('active');
        $('#pension-tab').removeClass('active');
        //$('#pensionContext').html(null);
        //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
        Session.set('pensionContext', 'pension');
    }

});

/*****************************************************************************/
/* Pensions: Helpers */
/*****************************************************************************/
Template.Pensions.helpers({
    'pensionContext': () => {
        return Session.get('pensionContext');
    }
});

/*****************************************************************************/
/* Pensions: Lifecycle Hooks */
/*****************************************************************************/
Template.Pensions.onCreated(function () {
});

Template.Pensions.onRendered(function () {
    //UI.insert( UI.render( Template.PensionIndex ), $('#pensionContext').get(0) );
});

Template.Pensions.onDestroyed(function () {
    //clear session context
    Session.set('pensionContext', null);
});
