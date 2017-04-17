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

    let businessUnitId = Session.get('context')

    let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)

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
