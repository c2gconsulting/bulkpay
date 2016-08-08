/*****************************************************************************/
/* ShippingDiscount: Event Handlers */
/*****************************************************************************/
Template.ShippingDiscount.events({
  'keypress input.number': function(e, tmpl) {
    // prevent non-number input
    if (e.which < 48 || e.which > 57) {
      e.preventDefault();
    }
  },
  'change select.reward-type': function(e, tmpl) {
    let valueSet = e.target.dataset;
    let value = e.target.value;
    let index = valueSet.index;
    let previewVal = $('.reward-type.select-' + index).find(':selected').attr('data-friendly');
    let tempReward = Template.instance().state.get('tempReward-' + index);
    console.log(tempReward, valueSet.index)
    if (!tempReward) {
      let tempReward = {
        type: valueSet.type,
        uom: value,
        previewUom: previewVal,
        index: index
      };
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    } else {
      tempReward.uom = value;
      tempReward.type = valueSet.type;
      tempReward.previewUom = previewVal;
      tempReward.index = index;
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    }
  },
  'blur input.reward-value': function(e, tmpl) {
    let valueSet = e.target.dataset;
    let value = e.target.value;
    let index = valueSet.index;

    let tempReward = Template.instance().state.get('tempReward-' + index);
    if (!tempReward) {
      let tempReward = {
        value: value
      };
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    } else {
      tempReward.value = value;
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    }
  }
});

/*****************************************************************************/
/* ShippingDiscount: Helpers */
/*****************************************************************************/
Template.ShippingDiscount.helpers({

});

/*****************************************************************************/
/* ShippingDiscount: Lifecycle Hooks */
/*****************************************************************************/
Template.ShippingDiscount.onCreated(function() {
  this.state = new ReactiveDict();
});

Template.ShippingDiscount.onRendered(function() {
  $('.selectpicker').selectpicker('show');
});

Template.ShippingDiscount.onDestroyed(function() {});

function updatePromo(tempReward, index) {
  console.log(tempReward)
  if (_.size(tempReward) >= 5) {
    let promotion = Session.get('draftPromotion');
    promotion.rewards = _.filter(promotion.rewards, function(r) {
      return r.index != index;
    });
    promotion.rewards.push(tempReward);
    Session.set('draftPromotion', promotion);
  }
}
