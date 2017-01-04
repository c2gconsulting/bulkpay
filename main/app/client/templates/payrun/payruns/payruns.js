/*****************************************************************************/
/* payruns: Event Handlers */
/*****************************************************************************/
import Ladda from "ladda";

Template.payruns.events({
    'click #PayGroupButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayGroupButton')[0]);
        l.start();
    }
});

/*****************************************************************************/
/* payruns: Helpers */
/*****************************************************************************/
Template.payruns.helpers({
    'month': function(){
        return Core.months()
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear() - 10; x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    'payrun': () => {
        return false
    }
});

/*****************************************************************************/
/* payruns: Lifecycle Hooks */
/*****************************************************************************/
Template.payruns.onCreated(function () {

});

Template.payruns.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.payruns.onDestroyed(function () {
});
