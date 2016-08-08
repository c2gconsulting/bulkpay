/*****************************************************************************/
/* StockTransferDetail: Event Handlers */
/*****************************************************************************/
Template.StockTransferDetail.events({
    'submit form#order-note': function(e, tmpl) {
        e.preventDefault();
        let message = tmpl.find('input[name=txtNote]').value;
        if (message) {
            //add message
            Meteor.call('stocktransfers/addNote', this._id, message);
            tmpl.find('form#order-note').reset();
        }
    }
});

/*****************************************************************************/
/* StockTransferDetail: Helpers */
/*****************************************************************************/
Template.StockTransferDetail.helpers({
    documentAvailable: function(){
        return this._id ? true : false
    },
    currentUserAvatar: function(){
        return UserImages.findOne({owner: Meteor.userId()})
    },
    transferNotes: function() {
        return  _.sortBy(this.notes, function(note) { return -note.createdAt; })
    },
    avatar: function () {
        return UserImages.findOne({owner: this.userId})
    }
});

/*****************************************************************************/
/* StockTransferDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.StockTransferDetail.onCreated(function () {
    let self = this
    this.autorun(function () {
        self.subscribe('VariantsForTransfer', Template.parentData()._id);
        UserSubs.subscribe('OrderUsers', Template.parentData()._id);
        self.subscribe('StockTransferImages', Template.parentData()._id);
    });
});

Template.StockTransferDetail.onRendered(function () {
});

Template.StockTransferDetail.onDestroyed(function () {
});
