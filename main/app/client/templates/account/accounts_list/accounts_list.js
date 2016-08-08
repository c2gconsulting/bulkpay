/*****************************************************************************/
/* AccountsList: Event Handlers */
/*****************************************************************************/
Template.AccountsList.events({
    'click a[href="#sort"]': function (e, tmpl) {
        let key = e.currentTarget.dataset.key;
        if (Session.get('userSortBy') === key) Session.set('userSortDirection', 0 - Number(Session.get('userSortDirection'))); //reverse sort direction
        else Session.set('userSortBy', key);
    },
    'click #add-user': function(e) {
        e.preventDefault();
        Modal.show('AccountCreate');
    },
    'keyup #user-search': function (e, tmpl) {
      let searchTerm = tmpl.$('#user-search').val().trim();
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
  'submit #user-search-form': function (e) {
    e.preventDefault();
  }
});

/*****************************************************************************/
/* AccountsList: Helpers */
/*****************************************************************************/
Template.AccountsList.helpers({
  searchQueryReturned: function () {
    return Session.get('searchQueryReturned');
  },
  searchText: function () {
    return Template.instance().elements.get('searchText');
  },
  searchUsers: function () {
    return Template.instance().searchResults.get('results');
  },
  hasMoreSearchResults: function () {
    return Template.AccountsList.__helpers.get('searchUsers').call().length >= Template.instance().limit.get();
  },
  searchActive: function () {
    return Session.get('searchActive');
  },
  hasMoreUsers: function () {
    return Template.instance().users().count() >= Template.instance().limit.get();
  },
  sortedBy: function (key) {
    let sortIcon = Session.get('userSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
    return Session.get('userSortBy') === key ? sortIcon : '';
  },
  users: function() {
    return Template.instance().users();
  }
});

/*****************************************************************************/
/* AccountsList: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountsList.onCreated(function () {

    if (!Session.get('userSortBy')) {
        Session.set('userSortBy', 'createdAt');
        Session.set('userSortDirection', -1);
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
    Core.SearchConnection.call('search/local', 'users', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
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
        let sortBy = Session.get('userSortBy');
        let sortDirection = Number(Session.get('userSortDirection') || -1);
        let sort = {};
        sort[sortBy] = sortDirection;

        let subscription = instance.subscribe('Users', sort, limit);

        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            instance.loaded.set(limit);
        }
    });

    // 3. Cursor
    instance.users = function() {
        let sortBy = Session.get('userSortBy');
        let sortDirection = Number(Session.get('userSortDirection') || -1);

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();

        return Meteor.users.find({}, options);
    };

});

Template.AccountsList.onRendered(function () {
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

Template.AccountsList.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
    Session.set('searchActive', false);
});

function getLimit() {
    return 20;
}
