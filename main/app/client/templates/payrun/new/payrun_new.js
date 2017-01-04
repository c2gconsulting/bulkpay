/*****************************************************************************/
/* Payments: Event Handlers */
/*****************************************************************************/
Template.PayrunNew.events({
    'click #startProcessing': (e,tmpl) => {
        var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        Meteor.setTimeout(function(){
            Blaze.remove(view);
        },10000);
    }
});

/*****************************************************************************/
/* Payments: Helpers */
/*****************************************************************************/
Template.PayrunNew.helpers({
    'month': function(){
        return Core.months()
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear(); x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    'paygrades': () => {
       return PayGrades.find();
    }
});

/*****************************************************************************/
/* Payments: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunNew.onCreated(function () {
    this.subscribe("paygrades", Session.get('context'));
});

Template.PayrunNew.onRendered(function () {
});

Template.PayrunNew.onDestroyed(function () {
});
