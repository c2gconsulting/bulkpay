/*****************************************************************************/
/* DateParameter: Event Handlers */
/*****************************************************************************/
Template.DateParameter.events({
  'click [type=radio]': function(e, tmpl) {
    if (e.currentTarget.checked) {
      let checked = e.currentTarget.dataset.field;
      let id = e.currentTarget.id;
      switch (checked) {
        case 'exactly':
          $('.exactly-' + id).show();
          $('.before-' + id).hide();
          $('.after-' + id).hide();
          break;
        case 'before':
          $('.before-' + id).show();
          $('.exactly-' + id).hide();
          $('.after-' + id).hide();
          break;
        case 'after':
          $('.after-' + id).show();
          $('.before-' + id).hide();
          $('.exactly-' + id).hide();
          break;
      }
      $('.reset-date-' + index).val('');
      let promotion = Session.get("draftPromotion");
      let rules = promotion.rules;
      rules = _.filter(rules, function(r) {
        return r.index != id;
      });
      promotion.rules = rules;
      Session.set("draftPromotion", promotion);
    }
  },
  'blur .datepicker': function(e, tmpl) {
    let id = e.currentTarget.id;
    let valueSet = e.currentTarget.dataset;
    let index = valueSet.index;
    let operator = valueSet.operator;
    let val = new Date(e.currentTarget.value);

    let tempRule = Template.instance().state.get('tempRule-' + index);
    if (!tempRule) {
      let tempRule = {
        name: valueSet.name,
        promotionParameterId: id,
        value: val,
        operator: operator,
        index: index,
        previewVal: moment(val).format('DD/MM/YYYY')
      };
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    } else {
      tempRule.name = valueSet.name;
      tempRule.promotionParameterId = id;
      tempRule.value = val;
      tempRule.operator = operator;
      tempRule.index = index;
      tempRule.previewVal = moment(val).format('DD/MM/YYYY');
      Template.instance().state.set('tempRule-' + index, tempRule);
      updatePromo(tempRule, index);
    }
  }
});
/*****************************************************************************/
/* DateParameter: Helpers */
/*****************************************************************************/
Template.DateParameter.helpers({});
/*****************************************************************************/
/* DateParameter: Lifecycle Hooks */
/*****************************************************************************/
Template.DateParameter.onCreated(function() {
  this.state = new ReactiveDict();
});

Template.DateParameter.onRendered(function() {});

Template.DateParameter.onDestroyed(function() {});

function updatePromo(tempRule, index) {
  console.log(tempRule)
  if (_.size(tempRule) >= 5) {
    let promotion = Session.get('draftPromotion');
    promotion.rules = _.filter(promotion.rules, function(r) {
      return r.index != index;
    });
    promotion.rules.push(tempRule);
    Session.set('draftPromotion', promotion);
  }
}
