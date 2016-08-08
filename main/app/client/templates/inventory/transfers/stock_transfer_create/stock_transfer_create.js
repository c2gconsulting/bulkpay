/*****************************************************************************/
/* StockTransferCreate: Event Handlers */
/*****************************************************************************/
import accounting from 'accounting';
import Ladda from 'ladda';
Template.StockTransferCreate.events({
    'input input.fast-search': function(e, tmpl) {
        let stockTransfer = getStockTransfer();
        let searchText = e.target.value;
        let locationId = stockTransfer.sourceId;
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
        let stockTransfer = getStockTransfer();

        //update input text. Useful as reactive update will not happen if selected variant does not change
        tmpl.$(e.currentTarget.parentNode.parentNode).find('input').val(variantData.code + ', ' + variantData.name);

        stockTransfer.items[this.index].variantId = variantData.id;
        stockTransfer.items[this.index].bogusVariant = variantData;
        setStockTransfer(stockTransfer);
    },
    'mouseup .fast-search-elem': function(e, tmpl) {
        setTimeout(function() {
            $('.fast-search-result').hide();
        }, 100);

    },
    'change [name=sourceId]': function(e, tmpl) {
        let value = tmpl.$('[name=sourceId]').val();
        let stockTransfer = getStockTransfer();
        stockTransfer.sourceId = value;
        setStockTransfer(stockTransfer);

    },
    'change [name=destinationId]': function(e, tmpl) {
        let value = tmpl.$('[name=destinationId]').val();
        let stockTransfer = getStockTransfer();
        stockTransfer.destinationId = value;
        setStockTransfer(stockTransfer);
    },
    'click [name=btnAddItem]': function(e, tmpl) {
        let stockTransfer = getStockTransfer();
        stockTransfer.items.push({
            "index": stockTransfer.items.length,
            "quantity": 0
        });
        setStockTransfer(stockTransfer, true);
    },
    'click .remove-item': function(e, tmpl) {
        let index = e.currentTarget.dataset.index;
        let stockTransfer = getStockTransfer();
        stockTransfer.items.splice(index, 1);

        //refactor index
        for (i in stockTransfer.items) {
            stockTransfer.items[i].index = i;
        }
        setStockTransfer(stockTransfer, true);
    },
    'keyup input[data-ifield=quantity], change input[data-type=item]': function(e, tmpl) {
        let index = e.currentTarget.dataset.index;
        let field = e.currentTarget.dataset.ifield;
        let value = e.currentTarget.value;
        let stockTransfer = getStockTransfer();

        let noRefresh;
        if (field === 'quantity') {
            value = value.replace(/,/g, '');
            value = numberize(value);
            value = value < 0 ? 0 : value;
            tmpl.$('input#txtQty-' + index).val(accounting.formatNumber(value));
            noRefresh = true;
        }
        if (field) stockTransfer.items[index][field] = value;
        setStockTransfer(stockTransfer, noRefresh);

    },
    'keypress input[data-ifield=quantity]': function(e, tmpl) {
        // prevent non-number input
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
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
                resetStockTransfer();
                swal({
                    title: "Cancelled",
                    text: "Stock transfer cancelled.",
                    confirmButtonClass: "btn-info",
                    type: "info",
                    confirmButtonText: "OK"
                });
                Router.go('transfers.list');
            });
    },
    'submit form, click #create-stockTransfer': function(e, tmpl) {
        e.preventDefault();
        let transferContext = Core.Schemas.StockTransfer.namedContext("stockTransferForm");
        if (transferContext.isValid()) {
            // Load button animation
            tmpl.$('#create-stockTransfer').text('Transfering... ');
            tmpl.$('#create-stockTransfer').attr('disabled', true);


            try {
                let l = Ladda.create(tmpl.$('#create-stockTransfer')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }


            let resetButton = function() {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('#create-stockTransfer')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('#create-stockTransfer').text('Transfer Stock ');

                // Add back glyphicon
                let icon = document.createElement('span');
                icon.className = 'glyphicon glyphicon-retweet';
                tmpl.$('#create-stockTransfer')[0].appendChild(icon);

                tmpl.$('#create-stockTransfer').removeAttr('disabled');
            };


            let stockTransfer = prepareStockTransfer(getStockTransfer());
            Meteor.call('stockTransfers/create', stockTransfer, function(error, result) {
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
                        text: `Stock transfer completed `,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });

                    // wipe slate clean
                    resetStockTransfer();
                    resetButton();

                    // switch to transfer detail
                    Router.go('transfers.detail', { _id: result._id })
                }

                //

            });
        } else {
            // load validation errors
        }
    }
});

