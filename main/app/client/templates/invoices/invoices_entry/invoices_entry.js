/*****************************************************************************/
/* InvoicesEntry: Event Handlers */
/*****************************************************************************/
Template.InvoicesEntry.events({
    'click .invoice-entry': function(e, tmpl) {
        Router.go('invoices.detail', {_id: this._id});
    }
});

/*****************************************************************************/
/* InvoicesEntry: Helpers */
/*****************************************************************************/
Template.InvoicesEntry.helpers({
    textStyle: function() {
        if (this.status === 'paid') return 'text-success';
        if (this.status === 'unpaid') return 'text-warning';
    }
});

/*****************************************************************************/
/* InvoicesEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.InvoicesEntry.onCreated(function () {
});

Template.InvoicesEntry.onRendered(function () {
});

Template.InvoicesEntry.onDestroyed(function () {
});
