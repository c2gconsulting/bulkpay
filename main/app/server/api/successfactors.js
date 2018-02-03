import _ from 'underscore';
import { HTTP } from 'meteor/http'
let parseString = require('xml2js').parseString;


var Api = new Restivus({
  useDefaultAuth: false,
  version: 'v1',
  defaultHeaders: {
    'Content-Type': 'text/xml'
  }
});

let apiCall = function (apiUrl, callback, config) {
  const companyId = config.companyId
  const username = config.username
  const password = config.password

  let fullUsername = `${username}@${companyId}`
  const authenticationToken = new Buffer(`${fullUsername}:${password}`).toString('base64')

  let requestHeaders = {
    Authorization: `Basic ${authenticationToken}`
  }

  try {
    const response = HTTP.get(apiUrl).data
    callback(null, response)
  } catch (error) {
    let errorCode;
    let errorMessage;

    if (error.response) {
      errorCode = error.response.data.code
      errorMessage = error.response.data.message
    } else {
      errorCode = 500
      errorMessage = 'Cannot access the API'
    }
    // Create an Error object and return it via callback
    var myError = new Meteor.Error(errorCode, errorMessage)
    callback(myError, null)
  }
}

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

let fetchEmployeeDetails = (business, config, personIdExternal) => {
  const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
  const perPersonQueryUrl = `${baseUrl}/odata/v2/PerPersonal?$filter=personIdExternal eq '${personIdExternal}'&$select=personIdExternal,firstName,lastName&$format=json`
  const perEmailQueryUrl = `${baseUrl}/odata/v2/PerEmail?$filter=personIdExternal eq '${personIdExternal}'&$format=json`
  const perPhoneQueryUrl = `${baseUrl}/odata/v2/PerPhone?$filter=personIdExternal eq '${personIdExternal}'&$format=json`

  const companyId = config.companyId
  const username = config.username
  const password = config.password

  let fullUsername = `${username}@${companyId}`
  const authenticationToken = new Buffer(`${fullUsername}:${password}`).toString('base64')

  let requestHeaders = {
    Authorization: `Basic ${authenticationToken}`
  }

  let getToSync = Meteor.wrapAsync(HTTP.get);
  
  const perPersonRes = getToSync(perPersonQueryUrl, {headers: requestHeaders})
  const perEmailRes = getToSync(perEmailQueryUrl, {headers: requestHeaders})
  const perPhoneRes = getToSync(perPhoneQueryUrl, {headers: requestHeaders})

  let bulkPayUserParams = {}
  bulkPayUserParams.tenantId = business._groupId
  bulkPayUserParams.roles = {
    "__global_roles__" : [ 
        "ess/all"
    ]
  }

  if(perPersonRes) {
    try {
      let perPersonData = JSON.parse(perPersonRes.content)

      if(perPersonData && perPersonData.d && perPersonData.d.results && perPersonData.d.results.length > 0) {
        let employeeData = perPersonData.d.results[0]
        let firstName = employeeData.firstName || ""
        let lastName = employeeData.lastName || ""
                
        bulkPayUserParams.firstname = firstName
        bulkPayUserParams.lastname =  lastName
      }
    } catch(e) {
      console.log('Error! ', e.message)
    }
  }

  if(perEmailRes) {
    try {
      let perPersonData = JSON.parse(perEmailRes.content)

      if(perPersonData && perPersonData.d && perPersonData.d.results && perPersonData.d.results.length > 0) {
        let employeeData = perPersonData.d.results[0]
        let emailAddress = employeeData.emailAddress

        bulkPayUserParams.email = emailAddress
      }
    } catch(e) {
      console.log('Error! ', e.message)
    }
  }

  if(perPhoneRes) {
    try {
      let perPersonData = JSON.parse(perPhoneRes.content)

      if(perPersonData && perPersonData.d && perPersonData.d.results && perPersonData.d.results.length > 0) {
        let employeeData = perPersonData.d.results[0]
        let phoneNumber = employeeData.phoneNumber

        bulkPayUserParams.phoneNumber = phoneNumber
      }
    } catch(e) {
      console.log('Error! ', e.message)
    }
  }

  let accountId = Accounts.createUser(bulkPayUserParams)
  
  if(bulkPayUserParams.email) {
    try {
      Accounts.sendEnrollmentEmail(accountId, bulkPayUserParams.email)
    } catch (e) {
      console.log("Unable to send a notification mail to new successfactors employee")
    }
  }

  let user = Meteor.users.findOne(accountId)
  Meteor.users.update({_id: user._id}, {$set: {
    successfactors: {
      personIdExternal: personIdExternal
    }
  }})
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
        this.request
        .on('data', chunk => {
          body.push(chunk)
        })
        .on('end', Meteor.bindEnvironment(function (error, result) {
          body = Buffer.concat(body).toString();

          Partitioner.directOperation(function() {
            let business = BusinessUnits.findOne({_id: businessId})
            if(business) {
              Partitioner.bindGroup(business._groupId, function() {
                SuccessFactorsEvents.insert({
                  businessId: businessId,
                  eventBody: body
                })
              })

              let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessId})
              if(config) {
                fetchEmployeeDetails(business, config, '100052')
              }
            }
          })
        }))
        return successResponse()
      }
    }
  });


  // maps to /api/v1/successfactors/rehire
  Api.addRoute('successfactors/rehire/:token', {authRequired: false}, {
    post: {
      action: function() {
        console.log(`Inside successfactors rehire event endpoint`)

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

                  Meteor.defer(() => {
                    fetchEmployeeDetails(businessId, personIdExternal)
                  })
                }                
              }  
            }
          });
        });
        
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

                  fetchEmployeeDetails(businessId, personIdExternal)
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
