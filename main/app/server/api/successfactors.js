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

let getSfEmployeeIds = (jsonPayLoad) => {
  console.log(`jsonPayLoad: `, JSON.stringify(jsonPayLoad))

  let externalEvent = jsonPayLoad['S:Envelope']['S:Body'][0]

  let personIdExternal = "";
  let perPersonUuid = "";
  let nsPrefix = ''
  for(let i = 1; i < 10; i++) {//We need this because we are not sure what prefix successfactors will use
    if(externalEvent[`ns${i}:ExternalEvent`] && externalEvent[`ns${i}:ExternalEvent`].length > 0) {
      nsPrefix = `ns${i}`
      break;
    }
  }

  let ns7Events = externalEvent[`${nsPrefix}:ExternalEvent`][0][`${nsPrefix}:events`] ? 
    externalEvent[`${nsPrefix}:ExternalEvent`][0][`${nsPrefix}:events`][0] : null

  if(ns7Events) {
    let ns7Event = ns7Events[`${nsPrefix}:event`] ? ns7Events[`${nsPrefix}:event`][0] : null
    if(ns7Event) {
      let ns7Params = ns7Event[`${nsPrefix}:params`] ? ns7Event[`${nsPrefix}:params`][0] : null
      if(ns7Params) {                                                                                                                                                                                                                                                              
        _.each(ns7Params[`${nsPrefix}:param`], param => {
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

  return {personIdExternal, perPersonUuid}
}

let fetchEmployeeDetails = (business, config, personIdExternal) => {
  const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
  const perPersonQueryUrl = `${baseUrl}/odata/v2/PerPersonal?$filter=personIdExternal eq '${personIdExternal}'&$select=personIdExternal,firstName,lastName&$format=json`
  const perEmailQueryUrl = `${baseUrl}/odata/v2/PerEmail?$filter=personIdExternal eq '${personIdExternal}'&$format=json`
  const perPhoneQueryUrl = `${baseUrl}/odata/v2/PerPhone?$filter=personIdExternal eq '${personIdExternal}'&$format=json`
  const empPayCompRecurringQueryUrl = `${baseUrl}/odata/v2/EmpPayCompRecurring?$filter=userId eq '${personIdExternal}'&$select=payComponent,userId,paycompvalue,currencyCode,frequency&$format=json`


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
  const empPayCompRecurringRes = getToSync(empPayCompRecurringQueryUrl, {headers: requestHeaders})

  let bulkPayUserParams = {}
  bulkPayUserParams.tenantId = business._groupId
  bulkPayUserParams.roles = {
    "__global_roles__" : [ 
        "ess/all"
    ]
  }
  let paymentsData = []

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
      let perEmailData = JSON.parse(perEmailRes.content)

      if(perEmailData && perEmailData.d && perEmailData.d.results && perEmailData.d.results.length > 0) {
        let employeeData = perEmailData.d.results[0]
        let emailAddress = employeeData.emailAddress
        console.log(`emailAddress: `, JSON.stringify(emailAddress))

        bulkPayUserParams.email = emailAddress
      }
    } catch(e) {
      console.log('Error! ', e.message)
    }
  }

  if(perPhoneRes) {
    try {
      let perPhoneData = JSON.parse(perPhoneRes.content)

      if(perPhoneData && perPhoneData.d && perPhoneData.d.results && perPhoneData.d.results.length > 0) {
        let employeeData = perPhoneData.d.results[0]
        let phoneNumber = employeeData.phoneNumber

        bulkPayUserParams.phoneNumber = phoneNumber
      }
    } catch(e) {
      console.log('Error! ', e.message)
    }
  }

  if(empPayCompRecurringRes) {
    try {
      let empPayCompRecurringData = JSON.parse(empPayCompRecurringRes.content)

      if(empPayCompRecurringData && empPayCompRecurringData.d 
          && empPayCompRecurringData.d.results && empPayCompRecurringData.d.results.length > 0) {        
        paymentsData = empPayCompRecurringData.d.results
      }
    } catch(e) {
      console.log('Error! ', e.message)
    }
  }
  console.log(`bulkPayUserParams: `, JSON.stringify(bulkPayUserParams))
  console.log(``)

  let accountId;
  try {
    accountId = Accounts.createUser(bulkPayUserParams)
  } catch(e) {
    try {
      let userFirstName = bulkPayUserParams.firstname || ""
      let userLastName = bulkPayUserParams.lastname || ""
      //--
      userFirstName = userFirstName.trim()
      userLastName = userLastName.trim()
      //--
      let defaultUsername = userFirstName + "." + userLastName
      defaultUsername = defaultUsername.toLowerCase()
  
      accountId = Meteor.users.insert({
        profile: {
          firstname: bulkPayUserParams.firstname,
          lastname: bulkPayUserParams.lastname,
          fullName: `${bulkPayUserParams.firstname} ${bulkPayUserParams.lastname}`
        },
        employeeProfile: {
          employment: {
            status: 'Active'
          }
        },
        employee: true,
        businessIds: [business._id],
        group: business._groupId,
        roles: {
          "__global_roles__" : [ 
              "ess/all"
          ]
        }
      })
      Meteor.users.update({_id: accountId}, {$set: {customUsername: defaultUsername}}) 
      Accounts.setPassword({_id: accountId}, "123456")
    } catch(err1) {
      console.log(`Error in alternative user creation! `, err1.message)
    }
  }
  
  if(bulkPayUserParams.email) {
    try {
      Accounts.sendEnrollmentEmail(accountId, bulkPayUserParams.email)
    } catch (e) {
      console.log("Unable to send a notification mail to new successfactors employee")
    }
  }

  let bpUser = Meteor.users.findOne(accountId)
  const bpUserId = bpUser._id
  bpUser.employeeProfile = {
    employment: {
      status: 'Active'
    }
  }
  bpUser.employee = true
  bpUser.businessIds = [business._id]

  bpUser.successfactors = {
    personIdExternal: personIdExternal
  }
  delete bpUser._id

  try {
    let empBpPaytypeAmounts = []
    console.log(`paymentsData length: `, paymentsData.length)

    paymentsData.forEach(payment => {
      if(payment.payComponent) {
        const payType = PayTypes.findOne({code: payment.payComponent})
        if(payType) {
          empBpPaytypeAmounts.push({
            paytype: payType._id,
            value: payment.paycompvalue
          })
        } else {
          let frequency = payment.frequency
          if(frequency === 'MON' || frequency === 'Monthly') {
              frequency = "Monthly"
          } else if(frequency === 'ANN') {
              frequency = "Annually"
          }
          //--
          const bpPayTypeId = PayTypes.insert({
            code: payment.payComponent,
            title: payment.payComponent,
            frequencyCode: frequency,
            currency: payment.currencyCode,
            businessId: business._id,
            addToTotal: true,
            editablePerEmployee: true,
            isTimeWritingDependent: false,
            includeWithSapIntegration: false,
            successFactors: {
              externalCode: payment.payComponent
            },
            type: 'Benefit',
            status: "Active"
          })
          // let bpPayTypeId = persistNewPaytypeFromSF(payment.payComponent, business._id)

          if(bpPayTypeId) {
            empBpPaytypeAmounts.push({
              paytype: bpPayTypeId,
              value: payment.paycompvalue
            })
          } else {
            console.log(`Error in insert SF paycomponent into bulkpay PayType: `, JSON.stringify(payment))
          }
        }
      }
    })
    console.log(`empBpPaytypeAmounts: `, JSON.stringify(empBpPaytypeAmounts, null, 4))
    //--
    if(empBpPaytypeAmounts.length > 0) {
      bpUser.employeeProfile.employment.paytypes = empBpPaytypeAmounts
    } else {
      console.log(`No payments to add for employee`)
    }
  } catch(e) {
    console.log(`Error: `, e.message)
    console.log(`Error in fetching employee paycomponents data`)
  }
  console.log(`bpUser with paytypes: `, JSON.stringify(bpUser))

  Meteor.users.update({_id: bpUserId}, {$set: bpUser})
}

let setBPEmployeeStatus = (business, personIdExternal, status) => {
  let tenantId = business._groupId

  let bpUser = Meteor.users.findOne({'successfactors.personIdExternal': personIdExternal})
  if(bpUser) {
    if(bpUser.group === tenantId) {
      const bpUserId = bpUser._id

      bpUser.employeeProfile = bpUser.employeeProfile || {}
      bpUser.employeeProfile.employment = bpUser.employeeProfile.employment || {}
      bpUser.employeeProfile.employment.status = status
      delete bpUser._id

      Meteor.users.update({_id: bpUserId}, {$set: bpUser})
    }
  }
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
                parseString(body, function (err, result) {
                  const {personIdExternal, perPersonUuid} = getSfEmployeeIds(result)
                  fetchEmployeeDetails(business, config, personIdExternal)
                })
              }
            }
          })
        }))
        // return successResponse()
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
        }).on('end', Meteor.bindEnvironment(function (error, result) {
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
                parseString(body, function (err, result) {
                  const {personIdExternal, perPersonUuid} = getSfEmployeeIds(result)
                  setBPEmployeeStatus(business, personIdExternal, 'Active')
                })
              }
            }
          })
        }));        
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
        }).on('end', Meteor.bindEnvironment(function (error, result) {
          body = Buffer.concat(body).toString();

          Partitioner.directOperation(function() {
            let business = BusinessUnits.findOne({_id: businessId})
            if(business) {
              Partitioner.bindGroup(business._groupId, function() {
                SuccessFactorsEvents.insert({
                  businessId: businessId,
                  eventBody: body,
                  _groupId: business._groupId
                })
              })

              let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessId})
              if(config) {
                parseString(body, function (err, result) {
                  const {personIdExternal, perPersonUuid} = getSfEmployeeIds(result)
                  setBPEmployeeStatus(business, personIdExternal, 'Inactive')
                })
              }
            }
          })
        }));
        return successResponse()
      }
    }
  });
}
