/*****************************************************************************/
/* ReturnsHistory: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.ReturnsHistory.events({
    'input .customerSearch': function(e, tmpl) {
        let $input = tmpl.$(".customerSearch");
        let searchText = $input.val();
        getCustomer(e, searchText, tmpl, div);

        if(searchText.length === 0){
            let filterConditions = Template.instance().reportData.get("filterConditions");
            delete filterConditions.customerId;
            delete filterConditions.customerName;
            Template.instance().reportData.set("filterConditions", filterConditions);
        }
    },

    'input .stockLocationSearch': function(e, tmpl) {
        let $input = tmpl.$(".stockLocationSearch");
        let searchText = $input.val();
        let div = '#divStockLocationSearch';
        getSalesLocations(e, searchText, tmpl, div);

        if(searchText.length === 0){
            let filterConditions = Template.instance().reportData.get("filterConditions");
            delete filterConditions.stockLocationId;
            delete filterConditions.stockLocationName;
            Template.instance().reportData.set("filterConditions", filterConditions);
        }
    },

    'blur input.customerSearch': function(e, tmpl) {
        setTimeout(function() {
            tmpl.$('.customer-search-result').hide();
        }, 100);
    },

    'click .customer .customer-search-elem, mousedown .customer .customer-search-elem': function(e, tmpl) {
        let searchData = e.currentTarget.dataset;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.customerId = searchData.id;
        filterConditions.customerName = searchData.name;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },

    'input .locationSearch': function(e, tmpl) {
        let $input = tmpl.$(".locationSearch");
        let searchText = $input.val();
        let div = "#divLocationSearch";
        getSalesLocations(e, searchText, tmpl, div);

        if(searchText.length === 0){
            let filterConditions = Template.instance().reportData.get("filterConditions");
            delete filterConditions.salesLocationId;
            delete filterConditions.salesLocationName;
            Template.instance().reportData.set("filterConditions", filterConditions);
        }
    },

    'blur input.locationSearch': function(e, tmpl) {
        setTimeout(function() {
            tmpl.$('.customer-search-result').hide();
        }, 100);
    },

    'blur input.stockLocationSearch': function(e, tmpl) {
        setTimeout(function() {
            tmpl.$('.customer-search-result').hide();
        }, 100);
    },

    'click .location .customer-search-elem, mousedown .location .customer-search-elem': function(e, tmpl) {
        let searchData = e.currentTarget.dataset;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.salesLocationId = searchData.id;
        filterConditions.salesLocationName = searchData.name;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },

    'click .stockLocation .customer-search-elem, mousedown .stockLocation .customer-search-elem': function(e, tmpl) {
        let searchData = e.currentTarget.dataset;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.stockLocationId = searchData.id;
        filterConditions.stockLocationName = searchData.name;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },


    'input .variantSearch': function(e, tmpl) {
        let $input = tmpl.$(".variantSearch");
        let searchText = $input.val();
        getProductVariant(e, searchText, tmpl);

        if(searchText.length === 0){
            let filterConditions = Template.instance().reportData.get("filterConditions");
            delete filterConditions.variantId;
            delete filterConditions.variantName;
            Template.instance().reportData.set("filterConditions", filterConditions);
        }
    },

    'blur input.variantSearch': function(e, tmpl) {
        setTimeout(function() {
            tmpl.$('.customer-search-result').hide();
        }, 100);
    },

    'click .variant .customer-search-elem, mousedown .variant .customer-search-elem': function(e, tmpl) {
        let searchData = e.currentTarget.dataset;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.variantId = searchData.id;
        filterConditions.variantName = searchData.name;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },

    'change #status': function(event){
        event.preventDefault();
        let status = [];
        let selected = $("#status").find("option:selected");
        _.each(selected, function(select){
            status.push(select.value)
        });
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.status = status;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },
    
    "change .assignee": function (e, tmpl) {
        let value = e.currentTarget.value;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        if (value){
            filterConditions.assigneeId = value;
        } else {
            delete  filterConditions.assigneeId
        }
        Template.instance().reportData.set("filterConditions", filterConditions);
    },

    'click .order-entry': function(e, tmpl) {
       Router.go('returns.detail', {_id: this._id});
    },

    'dp.change .datepicker': function (e, tmpl) {
        let value = e.currentTarget.value;
        let id = e.currentTarget.id;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions[id] = id === 'startDate' ? new Date(value) : moment(new Date(value)).endOf('day')._d;
        Template.instance().reportData.set("filterConditions", filterConditions);

        Session.set('rh_rep_' + id, new Date(value));

    },
    'click .excel': function(event, tmpl){
        event.preventDefault();

        tmpl.$('.excel').text('Preparing... ');
        tmpl.$('.excel').attr('disabled', true);
    

        try {
            let l = Ladda.create(tmpl.$('.excel')[0]);
            l.start();
        } catch(e) {
            console.log(e);
        }


        let resetButton = function() {
            // End button animation
            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.stop();
                l.remove();
            } catch(e) {
                console.log(e);
            }

            tmpl.$('.excel').text(' Export to CSV');
            // Add back glyphicon
            $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
            tmpl.$('.excel').removeAttr('disabled');
        }

        var fields = [
            "Return Number",
            "Location",
            "Date Posted",
            "Total",
            "Status",
            "Customer",
            "Salesperson",
            "Created By"
        ];

        let filterConditions = Template.instance().reportData.get("filterConditions");
        let options = getOptions(filterConditions);
        Meteor.call("returnorders/getExportData", options, function(err, data){
          if (err){
              console.log(err);
              resetButton();
          }  else {
              let exportData = {fields: fields, data: data};
              TDCExporter.exportAllData(exportData, "ReturnOrderHistoryReport");
              resetButton();
          }
        });
    },

    'click [name=reports-home]': function (event, tmpl) {
        event.preventDefault();
        Router.go('reports.home');
    },

    'click a[href="#sort"]': function (e, tmpl) {
        let key = e.currentTarget.dataset.key;
        if (Session.get('returnHistorySortBy') === key) Session.set('returnHistorySortDirection', 0 - Number(Session.get('returnHistorySortDirection'))); //reverse sort direction
        else Session.set('returnHistorySortBy', key);
    },

    "change .createdBy": function (e, tmpl) {
        let value = e.currentTarget.value;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        if (value){
            filterConditions.userId = value;
        } else {
            delete  filterConditions.userId
        }
        Template.instance().reportData.set("filterConditions", filterConditions);
    },


});

/*****************************************************************************/
/* ReturnsHistory: Helpers */
/*****************************************************************************/
Template.ReturnsHistory.helpers({
    salesUsers: function() {
        return Meteor.users.find().fetch();
    },
    startDate: function () {
        return Session.get('rh_rep_startDate');
    },
    endDate: function () {
        return Session.get('rh_rep_endDate');
    },
    assignee: function() {
        if(this.assigneeId)
            return getSalesPerson(this.assigneeId);
    },
    filterConditions: function(){
        return Template.instance().reportData.get("filterConditions")
    },
    returns: function() {
        return Template.instance().returns();
    },

    hasMoreReturns: function () {
        return Template.instance().returns().count() >= Template.instance().limit.get();
    },

    sortedBy: function (key) {
        let sortIcon = Session.get('returnHistorySortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
        return Session.get('returnHistorySortBy') === key ? sortIcon : '';
    }
});

/*****************************************************************************/
/* ReturnsHistory: Lifecycle Hooks */
/*****************************************************************************/
Template.ReturnsHistory.onCreated(function () {
    let self = this;
    self.reportData = new ReactiveDict();
    if (!self.reportData.get("filterConditions")){
        let filterConditions = {};
        filterConditions.startDate = moment().subtract(3, 'months').startOf("month")._d;
        filterConditions.endDate = moment().endOf('day')._d;
        self.reportData.set("filterConditions", filterConditions)
    }
    
    if (!Session.get('returnHistorySortBy')) {
        Session.set('returnHistorySortBy', 'issuedAt');
        Session.set('returnHistorySortDirection', -1);
    }

    self.loaded = new ReactiveVar(0);
    self.limit = new ReactiveVar(getLimit());

    self.autorun(function () {
        let filterConditions = self.reportData.get("filterConditions");
        let options = getOptions(filterConditions);
        let limit = self.limit.get();
        let sortBy = Session.get('returnHistorySortBy');
        let sortDirection = Number(Session.get('returnHistorySortDirection') || -1);
        let sort = {};
        sort[sortBy] = sortDirection;
        let subscription = self.subscribe('ManageReturns', options, limit, sort);
        if (subscription.ready()) {
            self.loaded.set(limit);
        }
    });

    // 3. Cursor
    self.returns = function() {
        let filterConditions = self.reportData.get("filterConditions");
        let options = getOptions(filterConditions);
        let limit = self.loaded.get();
        let sortBy = Session.get('returnHistorySortBy');
        let sortDirection = Number(Session.get('returnHistorySortDirection') || -1);
        let sort = {};
        sort[sortBy] = sortDirection;
        return ReturnOrders.find(options, {sort: sort, limit: limit});
    };

    // long-span variables to improve UX
    if (!Session.get('rh_rep_startDate')) {
        Session.set('rh_rep_startDate', moment().subtract(3, 'months').startOf('month')._d);
        Session.set('rh_rep_endDate', moment().endOf('day')._d);
    }
});

Template.ReturnsHistory.onRendered(function () {
    var tmpl = Template.instance();
    //let instance = this;
    this.scrollHandler = function(e) {
        let threshold, target = $("#showMoreResults");
        if (!target.length) return;

        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if (target.offset().top < threshold) {
            if (!target.data("visible")) {
                target.data("visible", true);
                var limit = this.limit.get();
                limit += 24;
                this.limit.set(limit);
            }
        } else {
            if (target.data("visible")) {
                target.data("visible", false);
            }
        }
    }.bind(this);

    $(window).on('scroll', this.scrollHandler);
});

Template.ReturnsHistory.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
});


