/*****************************************************************************/
/* StaffCategoryIndex: Event Handlers */
/*****************************************************************************/
Template.StaffCategoryIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('StaffCategoryCreate');
    }
});

/*****************************************************************************/
/* StaffCategories: Helpers */
/*****************************************************************************/
Template.StaffCategoryIndex.helpers({
    'pfas': function(){
      let allPfas = StaffCategories.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return StaffCategories.find().count();
    },

});

/*****************************************************************************/
/* StaffCategories: Lifecycle Hooks */
/*****************************************************************************/
Template.StaffCategoryIndex.onCreated(function () {
    let self = this;
    self.subscribe("staffcategories", Session.get('context'));
});

Template.StaffCategoryIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.StaffCategoryIndex.onDestroyed(function () {
});

/*****************************************************************************/
/* singleStaffCategory: Helpers */
/*****************************************************************************/
Template.singleStaffCategory.events({
    'click .pointer': function(e, tmpl){
        e.preventDefault();
        Modal.show('StaffCategoryCreate', this.data);
    }
})
Template.singleStaffCategory.helpers({
       
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})
        if(travelcity) {
            return travelcity.name
        }
    }
});
