/*****************************************************************************/
/* PromotionEdit: Event Handlers */
/*****************************************************************************/
Template.PromotionEdit.events({
  'submit form, click #create-order': function(e, tmpl) {
    e.preventDefault();
  },
  'click .wizard-action': function(e, tmpl) {
    let clicked = e.currentTarget.id;
    let wizardStep = clicked.substr(clicked.length - 1, clicked.length);
    if (wizardStep == Template.instance().state.get('currentWizardStep')) {

      Template.instance().state.set('currentWizardStep', '0');
    } else {
      Template.instance().state.set('currentWizardStep', wizardStep);
    }

  },
  'click .reward-add': function(e, tmpl) {
    let selectedRewards = Session.get('selectedRewards');
    let id = e.currentTarget.dataset.field;
    let reward = getReward(id);
    if (_.size(selectedRewards) === 0) {
      let promotion = getPromotion();
      promotion.rewards = [];
      setPromotion(promotion);
    }
    let r = {};
    switch (reward.type) {
      case "rebates":
        r.data = reward;
        r.template = "Rebate";
        break;
      case "lineDiscount":
        r.data = reward;
        r.template = "LineDiscount";
        break;
      case "priceReduction":
        r.data = reward;
        r.template = "PriceReduction";
        break;
      case "orderDiscount":
        r.data = reward;
        r.template = "OrderDiscount";
        break;
      case "addOn":
        r.data = reward;
        r.template = "AddOn";
        break;
      case "shippingDiscount":
        r.data = reward;
        r.template = "ShippingDiscount";
        break;
    }
    r.data.index = selectedRewards.length;
    selectedRewards.push(r);
    Session.set('selectedRewards', selectedRewards);

  },
  'blur .form-control.name': function(e, tmpl) {
    let field = e.currentTarget.dataset.field;
    let value = e.currentTarget.value;
    let promotion = getPromotion();
    if (field) {
      promotion[field] = value;
    }
    setPromotion(promotion);
  },
  'input .form-control.search-param': function(e, tmpl) {
    let value = e.currentTarget.value;
    Session.set("search-param", value);
  },
  'change .priority': function(e, tmpl) {
    let value = $('.priority').val();
    if (value) {
      let promotion = getPromotion();
      promotion.priority = value;
      setPromotion(promotion);
    }
  },
  'change .currency': function(e, tmpl) {
    let value = $('.currency').val();
    if (value) {
      let promotion = getPromotion();
      promotion.currency = value;
      setPromotion(promotion);
    }
  },
  'click [type=checkbox].exclusive': function(e, tmpl) {
    let promotion = getPromotion();
    promotion.exclusive = e.currentTarget.checked;
    setPromotion(promotion);
  },
  'blur .form-control.datepicker.step1': function(e, tmpl) {
    let field = e.currentTarget.dataset.field;
    let value = e.currentTarget.value;
    let promotion = getPromotion();
    if (field) {
      promotion[field] = new Date(value);
    }
    setPromotion(promotion);
  },
  'click .remove-rule': function(e, tmpl) {
    let index = e.currentTarget.dataset.index;
    let selectedParameters = Session.get('selectedParameters');
    let promotion = Session.get("draftPromotion");
    let rules = promotion.rules;

    rules = _.filter(promotion.rules, function(rule) {
      return rule.index != index;
    })

    selectedParameters.splice(index, 1);

    //refactor index
    for (i in rules) {
      rules[i].index = i;
    }

    //refactor index
    for (i in selectedParameters) {
      selectedParameters[i].data.index = i;
    }

    Session.set('selectedParameters', selectedParameters);
    promotion.rules = rules;
    Session.set("draftPromotion", promotion);
  },
  'click .remove-reward': function(e, tmpl) {
    let index = e.currentTarget.dataset.index;
    let selectedRewards = Session.get('selectedRewards');
    let promotion = Session.get("draftPromotion");

    let rewards = promotion.rewards;

    rewards = _.filter(promotion.rewards, function(r) {
      return r.index != index;
    })

    selectedRewards.splice(index, 1);

    //refactor index
    for (i in rewards) {
      rewards[i].index = i;
    }

    //refactor index
    for (i in selectedRewards) {
      selectedRewards[i].data.index = i;
    }

    Session.set('selectedRewards', selectedRewards);
    promotion.rewards = rewards;
    Session.set("draftPromotion", promotion);
  },
  'click .parameter-add': function(e, tmpl) {
    let id = e.currentTarget.dataset.field;
    let parameter = getParameter(id);
    let selectedParameters = Session.get('selectedParameters');
    if (_.size(selectedParameters) === 0) {
      let promotion = getPromotion();
      promotion.rules = [];
      setPromotion(promotion);
    }
    let param = {};
    switch (parameter.dataType) {
      case "String":
        param.data = parameter;
        param.template = "StringParameter";
        break;
      case "Number":
        param.data = parameter;
        param.template = "NumberParameter";
        break;
      case "Date":
        param.data = parameter;
        param.template = "DateParameter";
        break;
      case "Boolean":
        param.data = parameter;
        param.template = "BooleanParameter";
        break;
    }
    param.data.index = selectedParameters.length;
    selectedParameters.push(param);

    Session.set('selectedParameters', selectedParameters);
  },
  'click #create-promotion': function(e, tmpl) {
    let promotion = getPromotion();

    _.each(promotion.rules, function(rule) {
      if (rule.operator == 'cummulative' && !rule.to && !rule.from)
        swal({
          title: "Oops!",
          text: 'You must select date range for cummulative',
          confirmButtonClass: "btn-error",
          type: "error",
          confirmButtonText: "OK"
        });
      return;
    });

    _.map(promotion.rules, function(r) {
      delete r.index;
      // delete r.previewVal;
      // delete r.subParamPreview;
      return r;
    })
    _.map(promotion.rewards, function(r) {
      delete r.index;
      // delete r.previewSubType;
      // delete r.previewSubTypeValue;
      // delete r.previewUom;
      return r;
    })
    Meteor.call('promotions/update', promotion._id, promotion, function(error, result) {
      if (error) {
        swal({
          title: "Oops!",
          text: error.reason,
          confirmButtonClass: "btn-error",
          type: "error",
          confirmButtonText: "OK"
        });
      } else {
        swal({
          title: "Success",
          text: `Promotion has been updated`,
          confirmButtonClass: "btn-success",
          type: "success",
          confirmButtonText: "OK"
        });

        // wipe slate clean
        resetEditPromotion();

        // switch to promotions list
        Router.go('promotions.list')
      }
    });
  },
  'click #cancel-promotion': function(e, tmpl) {
    swal({
        title: "Are you sure?",
        text: "You will lose your entries!",
        type: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, exit!",
        closeOnConfirm: false
      },
      function() {
        resetEditPromotion();

        swal({
          title: "Cancelled",
          text: "You have opted out.",
          confirmButtonClass: "btn-info",
          type: "info",
          confirmButtonText: "OK"
        });
        Router.go('promotions.list');
      });
  }
});