function getCustomer(e, searchText, tmpl, self){
    Meteor.call('customers/getCustomers', searchText, function(err, customers) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            let obj = [],
                i = 0;
            _.forEach(customers, function(c) {

                // text
                cText = c.name || c.description;
                if (cText && cText.length > 42) cText = cText.substring(0, 42) + '...';

                obj[i++] = { id: c._id, name: cText, customerNumber: c.customerNumber };
            });
            let res = tmpl.$('#customerName');
            tmpl.$(res).html('');
            _.forEach(obj, function(el) {
                tmpl.$(res).append('' +
                    '<div class="customer-search-elem" data-id="' + el['id'] + '" data-name="' + el['name'] + '"><div>' +
                    '<div class="col-sm-10 col-xs-10 n-side-padding">' +
                    el['name'] + ' <span class="text-muted"><small>' + el['customerNumber'] + '</small></span>' +
                    '</div>' +
                    '<div class="col-sm-2 col-xs-2 n-side-padding fs11 text-right">' +
                    '<span class="text-muted"><a href="' + Router.path('distributors.detail', { _id: el['id'] }) + '" data-id="' + el['id'] + '" class="customer-link">View</a></span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</div><div class="clearfix"></div></div>'
                );
            });
            if (customers && customers.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();

        }
    });
}

