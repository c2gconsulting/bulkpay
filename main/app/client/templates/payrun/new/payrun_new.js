/*****************************************************************************/
/* Payments: Event Handlers */
/*****************************************************************************/
Template.PayrunNew.events({
});

/*****************************************************************************/
/* Payments: Helpers */
/*****************************************************************************/
Template.PayrunNew.helpers({
    'month': function(){
        return [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear(); x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    }
});

/*****************************************************************************/
/* Payments: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunNew.onCreated(function () {
});

Template.PayrunNew.onRendered(function () {
});

Template.PayrunNew.onDestroyed(function () {
});
