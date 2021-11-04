import axios from 'axios';

Core.sendMail = () => {
  // const API_KEY = process.env.API_KEY
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
  const MAILGUN_HOST = process.env.MAILGUN_HOST

  var options = {
    url: `https://${MAILGUN_HOST}/v3/${MAILGUN_DOMAIN}/messages`,
    method: 'POST',
    auth: {
        'user': 'api',
        'pass': MAILGUN_API_KEY
    },
    data: {}
  };

  axios(options)
    .then(function (response) {
        // handle success
        console.log('EMAIL SENT SUCCESSFULY', response);
    })
    .catch(function (error) {
        // handle error
        console.log('EMAIL FAiLED', error);
    })
    .then(function () {
        // always executed
    });
}
