/*****************************************************************************/
/* StringParameter: Event Handlers */
/*****************************************************************************/
Template.StringParameter.events({
  'click [type=radio]': function(e, tmpl) {
    let clicked = e.currentTarget.id + '-' + e.currentTarget.dataset.id;
    if (e.currentTarget.checked) {
      Template.instance().state.set('parameter-value', clicked);
    }
  },
  'change select': function(e, tmpl) {
    let valueSet = e.currentTarget.dataset;
    let id = valueSet.id;
    let index = valueSet.index;
    let value = $('.select-' + index).val();
    let previewVal = $('.select-' + index).find(':selected').attr('data-friendly');

    let tempRule = Template.instance().state.get('tempRule-' + index);
    if (!tempRule) {
      let tempRule = {
        name: valueSet.name,
        promotionParameterId: id,
        operator: 'is',
        value: value,
        index: index,
        previewVal: previewVal
      };
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    } else {
      tempRule.name = valueSet.name;
      tempRule.promotionParameterId = id;
      tempRule.value = value;
      tempRule.operator = 'is';
      tempRule.index = index;
      tempRule.previewVal = previewVal;
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    }
  },
  'blur .nolookup': function(e, tmpl) {
    let valueSet = e.currentTarget.dataset;
    let id = valueSet.id;
    let index = valueSet.index;
    let value = e.currentTarget.value;

    let tempRule = Template.instance().state.get('tempRule-' + index);
    if (!tempRule) {
      let tempRule = {
        name: valueSet.name,
        promotionParameterId: id,
        value: value,
        operator: 'is',
        index: index,
        previewVal: value
      };
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    } else {
      tempRule.name = valueSet.name;
      tempRule.promotionParameterId = id;
      tempRule.value = value;
      tempRule.operator = 'is';
      tempRule.index = index;
      tempRule.previewVal = value;
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    }
  }
});

/*****************************************************************************/
/* StringParameter: Helpers */
/*****************************************************************************/
Template.StringParameter.helpers({});

/*****************************************************************************/
/* StringParameter: Lifecycle Hooks */
/*****************************************************************************/
Template.StringParameter.onCreated(function() {
  this.state = new ReactiveDict();
  let self = this;
  this.autorun(function() {
    let lookUpObject = self.data.lookUpObject;
    let lookUpField = self.data.lookUpField;
    let friendlyName = self.data.friendlyName;
    let friendlyName2 = self.data.friendlyName2;
    
    self.subscribe(lookUpObject);
    if (self.subscriptionsReady()) {
     let results = eval(lookUpObject).find().fetch();
      _.map(results, function(s) {
        s.lookUpField = s[lookUpField];
        s.friendlyName = s[friendlyName];
        if (s[friendlyName2]) s.friendlyName2 = s[friendlyName2];
        return s;
      });

      _.each(results, function(result) {
        $('.selectpicker').append('<option value="' + result.lookUpField + '" data-tokens="' + result.friendlyName + (!result.friendlyName2 ? '' : ', ' + result.friendlyName2) + '" data-friendly="' + result.friendlyName + '">' +
          (!result.friendlyName2 ? '' : result.friendlyName2 + ', ') + result.friendlyName + '</option>');
      })
      $('.selectpicker').selectpicker('show');
      $('.loading-' + self.data.index).hide();
    } else {
      $('.loading-' + self.data.index).show();
    }
  })
});

Template.StringParameter.onRendered(function() {});

Template.StringParameter.onDestroyed(function() {

});

function updatePromo(tempRule, index) {
  console.log(tempRule)
  if ((tempRule.subParamValue && _.size(tempRule) >= 8) || (!tempRule.subParamValue && _.size(tempRule) >= 6)) {
    let promotion = Session.get('draftPromotion');
    promotion.rules = _.filter(promotion.rules, function(r) {
      return r.index != index;
    });
    promotion.rules.push(tempRule);
    Session.set('draftPromotion', promotion);
  }
}