/*****************************************************************************/
/* StockTransferCreate: Helpers */
/*****************************************************************************/
Template.StockTransferCreate.helpers({
    arrayedStockTransfer: function() {
        return [getStockTransfer()];
    },
    sourceAfter: function () {
        if (this.bogusVariant){
            let source = this.bogusVariant.source || 0;
            let quantity = this.quantity || 0;
            return source - quantity
        }
    },
    destinationAfter: function () {
        if (this.bogusVariant){
            let destination = this.bogusVariant.destination || 0;
            let quantity = this.quantity || 0;
            return destination + quantity
        }
    },
    getTotalItems: function () {
        let subTotal = 0;
        _.each(this.items, function(item) {
            subTotal += item.quantity
        });
        return subTotal
    },
    disableSubmit: function() {
        let orderContext = Core.Schemas.StockTransfer.namedContext("stockTransferForm");
        if (orderContext.isValid()) return '';
        else return 'disabled';
    }
});

/*****************************************************************************/
/* StockTransferCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.StockTransferCreate.onCreated(function () {
   let self = this;
    let transferContext = Core.Schemas.StockTransfer.namedContext("stockTransferForm");
    this.autorun(function(computation) {

        let strippedStockTransfer = prepareStockTransfer(getStockTransfer());
        transferContext.validate(strippedStockTransfer);
        if (transferContext.isValid()) {
            console.log('Stock Transfer is Valid!');
        } else {
            console.log('Stock Transfer is not Valid!');
        }
        console.log(transferContext._invalidKeys);

        let stockTransfer = getStockTransfer();
        let location = Locations.findOne({}, { sort: { name: 1}});
        if (!stockTransfer.sourceId && location) stockTransfer.sourceId = location._id;
        if (!stockTransfer.destinationId && location) stockTransfer.destinationId = location._id;
        if (stockTransfer.items[0].variantId) {
           let variantIds = _.pluck(stockTransfer.items, 'variantId');
            self.subscribe('VariantsForStockTransfer', variantIds);
            if (self.subscriptionsReady()) {
                for (let i in stockTransfer.items) {
                    v = ProductVariants.findOne(stockTransfer.items[i].variantId);
                    if (v) {
                        stockTransfer.items[i].bogusVariant = v;

                        // prep display caption
                        let shortTag = v.name.length > 36 ? v.name.substring(0, 36) + '..' : v.name;
                        stockTransfer.items[i].bogusVariant.caption = v.code + ', ' + shortTag;

                        stockTransfer.items[i].bogusVariant.available = 0;
                        if (v.locations && v.locations.length > 0) {
                            let source = _.find(v.locations, function(location) {return location.locationId === stockTransfer.sourceId});
                            source = source ? source.stockOnHand : 0;
                            let destination = _.find(v.locations, function(location) {return location.locationId === stockTransfer.destinationId});
                            destination = destination ? destination.stockOnHand : 0;
                            stockTransfer.items[i].bogusVariant.source = source;
                            stockTransfer.items[i].bogusVariant.destination = destination;
                        }
                    }
                }
                setStockTransfer(stockTransfer);
            }
        }
        setStockTransfer(stockTransfer);
    })
});

Template.StockTransferCreate.onRendered(function () {
    let self = this;

    this.autorun(function(computation) {
        if (self.subscriptionsReady()) {
            // refresh all selects
            Meteor.defer(function() {
                try {
                    self.$('[name=sourceId]').selectpicker('refresh');
                    self.$('[name=destinationId]').selectpicker('refresh');
                } catch (e) {
                    console.log(e)
                }
            });

        }


    });
});

Template.StockTransferCreate.onDestroyed(function () {
});




/*****************************************************************************/
/* General Functions */
/*****************************************************************************/

function getStockTransfer() {
    //retrieve or create new order shell
    let stockTransfer = Session.get('stockTransfer');

    if (!stockTransfer) {
        stockTransfer = resetStockTransfer();
    } else {
        if (!stockTransfer.userId) stockTransfer.userId = Meteor.userId();
        if (!stockTransfer.createdAt) stockTransfer.createdAt = new Date;
        if (!stockTransfer.stockTransferNumber) stockTransfer.stockTransferNumber = 0;
    }

    return stockTransfer;
}


function resetStockTransfer() {
    // create new stockTransfer and set defaults
    let stockTransfer = {
        "stockTransferNumber": 0,
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

    Session.set('stockTransfer', stockTransfer);
    return stockTransfer;
}

function setStockTransfer(StockTransfer, noRefresh) {
    StockTransfer.noRefresh = !!noRefresh;
    Session.set('stockTransfer', StockTransfer);
}

function numberize(n) {
    return Math.round(_.isNaN(Number(n)) ? 0 : Number(n)); //upgrade to 2 decimals
}


function prepareStockTransfer(stockTransfer, tmpl) {
    tmpl = tmpl || Template.instance();
    if (stockTransfer) {
        _.forEach(stockTransfer.items, function(i) {
            delete i.bogusVariant;
            delete i.index;

            // numberize
            i.quantity = numberize(i.quantity);

        })
        delete stockTransfer.noRefresh;
    }
    return stockTransfer;
}