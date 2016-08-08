/*****************************************************************************/
/* StockAdjustmentCreate: Event Handlers */
/*****************************************************************************/
import accounting from 'accounting';
import Ladda from 'ladda';

Template.StockAdjustmentCreate.events({
  'input input.fast-search': function(e, tmpl) {
    let stockAdjustment = getStockAdjustment();
    let searchText = e.target.value;
    let locationId = stockAdjustment.locationId;
    let self = this;

    if (searchText.length >= 3 && locationId) {
      Meteor.call('products/getVariants', searchText, locationId, function(err, variants) {
        if (err) {
          console.log('Error: ' + err);
        } else {
          let obj = [],
            i = 0;
          _.each(variants, function(v) {

            // text
            vText = v.name || v.description;
            if (vText && vText.length > 36) vText = vText.substring(0, 36) + '..';

            // amount
            vAmountString = '';
            vAmount = 0;
            if (v.variantPrices && v.variantPrices.length > 0) {
              vAmount = v.variantPrices[0].value;
            } else {
              vAmount = v.wholesalePrice;
            }

            vAmountString = Core.numberWithDecimals(vAmount);

            vCode = v.code ? ', ' + v.code : '';

            // quantity
            vQuantity = 0;
            if (v.locations && v.locations.length > 0) {
              vQuantity = v.locations[0].stockOnHand;
              obj[i++] = [v._id, vText, vAmountString, vQuantity, v.code, v.name, v.uom, vAmount, vCode];
            }
          });
          let res = $(`#divSearch_${self.index}`);
          $(res).html('');
          _.forEach(obj, function(el) {
            $(res).append('' +
              '<div class="fast-search-elem" data-price="' + el[7] + '" data-available="' + el[3] + '" data-name="' + el[5] + '" data-uom="' + el[6] + '" data-code="' + el[4] + '" data-id="' + el[0] + '" data-caption="' + el[1] + '"><div>' +
              '<div class="col-sm-9 col-xs-9 n-side-padding">' +
              el[1] + '<span class="text-muted"><small>' + el[8] + '</small></span>' +
              '</div>' +
              '<div class="col-sm-2 col-xs-2 n-side-padding pr20 fs11 text-right text-nowrap">' +
              " " +
              '</div>' +
              '<div class="col-sm-1 col-xs-1 n-side-padding fs11 text-right">' +
              '<span class="badge text-muted">' + el[3] + '</span>' +
              '</div>' +
              '<div class="clearfix"></div>' +
              '</div><div class="clearfix"></div></div>'
            );
          });
          if (variants && variants.length > 0) $(res).show();
          else $(res).hide();
        }

      });
    } else {
      $(`#divSearch_${self.index}`).hide();
    }


  },
  'blur input.fast-search': function(e, tmpl) {
    setTimeout(function() {
      $('.fast-search-result').hide();
    }, 100);
  },
  'click .fast-search-elem, mousedown .fast-search-elem': function(e, tmpl) {

    let variantData = e.currentTarget.dataset;
    let stockAdjustment = getStockAdjustment();

    //update input text. Useful as reactive update will not happen if selected variant does not change
    tmpl.$(e.currentTarget.parentNode.parentNode).find('input').val(variantData.code + ', ' + variantData.name);

    stockAdjustment.items[this.index].variantId = variantData.id;
    stockAdjustment.items[this.index].bogusVariant = variantData;
    setStockAdjustment(stockAdjustment);
  },
  'mouseup .fast-search-elem': function(e, tmpl) {
    setTimeout(function() {
      $('.fast-search-result').hide();
    }, 100);

  },

  'change [name=locationId]': function(e, tmpl) {
    let value = tmpl.$('[name=locationId]').val();
    let stockAdjustment = getStockAdjustment();
    stockAdjustment.locationId = value;
    setStockAdjustment(stockAdjustment);
  },

  'click [name=btnAddItem]': function(e, tmpl) {
    let stockAdjustment = getStockAdjustment();
    stockAdjustment.items.push({
      "index": stockAdjustment.items.length,
      "quantity": 0
    });
    setStockAdjustment(stockAdjustment, true);
  },
  'click .remove-item': function(e, tmpl) {
    let index = e.currentTarget.dataset.index;
    let stockAdjustment = getStockAdjustment();
    stockAdjustment.items.splice(index, 1);
    //refactor index
    for (i in stockAdjustment.items) {
      stockAdjustment.items[i].index = i;
    }
    setStockAdjustment(stockAdjustment, true);
  },

  'keyup input[data-ifield=quantity], change input[data-type=item]': function(e, tmpl) {
    let index = e.currentTarget.dataset.index;
    let field = e.currentTarget.dataset.ifield;
    let value = e.currentTarget.value;
    let stockAdjustment = getStockAdjustment();

    let noRefresh;
    if (field === 'quantity') {
      value = value.replace(/,/g, '');
      value = numberize(value);
      value = value < 0 ? 0 : value;
      tmpl.$('input#txtQty-' + index).val(accounting.formatNumber(value));
      noRefresh = true;
    }
    if (field) stockAdjustment.items[index][field] = value;
    setStockAdjustment(stockAdjustment, noRefresh);

  },
  'keypress input[data-ifield=quantity]': function(e, tmpl) {
    // prevent non-number input
    if (e.which < 48 || e.which > 57) {
      e.preventDefault();
    }
  },

  'blur [name=stock-adjustment-comment]': function(e, tmpl) {
    let stockAdjustment = getStockAdjustment();
    let value = e.currentTarget.value.trim();
    if (value && value.length > 0) {
      stockAdjustment.comments = value;
    } else {
      delete stockAdjustment.comments;
    }
    setStockAdjustment(stockAdjustment, true);
  },

  'click #cancel': function(e, tmpl) {
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
        resetStockAdjustment();
        swal({
          title: "Cancelled",
          text: "Stock adjustment cancelled.",
          confirmButtonClass: "btn-info",
          type: "info",
          confirmButtonText: "OK"
        });
        Router.go('stockAdjustments.list');
      });
  },
  'submit form, click #create-stockAdjustment': function(e, tmpl) {
    e.preventDefault();
    let adjustmentContext = Core.Schemas.StockAdjustment.namedContext("stockAdjustmentForm");
    if (adjustmentContext.isValid()) {
      // Load button animation
      tmpl.$('#create-stockAdjustment').text('Adjusting... ');
      tmpl.$('#create-stockAdjustment').attr('disabled', true);


      try {
        let l = Ladda.create(tmpl.$('#create-stockAdjustment')[0]);
        l.start();
      } catch(e) {
        console.log(e);
      }


      let resetButton = function() {
        // End button animation
        try {
          let l = Ladda.create(tmpl.$('#create-stockAdjustment')[0]);
          l.stop();
          l.remove();
        } catch(e) {
          console.log(e);
        }

        tmpl.$('#create-stockAdjustment').text('Adjust Stock ');

        // Add back glyphicon
        let icon = document.createElement('span');
        icon.className = 'glyphicon glyphicon-adjust';
        tmpl.$('#create-stockAdjustment')[0].appendChild(icon);

        tmpl.$('#create-stockAdjustment').removeAttr('disabled');
      };


      let stockAdjustment = prepareStockAdjustment(getStockAdjustment());
      Meteor.call('stockAdjustments/create', stockAdjustment, function(error, result) {
        if (error) {
          swal({
            title: "Oops!",
            text: error.reason,
            confirmButtonClass: "btn-error",
            type: "error",
            confirmButtonText: "OK"
          });
          resetButton();

        } else {

          swal({
            title: "Success",
            text: `Stock Adjustment ${result.stockAdjustmentNumber} has been processed`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });

          // wipe slate clean
          resetStockAdjustment();
          resetButton();

          // switch to transfer detail
          Router.go('stockAdjustments.detail', { _id: result._id });
        }

        //

      });
    } else {
      // load validation errors
    }
  }

});

