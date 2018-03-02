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


const getOdataResults = (odataResponse) => {
  if(odataResponse && odataResponse.d && odataResponse.d.results 
      && odataResponse.d.results.length > 0) {
      return odataResponse.d.results
  } else {
      return []
  }
}

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
        console.log(``)
      }
    }
  }

  return {personIdExternal, perPersonUuid}
}

let getSfEmployeeIds2 = (business, config, jsonPayLoad) => {
  console.log(`jsonPayLoad: `, JSON.stringify(jsonPayLoad))

  let externalEvent = jsonPayLoad['S:Envelope']['S:Body'][0]

  let personIds = []
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
    let ns7Event = ns7Events[`${nsPrefix}:event`]
    if(ns7Event) {
      ns7Event.forEach(event => {
        let ns7Params = event[`${nsPrefix}:params`] ? event[`${nsPrefix}:params`][0] : null
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
          console.log(``)
          personIds.push({personIdExternal, perPersonUuid})

          fetchEmployeeDetails(business, config, personIdExternal)
        }
      })
    }
  }
}

let fetchEmployeeDetails = (business, config, personIdExternal) => {
  const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
  const perPersonQueryUrl = `${baseUrl}/odata/v2/PerPersonal?$filter=personIdExternal eq '${personIdExternal}'&$select=personIdExternal,firstName,lastName&$format=json`
  const perEmailQueryUrl = `${baseUrl}/odata/v2/PerEmail?$filter=personIdExternal eq '${personIdExternal}'&$format=json`
  const perPhoneQueryUrl = `${baseUrl}/odata/v2/PerPhone?$filter=personIdExternal eq '${personIdExternal}'&$format=json`
  const empPayCompRecurringQueryUrl = `${baseUrl}/odata/v2/EmpPayCompRecurring?$filter=userId eq '${personIdExternal}'&$select=payComponent,userId,paycompvalue,calculatedAmount,currencyCode,frequency&$format=json`
  const empJobQueryUrl = `${baseUrl}/odata/v2/EmpJob?$filter=userId eq '${personIdExternal}'&$select=userId,position,jobTitle&$format=json`
  const empPayGroupQueryUrl = `${baseUrl}/odata/v2/EmpCompensation?$filter=userId eq '${personIdExternal}'&$format=json`
  // const positionQueryUrl = `${baseUrl}/odata/v2/Position?$filter=code eq '${personIdExternal}'&$select=code,userId,jobTitle,positionTitle&$format=json`


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
  const empJobRes = getToSync(empJobQueryUrl, {headers: requestHeaders})
  const empPayGroupRes = getToSync(empPayGroupQueryUrl, {headers: requestHeaders})

  let bulkPayUserParams = {}
  bulkPayUserParams.tenantId = business._groupId
  bulkPayUserParams.roles = {
    "__global_roles__" : [ 
        "ess/all"
    ]
  }
  let paymentsData = []
  let positionData = {}
  let empBpPaytypeAmounts = []
  let payGroupData = {}
  //----------

  if(perPersonRes) {
    try {
      let perPersonData = JSON.parse(perPersonRes.content)
      console.log(`perPersonData: `, JSON.stringify(perPersonData))

      if(perPersonData && perPersonData.d && perPersonData.d.results && perPersonData.d.results.length > 0) {
        let employeeData = perPersonData.d.results[0]
        let firstName = employeeData.firstName || ""
        let lastName = employeeData.lastName || ""
                
        bulkPayUserParams.firstname = firstName
        bulkPayUserParams.lastname =  lastName
      }
    } catch(e) {
      console.log('PerPerson Error! ', e.message)
    }
  }

  if(perEmailRes) {
    try {
      let perEmailData = JSON.parse(perEmailRes.content)
      console.log(`perEmailData: `, JSON.stringify(perEmailData))

      if(perEmailData && perEmailData.d && perEmailData.d.results && perEmailData.d.results.length > 0) {
        let employeeData = perEmailData.d.results[0]
        let emailAddress = employeeData.emailAddress

        bulkPayUserParams.email = emailAddress
      }
    } catch(e) {
      console.log('PerEmail Error! ', e.message)
    }
  }

  if(perPhoneRes) {
    try {
      let perPhoneData = JSON.parse(perPhoneRes.content)
      console.log(`perPhoneData: `, JSON.stringify(perPhoneData))

      if(perPhoneData && perPhoneData.d && perPhoneData.d.results && perPhoneData.d.results.length > 0) {
        let employeeData = perPhoneData.d.results[0]
        let phoneNumber = employeeData.phoneNumber

        bulkPayUserParams.phoneNumber = phoneNumber
      }
    } catch(e) {
      console.log('PerPhone Error! ', e.message)
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
      console.log('EmpPayCompRecurring Error! ', e.message)
    }
  }
  
  if(empJobRes) {
    try {
      let empJobData = JSON.parse(empJobRes.content)
      console.log(`empJobData: `, JSON.stringify(empJobData))

      if(empJobData && empJobData.d && empJobData.d.results && empJobData.d.results.length > 0) {
        let employeeData = empJobData.d.results[0]
        positionData.positionCode = employeeData.position
        positionData.positionName = employeeData.jobTitle
      }
    } catch(e) {
      console.log('EmpJob Error! ', e.message)
    }
  }

  if(empPayGroupRes) {
    try {
      let empPayGroupData = JSON.parse(empPayGroupRes.content)
      if(empPayGroupData && empPayGroupData.d && empPayGroupData.d.results && empPayGroupData.d.results.length > 0) {
        let employeeData = empPayGroupData.d.results[0]
        const payGroupCode = employeeData.payGroup
        payGroupData.code = payGroupCode

        if(payGroupCode) {
          const empPayGroupDetailQueryUrl = `${baseUrl}/odata/v2/FOPayGroup?$filter=externalCode eq '${payGroupCode}'&$format=json`
          const empPayGrouDetailspRes = getToSync(empPayGroupDetailQueryUrl, {headers: requestHeaders})
          if(empPayGrouDetailspRes) {
            let data = JSON.parse(empPayGrouDetailspRes.content)
            if(data && data.d && data.d.results && data.d.results.length > 0) {
              let employeeData = data.d.results[0]
              const payGroupDesc = employeeData.description;

              payGroupData.code = payGroupCode
              payGroupData.description = payGroupDesc
            }
          }
        } else {
          console.log(`Could not find pay group`)
        }
      }
    } catch(e) {
      console.log('EmpJob Error! ', e.message)
    }
  }


  console.log(`bulkPayUserParams: `, JSON.stringify(bulkPayUserParams))
  console.log(`positionData: `, JSON.stringify(positionData))
  console.log(`payGroupData: `, JSON.stringify(payGroupData))
  console.log(``)


  let existingUser = Meteor.users.findOne({
    'successFactors.personIdExternal': personIdExternal
  })

  let accountId;
  if(!existingUser) {
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
        // let defaultUsername = personIdExternal;
    
        accountId = Meteor.users.insert({
          profile: {
            firstname: bulkPayUserParams.firstname,
            lastname: bulkPayUserParams.lastname,
            fullName: `${bulkPayUserParams.firstname} ${bulkPayUserParams.lastname}`
          },
          employeeProfile: {
            employeeId: personIdExternal,
            employment: {
              status: 'Active',
              hireDate: new Date(),
              terminationDate: null
            },
            payment: {}
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
        
        Partitioner.setUserGroup(accountId, business._groupId);
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
  } else {
    accountId = existingUser._id

    Meteor.users.update({
      'successFactors.personIdExternal': personIdExternal
    }, {$set: {
      profile: {
        firstname: bulkPayUserParams.firstname,
        lastname: bulkPayUserParams.lastname,
        fullName: `${bulkPayUserParams.firstname} ${bulkPayUserParams.lastname}`
      }}
    })
  }


  let bpUser = Meteor.users.findOne(accountId)
  const bpUserId = bpUser._id
  bpUser.emails = [{
    address: bulkPayUserParams.email,
    verified: false
  }]
  bpUser.employeeProfile = {
    employeeId: personIdExternal,
    employment: {
      status: 'Active',
      hireDate: new Date()
    }
  }
  bpUser.employee = true
  bpUser.businessIds = [business._id]
  bpUser.successFactors = {
    personIdExternal: personIdExternal
  }
  delete bpUser._id

  try {
    paymentsData.forEach(payment => {
      if(payment.payComponent) {
        let frequency = payment.frequency
        if(frequency === 'MON' || frequency === 'Monthly') {
            frequency = "Monthly"
        } else if(frequency === 'ANN') {
            frequency = "Annually"
        }

        const payType = PayTypes.findOne({
          'successFactors.externalCode': payment.payComponent,
          businessId: business._id
        })
        if(payType) {
          empBpPaytypeAmounts.push({
            paytype: payType._id,
            value: payment.calculatedAmount // payment.paycompvalue
          })

          PayTypes.update({_id: payType._id}, {$set: {
            code: payment.payComponent,
            title: payment.payComponent,
            frequencyCode: frequency,
            currency: payment.currencyCode,
            editablePerEmployee: true,
          }})
        } else {
          const bpPayTypeId = PayTypes.insert({
            code: payment.payComponent,
            title: payment.payComponent,
            frequencyCode: frequency,
            currency: payment.currencyCode,
            businessId: business._id,
            addToTotal: true,
            editablePerEmployee: true,
            isTimeWritingDependent: true,
            includeWithSapIntegration: true,
            successFactors: {
              externalCode: payment.payComponent
            },
            type: 'Benefit',
            status: "Active",
            _groupId: business._groupId
          })
          if(bpPayTypeId) {
            empBpPaytypeAmounts.push({
              paytype: bpPayTypeId,
              value: payment.calculatedAmount
            })
          } else {
            console.log(`Error inserting SF paycomponent into bulkpay PayType: `, JSON.stringify(payment))
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
    console.log(`Error in fetching employee paycomponents data`)
    console.log(`Error: `, e.message)
  }

  if(positionData.positionCode) {
    let positionId;
    let payGradeId;

    let createPosition = (parentId) => {
      const foundPosition = EntityObjects.findOne({
        'successFactors.externalCode': positionData.positionCode,
        otype: 'Position',
        businessId: business._id
      })
      if(!foundPosition) {
        return EntityObjects.insert({
          parentId: parentId,
          name: positionData.positionName,
          otype: 'Position',
          properties: {},
          status: 'Active',
          createdBy: null,
          businessId: business._id,
          _groupId: business._groupId,
          successFactors: {
            externalCode: positionData.positionCode,
            costCenter: {
              code: null // I know positions have cost centers on SF. 
            }
          }
        })
      } else {
        EntityObjects.update({_id: foundPosition._id}, {$set: {
          parentId: parentId,
          name: positionData.positionName
        }})
        return foundPosition._id
      }
    }

    let positionParentId;
    const positionsUrl = `${baseUrl}/odata/v2/Position?$filter= code eq '${positionData.positionCode}'&$select=code,costCenter,department,positionTitle,jobTitle,parentPosition&$format=json`
          
    let getToSync = Meteor.wrapAsync(HTTP.get);  
    const positionsRes = getToSync(positionsUrl, {headers: requestHeaders})
    if(positionsRes) {
      try {
        let positionsData = JSON.parse(positionsRes.content)
        let positionResults = getOdataResults(positionsData)
        if(positionResults[0]) {
          let position = positionResults[0]

          if(position.department) {
            const departmentUrl = `${baseUrl}/odata/v2/FODepartment?$filter=externalCode eq '${position.department}'&$select=costCenter,name,description,externalCode,parent&$format=json`

            let getToSync = Meteor.wrapAsync(HTTP.get);  
            const departmentRes = getToSync(departmentUrl, {headers: requestHeaders})
            if(departmentRes) {
                let departmentData = JSON.parse(departmentRes.content)
                let departmentResults =  getOdataResults(departmentData)
                if(departmentResults.length > 0) {
                    const department = departmentResults[0]
                    position.departmentDetails = department

                    const foundDepartment = EntityObjects.findOne({
                        'successFactors.externalCode': department.externalCode,
                        otype: 'Unit',
                        businessId: business._id
                    })
                    let unitId = ''
                    if(!foundDepartment) {
                        unitId = EntityObjects.insert({
                            parentId: null,
                            name: department.name,
                            otype: 'Unit',
                            properties: {},
                            status: 'Active',
                            createdBy: null,
                            properties: null,
                            businessId: businessUnitId,
                            _groupId: business._groupId,
                            successFactors: {
                              externalCode: department.externalCode,
                              costCenter: {
                                  code: department.costCenter
                              }
                            }
                        })
                    } else {
                      EntityObjects.update({_id: foundDepartment._id}, {$set: {
                        name: department.name
                      }})
                      unitId = foundDepartment._id
                    }
                    positionId = createPosition(unitId)
                }
            } else {
              positionId = createPosition(null)
            }
          } else {
            positionId = createPosition(null)
          }
        }
      } catch(e) {
        console.log('Error in Getting employee position!', e.message)
      }
    }
    
    //--
    
    if(payGroupData.code) {
      let payGrade = PayGrades.findOne({
        'successFactors.externalCode': payGroupData.code,
        businessId: business._id
      })

      const paytypesWithNoVals = empBpPaytypeAmounts.map(paytype => {
        return {paytype: paytype.paytype, value: ""}
      })
      let desc = payGroupData.description;
      if(!payGroupData.description) {
        desc = payGroupData.code
      }

      if(payGrade) {
        payGradeId = payGrade._id

        PayGrades.update({_id: payGrade._id}, {$set: {
          code: payGroupData.code,
          description: desc,
          // positions: [positionId],
          // payTypes: paytypesWithNoVals
        }})
      } else {
        payGradeId = PayGrades.insert({
          code: payGroupData.code,
          description: desc,
          positions: [positionId],
          payGroups: [],
          payTypes: paytypesWithNoVals,
          status: 'Active',
          businessId: business._id,
          _groupId: business._groupId,
          successFactors: {
            externalCode: payGroupData.code
          }
        })
      }
    }
    bpUser.employeeProfile.employment.position = positionId
    bpUser.employeeProfile.employment.paygrade = payGradeId
  }
  bpUser.employeeProfile.phone = bulkPayUserParams.phoneNumber
  console.log(`bpUserId: `, bpUserId)

  Meteor.users.update({_id: bpUserId}, {$set: bpUser})
}

let setBPEmployeeStatus = (business, personIdExternal, status) => {
  let tenantId = business._groupId

  let bpUser = Meteor.users.findOne({'successFactors.personIdExternal': personIdExternal})
  if(bpUser) {
    if(bpUser.group === tenantId) {
      const bpUserId = bpUser._id

      bpUser.employeeProfile = bpUser.employeeProfile || {}
      bpUser.employeeProfile.employment = bpUser.employeeProfile.employment || {}
      bpUser.employeeProfile.employment.status = status
      delete bpUser._id

      if(status === 'Inactive') {
        bpUser.employeeProfile.employment.terminationDate = new Date()
      } else {
        bpUser.employeeProfile.employment.hireDate = new Date()
      }

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
        console.log(`10: 17pm GMT Current deployment`)
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
                  getSfEmployeeIds2(business, config, result)
                  // fetchEmployeeDetails(business, config, personIdExternal)
                })
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

  // maps to /api/v1/successfactors/test
  Api.addRoute('successfactors/test/:token', {authRequired: false}, {
    post: {
      action: function() {
        console.log(`Inside successfactors test event endpoint`)

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
            let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessId})
            if(config) {
              // fetchEmployeeDetails(business, config, '103239')
              // fetchEmployeeDetails(business, config, 'chris.tester')
              fetchEmployeeDetails(business, config, 'balogun.integrator')
              // fetchEmployeeDetails(business, config, 'black.panther')
              
              // fetchEmployeeDetails(business, config, 'Zek')
            }
          })
        }));        
        return successResponse()
      }
    }
  });
}
