/*****************************************************************************/
/* singlePaygroup: Lifecycle Hooks */
/*****************************************************************************/
Template.singlePaygroup.onCreated(function () {
    let self = this;
    self.subscribe("pension", self.data.data.pension); //subscribe to pension pubs
    self.subscribe("tax", self.data.data.tax);   //subscribe to tax pub
});

Template.singlePaygroup.onRendered(function () {

});

Template.singlePaygroup.onDestroyed(function () {
});

Template.singlePaygroup.helpers({
    tax(){
        let tax = Tax.find({_id: Template.instance().data.data.tax}).fetch();
        return tax[0];
    },
    pension(){
        let pension = Pensions.find({_id: Template.instance().data.data.pension}).fetch();
        return pension[0];
    },
    'activeClass': function(){
        return this.data.status === "Active" ? "success" : "danger";
    }
});
Template.singlePaygroup.events({
    'click .pointer': function(e, tmpl){
        Modal.show('PaygroupCreate', this.data);
    }
})
