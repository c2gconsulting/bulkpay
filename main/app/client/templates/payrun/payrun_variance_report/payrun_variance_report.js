
/*****************************************************************************/
/* PayrunVarianceReport: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';


Template.PayrunVarianceReport.events({
});

/*****************************************************************************/
/* PayrunVarianceReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.PayrunVarianceReport.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'result': () => {
        return Template.instance().varianceResults.get();
    },
    'netPayData': () => {
        let rawData = Template.instance().varianceResults.get();

        if(rawData && rawData.length > 0) {
            return rawData.splice(1)
        }        
    },
    'isEqual': (a, b) => {
        return a === b
    },
    'or': (a, b) => {
        return a || b
    },
    'isNumber': (value) => {
        return !isNaN(value)
    }
});

/*****************************************************************************/
/* PayrunVarianceReport: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunVarianceReport.onCreated(function () {
    let self = this;
    self.varianceResults = new ReactiveVar();
});

Template.PayrunVarianceReport.onRendered(function () {
  	self.$('select.dropdown').dropdown();
});

Template.PayrunVarianceReport.onDestroyed(function () {
});
