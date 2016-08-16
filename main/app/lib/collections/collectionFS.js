/*
*
 * core collectionsFS configurations
FS.HTTP.setBaseUrl("/assets");
FS.HTTP.setHeadersForGet([
  ["Cache-Control", "public, max-age=31536000"]
]);

/!**
 * Define CollectionFS collection
 * See: https://github.com/CollectionFS/Meteor-CollectionFS
 * chunkSize: 1024*1024*2; <- CFS default // 256k is default GridFS chunk size, but performs terribly
 *!/

Media = new FS.Collection("Media", {
  stores: [
    new FS.Store.GridFS("image", {
      chunkSize: 1 * 1024 * 1024
    }), new FS.Store.GridFS("large", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream, fileObj.name).resize("1000", "1000").stream()
            .pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("medium", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream, fileObj.name).resize("600", "600").stream().pipe(
            writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("small", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream).resize("235", "235" + "^").gravity("Center")
            .extent("235", "235").stream("PNG").pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("thumbnail", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream).resize("100", "100" + "^").gravity("Center")
            .extent("100", "100").stream("PNG").pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    })
  ],
  filter: {
    allow: {
      contentTypes: ["image/!*"]
    }
  }
});
*/

const ALLOWED_EXT = ['pdf', 'xls', 'docx', 'xlsx', 'png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG']
const ALLOWED_IMAGE_EXT = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG']

const s3bucket = process.env.AWS_S3_BUCKET || "bulkpaydocuments";
const s3AvatarSmallBucket = process.env.s3AvatarSmallBucket || "bulkpay-avatar-small";
const s3AvatarLargeBucket = process.env.s3AvatarLargeBucket || "bulkpay-avatar-large";

if (Meteor.isServer) {

  var avatarStoreLarge = new FS.Store.S3("avatarsLarge", {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: s3AvatarLargeBucket,
    transformWrite: function(fileObj, readStream, writeStream) {
      gm(readStream, fileObj.name()).resize('93', '88', '^').gravity('Center').crop('93', '88').stream().pipe(writeStream)
    }
  });

  var avatarStoreSmall = new FS.Store.S3("avatarsSmall", {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: s3AvatarSmallBucket,
    beforeWrite: function(fileObj) {
      fileObj.size(20, {store: "avatarStoreSmall", save: false});
    },
    transformWrite: function(fileObj, readStream, writeStream) {
      gm(readStream, fileObj.name()).resize('64', '64', '^').gravity('Center').crop('64', '64').stream().pipe(writeStream)
    }
  });


  let attachmentStore = new FS.Store.S3("files", {
    bucket: s3bucket,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    maxTries: 1
  });

  Media = new FS.Collection("Media", {
    stores: [attachmentStore],
    filter: {
      allow: {
        extensions: ALLOWED_EXT
      }
    }
  });

  UserImages = new FS.Collection("UserImages", {
    stores: [avatarStoreSmall, avatarStoreLarge],
    filter: {
      allow: {
        extensions: ALLOWED_IMAGE_EXT
      }
    }
  });


}

// On the client just create a generic FS Store as don't have
// access (or want access) to S3 settings on client
if (Meteor.isClient) {
  let attachmentStore = new FS.Store.S3("files");
  let avatarStoreSmall = new FS.Store.S3("avatarsSmall");
  let avatarStoreLarge = new FS.Store.S3("avatarsLarge");
  Media = new FS.Collection("Media", {
    stores: [attachmentStore],
    filter: {
      allow: {
        extensions: ALLOWED_EXT
      },
      onInvalid: function(message) {
        console.log(message);
      }
    }
  });

  UserImages = new FS.Collection("UserImages", {
    stores: [attachmentStore, avatarStoreLarge, avatarStoreSmall],
    filter: {
      allow: {
        extensions: ALLOWED_IMAGE_EXT
      },
      onInvalid: function(message) {
        console.log(message);
      }
    }
  });
}


Media.allow({
  insert: function(user){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  },
  download: function(){
    return true;
  }
});

UserImages.allow({
  insert: function(user){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  },
  download: function(){
    return true;
  }
});