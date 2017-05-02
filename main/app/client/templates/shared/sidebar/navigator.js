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

Template.navlist.helpers({
    hasProcurementRequisitionApproveAccess: () => {
        let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(Meteor.userId());
        console.log("[navigator.js] canApproveProcurementApprove: " + canApproveProcurement);

        return canApproveProcurement;
    },
    isProcurementRequisitionActive: () => {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isProcurementRequisitionActive && businessUnitCustomConfig.isActive
        } else {
            return true
        }
    },
    'payGradeLabel': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabel
        } else {
            return "Pay Grade"
        }
    },
    'payGradeLabelPlural': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabelPlural
        } else {
            return "Pay Grades"
        }
    }
});

Template.navlist.onCreated(function () {
    console.log(`Inside navlist onCreated`)
    let self = this
    let businessUnitId = Session.get('context');

    self.businessUnitCustomConfig = new ReactiveVar()

    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.tenantId);

    self.autorun(function(){
        if(customConfigSub.ready()) {
            self.businessUnitCustomConfig.set(BusinessUnitCustomConfigs.findOne({businessId: businessUnitId}))
            // console.log(`businessUnitCustomConfig: ${JSON.stringify(self.businessUnitCustomConfig.get())}`)
        }
    })
});

Template.navlist.onRendered(function () {
    Deps.autorun(function () {
        initAll();
    });
});
