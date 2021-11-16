module.exports = {
    servers: {
      one: {
        host: 'ec2-54-145-211-52.compute-1.amazonaws.com', //'ec2-35-174-225-15.compute-1.amazonaws.com'
        username: 'ubuntu',
        pem: '~/Desktop/Personal_files/C2G_secret/secrets/c2g_2_secure_key.pem'
        // password:
        // or leave blank for authenticate from ssh-agent
        // 35.174.225.15 // sandbox ip address
      //  54.145.211.52 // production ip address
      //run this then deploy: ssh -i c2g_2_secure_key.pem ubuntu@54.145.211.52
      }
    },

    meteor: {
      name: 'bulkpay',
      path: '~/bp-core/main/app', // Documents/professional/development/c2g/app/
      servers: {
        one: {},
      },
      buildOptions: {
        serverOnly: true,
      },
      env: {
          KADIRA_ID: "458v9eu3iXifGLhNg",
          KADIRA_SECRET: "924d7f10-04fc-4f50-8baa-651b740c0d0a",
          // MONGO_URL: "mongodb://c2gbulkpayadmin:*HU*&^G&Y&^F^@ds143754.mlab.com:43754/bulkpay",
          // http://ec2-54-145-211-52.compute-1.amazonaws.com//
          ROOT_URL: "http://ec2-54-145-211-52.compute-1.amazonaws.com", //"http://ec2-35-174-225-15.compute-1.amazonaws.com"
  
          // MONGO_URL: 'mongodb+srv://admin:FPlUgIvVegwSDfbS@cluster0.d1a3e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
          // cluster env vars
           //CLUSTER_DISCOVERY_URL: "mongodb://172.17.0.1/service-discovery",
           //CLUSTER_SERVICE: "main",
           //CLUSTER_PUBLIC_SERVICES: "main, search, notification",
  
          // aws env vars
          //  AWS_ACCESS_KEY_ID: "AKIAIVV6GSU6SKC7HU2Q",
          //  AWS_SECRET_ACCESS_KEY: "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",
          AWS_SECRET_ACCESS_KEY: "rcTfrk3hdodamDQJgoSUBhpS0l9HHKdMCeEkEYnF",
  
          // service env vars
           RABBIT_URL: "amqp://127.0.0.1",
  
          // base auth env vars
           //BASE_ADMIN_PASS: "",
  
          // redis env vars
           REDIS_HOST: "127.0.0.1",
           REDIS_PORT: "6379",
  
          //other service env vars
           MAIL_URL: "smtp://bulkpay@c2gconsulting.com:Awnkg0akm@smtp.gmail.com:587/",
           //AWS_S3_BUCKET: "",
           MAIL_SITE_NAME: "OILSERV TRIPS",
           MAIL_FROM: "bulkpay@c2gconsulting.com",
  
           JWT_SECRET: "HK5JPj8si72BEMAAupe9jKt7ps2QHi9RBWeooysHYBNSe35iD"
      },

      // change to 'kadirahq/meteord' if your app is not using Meteor 1.4
      dockerImage: 'abernix/meteord:base',
      deployCheckWaitTime: 60,

      // Show progress bar while uploading bundle to server
      // You might need to disable it on CI servers
      enableUploadProgressBar: false
    },
    mongo: {
      oplog: true,
      port: 27017,
      version: '3.4.1',
      servers: {
        one: {},
      },
    },
  };
  