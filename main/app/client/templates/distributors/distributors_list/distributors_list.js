/*****************************************************************************/
/* DistributorsList: Event Handlers */
/*****************************************************************************/
Template.DistributorsList.events({
  'click .load-more': function (event, instance) {
    event.preventDefault();

    // get current value for limit, i.e. how many posts are currently displayed
    var limit = instance.limit.get();

    // increase limit by 5 and update it
    limit += getLimit();
    instance.limit.set(limit);
  },
  'click a[href="#sort"]': function (e, tmpl) {
    let key = e.currentTarget.dataset.key;
    if (Session.get('customerSortBy') === key) Session.set('customerSortDirection', 0 - Number(Session.get('customerSortDirection'))); //reverse sort direction
    else Session.set('customerSortBy', key);
  },
  'keyup #customer-search': function (e, tmpl) {
    let searchTerm = tmpl.$('#customer-search').val().trim();
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
  'submit #customer-search-form': function (e) {
    e.preventDefault();
  }
});

/*****************************************************************************/
/* DistributorsList: Helpers */
/*****************************************************************************/
Template.DistributorsList.helpers({
  searchQueryReturned: function () {
    return Session.get('searchQueryReturned');
  },
  searchText: function () {
    return Template.instance().elements.get('searchText');
  },
  mainSearchReturns: function () {
    return Template.instance().searchResults.get('results');
  },
  searchCustomers: function () {
    var allResults = Template.DistributorsList.__helpers.get('mainSearchReturns').call();
    let sFilter = Session.get('distributorListStatusFilter');
    let limit = Template.instance().limit.get();
    let sortDirection = Number(Session.get('customerSortDirection') || -1);
    let sortField = Session.get('customerSortBy');
    let filteredResult = _.filter(allResults, function (result) {
      return result.status === sFilter;
    }).slice(0, limit - 1);
    return sortSearchResults(filteredResult, sortField, sortDirection);
  },
  hasMoreSearchResults: function () {
    return Template.DistributorsList.__helpers.get('mainSearchReturns').call().length >= Template.instance().limit.get();
  },
  searchActive: function () {
    return Session.get('searchActive');
  },

  customers: function () {
    return Template.instance().customers();
  },
  tabClass: function (tab) {
    if (tab === Session.get('distributorListStatusFilter')) return 'active';
    return '';
  },
  pendingCustomerCount: function () {
    let count;
    if (Session.get('searchActive')) {
      count = _.filter(Template.DistributorsList.__helpers.get('mainSearchReturns').call(), function (data) {
        return data.status === 'pending';
      }).length
    } else {
      count = Customers.find({
        status: 'pending'
      }).count();
    }
    return count ? count : '';
  },
  activeStatus: function () {
    return s.capitalize(Session.get('distributorListStatusFilter'));
  },
  hasMoreCustomers: function () {
    return Template.instance().customers().count() >= Template.instance().limit.get();
  },
  sortedBy: function (key) {
    let sortIcon = Session.get('customerSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
    return Session.get('customerSortBy') === key ? sortIcon : '';
  }
});


Template.DistributorsList.events({
  'click a[href="#active"]': function (e, tmpl) {
    Session.set('distributorListStatusFilter', 'active');
  },
  'click a[href="#pending"]': function (e, tmpl) {
    Session.set('distributorListStatusFilter', 'pending');
  }
});

/*****************************************************************************/
/* DistributorsList: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorsList.onCreated(function () {
  let distributorStatusFilter = Session.get('distributorListStatusFilter');

  if (!distributorStatusFilter) {
    Session.set('distributorListStatusFilter', 'active');
    Session.set('customerSortBy', 'createdAt');
    Session.set('customerSortDirection', -1);
  }

  if (!Session.get('searchActive')) {
    Session.set('searchActive', false);
  }

  // 1. Initialization
  let instance = this;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(getLimit());

  instance.searchResults = new ReactiveDict();
  instance.searchResults.set('results', []);
  instance.searchFunctionTimeOut = null;
  instance.elements = new ReactiveDict();
  instance.elements.set('queryIds', []);
  instance.lastSearchText = '';

  let query = function (queryObject) {
    Core.SearchConnection.call('search/local', 'customers', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
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



  // 2. Autorun

  // will re-run when the "limit" reactive variables changes
  instance.autorun(function () {

    // get the limit
    let limit = instance.limit.get();
    // subscribe to the posts publication
    let status = Session.get("distributorListStatusFilter") || "active";
    instance.subscribe("Locations");
    let subscription = CustomerSubs.subscribe('Customers', status, limit);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
    } else {
    }
  });

  // 3. Cursor
  instance.customers = function () {
    let sortBy = Session.get('customerSortBy');
    let sortDirection = Number(Session.get('customerSortDirection') || -1);

    let options = {};
    options.sort = {};
    options.sort[sortBy] = sortDirection;
    options.limit = instance.loaded.get();

    let status = Session.get("distributorListStatusFilter") || "active";
    return Customers.find({status: status}, options);
  }


});

Template.DistributorsList.onRendered(function () {
  //let instance = this;
  this.scrollHandler = function (e) {
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
        target.data("visible", false);
      }
    }
  }.bind(this);

  $(window).on('scroll', this.scrollHandler);
});

Template.DistributorsList.onDestroyed(function () {
  $(window).off('scroll', this.scrollHandler);
  Session.set('searchActive', false);
});

function getLimit() {
  return 20;
}


const sortSearchResults = (arrayToSort, sortField, sortDirection) => {
  switch (sortField) {
    case 'createdAt':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
      });
      break;
    case 'groupCode':
      arrayToSort.sort(function (a, b) {
        var firstGroupCode = (a.groupCode).toLowerCase();
        var secondGroupCode = (b.groupCode).toLowerCase();
        return sortDirection === 1 ? firstGroupCode > secondGroupCode : secondGroupCode > firstGroupCode;
      });
      break;
    case 'defaultSalesLocationId':
      arrayToSort.sort(function (a, b) {
        var firstSalesLocationId = a.defaultSalesLocationId ? (a.defaultSalesLocationId).toLowerCase() : '';
        var secondSalesLocationId  = b.defaultSalesLocationId ? (b.defaultSalesLocationId).toLowerCase() : '';
        return sortDirection === 1 ? firstSalesLocationId > secondSalesLocationId : secondSalesLocationId > firstSalesLocationId;
      });
      break;
    case 'name':
      arrayToSort.sort(function (a, b) {
        var firstName = (a.name).toLowerCase();
        var secondName = (b.name).toLowerCase();
        return sortDirection === 1 ? firstName > secondName : secondName > firstName;
      });
      break;
    case 'customerNumber':
      arrayToSort.sort(function (a, b) {
        var firstCustomerNumber = (String(a.customerNumber)).toLowerCase();
        var secondCustomerNumber = (String(b.customerNumber)).toLowerCase();
        return sortDirection === 1 ? firstCustomerNumber > secondCustomerNumber : secondCustomerNumber > firstCustomerNumber;
      });
      break;
  }
  return arrayToSort;
};

