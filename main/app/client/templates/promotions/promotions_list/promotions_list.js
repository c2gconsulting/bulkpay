/*****************************************************************************/
/* PromotionsList: Event Handlers */
/*****************************************************************************/
Template.PromotionsList.events({
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
    if (Session.get('promotionSortBy') === key) Session.set('promotionSortDirection', 0 - Number(Session.get('promotionSortDirection'))); //reverse sort direction
    else Session.set('promotionSortBy', key);
  },
  'click .promotion-line': function(e, tmpl) {
    Router.go('promotions.detail', { _id: this._id });
  },
  'click a#clone-button': function(e, tmpl) {
    e.preventDefault();

    let promotion = Promotions.findOne(this._id);
    if (promotion) {
      delete promotion.status;
      delete promotion._id;
      delete promotion._groupId;
      delete promotion.userId;
      delete promotion.createdBy;
      delete promotion.approvals;
      delete promotion.history;

      promotion.createdAt = new Date();

      Session.set('draftPromotion', promotion);

      Router.go('promotions.create');
    }
  },
  'click a#edit-button': function(e, tmpl) {
    e.preventDefault();
    if (this.status !== 'active')
      Router.go('promotions.edit', { _id: this._id });
  },
  'click .onoffswitch-checkbox': function(e, tmpl) {
    e.preventDefault();

    let field = e.currentTarget.dataset.field;
    if (e.currentTarget.type === 'checkbox' && this.status !== 'ended') {
      let value = e.currentTarget.checked;
      Meteor.call('promotions/updateStatus', this._id, value ? "active" : "pending", function(error, result) {
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
    } else {
      e.preventDefault();
      return
    };
  },
  'click #delete-promotion': function(e, tmpl) {
    let self = this;
    swal({
        title: "Are you sure?",
        text: "Your promotion will be deactivated!",
        type: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, deactivate!",
        closeOnConfirm: false
      },
      function() {
        Meteor.call('promotions/updateStatus', self._id, 'ended', function(error, result) {
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
              text: "Your promotion has been deactivated.",
              confirmButtonClass: "btn-info",
              type: "info",
              confirmButtonText: "OK"
            });
            Router.go('promotions.list');
          }
        });
      })
  },
  'keyup #promotion-search': function (e, tmpl) {
    let searchTerm = tmpl.$('#promotion-search').val().trim();
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
	'submit #promotion-search-form': function (e) {
		e.preventDefault();
	}
});

/*****************************************************************************/
/* PromotionsList: Helpers */
/*****************************************************************************/
Template.PromotionsList.helpers({
  searchQueryReturned: function () {
    return Session.get('searchQueryReturned');
  },
  searchText: function () {
    return Template.instance().elements.get('searchText');
  },
  mainSearchReturns: function() {
    return Template.instance().searchResults.get('results');
  },
  searchPromotions: function() {
    var allResults = Template.PromotionsList.__helpers.get('mainSearchReturns').call();
    let sFilter = Session.get('promotionsListStatusFilter');
    let limit = Template.instance().limit.get();
    let sortDirection = Number(Session.get('promotionSortDirection') || -1);
    let sortField = Session.get('promotionSortBy');
    let filteredResult = _.filter(allResults, function (result) {
      return result.status === sFilter;
    }).slice(0, limit - 1);
    return sortSearchResults(filteredResult, sortField, sortDirection);
  },
  hasMoreSearchResults: function() {
    return Template.PromotionsList.__helpers.get('mainSearchReturns').call().length >= Template.instance().limit.get();
  },
  searchActive: function() {
    return Session.get('searchActive');
  },

  promotions: function() {
    return Template.instance().promotions();
  },
  tabClass: function(tab) {
    if (tab === Session.get('promotionsListStatusFilter')) return 'active';
    return '';
  },
  pendingPromotionCount: function() {
    let count;
    if (Session.get('searchActive')) {
      count = _.filter(Template.PromotionsList.__helpers.get('mainSearchReturns').call(), function(data) {
        return data.status === 'pending';
      }).length
    } else {
      count = Promotions.find({
        status: 'pending'
      }).count();
    }
    return count ? count : '';
  },
  activeStatus: function() {
    return s.capitalize(Session.get('promotionsListStatusFilter'));
  },
  hasMorePromotions: function() {
    return Template.instance().promotions().count() >= Template.instance().limit.get();
  },
  sortedBy: function(key) {
    let sortIcon = Session.get('promotionSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
    return Session.get('promotionSortBy') === key ? sortIcon : '';
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
  isActive: function(status) {
    return status == 'active';
  },
  notEnded: function(status) {
    return status !== 'ended';
  }
});


Template.PromotionsList.events({
  'click a[href="#active"]': function(e, tmpl) {
    Session.set('promotionsListStatusFilter', 'active');
  },
  'click a[href="#pending"]': function(e, tmpl) {
    Session.set('promotionsListStatusFilter', 'pending');
  },
  'click a[href="#ended"]': function(e, tmpl) {
    Session.set('promotionsListStatusFilter', 'ended');
  }
});

/*****************************************************************************/
/* PromotionsList: Lifecycle Hooks */
/*****************************************************************************/
Template.PromotionsList.onCreated(function() {
  let distributorStatusFilter = Session.get('promotionsListStatusFilter');

  if (!distributorStatusFilter) {
    Session.set('promotionsListStatusFilter', 'active');
    Session.set('promotionSortBy', 'createdAt');
    Session.set('promotionSortDirection', -1);
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
    Core.SearchConnection.call('search/local', 'promotions', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
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
    let status = Session.get("promotionsListStatusFilter") || "active";
    let subscription = PromotionSubs.subscribe('Promotions', status, limit);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
    } else {}
  });

  // 3. Cursor
  instance.promotions = function() {
    let sortBy = Session.get('promotionSortBy');
    let sortDirection = Number(Session.get('promotionSortDirection') || -1);

    let options = {};
    options.sort = {};
    options.sort[sortBy] = sortDirection;
    options.limit = instance.loaded.get();

    let status = Session.get("promotionsListStatusFilter") || "active";
    return Promotions.find({ status: status }, options);
  }


});

Template.PromotionsList.onRendered(function() {
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

Template.PromotionsList.onDestroyed(function() {
  $(window).off('scroll', this.scrollHandler);
  Session.set('searchActive', false);
});

function getLimit() {
  return 20;
}


const sortSearchResults = (arrayToSort, sortField, sortDirection) => {
  switch (sortField) {
    case 'startDate':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? new Date(a.startDate) - new Date(b.startDate) : new Date(b.startDate) - new Date(a.startDate);
      });
      break;
    case 'endDate':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? new Date(a.endDate) - new Date(b.endDate) : new Date(b.endDate) - new Date(a.endDate);
      });
      break;
    case 'createdAt':
      arrayToSort.sort(function (a, b) {
        return sortDirection === 1 ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
      });
      break;
    case 'name':
      arrayToSort.sort(function (a, b) {
        var firstName = (a.name).toLowerCase();
        var secondName = (b.name).toLowerCase();
        return sortDirection === 1 ? firstName > secondName : secondName > firstName;
      });
      break;
  }
  return arrayToSort;
};
