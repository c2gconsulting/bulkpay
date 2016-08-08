/*****************************************************************************/
/* GlobalSearch: Event Handlers */
/*****************************************************************************/
Template.GlobalSearch.events({
  'click .view-search-document': function (e, tmpl) {
    tmpl.$('#global-search-close').click();
  },
  'keyup #overlay-search': function (e, tmpl) {
    tmpl.elements.set('searchText', e.currentTarget.value);
  }
});

/*****************************************************************************/
/* HeaderProfile: Helpers */
/*****************************************************************************/
Template.GlobalSearch.helpers({
  mainSearchResults: function () {
    return Template.instance().searchResults.get('results');
  },
  searchText: function () {
    return Template.instance().elements.get('searchText');
  },
  globalSearchTypes: function (type) {
    let typeArray = [];
    var allSearchResults = Template.GlobalSearch.__helpers.get('mainSearchResults').call();
    _.each(allSearchResults, function (result) {
      if (result._type === type) {
        typeArray.push(result._source);
      }
    });
    return typeArray;
  },
  hasResult: function (type) {
    let object = Template.instance().searchResults.get('results')[type];
    if (object) {
      return object.length > 0;
    } else {
      return false;
    }
  }
});

/*****************************************************************************/
/* HeaderProfile: Lifecycle Hooks */
/*****************************************************************************/
Template.GlobalSearch.onCreated(function () {
  let instance = Template.instance();
  instance.searchResults = new ReactiveDict();
  instance.searchResults.set('results', {});
  instance.lastSearchText = '';

  instance.elements = new ReactiveDict();
});

Template.GlobalSearch.onRendered(function () {

  let instance = Template.instance();

  instance.elements = new ReactiveDict();
  instance.elements.set('queryIds', []);

  // by default exclude searchResults on load
  let searchResults = $('.search-results');
  searchResults.fadeOut("fast");

  // add loading message
  let searchLoading = $('.search-loading');
  searchLoading.fadeOut("fast");

  let query = function (queryObject) {
    Core.SearchConnection.call('search/global', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
      if (!error) {
        let currentQueryIds = instance.elements.get('queryIds');
        if (queryObject.queryId === currentQueryIds[currentQueryIds.length - 1]) {
          instance.searchResults.set('results', results);
          searchLoading.fadeOut("fast");
          searchResults.fadeIn("fast");
        }
      }
    });
  };

  instance.setSearchFunctionTimeOut = function (searchTerm) {
    Meteor.clearTimeout(instance.searchFunctionTimeOut);
    let queryId = Random.id();
    instance.searchFunctionTimeOut = Meteor.setTimeout(function () {
      searchLoading.fadeIn("fast");
      query({
        searchTerm: searchTerm,
        queryId: queryId
      });
    }, 500);
    let currentQueryIds = instance.elements.get('queryIds');
    currentQueryIds.push(queryId);
    instance.elements.set('queryIds', currentQueryIds);
  };


  $('[data-pages="search"]').search({
    searchField: '#overlay-search',
    closeButton: '.overlay-close',
    suggestions: '#overlay-suggestions',
    brand: '.brand',
    onSearchSubmit: function (searchString) {

    },
    onKeyEnter: function (searchString) {
      var searchResults = $('.search-results');
      var searchInstruction = $('.search-instruction');
      var searchText = searchString.trim();

      if (searchText.length >= 3) {
        if (searchText !== instance.lastSearchText) {
          searchResults.fadeOut("fast");
          searchInstruction.fadeOut("fast");
          instance.setSearchFunctionTimeOut(searchText);
        }
      } else {
        Meteor.clearTimeout(instance.searchFunctionTimeOut);
        searchLoading.fadeOut("fast");
        searchResults.fadeOut("fast");
        searchInstruction.fadeIn("fast");
        instance.elements.set('searchTerm', '');
      }

      // set currentSearchString to searchString
      instance.lastSearchText = searchText;
    }
  });
});

Template.GlobalSearch.onDestroyed(function () {
});
