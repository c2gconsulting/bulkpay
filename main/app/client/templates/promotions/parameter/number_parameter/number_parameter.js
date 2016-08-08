/*****************************************************************************/
/* NumberParameter: Event Handlers */
/*****************************************************************************/
Template.NumberParameter.events({
  'click [type=radio]': function(e, tmpl) {
    if (e.currentTarget.checked) {
      let checked = e.currentTarget.dataset.field;
      let index = e.currentTarget.id;
      let promotion = Session.get("draftPromotion");
      let rules = promotion.rules;

      switch (checked) {
        case 'exactly':
          $('.exactly-' + index).show();
          $('.less-than-' + index).hide();
          $('.greater-than-' + index).hide();
          $('.multiple-of-' + index).hide();
          $('.cummulative-' + index).hide();
          break;
        case 'less-than':
          $('.less-than-' + index).show();
          $('.greater-than-' + index).hide();
          $('.exactly-' + index).hide();
          $('.multiple-of-' + index).hide();
          $('.cummulative-' + index).hide();
          break;
        case 'greater-than':
          $('.greater-than-' + index).show();
          $('.less-than-' + index).hide();
          $('.cummulative-' + index).hide();
          $('.multiple-of-' + index).hide();
          $('.exactly-' + index).hide();
          break;
        case 'multiple-of':
          $('.multiple-of-' + index).show();
          $('.greater-than-' + index).hide();
          $('.less-than-' + index).hide();
          $('.cummulative-' + index).hide();
          $('.exactly-' + index).hide();

          break;
        case 'cummulative':
          $('.cummulative-' + index).show();
          $('.less-than-' + index).hide();
          $('.greater-than-' + index).hide();
          $('.multiple-of-' + index).hide();
          $('.exactly-' + index).hide();
          break;
      }
      $('.reset-number-' + index).val('');

      rules = _.filter(rules, function(r) {
        return r.index != index;
      });
      promotion.rules = rules;
      Session.set("draftPromotion", promotion);
    }
  },
  'change select': function(e, tmpl) {
    let valueSet = e.currentTarget.dataset;
    let id = valueSet.id;
    let index = valueSet.index;

    let value = $('.select-' + index).val();
    let previewVal = $('.select-' + index).find(':selected').attr('data-friendly');
    console.log(index)
    let tempRule = Template.instance().state.get('tempRule-' + index);
    if (!tempRule) {
      let tempRule = {
        subParamValue: value,
        subParamPreview: previewVal
      };
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    } else {
      tempRule.subParamValue = value;
      tempRule.subParamPreview = previewVal;
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    }

  },
  'keypress input.number': function(e, tmpl) {
    // prevent non-number input
    if (e.which < 48 || e.which > 57) {
      e.preventDefault();
    }
  },
  'blur .number': function(e, tmpl) {
    let id = e.currentTarget.id;
    let valueSet = e.currentTarget.dataset;
    let index = valueSet.index;
    let operator = valueSet.operator;
    let value = e.currentTarget.value;

    let tempRule = Template.instance().state.get('tempRule-' + index);
    if (!tempRule) {
      let tempRule = {
        name: valueSet.name,
        promotionParameterId: id,
        value: value,
        operator: operator,
        index: index,
        previewVal: value,
      };
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    } else {
      tempRule.name = valueSet.name;
      tempRule.promotionParameterId = id;
      tempRule.value = value;
      tempRule.operator = operator;
      tempRule.index = index;
      tempRule.previewVal = value;
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    }
  },
  'blur .cummulative': function(e, tmpl) {
    let id = e.currentTarget.id;
    let valueSet = e.currentTarget.dataset;
    let index = valueSet.index;
    let operator = valueSet.operator;
    let value = e.currentTarget.value;
    console.log(valueSet, value)
    let tempRule = Template.instance().state.get('tempRule-' + index);
    if (!tempRule) {
      let tempRule = {
        name: valueSet.name,
        promotionParameterId: id,
        value: value,
        operator: operator,
        index: index,
        previewVal: value,
      };
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    } else {
      tempRule.name = valueSet.name;
      tempRule.promotionParameterId = id;
      tempRule.value = value;
      tempRule.operator = operator;
      tempRule.index = index;
      tempRule.previewVal = value;
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    }
  },
  'blur .datepicker': function(e, tmpl) {
    let id = e.currentTarget.id;
    let valueSet = e.currentTarget.dataset;
    let index = valueSet.index;
    let operator = valueSet.operator;
    let value = e.currentTarget.value;

    let tempRule = Template.instance().state.get('tempRule-' + index);

    if (operator == 'from') {
      if (!tempRule) {
        let tempRule = {
          from: new Date(value)
        };
        Template.instance().state.set('tempRule-' + index, tempRule);
        updatePromo(tempRule, index);
      } else {
        tempRule.from = new Date(value);
        Template.instance().state.set('tempRule-' + index, tempRule);
        updatePromo(tempRule, index);
      }
    } else if (operator == 'to') {
      if (!tempRule) {
        let tempRule = {
          to: new Date(value)
        };
        Template.instance().state.set('tempRule-' + index, tempRule);
        updatePromo(tempRule, index);
      } else {
        tempRule.to = new Date(value);
        Template.instance().state.set('tempRule-' + index, tempRule);
        updatePromo(tempRule, index);
      }
    }
  }
});

/*****************************************************************************/
/* NumberParameter: Helpers */
/*****************************************************************************/
Template.NumberParameter.helpers({
  defaultFrom: function() {
    return moment(new Date()).startOf('day').subtract(1, 'months')._d;
  },
  defaultTo: function() {
    return moment(new Date()).endOf('day')._d;
  }
});

/*****************************************************************************/
/* NumberParameter: Lifecycle Hooks */
/*****************************************************************************/
Template.NumberParameter.onCreated(function() {
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

Template.NumberParameter.onRendered(function() {

});

Template.NumberParameter.onDestroyed(function() {});

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
