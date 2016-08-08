/*****************************************************************************/
/* ReturnsList: Event Handlers */
/*****************************************************************************/
Template.ReturnsList.events({
  'click a[href="#inprocess"]': function(e, tmpl) {
    Session.set('returnOrderListStatusFilter', 'pending');
  },
  'click a[href="#approved"]': function(e, tmpl) {
    Session.set('returnOrderListStatusFilter', 'approved');
  },
  'click a[href="#rejected"]': function(e, tmpl) {
    Session.set('returnOrderListStatusFilter', 'rejected');
  },
  'change select#dfilter': function(e, tmpl) {
    let filterMonths = tmpl.$('#dfilter').val();
    Session.set('returnOrderListDurationFilter', filterMonths);
    let startDate = moment().subtract(filterMonths, 'months')._d;
    Session.set('startDate', startDate)
  },
	'click a[href="#sort"]': function(e, tmpl) {
		let key = e.currentTarget.dataset.key;
		if (Session.get('returnOrderSortBy') === key) Session.set('returnOrderSortDirection', 0 - Number(Session.get('returnOrderSortDirection'))); //reverse sort direction
		else Session.set('returnOrderSortBy', key);
	},
  'keyup #return-search': function(e, tmpl) {
    let searchTerm = tmpl.$('#return-search').val().trim();
    tmpl.elements.set('searchText', searchTerm);
    if (searchTerm.length >= 3) {
      if (searchTerm !== tmpl.lastSearchText) {
        Session.set('searchQueryReturned', false);
        Session.set('searchActive', true);
        tmpl.setSearchFunctionTimeOut(searchTerm);
      }
    } else {
      tmpl.limit.set(getLimit());
      Session.set('searchQueryReturned', false);
      Session.set('searchActive', false);
    }
    tmpl.lastSearchText = searchTerm;
  },
  'submit #return-search-form': function(e) {
    e.preventDefault();
  }
});

/*****************************************************************************/
/* ReturnsList: Helpers */
/*****************************************************************************/
Template.ReturnsList.helpers({
  searchText: function () {
    return Template.instance().elements.get('searchText');
  },
  activeStatus: function() {
    return s.capitalize(Session.get('returnOrderListStatusFilter'));
  },
  mainSearchReturns: function () {
    return Template.instance().searchResults.get('results');
  },
  searchReturns: function () {
    var allResults = Template.ReturnsList.__helpers.get('mainSearchReturns').call();
    let orderedListFilter = Session.get('returnOrderListStatusFilter');
    let orderListDurationFilter = Session.get('returnOrderListDurationFilter');
    let startDate = moment().subtract(orderListDurationFilter, 'months')._d;
    let limit = Template.instance().limit.get();
    let sortDirection = Number(Session.get('returnOrderSortDirection') || -1);
    let sortField = Session.get('returnOrderSortBy');
    let filteredResult = _.filter(allResults, function (result) {
      return (result.status === orderedListFilter && moment(result.issuedAt) > startDate);
    }).slice(0, limit - 1);
    return sortSearchResults(filteredResult, sortField, sortDirection);
  },
  hasMoreSearchResults: function () {
    return Template.ReturnsList.__helpers.get('mainSearchReturns').call().length >= Template.instance().limit.get();
  },
  searchActive: function () {
    return Session.get('searchActive');
  },
  searchQueryReturned: function () {
    return Session.get('searchQueryReturned');
  },
  returns: function() {
    return Template.instance().returns();
  },
  returnCount: function() {
    let dFilter = Session.get('returnOrderListDurationFilter');
    let startDate = moment().subtract(dFilter, 'months')._d;
    let count;
    if (Session.get('searchActive')) {
      count = _.filter(Template.ReturnsList.__helpers.get('mainSearchReturns').call(), function (data) {
        return moment(data.issuedAt) > startDate;
      }).length
    } else {

      let cStatus = (Session.get('returnOrderListStatusFilter')).toUpperCase();
      let counterId = "RETURN_ORDERS_" + cStatus + '_' + dFilter;
      let counter = Counts.findOne(counterId);
      count = counter ? counter.count : 0
    }

    return count == 1 ? `${count} return` : `${count} returns`;
  },
  pendingReturnCountFiltered: function() {
    let dFilter = Session.get('returnOrderListDurationFilter');
    let startDate = moment().subtract(dFilter, 'months')._d;
    let count;
    if (Session.get('searchActive')) {
      count = _.filter(Template.ReturnsList.__helpers.get('mainSearchReturns').call(), function (data) {
        return (data.status === 'pending' && moment(data.issuedAt) > startDate);
      }).length;
    } else {
      count = ReturnOrders.find({
        status: 'pending',
        issuedAt: {
          $gte: startDate
        }
      }).count();
    }
    return count ? count : '';
  },
  currentDuration: function() {
    let dFilter = Session.get('returnOrderListDurationFilter');
    return dFilter == '1' ? `past month` : `past ${dFilter} months`;
  },
  tabClass: function(tab) {
    if (tab === Session.get('returnOrderListStatusFilter')) return 'active';
    return '';
  },
  hasMoreReturns: function () {
    return Template.instance().returns().count() >= Template.instance().limit.get();
  },
	sortedBy: function (key) {
		let sortIcon = Session.get('returnOrderSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
		return Session.get('returnOrderSortBy') === key ? sortIcon : '';
	}

});

/*****************************************************************************/
/* ReturnsList: Lifecycle Hooks */
/*****************************************************************************/
Template.ReturnsList.onCreated(function() {
  let returnOrderListStatusFilter = Session.get('returnOrderListStatusFilter');
  let dFilter = Session.get('returnOrderListDurationFilter') ? Session.get('returnOrderListDurationFilter') : 1 ;
  let startDate = moment().subtract(dFilter, 'months')._d;
  Session.set('startDate', startDate);

  if (!returnOrderListStatusFilter) {
    Session.set('returnOrderListStatusFilter', 'pending');
    Session.set('returnOrderListDurationFilter', 1);
	}

  if (!Session.get('returnOrderSortBy')) {
    Session.set('returnOrderSortBy', 'issuedAt');
		Session.set('returnOrderSortDirection', -1);
	}

  if (!Session.get('searchActive')) {
    Session.set('searchActive', false);
  }
  
  let instance = this;
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(getLimit());


  instance.searchResults = new ReactiveDict();
  instance.searchResults.set('results', []);
  instance.searchFunctionTimeOut = null;
  instance.elements = new ReactiveDict();
  instance.elements.set('queryIds', []);
  instance.lastSearchText = '';

  let query = function (queryObject) {
    Core.SearchConnection.call('search/local', 'returnorders', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
      if (!error) {
        let currentQueryIds = instance.elements.get('queryIds');
        if (queryObject.queryId === currentQueryIds[currentQueryIds.length - 1]) {
          instance.searchResults.set('results', results);
          instance.elements.set('queryIds', []);
          Session.set('searchQueryReturned', true);
        }
      }
    });
  };

  instance.setSearchFunctionTimeOut = function (searchTerm) {
    Meteor.clearTimeout(instance.searchFunctionTimeOut);
    let queryId = Random.id();
    instance.searchFunctionTimeOut = Meteor.setTimeout(function () {
      query({
        searchTerm: searchTerm,
        queryId: queryId
      });
    }, 500);
    let currentQueryIds = instance.elements.get('queryIds');
    currentQueryIds.push(queryId);
    instance.elements.set('queryIds', currentQueryIds);
  };


  instance.autorun(function () {
    let limit = instance.limit.get();
    let status = Session.get('returnOrderListStatusFilter');
    let sortBy = Session.get('returnOrderSortBy');
    let sortDirection = Number(Session.get('returnOrderSortDirection') || -1);
    let sort = {};
    sort[sortBy] = sortDirection;
    let subscription = ReturnOrderSubs.subscribe('ReturnOrders', status, Session.get('startDate'), limit, sort);

    /*
    let orderStatus = ["pending", "approved"];
    let durations = [1, 3, 6, 12];
    _.each(orderStatus, function(s){
      _.each(durations, function(d){
        instance.subscribe('ReturnOrderCount', d, s);
      })
    });
    */

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
    }
  });

  // 3. Cursor
  instance.returns = function() {
        let dFilter = Session.get('returnOrderListDurationFilter');
        let startDate = moment().subtract(dFilter, 'months')._d;
        let sortBy = Session.get('returnOrderSortBy');
        let sortDirection = Number(Session.get('returnOrderSortDirection') || -1);
		let options = {};
		options.sort = {};
		options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();
		
		return ReturnOrders.find({status: Session.get('returnOrderListStatusFilter'), issuedAt: { $gte: startDate }}, options );
  }
});

