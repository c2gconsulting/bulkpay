/*****************************************************************************/
/* Payslip: Event Handlers */
/*****************************************************************************/
Template.Payslip.events({

});

/*****************************************************************************/
/* Payslip: Helpers */
/*****************************************************************************/
Template.Payslip.helpers({
    'bank': function() {
        return Template.instance().employeeData.get().bank;
    },
    'accountNumber': function() {
        return Template.instance().employeeData.get().accountNumber;
    },
    'businessUnitName': function() {
        return Template.instance().businessUnitName.get()
    },
    'payrunPeriod': function() {
        return Template.instance().payrunPeriod.get()
    },
    'currency': () => {
        return Core.getTenantBaseCurrency().iso;

    }
});

/*****************************************************************************/
/* Payslip: Lifecycle Hooks */
/*****************************************************************************/
Template.Payslip.onCreated(function () {
    let self = this;

    self.employeeData = new ReactiveVar();
    self.employeeData.set(self.data.employee);

    self.businessUnitName = new ReactiveVar()

    self.payrunPeriod = new ReactiveVar();


    let businessUnitId = Session.get('context')

    let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)

    let months = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May',
        '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October',
        '11': 'November', '12': 'December'
    }
    let payrunPeriod = Session.get('currentPayrunPeriod')

    if(payrunPeriod.month) {
        self.payrunPeriod.set(`${months[payrunPeriod.month]} ${payrunPeriod.year}`)
    }

    self.autorun(function(){
        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            //console.log(`Business unit: ${JSON.stringify(businessUnit)}`)

            self.businessUnitName.set(businessUnit.name)
        }
    })
});

Template.Payslip.onRendered(function () {
    console.log(Template.instance().data);

});

Template.Payslip.onDestroyed(function () {

});
