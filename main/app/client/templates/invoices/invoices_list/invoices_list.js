/*****************************************************************************/
/* InvoicesList: Event Handlers */
/*****************************************************************************/
Template.InvoicesList.events({
  'click a[href="#unpaid"]': function(e, tmpl) {
    Session.set('invoiceListStatusFilter', 'unpaid');
  },
  'click a[href="#paid"]': function(e, tmpl) {
    Session.set('invoiceListStatusFilter', 'paid');
  },
  'change select#dfilter': function(e, tmpl) {
    let filterMonths = tmpl.$('#dfilter').val();
    Session.set('invoiceListDurationFilter', filterMonths)
    let startDate = moment().subtract(filterMonths, 'months')._d;
    Session.set('startDate', startDate)
  },
	'click a[href="#sort"]': function(e, tmpl) {
		let key = e.currentTarget.dataset.key;
		if (Session.get('invoiceSortBy') === key) Session.set('invoiceSortDirection', 0 - Number(Session.get('invoiceSortDirection'))); //reverse sort direction
		else Session.set('invoiceSortBy', key);
	},
  'keyup #invoice-search': function(e, tmpl) {
    let searchTerm = tmpl.$('#invoice-search').val().trim();
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
  'submit #invoice-search-form': function(e) {
    e.preventDefault();
  }
});

/*****************************************************************************/
/* InvoicesList: Helpers */
/*****************************************************************************/
Template.InvoicesList.helpers({
  searchText: function () {
    return Template.instance().elements.get('searchText');
  },
  activeStatus: function() {
    return s.capitalize(Session.get('invoiceListStatusFilter'));
  },
  mainSearchReturns: function () {
    return Template.instance().searchResults.get('results');
  },
  searchInvoices: function () {
    var allResults = Template.InvoicesList.__helpers.get('mainSearchReturns').call();
    let sFilter = Session.get('invoiceListStatusFilter');
    let dFilter = Session.get('invoiceListDurationFilter');
    let startDate = moment().subtract(dFilter, 'months')._d;
    let limit = Template.instance().limit.get();
    let sortDirection = Number(Session.get('invoiceSortDirection') || -1);
    let sortField = Session.get('invoiceSortBy');
    let filteredResult = _.filter(allResults, function (result) {
      return (result.status === sFilter && moment(result.issuedAt) > startDate);
    }).slice(0, limit - 1);
    return sortSearchResults(filteredResult, sortField, sortDirection);
  },
  hasMoreSearchResults: function () {
    return Template.InvoicesList.__helpers.get('mainSearchReturns').call().length >= Template.instance().limit.get();
  },
  searchActive: function () {
    return Session.get('searchActive');
  },
  searchQueryReturned: function () {
    return Session.get('searchQueryReturned');
  },
  invoices: function() {
    return Template.instance().invoices();
  },
  invoiceCount: function() {
    let dFilter = Session.get('invoiceListDurationFilter');
    let startDate = moment().subtract(dFilter, 'months')._d;
    let count;
    if (Session.get('searchActive')) {
      count = _.filter(Template.InvoicesList.__helpers.get('mainSearchReturns').call(), function (data) {
        return moment(data.issuedAt) > startDate;
      }).length
    } else {
      let cStatus = (Session.get('invoiceListStatusFilter')).toUpperCase();
      let counterId = "INVOICES_" + cStatus + '_' + dFilter;
      let counter = Counts.findOne(counterId);
      count = counter ? counter.count : 0
    }
    return count == 1 ? `${count} invoice` : `${count} invoices`;
  },
  unpaidInvoiceCountFiltered: function() {
    let dFilter = Session.get('invoiceListDurationFilter');
    let startDate = moment().subtract(dFilter, 'months')._d;
    let count;

    if (Session.get('searchActive')) {
      count = _.filter(Template.InvoicesList.__helpers.get('mainSearchReturns').call(), function (data) {
        return (data.status === 'unpaid' && moment(data.issuedAt) > startDate);
      }).length;
    } else {
      count = Invoices.find({
        status: 'unpaid',
        issuedAt: {
          $gte: startDate
        }
      }).count();
    }
    return count ? count : '';
  },
  currentDuration: function() {
    let dFilter = Session.get('invoiceListDurationFilter');
    return dFilter == '1' ? `past month` : `past ${dFilter} months`;
  },
  tabClass: function(tab) {
    if (tab === Session.get('invoiceListStatusFilter')) return 'active';
    return '';
  },
  hasMoreInvoices: function () {
    return Template.instance().invoices().count() >= Template.instance().limit.get();
  },
	sortedBy: function (key) {
		let sortIcon = Session.get('invoiceSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
		return Session.get('invoiceSortBy') === key ? sortIcon : '';
	}

});

/*****************************************************************************/
/* InvoicesList: Lifecycle Hooks */
/*****************************************************************************/
Template.InvoicesList.onCreated(function() {
  let invoiceListStatusFilter = Session.get('invoiceListStatusFilter');
  let dFilter = Session.get('invoiceListDurationFilter') ? Session.get('invoiceListDurationFilter') : 1 ;
  let startDate = moment().subtract(dFilter, 'months')._d;
  Session.set('startDate', startDate);

  if (!invoiceListStatusFilter) {
    Session.set('invoiceListStatusFilter', 'paid');
    Session.set('invoiceListDurationFilter', 1);
 	}
  
  if (!Session.get('invoiceSortBy')) {
    Session.set('invoiceSortBy', 'issuedAt');
		Session.set('invoiceSortDirection', -1);
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
    Core.SearchConnection.call('search/local', 'invoices', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
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
    let status = Session.get('invoiceListStatusFilter');
    let sortBy = Session.get('invoiceSortBy');
    let sortDirection = Number(Session.get('invoiceSortDirection') || -1);
    let sort = {};
    sort[sortBy] = sortDirection;
    let subscription = InvoiceSubs.subscribe('Invoices', status, Session.get('startDate'), limit, sort);

    /*
    let invoiceStatus = ["paid", "unpaid"];
    let durations = [1, 3, 6, 12];
    _.each(invoiceStatus, function(s){
      _.each(durations, function(d){
        instance.subscribe('InvoiceCount', d, s);
      })
    });
    */

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
    }
  });

  // 3. Cursor
  instance.invoices = function() {
       let dFilter = Session.get('invoiceListDurationFilter');
       let startDate = moment().subtract(dFilter, 'months')._d;
       let sortBy = Session.get('invoiceSortBy');
	   let sortDirection = Number(Session.get('invoiceSortDirection') || -1);
	
	   let options = {};
	   options.sort = {};
	   options.sort[sortBy] = sortDirection;
       options.limit = instance.loaded.get();
		
	   return Invoices.find({status: Session.get('invoiceListStatusFilter'), issuedAt: {$gte: startDate}}, options);
  }
});

Template.InvoicesList.onRendered(function() {
  var tmpl = Template.instance();
  tmpl.$('#dfilter').val(Session.get('invoiceListDurationFilter'));

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
        target.data("visible", false);
      }
    }
  }.bind(this);

  $(window).on('scroll', this.scrollHandler);
});

Template.InvoicesList.onDestroyed(function() {
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
    case 'invoiceNumber':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? Number(a.invoiceNumber) - Number(b.invoiceNumber) : Number(b.invoiceNumber) - Number(a.invoiceNumber);
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