/*****************************************************************************/
/* StockAdjustmentCreate: Helpers */
/*****************************************************************************/
Template.StockAdjustmentCreate.helpers({
  stockTransfer: function () {
    return getStockAdjustment();
  },
  locationAfter: function () {
    if (this.bogusVariant) {
      let location = this.bogusVariant.location || 0;
      let quantity = this.quantity || 0;
      return location - quantity
    }
  },
  getTotalItems: function () {
    let subTotal = 0;
    let stockAdjustment = getStockAdjustment();
    _.each(stockAdjustment.items, function(item) {
      subTotal += item.quantity
    });
    return subTotal
  },
  disableSubmit: function () {
    let adjustmentContext = Core.Schemas.StockAdjustment.namedContext("stockAdjustmentForm");
    return adjustmentContext.isValid() ? '' : 'disabled';
  }
});

/*****************************************************************************/
/* StockAdjustmentCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.StockAdjustmentCreate.onCreated(function () {
  let instance = this;

  let adjustmentContext = Core.Schemas.StockAdjustment.namedContext("stockAdjustmentForm");

  this.autorun(function(computation) {
    let strippedStockAdjustment = prepareStockAdjustment(getStockAdjustment());
    adjustmentContext.validate(strippedStockAdjustment);

    let stockAdjustment = getStockAdjustment();
    let location = Locations.findOne({}, { sort: { name: 1}});
    if (!stockAdjustment.locationId && location) stockAdjustment.locationId = location._id;
    if (stockAdjustment.items[0] && stockAdjustment.items[0].variantId) {
      let variantIds = _.pluck(stockAdjustment.items, 'variantId');
      instance.subscribe('VariantsForStockTransfer', variantIds);
      if (instance.subscriptionsReady()) {
        for (let i in stockAdjustment.items) {
          v = ProductVariants.findOne(stockAdjustment.items[i].variantId);
          if (v) {
            stockAdjustment.items[i].bogusVariant = v;

            // prep display caption
            let shortTag = v.name.length > 36 ? v.name.substring(0, 36) + '..' : v.name;
            stockAdjustment.items[i].bogusVariant.caption = v.code + ', ' + shortTag;

            stockAdjustment.items[i].bogusVariant.available = 0;
            if (v.locations && v.locations.length > 0) {
              let location = _.find(v.locations, function (location) {
                return location.locationId === stockAdjustment.locationId;
              });
              location = location ? location.stockOnHand : 0;
              stockAdjustment.items[i].bogusVariant.location = location;
            }
          }
        }
        setStockAdjustment(stockAdjustment);
      }
    }
    setStockAdjustment(stockAdjustment);
  });

});

Template.StockAdjustmentCreate.onRendered(function () {
  let instance = this;
  instance.autorun(function(computation) {
    if (instance.subscriptionsReady()) {
      // refresh all selects
      Meteor.defer(function() {
        try {
          instance.$('[name=locationId]').selectpicker('refresh');
        } catch (e) {
          console.log(e)
        }
      });
    }
  });
});

Template.StockAdjustmentCreate.onDestroyed(function () {
});



/*****************************************************************************/
/* General Functions */
/*****************************************************************************/

