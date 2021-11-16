/*****************************************************************************/
/* ApprovalConfigIndex: Event Handlers */
/*****************************************************************************/
Template.ApprovalConfigIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('ApprovalConfigCreate');
    }
});

/*****************************************************************************/
/* ApprovalsConfigs: Helpers */
/*****************************************************************************/
Template.ApprovalConfigIndex.helpers({
    'pfas': function(){
      let allPfas = ApprovalsConfigs.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return ApprovalsConfigs.find().count();
    },

});

/*****************************************************************************/
/* ApprovalsConfigs: Lifecycle Hooks */
/*****************************************************************************/
Template.ApprovalConfigIndex.onCreated(function () {
    let self = this;
    self.subscribe("approvalsconfigs", Session.get('context'));
    self.subscribe("travelcities", Session.get('context'));
});

Template.ApprovalConfigIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.ApprovalConfigIndex.onDestroyed(function () {
});

/*****************************************************************************/
/* singleApprovalConfig: Helpers */
/*****************************************************************************/
Template.singleApprovalConfig.events({
    'click .pointer': function(e, tmpl){
        e.preventDefault();
        Modal.show('ApprovalConfigCreate', this.data);
    }
})

Template.singleApprovalConfig.helpers({
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})
        if(travelcity) {
            return travelcity.name
        }
    }
});