/*****************************************************************************/
/* PromotionEdit: Helpers */
/*****************************************************************************/
Template.PromotionEdit.helpers({
  promotion: function() {
    return getPromotion();
  },
  promotionParameters: function() {
    return getParams();
  },
  promotionRewards: function() {
    return getRewards();
  },
  showWizardStepDetails: function(step) {
    if (step == Template.instance().state.get('currentWizardStep')) {
      return '';
    } else {
      return 'hidden';
    }
  },
  isActiveWizardStep: function(step) {
    return (step == Template.instance().state.get('currentWizardStep'));
  },
  isActiveWizardStepComplete: function(step) {
    let promotion = getPromotion(),
      status = false,
      rules = promotion.rules,
      rewards = promotion.rewards;

    switch (step) {
      case 1:
        status = (promotion.startDate && promotion.name) ? true : false;
        break;
      case 2:
        status = (rules.length > 0) ? true : false;
        break;
      case 3:
        status = (rewards.length > 0) ? true : false;
        break;
    }
    return status;
  },
  selectedParameters: function() {
    return Session.get('selectedParameters');
  },
  selectedRewards: function() {
    return Session.get('selectedRewards');
  },
  hasContent: function(arr) {
    return arr.length > 0;
  },
  isComplete: function() {
    let promotion = Session.get('draftPromotion');
    return ((promotion.startDate && promotion.name && promotion.currency) && _.size(promotion.rules) > 0 && _.size(promotion.rewards) > 0) ? true : false;
  },
  promotion: function() {
    return Session.get('draftPromotion');
  },
  add: function(a, b) {
    return a + b;
  },
  prettyDate: function(date) {
    return moment(date).format('DD/MM/YYYY');
  },
  hasNext: function(data, index) {
    return index < (_.size(data) - 1);
  },
  equal: function(a, b) {
    return a == b;
  },
  size: function(arr) {
    return _.size(arr);
  },
  searchParam: function() {
    return Session.get("search-param");
  },
  currencies: function() {
    return Tenants.findOne().currencies;
  }
});

