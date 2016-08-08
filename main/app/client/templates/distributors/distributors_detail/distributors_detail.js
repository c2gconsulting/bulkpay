/*****************************************************************************/
/* DistributorsDetail: Event Handlers */
/*****************************************************************************/
Template.DistributorsDetail.events({
    'click a[href="#sort"]': function(e, tmpl) {
        let key = e.currentTarget.dataset.key;
        if (Session.get('transactionSortBy') === key) Session.set('transactionSortDirection', 0 - Number(Session.get('transactionSortDirection'))); //reverse sort direction
        else Session.set('transactionSortBy', key);
    }
});

/*****************************************************************************/
/* DistributorsDetail: Helpers */
/*****************************************************************************/
Template.DistributorsDetail.helpers({
    avatar: function () {
        return UserImages.findOne({owner: this._id})
    },
    textStyle: function() {
        if (this.status === 'accepted') return 'text-info';
        if (this.status === 'active') return 'text-success';
        if (this.status === 'cancelled') return 'text-danger';
    },
    orders: function(){
        return Orders.find({customerId: this._id, status: {$ne: 'cancelled'}}, { 
            sort: {
                issuedAt: -1
                }
            });
    },
    customerAvailable: function(){
        return this._id ? true : false
    },
    transactions: function(){
        return Template.instance().transactions()
    },
    hasMoreTransactions: function () {
        return Template.instance().transactions().count() >= Template.instance().limit.get();
    },
    sortedBy: function (key) {
        let sortIcon = Session.get('transactionSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
        return Session.get('transactionSortBy') === key ? sortIcon : '';
    }
});



/*****************************************************************************/
/* DistributorsDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorsDetail.onCreated(function () {
    let customerId = Router.current().params._id;
     Session.set('transactionSortBy', 'postingDate');
     Session.set('transactionSortDirection', -1);
    let instance = this;

    // initialize the reactive variables
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());

    // 2. Autorun

    // will re-run when the "limit" reactive variables changes
    instance.autorun(function () {

        // get the limit
        let limit = instance.limit.get();
        // subscribe to the posts publication
        let subscription = instance.subscribe('CustomerTransactionsEx', customerId, limit);
        instance.subscribe('UserImages', Template.parentData()._id);
        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            instance.loaded.set(limit);
        } 
    });

    // 3. Cursor
    instance.transactions = function() {
        let sortBy = Session.get('transactionSortBy');
        let sortDirection = Number(Session.get('transactionSortDirection') || -1);

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();

        return CustomerTransactionsEx.find({},options);
    }
});

Template.DistributorsDetail.onRendered(function () {
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

Template.DistributorsDetail.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
});


function getLimit() {
    return 20;
}



