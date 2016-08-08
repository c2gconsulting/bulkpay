/*****************************************************************************/
/* StockAdjustmentsList: Event Handlers */
/*****************************************************************************/
Template.StockAdjustmentsList.events({
  'click a[href="#sort"]': function (e, tmpl) {
    let key = e.currentTarget.dataset.key;
    if (Session.get('transferSortBy') === key) Session.set('transferSortDirection', 0 - Number(Session.get('transferSortDirection'))); //reverse sort direction
    else Session.set('transferSortBy', key);
  },
});

/*****************************************************************************/
/* StockAdjustmentsList: Helpers */
/*****************************************************************************/
Template.StockAdjustmentsList.helpers({
  hasMoreTransfers: function () {
    return Template.instance().transfers().count() >= Template.instance().limit.get();
  },
  sortedBy: function (key) {
    let sortIcon = Session.get('transferSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
    return Session.get('transferSortBy') === key ? sortIcon : '';
  },
  adjustments: function() {
    return Template.instance().adjustments();
  }
});

/*****************************************************************************/
/* StockAdjustmentsList: Lifecycle Hooks */
/*****************************************************************************/
Template.StockAdjustmentsList.onCreated(function () {

  if (!Session.get('transferSortBy')) {
    Session.set('transferSortBy', 'receivedAt');
    Session.set('transferSortDirection', -1);
  }

  let instance = this;
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(getLimit());

  instance.autorun(function () {
    let limit = instance.limit.get();
    let sortBy = Session.get('transferSortBy');
    let sortDirection = Number(Session.get('transferSortDirection') || -1);
    let sort = {};
    sort[sortBy] = sortDirection;

    let subscription = instance.subscribe('StockAdjustments', sort, limit);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
    }
  });

  // 3. Cursor
  instance.adjustments = function () {
    let sortBy = Session.get('transferSortBy');
    let sortDirection = Number(Session.get('transferSortDirection') || -1);

    let options = {};
    options.sort = {};
    options.sort[sortBy] = sortDirection;
    options.limit = instance.loaded.get();

    return StockAdjustments.find({}, options);
  };

});

Template.StockAdjustmentsList.onRendered(function () {
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

Template.StockAdjustmentsList.onDestroyed(function () {
  $(window).off('scroll', this.scrollHandler);
  Session.set('searchActive', false);
});


function getLimit() {
  return 20;
}
