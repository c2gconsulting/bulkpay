/*****************************************************************************/
/* RebatesList: Event Handlers */
/*****************************************************************************/
Template.RebatesList.events({
  'click .load-more': function(event, instance) {
    event.preventDefault();

    // get current value for limit, i.e. how many posts are currently displayed
    var limit = instance.limit.get();

    // increase limit by 5 and update it
    limit += getLimit();
    instance.limit.set(limit);
  },
  'click a[href="#sort"]': function(e, tmpl) {
    let key = e.currentTarget.dataset.key;
    if (Session.get('rebateSortBy') === key) Session.set('rebateSortDirection', 0 - Number(Session.get('rebateSortDirection'))); //reverse sort direction
    else Session.set('rebateSortBy', key);
  },
  'click .promotion-line': function(e, tmpl) {
    Router.go('rebates.detail', { _id: this._id });
  },
  'click .onoffswitch-checkbox': function(e, tmpl) {
    e.preventDefault();
    let field = e.currentTarget.dataset.field;
    if (e.currentTarget.type === 'checkbox') {
      let value = e.currentTarget.checked;
      Meteor.call('rebates/updateStatus', this._id, value ? "applied" : "pending", function(error, result) {
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
            text: `Promotion status has been updated`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });
        }
      })
    }
  },
  'click #delete-promotion': function(e, tmpl) {
    let self = this;
    swal({
        title: "Are you sure?",
        text: "You will lose your entries!",
        type: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, delete!",
        closeOnConfirm: false
      },
      function() {
        Meteor.call('rebates/delete', self._id, function(error, result) {
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
              title: "",
              text: "Your promotion has been deleted.",
              confirmButtonClass: "btn-info",
              type: "info",
              confirmButtonText: "OK"
            });
            Router.go('rebates.list');
          }
        });
      })
  },
  'keyup #rebate-search': function (e, tmpl) {
    let searchTerm = tmpl.$('#rebate-search').val().trim();
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
	'submit #rebate-search-form': function (e) {
		e.preventDefault();
	}
});

/*****************************************************************************/
/* RebatesList: Helpers */
/*****************************************************************************/
Template.RebatesList.helpers({
  searchQueryReturned: function () {
    return Session.get('searchQueryReturned');
  },
  searchText: function () {
    return Template.instance().elements.get('searchText');
  },
  mainSearchReturns: function() {
    return Template.instance().searchResults.get('results');
  },
  searchRebates: function() {
    var allResults = Template.RebatesList.__helpers.get('mainSearchReturns').call();
    let sFilter = Session.get('rebatesListStatusFilter');
    let limit = Template.instance().limit.get();
    let sortDirection = Number(Session.get('rebateSortDirection') || -1);
    let sortField = Session.get('rebateSortBy');
    let filteredResult = _.filter(allResults, function (result) {
      return result.status === sFilter;
    }).slice(0, limit - 1);
    return sortSearchResults(filteredResult, sortField, sortDirection);
  },
  hasMoreSearchResults: function() {
    return Template.RebatesList.__helpers.get('mainSearchReturns').call().length >= Template.instance().limit.get();
  },
  searchActive: function() {
    return Session.get('searchActive');
  },
  rebates: function() {
    return Template.instance().rebates();
  },
  tabClass: function(tab) {
    if (tab === Session.get('rebatesListStatusFilter')) return 'active';
    return '';
  },
  pendingPromotionCount: function() {
    let count;
    if (Session.get('searchActive')) {
      count = _.filter(Template.RebatesList.__helpers.get('mainSearchReturns').call(), function(data) {
        return data.status === 'pending';
      }).length
    } else {
      count = PromotionRebates.find({
        status: 'pending'
      }).count();
    }
    return count ? count : '';
  },
  activeStatus: function() {
    return s.capitalize(Session.get('rebatesListStatusFilter') == 'applied' ? 'applied': 'pending');
  },
  hasMorePromotions: function() {
    return Template.instance().rebates().count() >= Template.instance().limit.get();
  },
  sortedBy: function(key) {
    let sortIcon = Session.get('rebateSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
    return Session.get('rebateSortBy') === key ? sortIcon : '';
  },
  add: function(a, b) {
    return a + b;
  },
  prettyCreatedAt: function() {
    return moment(this.createdAt).format('DD/MM/YYYY');
  },
  prettyEndDate: function() {
    return moment(this.endDate).format('DD/MM/YYYY');
  },
  prettyStartDate: function() {
    return moment(this.startDate).format('DD/MM/YYYY');
  },
  size: function(obj) {
    return _.size(obj);
  },
  applied: function(status) {
    return status == 'applied';
  }
});


Template.RebatesList.events({
  'click a[href="#active"]': function(e, tmpl) {
    Session.set('rebatesListStatusFilter', 'applied');
  },
  'click a[href="#pending"]': function(e, tmpl) {
    Session.set('rebatesListStatusFilter', 'pending');
  }
});

/*****************************************************************************/
/* RebatesList: Lifecycle Hooks */
/*****************************************************************************/
Template.RebatesList.onCreated(function() {
  let distributorStatusFilter = Session.get('rebatesListStatusFilter');

  if (!distributorStatusFilter) {
    Session.set('rebatesListStatusFilter', 'applied');
    Session.set('rebateSortBy', 'createdAt');
    Session.set('rebateSortDirection', -1);
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
    Core.SearchConnection.call('search/local', 'promotionrebates', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
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
  instance.autorun(function() {

    // get the limit
    let limit = instance.limit.get();
    // subscribe to the posts publication
    let status = Session.get("rebatesListStatusFilter");
    let subscription = instance.subscribe('PromotionRebates', status, limit);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
    } else {}
  });

  // 3. Cursor
  instance.rebates = function() {
    let sortBy = Session.get('rebateSortBy');
    let sortDirection = Number(Session.get('rebateSortDirection') || -1);

    let options = {};
    options.sort = {};
    options.sort[sortBy] = sortDirection;
    options.limit = instance.loaded.get();

    let status = Session.get("rebatesListStatusFilter");
    return PromotionRebates.find({ status: status }, options);
  }


});

Template.RebatesList.onRendered(function() {
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

Template.RebatesList.onDestroyed(function() {
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
    case 'orderNumber':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? Number(a.orderNumber) - Number(b.orderNumber) : Number(b.orderNumber) - Number(a.orderNumber);
      });
      break;
    case 'value':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? Number(a.value) - Number(b.value) : Number(b.value) - Number(a.value);
      });
      break;
    case 'customerName':
      arrayToSort.sort(function (a, b) {
        var firstCustomerName = (a.customerName).toLowerCase();
        var secondCustomerName = (b.customerName).toLowerCase();
        return sortDirection === 1 ? firstCustomerName > secondCustomerName : secondCustomerName > firstCustomerName;
      });
      break;
    case 'promotionName':
      arrayToSort.sort(function (a, b) {
        var firstPromotionName = (a.promotionName).toLowerCase();
        var secondPromotionName = (b.promotionName).toLowerCase();
        return sortDirection === 1 ? firstPromotionName > secondPromotionName : secondPromotionName > firstPromotionName;
      });
      break;
  }
  return arrayToSort;
};
