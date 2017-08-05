/*****************************************************************************/
/* AdditionalPay: Event Handlers */
/*****************************************************************************/
Template.AdditionalPay.events({
    'click #newAddPay': function(e){
        e.preventDefault();
        Modal.show('AdditionalPayCreate');
    },
    'click #uploadAddPay': function(e){
        e.preventDefault();
        Modal.show('ImportModal');
    }
});

/*****************************************************************************/
/* AdditionalPay: Helpers */
/*****************************************************************************/
Template.AdditionalPay.helpers({
    'additonalPay': () => {
        return AdditionalPayments.find();
    },
    hasMoreAdditionalPayments: function () {
        let numAdditionalPayments = AdditionalPayments.find().count()
        return numAdditionalPayments >= Template.instance().limit.get();
    }
});

/*****************************************************************************/
/* AdditionalPay: Lifecycle Hooks */
/*****************************************************************************/
Template.AdditionalPay.onCreated(function () {
    let self = this;
    let limit = 20;
    
    self.loaded = new ReactiveVar(0);
    self.limit = new ReactiveVar(getLimit());

    self.isFetchingData = new ReactiveVar()
    self.isFetchingData.set(true)

    self.autorun(function () {
        let limit = self.limit.get();
        
        let subscription = self.subscribe('AdditionalPaymentDeduction', Session.get('context'), limit);
        if (subscription.ready()) {
            self.loaded.set(limit);
            self.isFetchingData.set(false)
        }
    });
});

Template.AdditionalPay.onRendered(function () {
    this.scrollHandler = function(e) {
        let threshold, target = $("#showMoreResults");
        if (!target.length) return;

        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if (target.offset().top < threshold) {
            if (!target.data("visible")) {
                target.data("visible", true);
                var limit = this.limit.get();
                limit += 24;
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

Template.AdditionalPay.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
});

function getLimit() {
    return 24;
}
