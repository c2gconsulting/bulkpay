let parseString = require('xml2js').parseString;

var Api = new Restivus({
  useDefaultAuth: false,
  version: 'v1',
  defaultHeaders: {
    'Content-Type': 'text/xml'
  }
});

let getFailureResponse = message => {
  let now = moment().format(`YYYY-MM-DDTHH:mm:ss`)

  const response = 
  `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">\
  <Header xmlns="http://schemas.xmlsoap.org/soap/envelope/"></Header>\
  <Body>\
  <ExternalEventResponse xmlns="com.successfactors.event.notification">\
    <responsePayload>\
      <entityId>EmpJob</entityId>\
      <status>1</status>\
      <statusDate>${now}</statusDate>\
      <statusDetails>${message}</statusDetails>\
    </responsePayload>\
  </ExternalEventResponse>\
  </Body>\
  </Envelope>`

  return response
}

let getSuccessResponse = () => {
  let now = moment().format(`YYYY-MM-DDTHH:mm:ss`)

  const response = 
  `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">\
  <Header xmlns="http://schemas.xmlsoap.org/soap/envelope/"></Header>\
  <Body>\
  <ExternalEventResponse xmlns="com.successfactors.event.notification">\
    <responsePayload>\
      <entityId>EmpJob</entityId>\
      <status>0</status>\
      <statusDate>${now}</statusDate>\
      <statusDetails>Success</statusDetails>\
    </responsePayload>\
  </ExternalEventResponse>\
  </Body>\
  </Envelope>`

  return response
}


if (Meteor.isServer) {
  var Auth = {};

  // maps to /api/v1/successfactors/newhire
  Api.addRoute('successfactors/newhire/:token', {authRequired: false}, {
    post: {
      action: function() {
        let decoded;

        try {
          decoded = JWT.verifyAuthorizationToken(this.urlParams)
        } catch (e) {
          return getFailureResponse(e.message)
        }
        console.log(`[successfactors newhire: `, decoded)

        let businessId = decoded.businessId;

        const postBody = this.bodyParams;
        console.log(`postBody: `, postBody);
        
        parseString(this.bodyParams, function (err, result) {
          console.log(`Got request body: `, result);


        });

        const headers = this.request.headers;
        console.log(`headers: `, headers)

        return getSuccessResponse()
      }
    }
  });

  // maps to /api/v1/successfactors/termination
  Api.addRoute('successfactors/termination/:token', {authRequired: false}, {
    post: {
      action: function() {
        console.log(`Inside successfactors termination event endpoint`)
        let decoded;
        try {
          decoded = JWT.verifyAuthorizationToken(this.urlParams)
        } catch (e) {
          return getFailureResponse(e.message)
        }
        console.log(`[successfactors termination: `, decoded)

        let businessId = decoded.businessId;

        const postBody = this.bodyParams;
        console.log(`postBody: `, postBody);
        
        parseString(this.bodyParams, function (err, result) {
          console.log(`Got request body: `, result);



        });


        const headers = this.request.headers;
        console.log(`headers: `, headers)
        
        return getSuccessResponse()
      }
    }
  });
}
