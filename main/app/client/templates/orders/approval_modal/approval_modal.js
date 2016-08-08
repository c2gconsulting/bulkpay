Template.approvalModal.events({
    'click #approve, click #reject': function(e) {
        e.preventDefault();

        let orderId = Session.get('objectId');
        let message = $('#message').val();
        let approvalStatus = event.target.dataset.approvalType;

        Meteor.call('orders/approveOrder', orderId, message, approvalStatus, function(err, result) {
            if (err) {

                swal({
                    title: "Oops!",
                    text: err.reason,
                    confirmButtonClass: "btn-error",
                    type: "error",
                    confirmButtonText: "OK" });
            } else {
                Modal.hide('approvalModal');
                swal({
                    title: "Success",
                    text: `Order ${result.orderNumber} has been ${approvalStatus}`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK" });

    }})
    }
});


Template.approvalModal.helpers({
    order: function() {
        var orderId = Session.get('objectId');

        if (typeof orderId !== "undefined") {
            return Orders.findOne(orderId);
        }
    }
});

Template.approvalModal.onCreated(function() {
});

Template.approvalModal.onDestroyed(function() {

})