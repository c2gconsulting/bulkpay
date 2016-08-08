/*****************************************************************************/
/* PaymentsHistory: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.PaymentsHistory.events({
  'input .customerSearch': function(e, tmpl) {
    let $input = tmpl.$(".customerSearch");
    let searchText = $input.val();
    getCustomer(e, searchText, tmpl);

    if (searchText.length === 0) {
      let filterConditions = Template.instance().reportData.get("filterConditions");
      delete filterConditions.customerId;
      delete filterConditions.customerName;
      Template.instance().reportData.set("filterConditions", filterConditions);
    }
  },

  'blur input.customerSearch': function (e, tmpl) {
    setTimeout(function() {
      tmpl.$('.customer-search-result').hide();
    }, 100);
  },

  'click .customer .customer-search-elem, mousedown .customer .customer-search-elem': function (e, tmpl) {
    let searchData = e.currentTarget.dataset;
    let filterConditions = Template.instance().reportData.get("filterConditions");
    filterConditions.customerId = searchData.id;
    filterConditions.customerName = searchData.name;
    Template.instance().reportData.set("filterConditions", filterConditions);
  },

  'input .locationSearch': function (e, tmpl) {
    let $input = tmpl.$(".locationSearch");
    let searchText = $input.val();
    let div = '#divLocationSearch';
    getSalesLocations(e, searchText, tmpl, div);

    if (searchText.length === 0) {
      let filterConditions = Template.instance().reportData.get("filterConditions");
      delete filterConditions.salesLocationId;
      delete filterConditions.salesLocationName;
      Template.instance().reportData.set("filterConditions", filterConditions);
    }
  },

  'blur input.locationSearch': function (e, tmpl) {
    setTimeout(function () {
      tmpl.$('.customer-search-result').hide();
    }, 100);
  },

  'input .stockLocationSearch': function (e, tmpl) {
    let $input = tmpl.$(".stockLocationSearch");
    let searchText = $input.val();
    let div = '#divStockLocationSearch';
    getSalesLocations(e, searchText, tmpl, div);

    if (searchText.length === 0) {
      let filterConditions = Template.instance().reportData.get("filterConditions");
      delete filterConditions.stockLocationId;
      delete filterConditions.stockLocationName;
      Template.instance().reportData.set("filterConditions", filterConditions);
    }
  },

  'blur input.stockLocationSearch': function (e, tmpl) {
    setTimeout(function () {
      tmpl.$('.customer-search-result').hide();
    }, 100);
  },

  'click .location .customer-search-elem, mousedown .location .customer-search-elem': function (e, tmpl) {
    let searchData = e.currentTarget.dataset;
    let filterConditions = Template.instance().reportData.get("filterConditions");
    filterConditions.salesLocationId = searchData.id;
    filterConditions.salesLocationName = searchData.name;
    Template.instance().reportData.set("filterConditions", filterConditions);
  },

  'click .stockLocation .customer-search-elem, mousedown .stockLocation .customer-search-elem': function (e, tmpl) {
    let searchData = e.currentTarget.dataset;
    let filterConditions = Template.instance().reportData.get("filterConditions");
    filterConditions.stockLocationId = searchData.id;
    filterConditions.stockLocationName = searchData.name;
    Template.instance().reportData.set("filterConditions", filterConditions);
  },

  'change .assignee': function (e, tmpl) {
    let value = e.currentTarget.value;
    let filterConditions = Template.instance().reportData.get("filterConditions");
    if (value) {
      filterConditions.assigneeId = value;
    } else {
      delete  filterConditions.assigneeId
    }
    Template.instance().reportData.set("filterConditions", filterConditions);
  },

  'change .createdBy': function (e, tmpl) {
    let value = e.currentTarget.value;
    let filterConditions = Template.instance().reportData.get("filterConditions");
    if (value) {
      filterConditions.userId = value;
    } else {
      delete  filterConditions.userId
    }
    Template.instance().reportData.set("filterConditions", filterConditions);
  },

  'change .orderType': function (e, tmpl) {
    let value = e.currentTarget.value;
    let filterConditions = Template.instance().reportData.get("filterConditions");
    if (value) {
      filterConditions.orderType = value;
    } else {
      delete  filterConditions.orderType
    }
    Template.instance().reportData.set("filterConditions", filterConditions);
  },

  'click .order-entry': function (e, tmpl) {
    Router.go('orders.detail', {_id: this.orderId});
  },

  'dp.change .datepicker': function (e, tmpl) {
    let value = e.currentTarget.value || new Date;
    let id = e.currentTarget.id;
    let filterConditions = Template.instance().reportData.get("filterConditions");
    filterConditions[id] = id === 'startDate' ? new Date(value) : moment(new Date(value)).endOf('day')._d;
    Template.instance().reportData.set("filterConditions", filterConditions);
    Session.set('sh_rep_' + id, new Date(value));
  },

  'click .excel': function (event, tmpl) {
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
      "Order Number",
      "Narration",
      "Reference",
      "Amount",
      "Customer",
      "Date"
    ];

    let filterConditions = Template.instance().reportData.get("filterConditions");
    let options = getOptions(filterConditions);
    Meteor.call("payments/getExportData", options, function(err, data){
      if (err){
        console.log(err)
        resetButton()
      }  else {
        let exportData = {fields: fields, data: data};
        TDCExporter.exportAllData(exportData, "PaymentHistoryReport");
        resetButton()
      }
    });
  },

    'click [name=reports-home]': function (event, tmpl) {
        event.preventDefault();
        Router.go('reports.home');
    },

    'click a[href="#sort"]': function (e, tmpl) {
        let key = e.currentTarget.dataset.key;
        if (Session.get('orderHistorySortBy') === key) Session.set('orderHistorySortDirection', 0 - Number(Session.get('orderHistorySortDirection'))); //reverse sort direction
        else Session.set('orderHistorySortBy', key);
    }
});

/*****************************************************************************/
/* PaymentsHistory: Helpers */
/*****************************************************************************/
Template.PaymentsHistory.helpers({
  paymentCreator: function (id) {
    return Meteor.users.findOne({_id: id}).profile.fullName;
  },
  salesUsers: function () {
    return Meteor.users.find().fetch();
  },
  startDate: function () {
    return Session.get('sh_rep_startDate');
  },
  endDate: function () {
    return Session.get('sh_rep_endDate');
  },
  filterConditions: function (){
    return Template.instance().reportData.get("filterConditions")
  },
  payments: function () {
    return Template.instance().payments();
  },
  orderType: function () {
    let orderT = OrderTypes.findOne({code: this.orderType});
    return orderT.name ? orderT.name :  ""
  },
  orderTypes: function () {
    return OrderTypes.find().fetch()
  },
  hasMoreOrders: function () {
    return Template.instance().payments().count() >= Template.instance().limit.get();
  },
  sortedBy: function (key) {
    let sortIcon = Session.get('orderHistorySortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
    return Session.get('orderHistorySortBy') === key ? sortIcon : '';
  },
  referenceOrder: function(){
    let order = Orders.findOne(this.orderId);
    return order ? order.orderNumber : "--"
  },
  referenceCustomer: function () {
    let customer = Customers.findOne(this.customerId);
    return customer ? customer.name : "--"
  }
});

/*****************************************************************************/
/* PaymentsHistory: Lifecycle Hooks */
/*****************************************************************************/
Template.PaymentsHistory.onCreated(function() {
  let instance = this;
  instance.reportData = new ReactiveDict();
  if (!instance.reportData.get("filterConditions")) {
    let filterConditions = {};
    filterConditions.startDate = moment().subtract(3, 'months').startOf("month")._d;
    filterConditions.endDate = moment().endOf('day')._d;
    instance.reportData.set("filterConditions", filterConditions);
  }

  if (!Session.get('orderHistorySortBy')) {
    Session.set('orderHistorySortBy', 'postingDate');
    Session.set('orderHistorySortDirection', -1);
  }

  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(getLimit());

  instance.autorun(function() {
    let filterConditions = instance.reportData.get("filterConditions");
    let options = getOptions(filterConditions);
    let limit = instance.limit.get();
    let sortBy = Session.get('orderHistorySortBy');
    let sortDirection = Number(Session.get('orderHistorySortDirection') || -1);
    let sort = {};
    sort[sortBy] = sortDirection;
    let subscription = instance.subscribe('ManagePayments', options, limit, sort);
    if (subscription.ready()) {
      instance.loaded.set(limit);
    }
  });


  instance.payments = function() {
    let filterConditions = instance.reportData.get("filterConditions");
    let options = getOptions(filterConditions);
    let limit = instance.loaded.get();
    let sortBy = Session.get('orderHistorySortBy');
    let sortDirection = Number(Session.get('orderHistorySortDirection') || -1);

    let sort = {};
    sort[sortBy] = sortDirection;
    return CustomerTransactions.find({transactionType: "payments"});
  };

  // long-span variables to improve UX
  if (!Session.get('sh_rep_startDate')) {
    Session.set('sh_rep_startDate', moment().subtract(3, 'months').startOf('month')._d);
    Session.set('sh_rep_endDate', moment().endOf('day')._d);
  }
});

Template.PaymentsHistory.onRendered(function () {
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

Template.PaymentsHistory.onDestroyed(function () {
  $(window).off('scroll', this.scrollHandler);
});


function getLimit() {
  return 24;
}

const getLocation = locationId => {
  let theLocation = Locations.findOne({_id: locationId}).name;
  return theLocation ? theLocation : 'Unspecified';
};

const getOrderType = orderType => {
  let orderT = OrderTypes.findOne({code: orderType});
  return orderT.name ? orderT.name :  ""
};

const getSalesPerson = userId => {
  let user = Meteor.users.findOne(userId);
  return user ? user.profile.fullName : "None"
};

const getCustomer = (e, searchText, tmpl, self) => {
  Meteor.call('customers/getCustomers', searchText, function (err, customers) {
    if (err) {
      console.log('Error: ' + err);
    } else {
      let obj = [],
      i = 0;
      _.forEach(customers, function (c) {
        // text
        cText = c.name || c.description;
        if (cText && cText.length > 42) {
          cText = cText.substring(0, 42) + '...';
        }
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

      if (customers && customers.length > 0) {
        tmpl.$(res).show();
      } else {
        tmpl.$(res).hide();
      }
    }
  });
};

const getSalesLocations = (e, searchText, tmpl, div) => {
  Meteor.call('locations/getLocations', searchText, function (err, locations) {
    if (err) {
      console.log('Error: ' + err);
    } else {
      let obj = [],
      i = 0;
      _.forEach(locations, function(c) {
        // text
        cText = c.name;
        if (cText && cText.length > 42) {
          cText = cText.substring(0, 42) + '...';
        }
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

      if (locations && locations.length > 0) {
        tmpl.$(res).show();
      } else {
        tmpl.$(res).hide();
      }
    }
  });
};

const getOptions = filterConditions => {
  let options = {};

  if (filterConditions.customerId) {
    options["customerId"] = filterConditions.customerId
  }

  if (filterConditions.salesLocationId) {
    options["salesLocationId"] = filterConditions.salesLocationId
  }

  if (filterConditions.stockLocationId) {
    options["stockLocationId"] = filterConditions.stockLocationId
  }

  if (filterConditions.assigneeId) {
    options["assigneeId"] = filterConditions.assigneeId
  }

  if (filterConditions.userId) {
    options["userId"] = filterConditions.userId
  }

  if (filterConditions.orderType) {
    options["orderType"] = Number(filterConditions.orderType)
  }

  if (filterConditions.variantId) {
    options["items.variantId"] = filterConditions.variantId
  }

  let startDate, endDate;
  if (filterConditions.startDate) {
    startDate = filterConditions.startDate;
  }
  if (filterConditions.endDate) {
    endDate = filterConditions.endDate
  }
  if (startDate && endDate) {
    options["postingDate"] = {
      $gte: startDate,
      $lte: endDate
    }
  } else if (startDate) {
    options["postingDate"] = {
      $gte: startDate
    }
  } else if (endDate) {
    options["postingDate"] = {
      $lte: endDate
    }
  } else {
    delete options["postingDate"]
  }

  return options
};