let getStockAdjustment = () => {

  let stockAdjustment = Session.get('stockAdjustment');

  if (!stockAdjustment) {
    stockAdjustment = resetStockAdjustment();
  } else {
    if (!stockAdjustment.userId) stockAdjustment.userId = Meteor.userId();
    if (!stockAdjustment.createdAt) stockAdjustment.createdAt = new Date;
  }

  return stockAdjustment;
};


let resetStockAdjustment = () => {
  // create new stockAdjustment and set defaults
  let stockAdjustment = {
    "userId": Meteor.userId(),
    "createdAt": new Date,
    "receivedAt": new Date,
    "items": [
      {
        "index": 0,
        "quantity": 0
      }
    ]
  };
  Session.set('stockAdjustment', stockAdjustment);
  return stockAdjustment;
};

let setStockAdjustment = (stockAdjustment, noRefresh) => {
  stockAdjustment.noRefresh = !!noRefresh;
  Session.set('stockAdjustment', stockAdjustment);
};

let numberize = n => {
  return Math.round(_.isNaN(Number(n)) ? 0 : Number(n)); //upgrade to 2 decimals
};


let prepareStockAdjustment = (stockAdjustment, tmpl) => {
  tmpl = tmpl || Template.instance();
  if (stockAdjustment) {
    _.forEach(stockAdjustment.items, function(i) {
      delete i.bogusVariant;
      delete i.index;

      // numberize
      i.quantity = numberize(i.quantity);

    });
    delete stockAdjustment.noRefresh;
  }
  return stockAdjustment;
};


