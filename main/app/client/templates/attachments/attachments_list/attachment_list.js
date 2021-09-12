Template.AttachmentsList.events({
    // 'dropped #dropzone': function(event, temp) {
    //     FS.Utility.eachFile(event, function(file) {
    //         Media.insert(file, function (err, fileObj) {
    //         //If !err, we have inserted new doc with ID fileObj._id, and
    //         //kicked off the data upload using HTTP
            
    //         console.log("Image url: /cfs/files/images/" + fileObj._id);
    //         console.log("Image url: /cfs/files/images/ 2:", fileObj);
    //         console.log("Image url: /cfs/files/images/ 3:" + JSON.stringify(fileObj));
    //       });
    //     });
    //   },
    // 'dropped #dropzone': FS.EventHandlers.insertFiles(Media, {
    //     metadata: function (fileObj) {
    //         return {
    //             owner: Meteor.userId(),
    //             objectType: Session.get('objectType'),
    //             objectId: Session.get('objectId'),
    //             tenantId: Core.getTenantId()
    //         };
    //     },
    //     after: function (error, fileObj) {
    //         if (error){
    //             if (error.reason){
    //                 toastr.error(error.reason, 'Error')
    //             } else {
    //                 toastr.warning(error, "Warning")
    //             }
    //         } else {
    //             toastr.success('File successfully uploaded', 'Success')
    //         }
    //     }
    // }),
    // 'dropped #dropzone': function (fileObj) {
    //   axios.post('https://9ic0ul4760.execute-api.eu-west-1.amazonaws.com/dev/upload', formData)
    //   .then(res => {
    //     console.log(data)
    //     toastr.success('File successfully uploaded', 'Success')
    //   })
    //   .catch(err => {
    //       toastr.warning(error, "Warning")
    //       console.log('then errponse', err)
    //   })
    // },

    'click .remove-file': function(event, template) {
        var fileObj = this;
        if (!fileObj) {
            toastr.warning('No file selected', 'Warning');
            return false;
        }

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Attachment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, () => {
            Meteor.call('attachment/delete', fileObj._id, (err, res) => {
                if (res){
                    toastr.success('File deleted successfully', 'Success')
                } else {
                    console.log(err);
                    toastr.error("Delete Failed", "Couldn't delete an attachment", "error");
                }
            });
        });
    },

    // 'change #manualInput': FS.EventHandlers.insertFiles(Media, {
    //     metadata: function (fileObj) {
    //         return {
    //             owner: Meteor.userId(),
    //             objectType: Session.get('objectType'),
    //             objectId: Session.get('objectId'),
    //             tenantId: Core.getTenantId()
    //         };
    //     },
    //     after: function (error, fileObj) {
    //         if (error){
    //             if (error.reason){
    //                 toastr.error(error.reason, 'Error')
    //             } else {
    //                 toastr.warning("Invalid file format selected or file too large", "Warning")
    //             }
    //         } else {
    //             toastr.success('File successfully uploaded', 'Success')
    //         }
    //     }
    // })
});


Template.AttachmentsList.helpers({
    assets: function(){
        return Template.instance().media();
    },

    getAttachmentName: function (data) {
        return data.name || data.fileUrl || data.imageUrl
    },

    getAttachmentUrl: function (data) {
        return data.fileUrl || data.imageUrl
    },

    getUploadStatus: function (status) {
        status =  status || Session.get('isUploading')
        console.log('Template.parentData().requisitionId;', Template.parentData())
        return status ? 'Uploading': 'Add files'
    },

    attachments: function () {
        // Meteor.Attachment.find({ })
        const requisitionId = Template.parentData() && Template.parentData().requisitionId;
        const travelId = Template.instance().data && Template.instance().data.requisitionId
        console.log('attachment list - requisitionId', travelId)
        const attachments = Attachments.find({ travelId: requisitionId || travelId })
        console.log('attachments', attachments)
        return attachments;
    },

    canManageAssets: function(){
       return Core.hasAdminAccess(Meteor.userId()) || this.owner === Meteor.userId()
    }
});

Template.AttachmentsList.onCreated(function() {
    let instance = this;

    self.attachments = new ReactiveVar()
    instance.autorun(function () {
        let subscription = instance.subscribe('ObjectsMedia', Session.get('objectType'), Session.get('objectId'));
    });

    self.attachments = function () {
        const requisitionId = Template.parentData() && Template.parentData().requisitionId;
        const travelId = Template.instance().data && Template.instance().data.requisitionId
        console.log('travelId', travelId)
        const data = Attachments.find({ travelId: requisitionId || travelId });
        console.log('traveldata', data)
        return data;
    }
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