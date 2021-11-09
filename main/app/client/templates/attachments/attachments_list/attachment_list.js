/*****************************************************************************/
/* AttachmentList: Event Handlers */
/*****************************************************************************/
import axios from 'axios';

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

    'change input[type="file"]' ( event, template ) {
      const formData = new FormData()

      if (!event.target || !event.target.files[0]) {
        return;
      }
      template.isUploading.set(true)
      Session.set('isUploading', true)

      formData.append(event.target.files[0].name, event.target.files[0])

      // console.log('running axios post request...')
      axios.post('https://9ic0ul4760.execute-api.eu-west-1.amazonaws.com/dev/upload', formData)
      .then(res => {
        try {
          // console.log('running then block...', res.data)
          // console.log("Session.get('context')", Session.get('context'))
          // console.log("Session.get('context')", template)
          const businessUnitId = Session.get('context');
          const requisitionId = template.data.requisitionId
      
          const newAttachment = {
            ...res.data,
            travelId: requisitionId,
            name: event.target.files[0].name,
            owner: Meteor.userId(),
            businessId: businessUnitId,
            tenantId: Core.getTenantId()
          }

          // console.log('newAttachment', newAttachment)
  
          Meteor.call('attachment/create', newAttachment, (err, res) => {
            if (res){
              template.isUploading.set(false)
              Session.set('isUploading', false)
              toastr.success('File successfully uploaded', 'Success')
            } else {
              template.isUploading.set(false)
              Session.set('isUploading', false)
              toastr.error("Save Failed", "Couldn't Save new attachment", "error");
            }
          });
        } catch (error) {
          toastr.error("Save Failed", error.message || error, "error");
          // console.log('error', error)
        }
      })
      .catch(err => {
        template.isUploading.set(false)
        Session.set('isUploading', false)
      })
    },
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
          // console.log(err);
          toastr.error("Delete Failed", "Couldn't delete an attachment", "error");
        }
      });
    });
  },
});


Template.AttachmentsList.helpers({
    assets: function(){
        return Template.instance().media();
    },

    getAttachmentName: function (data) {
        return data.name || data.fileUrl || data.imageUrl
    },

    canDeleteAttachments: function () {
      return Template.instance().canDeleteAttachments.get()
    },
    canUpload: function () {
      console.log('Template.instance().cannotUpload.get()', Template.instance().cannotUpload.get())
      return Template.instance().cannotUpload.get() !== true
    },
    getAttachmentUrl: function (data) {
        return data.fileUrl || data.imageUrl
    },

    getUploadStatus: function (status) {
        status =  status || Session.get('isUploading')
        // console.log('Template.parentData().requisitionId;', Template.parentData())
        return status ? 'Uploading': 'Add files'
    },

    attachments: function () {
        const requisitionId = Template.parentData() && Template.parentData().requisitionId;
        const travelId = Template.instance().data && Template.instance().data.requisitionId
        const attachments = Attachments.find({ travelId: requisitionId || travelId })
        return attachments;
    },

    canManageAssets: function(){
       return Core.hasAdminAccess(Meteor.userId()) || this.owner === Meteor.userId()
    }
});

Template.AttachmentsList.onCreated(function() {
    let instance = this;

    instance.attachments = new ReactiveVar()
    instance.isUploading = new ReactiveVar()
    instance.canDeleteAttachments = new ReactiveVar()
    instance.isUploading.set(false)
    Session.set('isUploading', false)
    instance.autorun(function () {
      let subscription = instance.subscribe('ObjectsMedia', Session.get('objectType'), Session.get('objectId'));
      const businessUnitId = Session.get('context');
      // console.log('businessUnitId', businessUnitId)
      let attachmentSub = instance.subscribe("attachments", businessUnitId);

      if (attachmentSub.ready()) {
        const requisitionId = instance.data.requisitionId || Template.parentData().requisitionId
        if (instance.data.canDelete || Template.parentData().canDelete) {
          instance.canDeleteAttachments.set(instance.data.canDelete || Template.parentData().canDelete)
          instance.cannotUpload.set(instance.data.cannotUpload || Template.parentData().cannotUpload)
        }
        // console.log('requisitionId-requisitionId', requisitionId)
        // console.log('Template.parentData()', Template.parentData())
        let attachmentRecords = Attachments.find({ travelId: requisitionId });
        instance.attachments.set(attachmentRecords)
      }
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