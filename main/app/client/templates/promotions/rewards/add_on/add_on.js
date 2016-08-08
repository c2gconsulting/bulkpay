/*****************************************************************************/
/* AddOn: Event Handlers */
/*****************************************************************************/
Template.AddOn.events({
  'keypress input.number': function(e, tmpl) {
    // prevent non-number input
    if ((e.which < 48 || e.which > 57) && e.which !== 46) {
      e.preventDefault();
    }
  },
  'change select.reward-subtypeValue': function(e, tmpl) {
    let valueSet = e.target.dataset;
    let value = e.target.value;
    let index = valueSet.index;
    let previewVal = $('.reward-subtypeValue.select-' + index).find(':selected').attr('data-friendly');
    let tempReward = Template.instance().state.get('tempReward-' + index);
    console.log(tempReward, valueSet.index)
    if (!tempReward) {
      let tempReward = {
        subTypeValue: value,
        previewSubTypeValue: previewVal
      };
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    } else {
      tempReward.subTypeValue = value;
      tempReward.previewSubTypeValue = previewVal;
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);

    }
  },
  'change select.reward-subtype': function(e, tmpl) {
    let valueSet = e.target.dataset;
    let value = e.target.value;
    let index = valueSet.index;
    let selectedIndex = $('.reward-subtype.select-' + index).find(':selected').index();
    let previewVal = $('.reward-subtype.select-' + index).find(':selected').attr('data-friendly');
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
      tempReward.index = index;
      tempReward.previewSubType = previewVal;
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);

    }
    Session.set('selectedIndex' + index, selectedIndex);
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
        value: value,
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
/* AddOn: Helpers */
/*****************************************************************************/
Template.AddOn.helpers({

});

/*****************************************************************************/
/* AddOn: Lifecycle Hooks */
/*****************************************************************************/
Template.AddOn.onCreated(function() {
  this.state = new ReactiveDict();
  let self = this;
  let index = this.data.index;

  this.autorun(function() {
    let tempReward = Template.instance().state.get('tempReward-' + index);
    let data = self.data;
    if (!tempReward) {
      let tempReward = {
        type: data.type,
        subType: data.subType[0].code,
        previewSubType: data.subType[0].name,
        index: index
      };
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    } else {
      tempReward.type = data.type;
      tempReward.subType = data.subType[0].code;
      tempReward.index = index;
      tempReward.previewSubType = data.subType[0].name;
      Template.instance().state.set('tempReward-' + index, tempReward);
      updatePromo(tempReward, index);
    }
  })

  this.autorun(function() {
    let lookUpObject = self.data.subType[0].lookUpObject;
    let lookUpField = '_id';
    let friendlyName = 'name';
    let friendlyName2 = 'code';

    self.subscribe(lookUpObject);
    if (self.subscriptionsReady()) {
      let results = eval(lookUpObject).find().fetch();
      _.map(results, function(s) {
        s.lookUpField = s[lookUpField];
        s.friendlyName = s[friendlyName];
        if (s[friendlyName2]) s.friendlyName2 = s[friendlyName2];
        return s;
      });

      $('.reward-subtypeValue.select-' + index).find('option').remove();

      _.each(results, function(result) {
        $('select.reward-subtypeValue.select-' + index).append('<option value="' + result.lookUpField + '" data-tokens="' + result.friendlyName + (!result.friendlyName2 ? '' : ', ' + result.friendlyName2) + '" data-friendly="' + result.friendlyName + '">' +
          (!result.friendlyName2 ? '' : result.friendlyName2 + ', ') + result.friendlyName + '</option>');
      })
      $('.reward-subtypeValue.select-' + index).selectpicker('refresh');

      $('.loading-' + index).hide();

    } else {
      $('.loading-' + index).show();
    }
  });
});

Template.AddOn.onRendered(function() {
  $('.selectpicker').selectpicker('show');
  $('.loading-' + this.data.index).hide();
});

Template.AddOn.onDestroyed(function() {});

function updatePromo(tempReward, index) {
  console.log(tempReward)
  if (_.size(tempReward) >= 9) {
    let promotion = Session.get('draftPromotion');
    promotion.rewards = _.filter(promotion.rewards, function(r) {
      return r.index != index;
    });
    promotion.rewards.push(tempReward);
    Session.set('draftPromotion', promotion);
  }
}