function getSalesLocations(e, searchText, tmpl, div){
    Meteor.call('locations/getLocations', searchText, function(err, locations) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            let obj = [],
                i = 0;
            _.forEach(locations, function(c) {

                // text
                cText = c.name;
                if (cText && cText.length > 42) cText = cText.substring(0, 42) + '...';

                obj[i++] = { id: c._id, name: cText};
            });
            let res = tmpl.$(div);
            tmpl.$(res).html('');
            _.forEach(obj, function(el) {
                tmpl.$(res).append('' +
                    '<div class="customer-search-elem" data-id="' + el['id'] + '" data-name="' + el['name'] + '"><div>' +
                    '<div class="col-sm-10 col-xs-10 n-side-padding">' +
                    el['name'] +
                    '</div>' +
                    '<div class="col-sm-2 col-xs-2 n-side-padding fs11 text-right">' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</div><div class="clearfix"></div></div>'
                );
            });
            if (locations && locations.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();

        }
    });
}


function getProductVariant(e, searchText, tmpl, self){
    Meteor.call('products/getAllVariants', searchText, function(err, variants) {
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
            let res = tmpl.$("#divVariantSearch");
            tmpl.$(res).html('');
            _.forEach(obj, function(el) {
                tmpl.$(res).append('' +
                    '<div class="customer-search-elem" data-price="' + el[7] + '" data-available="' + el[3] + '" data-name="' + el[5] + '" data-uom="' + el[6] + '" data-code="' + el[4] + '" data-id="' + el[0] + '" data-caption="' + el[1] + '"><div>' +
                    '<div class="col-sm-9 col-xs-9 n-side-padding">' +
                    el[1] + '<span class="text-muted"><small>' + el[8] + '</small></span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</div><div class="clearfix"></div></div>'
                );
            });
            if (variants && variants.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();
        }

    });
}

