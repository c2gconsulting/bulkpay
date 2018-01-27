var Api = new Restivus({
  useDefaultAuth: false,
  version: 'v1',
  defaultHeaders: {
    'Content-Type': 'text/xml'
  }
});


if (Meteor.isServer) {
  var Auth = {};

  // maps to /api/v1/successfactors/newhire
  Api.addRoute('v1/successfactors/newhire/:token', {
      post: {
        action: function() {
          let decoded;
          try {
            decoded = JWT.verifyAuthorizationToken(this.request)
          } catch (e) {
            return { statusCode: 404, body: {status: 'failed', data: {message: e.message}} }
          }

          let businessId = decoded.businessId;

          const postBody = this.bodyParams;
          console.log(`postBody: `, postBody);

          const headers = this.request.headers;
          console.log(`headers: `, headers)
          
          const successResponse = 
          '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\
          <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">\
          <Header xmlns="http://schemas.xmlsoap.org/soap/envelope/"></Header>\
          <Body>\
          <ExternalEventResponse xmlns="com.successfactors.event.notification">\
            <responsePayload>\
              <entityId>EmpJob</entityId>\
              <status>0</status>\
              <statusDate>2018-01-26T00:00:0-05:00</statusDate>\
              <statusDetails>Success</statusDetails>\
            </responsePayload>\
          </ExternalEventResponse>\
          </Body>\
          </Envelope>'

          return successResponse
        }
      }
  });
}
