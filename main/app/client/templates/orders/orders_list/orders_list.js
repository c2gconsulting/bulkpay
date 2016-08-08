/*****************************************************************************/
/* OrdersList: Event Handlers */
/*****************************************************************************/
Template.OrdersList.events({
	'click a[href="#open"]': function (e, tmpl) {
		Session.set('orderListStatusFilter', 'open');
		resetApprovalFilter()
	},
	'click a[href="#accepted"]': function (e, tmpl) {
		Session.set('orderListStatusFilter', 'accepted');
		resetApprovalFilter()
	},
	'click a[href="#approved"]': function (e, tmpl) {
		Session.set('orderListApprovalStatusFilter', 'approved');
		Session.set('orderListStatusFilter', 'open');

	},
	'click a[href="#rejected"]': function (e, tmpl) {
		Session.set('orderListApprovalStatusFilter', 'rejected');
		Session.set('orderListStatusFilter', 'open');
	},

	'click a[href="#pending"]': function (e, tmpl) {
		Session.set('orderListApprovalStatusFilter', 'pending');
		Session.set('orderListStatusFilter', 'open');
	},
	'click a[href="#shipped"]': function (e, tmpl) {
		Session.set('orderListStatusFilter', 'shipped');
		resetApprovalFilter()
	},
	'click a[href="#cancelled"]': function (e, tmpl) {
		Session.set('orderListStatusFilter', 'cancelled');
		resetApprovalFilter()
	},
	'change select#dfilter': function (e, tmpl) {
		let filterMonths = tmpl.$('#dfilter').val();
		Session.set('orderListDurationFilter', filterMonths);
		let startDate = moment().subtract(filterMonths, 'months')._d;
		Session.set('startDate', startDate)
	},
	'click a[href="#sort"]': function (e, tmpl) {
		let key = e.currentTarget.dataset.key;
		if (Session.get('orderSortBy') === key) Session.set('orderSortDirection', 0 - Number(Session.get('orderSortDirection'))); //reverse sort direction
		else Session.set('orderSortBy', key);
	},
	'keyup #orderSearch': function (e, tmpl) {
		let searchTerm = tmpl.$('#orderSearch').val().trim();
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
	'submit #order-search-form': function (e) {
		e.preventDefault();
	}
});

/*****************************************************************************/
/* OrdersList: Helpers */
/*****************************************************************************/
Template.OrdersList.helpers({
	searchText: function () {
		return Template.instance().elements.get('searchText');
	},
	activeStatus: function() {
		return s.capitalize(Session.get('orderListStatusFilter'));
	},
	mainSearchOrders: function () {
		return Template.instance().searchResults.get('results');
	},
	searchOrders: function () {
		var allResults = Template.OrdersList.__helpers.get('mainSearchOrders').call();
		let orderedListFilter = Session.get('orderListStatusFilter');
		let orderListDurationFilter = Session.get('orderListDurationFilter');
		let startDate = moment().subtract(orderListDurationFilter, 'months')._d;
		let limit = Template.instance().limit.get();
		let sortDirection = Number(Session.get('orderSortDirection') || -1);
		let sortField = Session.get('orderSortBy');
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
	orders: function() {
		return Template.instance().orders();
	},
	openTabstatus: function(){
		return Session.get('orderListStatusFilter') === "open";

	},
	openOrderCountFiltered: function() {
		let dFilter = Session.get('orderListDurationFilter');
		let startDate = moment().subtract(dFilter, 'months')._d;
		let count;
		if (Session.get('searchActive')) {
			count = _.filter(Template.OrdersList.__helpers.get('mainSearchOrders').call(), function (data) {
				return (data.status === 'open' && moment(data.issuedAt) > startDate);
			}).length;
		} else {
			count = Orders.find({
				status: 'open',
				issuedAt: { $gte: startDate }
			}).count();
		}
		return count ? count : '';
	},
	currentDuration: function() {
		let dFilter = Session.get('orderListDurationFilter');
		return dFilter == '1' ? `past month` : `past ${dFilter} months`;
	},
	tabClass: function(tab) {
		if (tab === Session.get('orderListStatusFilter')) return 'active';
		if (tab === Session.get('orderListApprovalStatusFilter')) return 'active';
		return '';
	},
	hasMoreOrders: function () {
		return Template.instance().orders().count() >= Template.instance().limit.get();
	},
	sortedBy: function (key) {
		let sortIcon = Session.get('orderSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
		return Session.get('orderSortBy') === key ? sortIcon : '';
	}

});

/*****************************************************************************/
/* OrdersList: Lifecycle Hooks */
/*****************************************************************************/
Template.OrdersList.onCreated(function () {
	let orderStatusFilter = Session.get('orderListStatusFilter');
	let dFilter = Session.get('orderListDurationFilter') ? Session.get('orderListDurationFilter') : 1 ;
	let startDate = moment().subtract(dFilter, 'months')._d;
	Session.set('startDate', startDate);


	if (!orderStatusFilter) {
		Session.set('orderListStatusFilter', 'open');
		Session.set('orderListDurationFilter', 1);
	}

	if (!Session.get('orderSortBy')) {
		Session.set('orderSortBy', 'issuedAt');
		Session.set('orderSortDirection', -1);
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
		Core.SearchConnection.call('search/local', 'orders', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
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
		let status = Session.get('orderListStatusFilter');
		let sortBy = Session.get('orderSortBy');
		let sortDirection = Number(Session.get('orderSortDirection') || -1);
		let sort = {};
		sort[sortBy] = sortDirection;

		let filter = {};
		filter["status"] = status;
		filter["issuedAt"] = {$gte: Session.get('startDate')};

		let approvalStatus = Session.get('orderListApprovalStatusFilter');
		if(status === 'open' && approvalStatus){
			filter["approvalStatus"] = approvalStatus;
		}

		let subscription = OrderSubs.subscribe('Orders', filter, limit, sort);

		/*
		let orderStatus = ["open", "accepted", "shipped", "cancelled"];
		let durations = [1, 3, 6, 12];
		_.each(orderStatus, function(s){
			_.each(durations, function(d){
				instance.subscribe('OrderCount', d, s);
			})
		});
		*/

		// if subscription is ready, set limit to newLimit
		if (subscription.ready()) {
			instance.loaded.set(limit);
		}
	});

	// 3. Cursor
	instance.orders = function() {
		let dFilter = Session.get('orderListDurationFilter');
		let startDate = moment().subtract(dFilter, 'months')._d;
		let sortBy = Session.get('orderSortBy');
		let sortDirection = Number(Session.get('orderSortDirection') || -1);

		let options = {};
		options.sort = {};
		options.sort[sortBy] = sortDirection;
		options.limit = instance.loaded.get();

		let filter = {};
		filter["status"] = Session.get('orderListStatusFilter');
		filter["issuedAt"] = {$gte: startDate};
		let approvalStatus = Session.get('orderListApprovalStatusFilter');
		if(filter["status"] === 'open' && approvalStatus){
			filter["approvalStatus"] = approvalStatus;
		}

		return Orders.find(filter, options);
	};

});

Template.OrdersList.onRendered(function () {
	var tmpl = Template.instance();
	tmpl.$('#dfilter').val(Session.get('orderListDurationFilter'));

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

Template.OrdersList.onDestroyed(function () {
	$(window).off('scroll', this.scrollHandler);
	Session.set('searchActive', false);
});

function getLimit() {
	return 20;
}

function resetApprovalFilter(){
	Session.set('orderListApprovalStatusFilter', undefined);
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
		case 'orderType':
			arrayToSort.sort(function (a, b) {
				return sortDirection === 1 ? Number(a.orderType) - Number(b.orderType) : Number(b.orderType) - Number(a.orderType);
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
