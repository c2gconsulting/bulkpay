// import axios from 'axios';

var axios = require("axios");
var qs = require("qs");
// const mailgun = require("mailgun-js");

Core.sendMail = async (data) => {
  // const API_KEY = process.env.API_KEY
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
  const MAILGUN_HOST = process.env.MAILGUN_HOST;

  const mailgunInstance = {
    messages: () => {
      send: () => "success"
    }
  }

  // const mailgunInstance = mailgun({
  //   apiKey: MAILGUN_API_KEY, // config.mailgun.api_key,
  //   domain: MAILGUN_DOMAIN, // config.mailgun.domain,
  //   host: MAILGUN_HOST, // config.mailgun.host,
  // });

  //  const data = {
  //    from: "bulkpay@hub825.com",
  //    to: "adesanmiakoladedotun@gmail.com",
  //    subject: "Hello",
  //    text: "hub825.com: Testing some Mailgun awesomeness!",
  //  };

  try {
    // data: qs ? qs.stringify(body) : JSON.stringify(body)
    await mailgunInstance.messages().send(data, (error, body) => {
      logger.info(body);
      if (error) {
        logger.error("error sending email");
        logger.error(JSON.stringify(error));
      } else {
        logger.info("emails were sent successfully");
      }
    });
  } catch (error) {
    logger.error("error sending email");
    logger.error(error);
  }
};
