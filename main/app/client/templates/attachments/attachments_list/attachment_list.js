Template.AttachmentsList.events({
    'dropped #dropzone': FS.EventHandlers.insertFiles(Media, {
        metadata: function (fileObj) {
            return {
                owner: Meteor.userId(),
                objectType: Session.get('objectType'),
                objectId: Session.get('objectId'),
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

    'change #manualInput': FS.EventHandlers.insertFiles(Media, {
        metadata: function (fileObj) {
            return {
                owner: Meteor.userId(),
                objectType: Session.get('objectType'),
                objectId: Session.get('objectId'),
                tenantId: Core.getTenantId()
            };
        },
        after: function (error, fileObj) {
            if (error){
                if (error.reason){
                    toastr.error(error.reason, 'Error')
                } else {
                    toastr.warning("Invalid file format selected or file too large", "Warning")
                }
            } else {
                toastr.success('File successfully uploaded', 'Success')
            }
        }
    })
});


Template.AttachmentsList.helpers({
    assets: function(){
        return Template.instance().media();
    },

    canManageAssets: function(){
       return Core.hasAdminAccess(Meteor.userId()) || this.owner === Meteor.userId()
    }
});

Template.AttachmentsList.onCreated(function() {
    let instance = this;
    instance.autorun(function () {
        let subscription = instance.subscribe('ObjectsMedia', Session.get('objectType'), Session.get('objectId'));
    });
    instance.media = function() {
        let selector;
        selector = {
            "tenantId": Core.getTenantId(),
            "objectType": Session.get('objectType'),
            "objectId": Session.get('objectId')
        };
        return Media.find(selector);
    };
});

Template.AttachmentModal.onDestroyed(function() {

});