function getOptions(filterConditions) {
    let options = {}
    let userId = Meteor.userId();
    let timezone = Core.getTimezone(userId);
    let status = getStatus(filterConditions);

    if (status.length > 0 ){
        options["status"] = {$in: status}
    }
   
    if (filterConditions.customerId){
        options["customerId"] = filterConditions.customerId
    }

    if (filterConditions.salesLocationId){
        options["salesLocationId"] = filterConditions.salesLocationId
    }

    if (filterConditions.stockLocationId){
        options["stockLocationId"] = filterConditions.stockLocationId
    }

    if (filterConditions.assigneeId){
        options["assigneeId"] = filterConditions.assigneeId
    }

    if (filterConditions.userId){
        options["userId"] = filterConditions.userId
    }

    if (filterConditions.variantId){
        options["items.variantId"] = filterConditions.variantId
    }
    let startDate, endDate;
    if (filterConditions.startDate){
        startDate = filterConditions.startDate
    }
    if (filterConditions.endDate){
        endDate = filterConditions.endDate
    }
    if (startDate && endDate){
        options["issuedAt"] = {$gte : startDate, $lte : endDate}
    } else if (startDate){
        options["issuedAt"] = {$gte : startDate}
    } else if (endDate) {
        options["issuedAt"] = {$lte : endDate}
    } else {
        delete options["issuedAt"]
    }
    return options
}

function getStatus(filterConditions){
    let status = [];
    let definedStatus = ["pending", "approved", "rejected"];
    if (_.isArray(filterConditions.status) && filterConditions.status.length > 0){
        _.each(definedStatus, function(s){
            let foundStatus =  _.find(filterConditions.status, function(c){ return s === c });
            if (foundStatus){
                status.push(foundStatus)
            }
        }); 
    }
    return status
}

function getLocation(locationId){
    let theLocation = Locations.findOne({_id: locationId}).name;
    return theLocation ? theLocation : 'Unspecified';
}

function getOrderType(orderType){
    let orderT = OrderTypes.findOne({code: orderType});
    return orderT.name ? orderT.name :  ""
}

function getSalesPerson(userId){
    let user = Meteor.users.findOne(userId);
    return user ? user.profile.fullName : "None"
}

function getLimit() {
    return 24;
}