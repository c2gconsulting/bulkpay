/*****************************************************************************/
/* BooleanParameter: Event Handlers */
/*****************************************************************************/
Template.BooleanParameter.events({
  'click #boolean': function(e, tmpl) {
    e.preventDefault();

    let id = this._id;
    let index = this.index;

    let tempRule = Template.instance().state.get('tempRule-' + index);
    if (!tempRule) {
      let tempRule = {
        name: this.name,
        promotionParameterId: id,
        value: true,
        operator: 'is',
        index: index,
        previewVal: true
      };
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    } else {
      tempRule.name = this.name;
      tempRule.promotionParameterId = id;
      tempRule.value = tempRule.value ? false : true;
      tempRule.operator = 'is';
      tempRule.index = index;
      tempRule.previewVal = tempRule.previewVal ? false : true;
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    }
  }
});

/*****************************************************************************/
/* BooleanParameter: Helpers */
/*****************************************************************************/
Template.BooleanParameter.helpers({
  checked: function(index) {
    return Template.instance().state.get('tempRule-' + index).value;
  }
});

/*****************************************************************************/
/* BooleanParameter: Lifecycle Hooks */
/*****************************************************************************/
Template.BooleanParameter.onCreated(function() {
  this.state = new ReactiveDict();
  let self = this;
  let tempRule = {
    name: self.data.name,
    promotionParameterId: self.data._id,
    value: false,
    operator: 'is',
    index: self.data.index,
    previewVal: false
  };
  Template.instance().state.set('tempRule-' + self.data.index, tempRule);
  updatePromo(tempRule, self.data.index);
});

Template.BooleanParameter.onRendered(function() {});

Template.BooleanParameter.onDestroyed(function() {

});

function updatePromo(tempRule, index) {
  console.log(tempRule)
  if (_.size(tempRule) >= 6) {
    let promotion = Session.get('draftPromotion');
    promotion.rules = _.filter(promotion.rules, function(r) {
      return r.index != index;
    });
    promotion.rules.push(tempRule);
    Session.set('draftPromotion', promotion);
  }
}
