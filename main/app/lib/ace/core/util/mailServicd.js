// import axios from 'axios';

var axios = require('axios');
var qs = require('qs');

Core.sendMail = (body) => {
  // const API_KEY = process.env.API_KEY
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
  const MAILGUN_HOST = process.env.MAILGUN_HOST

  var config = {
    url: `https://${MAILGUN_HOST}/v3/${MAILGUN_DOMAIN}/messages`,
    method: 'POST',
    auth: {
        'user': 'api',
        'pass': MAILGUN_API_KEY
    },
    headers: {
        // 'Authorization': 'Basic YXBpOjhmMGY3NjUwZGRhNWNkN2ZmNjdhZDFkNjEwMjlhOTJjLTJhZjE4M2JhLTU1NmJjNzk2', 
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: qs ? qs.stringify(body) : JSON.stringify(body)
    // data: body
  };

  axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
        // handle success
        console.log('EMAIL SENT SUCCESSFULY');
    })
    .catch(function (error) {
        // handle error
        console.log('EMAIL FAiLED');
        console.log(error);
    })
    .then(function () {
        // always executed
    });
}
