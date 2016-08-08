/*****************************************************************************/
/* Rebate: Event Handlers */
/*****************************************************************************/
Template.Rebate.events({
  'keypress input.number': function(e, tmpl) {
    // prevent non-number input
    if ((e.which < 48 || e.which > 57) && e.which !== 46) {
      e.preventDefault();
    }
  },
  'change select.rebate-type': function(e, tmpl) {
    let valueSet = e.target.dataset;
    let value = e.target.value;
    let index = valueSet.index;
    let previewVal = $('.rebate-type.select-' + index).find(':selected').attr('data-friendly');
    let tempReward = Template.instance().state.get('tempReward-' + index);
    console.log(tempReward, valueSet.index)

    if (!tempReward) {
      let tempReward = {
        type: valueSet.type,
        subType: value,
        previewSubType: previewVal,
        index: valueSet.index
      };
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);

    } else {
      tempReward.type = valueSet.type;
      tempReward.subType = value;
      tempReward.previewSubType = previewVal;
      tempReward.index = index;
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);

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
        uom: value,
        previewUom: previewVal
      };
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    } else {
      tempReward.uom = value;
      tempReward.previewUom = previewVal;
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
/* Rebate: Helpers */
/*****************************************************************************/
Template.Rebate.helpers({});

/*****************************************************************************/
/* Rebate: Lifecycle Hooks */
/*****************************************************************************/
Template.Rebate.onCreated(function() {
  this.state = new ReactiveDict();
});

Template.Rebate.onRendered(function() {
  $('.selectpicker').selectpicker('show');
});

Template.Rebate.onDestroyed(function() {});


function updatePromo(tempReward, index) {
  console.log(tempReward)
  if (_.size(tempReward) >= 7) {
    let promotion = Session.get('draftPromotion');
    promotion.rewards = _.filter(promotion.rewards, function(r) {
      return r.index != index;
    });
    promotion.rewards.push(tempReward);
    Session.set('draftPromotion', promotion);
  }
}
