/*****************************************************************************/
/* PurchaseOrdersList: Event Handlers */
/*****************************************************************************/
Template.PurchaseOrdersList.events({
    'click a[href="#open"]': function (e, tmpl) {
        Session.set('purchaseOrderListStatusFilter', 'open');
    },
    'click a[href="#received"]': function (e, tmpl) {
        Session.set('purchaseOrderListStatusFilter', 'received');
    },
    'click a[href="#cancelled"]': function (e, tmpl) {
        Session.set('purchaseOrderListStatusFilter', 'cancelled');
    },
    'change select#dfilter': function (e, tmpl) {
        let filterMonths = tmpl.$('#dfilter').val();
        Session.set('purchaseOrderListDurationFilter', filterMonths);
        let startDate = moment().subtract(filterMonths, 'months')._d;
        Session.set('startDate', startDate)
    },
    'click a[href="#sort"]': function (e, tmpl) {
        let key = e.currentTarget.dataset.key;
        if (Session.get('purchaseOrderSortBy') === key) Session.set('purchaseOrderSortDirection', 0 - Number(Session.get('purchaseOrderSortDirection'))); //reverse sort direction
        else Session.set('purchaseOrderSortBy', key);
    },
    'keyup #orderSearch': function (e, tmpl) {
        let searchTerm = tmpl.$('#purchaseOrderSearch').val().trim();
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
    'submit #purchase-order-search-form': function (e) {
        e.preventDefault();
    },
    'click .order-entry': function(e, tmpl) {
        Router.go('purchaseOrders.detail', {_id: this._id});
    }
});

/*****************************************************************************/
/* PurchaseOrdersList: Helpers */
/*****************************************************************************/
Template.PurchaseOrdersList.helpers({
    searchText: function () {
        return Template.instance().elements.get('searchText');
    },
    activeStatus: function() {
        return s.capitalize(Session.get('purchaseOrderListStatusFilter'));
    },
    mainSearchOrders: function () {
        return Template.instance().searchResults.get('results');
    },
    searchOrders: function () {
        var allResults = Template.OrdersList.__helpers.get('mainSearchOrders').call();
        let orderedListFilter = Session.get('purchaseOrderListStatusFilter');
        let orderListDurationFilter = Session.get('purchaseOrderListDurationFilter');
        let startDate = moment().subtract(orderListDurationFilter, 'months')._d;
        let limit = Template.instance().limit.get();
        let sortDirection = Number(Session.get('purchaseOrderSortDirection') || -1);
        let sortField = Session.get('purchaseOrderSortBy');
        let filteredResult = _.filter(allResults, function (result) {
            return (result && result.status === orderedListFilter && moment(result.issuedAt) > startDate);
        }).slice(0, limit - 1);
        return sortSearchResults(filteredResult, sortField, sortDirection);
    },
    hasMoreSearchResults: function () {
        return Template.OrdersList.__helpers.get('mainSearchOrders').call().length >= Template.instance().limit.get();
    },
    searchActive: function () {
        return Session.get('searchActive');
    },
    searchQueryReturned: function () {
        return Session.get('searchQueryReturned');
    },
    purchaseOrders: function() {
        return Template.instance().purchaseOrders();
    },
    openTabstatus: function(){
        return Session.get('orderListStatusFilter') === "open";

    },
    openPurchaseOrderCountFiltered: function() {
        let dFilter = Session.get('purchaseOrderListDurationFilter');
        let startDate = moment().subtract(dFilter, 'months')._d;
        let count;
        if (Session.get('searchActive')) {
            count = _.filter(Template.PurchaseOrdersList.__helpers.get('mainSearchOrders').call(), function (data) {
                return (data.status === 'open' && moment(data.issuedAt) > startDate);
            }).length;
        } else {
            count = PurchaseOrders.find({
                status: 'open',
                issuedAt: { $gte: startDate }
            }).count();
        }
        return count ? count : '';
    },
    currentDuration: function() {
        let dFilter = Session.get('purchaseOrderListDurationFilter');
        return dFilter == '1' ? `past month` : `past ${dFilter} months`;
    },
    tabClass: function(tab) {
        if (tab === Session.get('purchaseOrderListStatusFilter')) return 'active';
        if (tab === Session.get('purchaseOrderListApprovalStatusFilter')) return 'active';
        return '';
    },
    hasMorePurchaseOrders: function () {
        return Template.instance().purchaseOrders().count() >= Template.instance().limit.get();
    },
    sortedBy: function (key) {
        let sortIcon = Session.get('purchaseOrderSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
        return Session.get('purchaseOrderSortBy') === key ? sortIcon : '';
    }
});

/*****************************************************************************/
/* PurchaseOrdersList: Lifecycle Hooks */
/*****************************************************************************/
Template.PurchaseOrdersList.onCreated(function () {
    let orderStatusFilter = Session.get('purchaseOrderListStatusFilter');
    let dFilter = Session.get('purchaseOrderListDurationFilter') ? Session.get('purchaseOrderListDurationFilter') : 1 ;
    let startDate = moment().subtract(dFilter, 'months')._d;
    Session.set('startDate', startDate);


    if (!orderStatusFilter) {
        Session.set('purchaseOrderListStatusFilter', 'open');
        Session.set('purchaseOrderListDurationFilter', 1);
    }

    if (!Session.get('purchaseOrderSortBy')) {
        Session.set('purchaseOrderSortBy', 'issuedAt');
        Session.set('purchaseOrderSortDirection', -1);
    }

    if (!Session.get('searchActive')) {
        Session.set('searchActive', false);
    }


    let instance = this;
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    instance.ready = new ReactiveVar();


    instance.searchResults = new ReactiveDict();
    instance.searchResults.set('results', []);
    instance.searchFunctionTimeOut = null;
    instance.elements = new ReactiveDict();
    instance.elements.set('queryIds', []);
    instance.lastSearchText = '';

    let query = function (queryObject) {
        Core.SearchConnection.call('search/local', 'purchaseorders', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
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
        let status = Session.get('purchaseOrderListStatusFilter');
        let sortBy = Session.get('purchaseOrderSortBy');
        let sortDirection = Number(Session.get('purchaseOrderSortDirection') || -1);
        let sort = {};
        sort[sortBy] = sortDirection;

        let filter = {};
        filter["status"] = status;
        filter["issuedAt"] = {$gte: Session.get('startDate')};


        let subscription = OrderSubs.subscribe('PurchaseOrders', filter, limit, sort);

        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            instance.loaded.set(limit);
        }
    });

    // 3. Cursor
    instance.purchaseOrders = function() {
        let dFilter = Session.get('purchaseOrderListDurationFilter');
        let startDate = moment().subtract(dFilter, 'months')._d;
        let sortBy = Session.get('purchaseOrderSortBy');
        let sortDirection = Number(Session.get('purchaseOrderSortDirection') || -1);

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();

        let filter = {};
        filter["status"] = Session.get('purchaseOrderListStatusFilter');
        filter["issuedAt"] = {$gte: startDate};
        return PurchaseOrders.find(filter, options);
    };
});

Template.PurchaseOrdersList.onRendered(function () {
    var tmpl = Template.instance();
    tmpl.$('#dfilter').val(Session.get('purchaseOrderListDurationFilter'));

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

Template.PurchaseOrdersList.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
    Session.set('searchActive', false);
});

function getLimit() {
    return 20;
}