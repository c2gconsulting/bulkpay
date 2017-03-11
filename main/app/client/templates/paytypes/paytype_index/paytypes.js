/*****************************************************************************/
/* Paytypes: Event Handlers */
/*****************************************************************************/
Template.Paytypes.events({
    'click #createPaytype': function(e){
        e.preventDefault();
        Modal.show('PaytypeCreate');
    },
    "keyup #search-box": _.throttle(function(e, tmpl) {
      console.log("Inside throttle of searchbox");
      var text = $(e.target).val().trim();
      console.log("Text enterd: " + text);

      if (text && text.trim().length > 0) {
        tmpl.isSearchView.set(true);
        PayTypesSearch.search(text);
      } else {
        tmpl.isSearchView.set(false);
      }
    }, 200)
});

/*****************************************************************************/
/* Paytypes: Helpers */
/*****************************************************************************/
Template.Paytypes.helpers({
    'paytypes': function(){
        return PayTypes.find();
    },
    'paytypeCount': function(){
        return PayTypes.find().count();
    },
    getPayTypesSearchResults: function() {
      return PayTypesSearch.getData({
        sort: {isoScore: -1}
      });
    },
    isSearchView: function() {
      return Template.instance().isSearchView.get();
    },
});

/*****************************************************************************/
/* Paytypes: Lifecycle Hooks */
/*****************************************************************************/
Template.Paytypes.onCreated(function () {
    let self = this;
    self.subscribe("PayTypes", Session.get('context'));

    self.isSearchView = new ReactiveVar();
    self.isSearchView.set(false);
});

Template.Paytypes.onRendered(function () {
});

Template.Paytypes.onDestroyed(function () {
});


/**********************************************************************/
/* Single Paytype helper */
/******************************************************************* */

Template.singlePaytype.helpers({
    'activeClass': function(){
        return this.data.status === "Active" ? "success" : "danger";
    }
});

Template.singlePaytype.events({
    'click .pointer': function(e, tmpl){
        Modal.show('PaytypeCreate', this.data);
    }
});
