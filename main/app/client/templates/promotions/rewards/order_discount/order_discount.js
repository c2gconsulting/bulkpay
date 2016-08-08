/*****************************************************************************/
/* OrderDiscount: Event Handlers */
/*****************************************************************************/
Template.OrderDiscount.events({
  'keypress input.number': function(e, tmpl) {
    // prevent non-number input
    if ((e.which < 48 || e.which > 57) && e.which !== 46) {
      e.preventDefault();
    }
  },
  'change select.reward-uom': function(e, tmpl) {
    let valueSet = e.target.dataset;
    let value = e.target.value;
    let index = valueSet.index;
    let previewVal = $('.reward-uom.select-' + index).find(':selected').attr('data-friendly');
    let tempReward = Template.instance().state.get('tempReward-' + index);
    console.log(tempReward, valueSet.index)
    if (!tempReward) {
      let tempReward = {
        uom: value,
        type: valueSet.type,
        previewUom: previewVal,
        index: index
      };
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    } else {
      tempReward.uom = value;
      tempReward.previewUom = previewVal;
      tempReward.type = valueSet.type;
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
/* OrderDiscount: Helpers */
/*****************************************************************************/
Template.OrderDiscount.helpers({});

/*****************************************************************************/
/* OrderDiscount: Lifecycle Hooks */
/*****************************************************************************/
Template.OrderDiscount.onCreated(function() {
  this.state = new ReactiveDict();

  let self = this;
  let index = this.data.index;

  this.autorun(function() {})

});

Template.OrderDiscount.onRendered(function() {
  $('.selectpicker').selectpicker('show');
});

Template.OrderDiscount.onDestroyed(function() {});

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
