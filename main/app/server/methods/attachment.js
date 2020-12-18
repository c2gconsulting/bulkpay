
import { HTTP } from 'meteor/http'

/**
 *  Attachment Upload Method
 */
Meteor.methods({
  'attachment/create': function (attachment) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();

    try {
      check(attachment, Core.Schemas.Attachment);
    } catch (e) {
      console.log(e);
    }

    this.unblock();
    const attachmentId = Attachments.insert(attachment);
    return { _id: attachmentId }
  },
  "attachment/delete": function(id){
    if(!this.userId){
        throw new Meteor.Error(401, "Unauthorized");
    }
    // check if user has permission to delete
    Attachments.remove({_id: id});
    return true;
  },
});