Template.ReturnsList.onRendered(function() {
  var tmpl = Template.instance();
  tmpl.$('#dfilter').val(Session.get('returnOrderListDurationFilter'));

  //let instance = this;
  this.scrollHandler = function(e) {
    let threshold, target = $("#showMoreResults");
    if (!target.length) return;

    threshold = $(window).scrollTop() + $(window).height() - target.height();

    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("visible", true);
        var limit = this.limit.get();
        limit += 25;
        this.limit.set(limit);
      }
    } else {
      if (target.data("visible")) {
        // console.log("target became invisible (below viewable arae)");
        target.data("visible", false);
      }
    }
  }.bind(this);

  $(window).on('scroll', this.scrollHandler);
});

Template.ReturnsList.onDestroyed(function() {
  $(window).off('scroll', this.scrollHandler);
  Session.set('searchActive', false);
});

function getLimit() {
  return 20;
}

const sortSearchResults = (arrayToSort, sortField, sortDirection) => {
  switch (sortField) {
    case 'orderNumber':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? Number(a.orderNumber) - Number(b.orderNumber) : Number(b.orderNumber) - Number(a.orderNumber);
      });
      break;
    case 'issuedAt':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? new Date(a.issuedAt) - new Date(b.issuedAt) : new Date(b.issuedAt) - new Date(a.issuedAt);
      });
      break;
    case 'total':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? Number(a.total) - Number(b.total) : Number(b.total) - Number(a.total);
      });
      break;
    case 'returnOrderNumber':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? Number(a.returnOrderNumber) - Number(b.returnOrderNumber) : Number(b.returnOrderNumber) - Number(a.returnOrderNumber);
      });
      break;
    case 'customerName':
      arrayToSort.sort(function (a, b) {
        var firstCustomerName = (a.customerName).toLowerCase();
        var secondCustomerName = (b.customerName).toLowerCase();
        return sortDirection === 1 ? firstCustomerName > secondCustomerName : secondCustomerName > firstCustomerName;
      });
      break;
  }
  return arrayToSort;
};


