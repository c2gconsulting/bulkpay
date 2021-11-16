moment = require("moment");

/*****************************************************************************/
/* TransactionEntry: Event Handlers */
/*****************************************************************************/
Template.LogEntry.events({
    'click .log-entry': function (e, tmpl) {
        //Router.go('orders.detail', {_id: this._id});
        //router should go to the invoice view
    }
});

/*****************************************************************************/
/* TransactionEntry: Helpers */
/*****************************************************************************/
Template.LogEntry.helpers({
    orderType: function () {
        // let orderT = OrderTypes.findOne({code: this.orderType});
        // return orderT.name ? orderT.name :  ""
    },

    amountPaid: function () {
        return 0
    },

    billStatusStyle: function (status) {

        if (status === 'OPEN') return 'text-warning';
        if (status === 'PARTIALLY_PAID') return 'text-info';
        if (status === 'FULLY_PAID') return 'text-success';
        if (status === 'OVERDUE' || status === 'DISPUTED') return 'text-danger';
    },

    deadline: function (dueDate, status) {

        if (status === 'OVERDUE' || status === 'OPEN') {

            deadline = moment(dueDate).diff(moment(), 'days');
            abs_deadline = Math.abs(deadline);
            daysLeft = (deadline < 0) ? 'days overdue' : ((deadline == 1) ? 'day left' : 'days left');
            return `${abs_deadline} ${daysLeft}`;
        }

    },


    view: function(){
        return this.url ? 'glyphicon glyphicon-eye-open' : 'glyphicon glyphicon-minus';
    }


});

/* TransactionEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.LogEntry.onCreated(function () {
});

Template.LogEntry.onRendered(function () {
});

Template.LogEntry.onDestroyed(function () {
});