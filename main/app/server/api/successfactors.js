let parseString = require('xml2js').parseString;

var Api = new Restivus({
  useDefaultAuth: false,
  version: 'v1',
  defaultHeaders: {
    'Content-Type': 'text/xml'
  }
});

let failureResponse = message => {
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

let successResponse = () => {
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
        console.log(`Inside successfactors newhire event endpoint`)

        let decoded;
        try {
          decoded = JWT.verifyAuthorizationToken(this.urlParams)
        } catch (e) {
          return failureResponse(e.message)
        }
        let businessId = decoded.businessId;

        let body = [];
        this.request.on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          body = Buffer.concat(body).toString();

          parseString(body, function (err, result) {  
            let ns7Events = result['ns7:ExternalEvent']['ns7:events'] ? 
              result['ns7:ExternalEvent']['ns7:events'][0] : null

            if(ns7Events) {
              let ns7Event = ns7Events['ns7:event'] ? ns7Events['ns7:event'][0] : null
              if(ns7Event) {
                let ns7Params = ns7Event['ns7:params'] ? ns7Event['ns7:params'][0] : null
                if(ns7Params) {
                  let personIdExternal = "";
                  let perPersonUuid = "";

                  _.each(ns7Params["ns7:param"], param => {
                    if(param.name && param.name[0] === 'personIdExternal') {
                      personIdExternal = param.value[0]
                    } else if(param.name && param.name[0] === 'perPersonUuid') {
                      perPersonUuid = param.value[0]
                    }
                  })
                  console.log(`personIdExternal: `, personIdExternal)
                  console.log(`perPersonUuid: `, perPersonUuid)
                }                
              }  
            }
          });
        });
        
        const headers = this.request.headers;
        console.log(`headers: `, headers)

        return successResponse()
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
          return failureResponse(e.message)
        }
        let businessId = decoded.businessId;
        
        let body = [];
        this.request.on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          body = Buffer.concat(body).toString();

          parseString(body, function (err, result) {  
            let ns7Events = result['ns7:ExternalEvent']['ns7:events'] ? 
              result['ns7:ExternalEvent']['ns7:events'][0] : null

            if(ns7Events) {
              let ns7Event = ns7Events['ns7:event'] ? ns7Events['ns7:event'][0] : null
              if(ns7Event) {
                let ns7Params = ns7Event['ns7:params'] ? ns7Event['ns7:params'][0] : null
                if(ns7Params) {
                  let personIdExternal = "";
                  let perPersonUuid = "";

                  _.each(ns7Params["ns7:param"], param => {
                    if(param.name && param.name[0] === 'personIdExternal') {
                      personIdExternal = param.value[0]
                    } else if(param.name && param.name[0] === 'perPersonUuid') {
                      perPersonUuid = param.value[0]
                    }
                  })
                  console.log(`personIdExternal: `, personIdExternal)
                  console.log(`perPersonUuid: `, perPersonUuid)
                }                
              }  
            }
          });
        });
        
        return successResponse()
      }
    }
  });
}
