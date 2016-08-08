Template.ReturnApprovalModal.events({
    'click #approve, click #reject': function(e) {
        e.preventDefault();
        let returnId = Session.get("objectId");
        let approvalStatus = event.target.dataset.approvalType;
        let message = $('#message').val();
        if (returnId.length > 0 ) {
            Meteor.call('returnorders/approve', returnId, message, approvalStatus, function(err, result) {
                if (err) {
                    swal({
                        title: "Oops!",
                        text: err.reason,
                        confirmButtonClass: "btn-error",
                        type: "error",
                        confirmButtonText: "OK" });
                } else {
                    Modal.hide('ReturnApprovalModal');
                    swal({
                        title: "Success",
                        text: "All selected orders have been " + approvalStatus,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK" });
                }
            });
        } else {
            // load validation errors
        }
    },

    'dropped #Returndropzone': FS.EventHandlers.insertFiles(Media, {
        metadata: function (fileObj) {
            return {
                owner: Meteor.userId(),
                returnOrderId: Session.get('returnId'),
                tenantId: Core.getTenantId()
            };
        },
        after: function (error, fileObj) {
            if (error){
                if (error.reason){
                    toastr.error(error.reason, 'Error')
                } else {
                    toastr.warning(error, "Warning")
                }
            } else {
                toastr.success('File successfully uploaded', 'Success')
            }
        }
    }),

    'click .remove-file': function(event, template) {
        var fileObj = this;
        if (!fileObj) {
            toastr.warning('No file selected', 'Warning');
            return false;
        }
        fileObj.remove();
        toastr.success('File deleted successfully', 'Success');
        return false;
    },

    'change #returnManualInput': FS.EventHandlers.insertFiles(Media, {
        metadata: function (fileObj) {
            return {
                owner: Meteor.userId(),
                returnOrderId: Session.get('returnId'),
                tenantId: Core.getTenantId()
            };
        },
        after: function (error, fileObj) {
            if (error){
                if (error.reason){
                    toastr.error(error.reason, 'Error')
                } else {
                    toastr.warning(error, "Warning")
                }
            } else {
                toastr.success('File successfully uploaded', 'Success')
            }
        }
    })
});


Template.ReturnApprovalModal.helpers({
    order: function() {
        var returnOrderId = Session.get('objectId');

        if (typeof orderId !== "undefined") {
            return ReturnOrders.findOne(returnOrderId);
        }
    },
    assets: function(){
       return Template.instance().media();
    }
});

Template.ReturnApprovalModal.onCreated(function() {
    let instance = this;
    instance.autorun(function () {
        let subscription = instance.subscribe('ReturnOrderMedia', Session.get('returnId'));
    });
    instance.media = function() {
        let selector;
        selector = {
            "tenantId": Core.getTenantId(),
            "returnOrderId": Session.get('returnId')
        };
        return Media.find(selector);
    };
});