/*****************************************************************************/
/* PromotionEdit: Lifecycle Hooks */
/*****************************************************************************/
Template.PromotionEdit.onCreated(function() {

  //if order is not open, redirect to details view
  let testPromotion = Promotions.findOne(Template.parentData()._id);
  if (testPromotion.status !== 'pending') Router.go('promotions.detail', { _id: Template.parentData()._id });

  this.state = new ReactiveDict();
  let self = this;

  resetDraftPromotion();
  Session.set('promotionParameters', []);
  Session.set('selectedParameters', []);
  Session.set('selectedRewards', []);

  this.autorun(function() {
    let searchParam = Session.get("search-param");
    self.subscribe('PromotionParameters', searchParam);
    if (self.subscriptionsReady()) {
      Session.set("promotionParameters", PromotionParameters.find().fetch());
    }
  })


});

Template.PromotionEdit.onRendered(function() {
  $('.selectpicker').selectpicker('show');

});

Template.PromotionEdit.onDestroyed(function() {});

function getPromotion() {
  //retrieve or create new promotion shell
  let promotion = Session.get('draftPromotion');
  if (!promotion) {
    promotion = resetDraftPromotion();
  }
  return promotion;
}

function setPromotion(promotion) {
  Session.set('draftPromotion', promotion);
}

function resetDraftPromotion() {
  // reset new promotion and set defaults
  let promotion = Promotions.findOne(Template.parentData()._id);
  delete promotion._groupId;

  Session.set('draftPromotion', promotion);
  return promotion;
}

function resetEditPromotion() {
  // create new promotion and set defaults
  let promotion = {
    "status": "pending",
    "priority": "normal",
    "currency": Core.getTenantBaseCurrency().iso,
    "exclusive": false,
    "startDate": moment(new Date()).startOf('day')._d,
    "endDate": moment(new Date()).endOf('day').add(1, 'months')._d,
    "createdAt": new Date,
    "rules": [],
    "rewards": []
  }
  Session.set('draftPromotion', promotion);
  return promotion;
}

function getParameter(id) {
  return PromotionParameters.find({
    _id: typeof id == "string" ? id : eval(id)
  }).fetch()[0];
}

function getParams() {
  return Session.get("promotionParameters");
}

function ObjectID(hexString) {
  return new Mongo.ObjectID(hexString);
};

function getReward(id) {
  return _.findWhere(getRewards(), {
    _id: id
  })
}

function getRewards() {
  return [{
      "_id": "1",
      "name": "Rebates",
      "type": "rebates",
      "subType": [{
          "name": "Transport Rebate",
          "code": "tr"
        }
        /*, {
              "name": "Bonus Rebate",
              "code": "br"
            }*/
      ],
      "uom": [{
        "name": "% of Total Order Value",
        "code": "tov"
      }, {
        "name": "A fixed amount",
        "code": "afa"
      }]
    }, {
      "_id": "2",
      "name": "Order Discount",
      "type": "orderDiscount",
      "uom": [{
        "name": "% of Total Order Value",
        "code": "tov"
      }, {
        "name": "A fixed amount",
        "code": "afa"
      }]
    }, {
      "_id": "3",
      "name": "Line Discount",
      "type": "lineDiscount",
      "subType": [{
        "name": "Product",
        "code": "product",
        "lookUpObject": "Products"
      }, {
        "name": "Product Variant",
        "code": "productVariant",
        "lookUpObject": "ProductVariants"
      }],
      "uom": [{
        "name": "% of Price",
        "code": "pp"
      }, {
        "name": "A fixed amount",
        "code": "afa"
      }]
    }, {
      "_id": "6",
      "name": "Price Reduction",
      "type": "priceReduction",
      "subType": [{
        "name": "Product",
        "code": "product",
        "lookUpObject": "Products"
      }, {
        "name": "Product Variant",
        "code": "productVariant",
        "lookUpObject": "ProductVariants"
      }],
      "uom": [{
        "name": "% of Price",
        "code": "pp"
      }, {
        "name": "A fixed amount",
        "code": "afa"
      }]
    }, {
      "_id": "4",
      "name": "An Add-on Item",
      "type": "addOn",
      "subType": [{
        "name": "Product Variant",
        "code": "productVariant",
        "lookUpObject": "ProductVariants"
      }],
      "uom": [{
        "name": "% of Order Quantity",
        "code": "poo"
      }, {
        "name": "A fixed amount",
        "code": "afa"
      }]
    }
    /*, {
        "_id": "5",
        "name": "A Shipping Discount",
        "type": "shippingDiscount",
        "uom": [{
          "name": "% of Shipping Cost",
          "code": "psc"
        }, {
          "name": "% of Total Order Value",
          "code": "tov"
        }, {
          "name": "A fixed amount",
          "code": "afa"
        }]
      }*/
  ]
}
