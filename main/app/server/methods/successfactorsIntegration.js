
const SFIntegrationHelper = {
    getAuthHeader: (sfConfig) => {
        const companyId = sfConfig.companyId
        const username = sfConfig.username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        const password = sfConfig.password
      
        let fullUsername = `${username}@${companyId}`
        const authenticationToken = new Buffer(`${fullUsername}:${password}`).toString('base64')
      
        return {
          Authorization: `Basic ${authenticationToken}`
        }
    },
    getOdataResults: (odataResponse) => {
        if(odataResponse && odataResponse.d && odataResponse.d.results 
            && odataResponse.d.results.length > 0) {
            return odataResponse.d.results
        } else {
            return []
        }
    },
    getJsDateFromOdataDate(date) {
        if(date) {
          date = date + ""
          const numChars = date.length;
          const timestamp = date.substring(6, numChars - 2)// /Date(xxxxxxx)/
          console.log(`timestamp: `, timestamp)
          const timestampAsNum = Number(timestamp)

          return new Date(timestampAsNum)
        }
    }
}


/**
 *  SuccessFactors Integration Methods
 */
Meteor.methods({
  'successfactorsIntegration/testConnection': function (businessId, successFactorsConfig) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock()
        //--
        if(!successFactorsConfig) {
            return '{"status": false, "message": "Successfactors Config empty"}'
        }

        let connectionUrl = `${successFactorsConfig.protocol}://${successFactorsConfig.odataDataCenterUrl}/odata/v2/$metadata`
        const requestHeaders = SFIntegrationHelper.getAuthHeader(successFactorsConfig)

        let errorResponse = null
        try {
            let connectionTestResponse = HTTP.call('GET', connectionUrl, {headers: requestHeaders});
            // console.log(`connectionTestResponse: `, connectionTestResponse)

            if(connectionTestResponse && connectionTestResponse.statusCode === 200) {
                let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessId});
                if(config) {
                    SuccessFactorsIntegrationConfigs.update(config._id, {$set : successFactorsConfig});
                } else {
                    successFactorsConfig.businessId = businessId
                    SuccessFactorsIntegrationConfigs.insert(successFactorsConfig)
                }
                return '{"status": true, "message": "All good here!"}'
            } else {
                errorResponse = '{"status": false, "message": "An error occurred in testing connection. Please be sure of the details."}'
            }
        } catch(e) {
            console.log(`Error: `, e)
            errorResponse = `{"status": false, "message": "${e.message}"}`
        }
        return errorResponse;
    },
    'successfactors/fetchPaytypes': function (businessUnitId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const foPayComponentQueryUrl = `${baseUrl}/odata/v2/FOPayComponent?$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);  
            const payCompRes = getToSync(foPayComponentQueryUrl, {headers: requestHeaders})

            if(payCompRes) {
                try {
                    let payCompData = JSON.parse(payCompRes.content)
                    return SFIntegrationHelper.getOdataResults(payCompData)
                } catch(e) {
                  console.log('Error in Getting SF pay components! ', e.message)
                }
            } else {
                console.log('Error in Getting SF pay components! null response')
            }
        }
        return []
    },
    'successfactors/fetchPayGrades': function (businessUnitId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const foPayGradeQueryUrl = `${baseUrl}/odata/v2/FOPayGroup?select=externalCode,name&$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);
            const payGradeRes = getToSync(foPayGradeQueryUrl, {headers: requestHeaders})

            if(payGradeRes) {
                try {
                    let payGradeData = JSON.parse(payGradeRes.content)
                    return SFIntegrationHelper.getOdataResults(payGradeData)
                } catch(e) {
                  console.log('Error in Getting SF paygroups! ', e.message)
                }
            } else {
                console.log('Error in Getting SF paygroups! null response')
            }
        }
        return []
    },
    'successfactors/fetchCostCenters': function (businessUnitId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const foCostCenterUrl = `${baseUrl}/odata/v2/FOCostCenter?$select=externalCode,description&$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);  
            const costCenterRes = getToSync(foCostCenterUrl, {headers: requestHeaders})

            if(costCenterRes) {
                try {
                    let costCenterData = JSON.parse(costCenterRes.content)
                    return SFIntegrationHelper.getOdataResults(costCenterData)
                } catch(e) {
                  console.log('Error in Getting SF paygrades! ', e.message)
                }
            } else {
                console.log('Error in Getting SF paygrades! null response')
            }
        }
        return []
    },
    "successfactors/setSfCostCenterOnUnits": function(businessUnitId, unitCostCenters) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized")
        }
        let userId = Meteor.userId();
        this.unblock();
        console.log(`unitCostCenters: `, unitCostCenters)

        let unitIds = Object.keys(unitCostCenters) || []
        unitIds.forEach(unitId => {
            const unitCoster = unitCostCenters[unitId]

            const foundUnit = EntityObjects.findOne({_id: unitId})
            if(foundUnit) {
                EntityObjects.update({_id: foundUnit._id}, {$set: {
                    successFactors: {
                        externalCode: unitCoster.costCenterCode
                    }
                }})
            }
        })
        return true;
    },
    "successfactors/fetchOrgChart": function(businessUnitId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            let business = BusinessUnits.findOne({_id: businessUnitId})
                
            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const positionsUrl = `${baseUrl}/odata/v2/Position?$select=code,costCenter,department,positionTitle,jobTitle,parentPosition&$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);  
            const positionsRes = getToSync(positionsUrl, {headers: requestHeaders})

            if(positionsRes) {
                try {
                    let positionsData = JSON.parse(positionsRes.content)
                    let positionResults =  SFIntegrationHelper.getOdataResults(positionsData)

                    positionResults.map(position => {
                        try {
                            let createPosition = (parentId) => {
                                const foundPosition = EntityObjects.findOne({
                                    'successFactors.externalCode': position.code,
                                    otype: 'Position',
                                    businessId: businessUnitId
                                })
                                if(!foundPosition) {
                                    EntityObjects.insert({
                                        parentId: parentId,
                                        name: position.jobTitle,
                                        otype: 'Position',
                                        properties: {},
                                        status: 'Active',
                                        createdBy: null,
                                        properties: null,
                                        businessId: businessUnitId,
                                        _groupId: business._groupId,
                                        successFactors: {
                                          externalCode: position.code,
                                          costCenter: {
                                              code: null // I know positions have cost centers on SF. 
                                          }
                                        }
                                    })
                                }
                            }

                            if(position.department) {
                                const departmentUrl = `${baseUrl}/odata/v2/FODepartment?$filter=externalCode eq '${position.department}'&$select=costCenter,name,description,externalCode,parent&$format=json`
          
                                let getToSync = Meteor.wrapAsync(HTTP.get);  
                                const departmentRes = getToSync(departmentUrl, {headers: requestHeaders})
                                if(departmentRes) {
                                    let departmentData = JSON.parse(departmentRes.content)
                                    let departmentResults =  SFIntegrationHelper.getOdataResults(departmentData)
                                    if(departmentResults.length > 0) {
                                        const department = departmentResults[0]
                                        position.departmentDetails = department

                                        const foundDepartment = EntityObjects.findOne({
                                            'successFactors.externalCode': department.externalCode,
                                            otype: 'Position',
                                            businessId: businessUnitId
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
                                            unitId = foundDepartment._id
                                        }
                                        createPosition(unitId)
                                    }
                                } else {
                                    createPosition(null)
                                }
                            } else {
                                createPosition(null)
                            }
                        } catch(e) {
                            console.log('Error in Getting SF position department! ', e.message)
                        }
                        return position
                    })
                    console.log(`results: `, positionResults)

                    return positionResults
                } catch(e) {
                  console.log('Error in Getting SF positions! ', e.message)
                }
            } else {
                console.log('Error in Getting SF positions! null response')
            }
        }
        return true
    },
    "successfactors/fetchEmployeeTimeSheets": function(businessUnitId, month, year) {
        console.log(`Inside fetchEmployeeTimeSheets method`)
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            const monthAsNum = Number(month - 1)
            const yearAsNum = Number(year)

            const monthMoment = moment().month(monthAsNum).year(yearAsNum)
            const monthStartMoment = monthMoment.clone().startOf('month')
            const monthEndMoment = monthMoment.clone().endOf('month')
            
            const monthStart = monthStartMoment.format('YYYY-MM-DDTHH:mm:ss')
            const monthEnd = monthEndMoment.format('YYYY-MM-DDTHH:mm:ss')
            console.log(`monthStart! `, monthStart)
            console.log(`monthEnd!`, monthEnd)

            TimeWritings.remove({
                businessId: config.businessId, 
                day: {$gte: monthStartMoment.toDate(), $lte: monthEndMoment.toDate()}
            });

            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const empTimeSheetUrl = `${baseUrl}/odata/v2/EmployeeTimeSheet?$filter=startDate ge datetimeoffset'${monthStart}Z' and startDate le datetimeoffset'${monthEnd}Z'&$select=userId,externalCode,approvalStatus,plannedWorkingTime,recordedWorkingTime,startDate&$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);
            const timeSheetRes = getToSync(empTimeSheetUrl, {headers: requestHeaders})

            if(timeSheetRes) {
                try {
                    let timeSheetData = JSON.parse(timeSheetRes.content)
                    let timeSheetResults = SFIntegrationHelper.getOdataResults(timeSheetData)
                    let timeSheets = _.groupBy(timeSheetResults, 'userId');
                    // console.log(`timeSheets: `, timeSheets)
                    let queue = new PowerQueue({
                      isPaused: true,
                      onEnded: () => {
                        console.log(`Queue finally done!`)
                      }
                    });

                    let timeSheetsWithEntries = []
                    Object.keys(timeSheets).map(function(userId, index) {
                        queue.add(function(done) {
                            console.log('Task: ', index);
                            let empTimeSheets = timeSheets[userId]
                            let bpUser = Meteor.users.findOne({'successFactors.personIdExternal': userId})

                            if(bpUser) {
                                console.log(`bpUser: `, bpUser)
                                empTimeSheets.forEach(time => {
                                    try {
                                        const empTimeSheetEntryUrl = `${baseUrl}/odata/v2/EmployeeTimeSheetEntry?$filter=EmployeeTimeSheet_externalCode eq '${time.externalCode}'&$select=externalCode,costCenter,startDate,quantityInHours,startTime,endTime&$format=json`
                                        const timeSheetEntryRes = getToSync(empTimeSheetEntryUrl, {headers: requestHeaders})
                                        // console.log(`timeSheetEntryRes: `, timeSheetEntryRes)
        
                                        if(timeSheetEntryRes) {
                                            let timeSheetEntryData = JSON.parse(timeSheetEntryRes.content)
                                            const entries = SFIntegrationHelper.getOdataResults(timeSheetEntryData)
                                            entries.forEach(entry => {
                                                // if(entry.costCenter && entry.quantityInHours > 0) {
                                                    console.log(`Got timesheet entry with hours more than zero`)
                                                    console.log(`entry.quantityInHours: `, entry.quantityInHours)
                                                    const startDate = SFIntegrationHelper.getJsDateFromOdataDate(time.startDate)
                                                    console.log(`time.startDate: `, startDate)
                                                    console.log(``)
    
                                                    TimeWritings.insert({
                                                        employeeId: bpUser._id,
                                                        costCenter: entry.costCenter,
                                                        day: startDate,
                                                        duration: entry.quantityInHours || 0,
                                                        businessId: config.businessId,
                                                        isStatusSeenByCreator: false,
                                                        approvedBy: null,
                                                        approvedDate: null,
                                                        isApprovalStatusSeenByCreator: false
                                                    })
                                                // } else {
                                                //     console.log(`Got timesheet entry with null hours`)
                                                // }
                                            })
                                        }
                                    } catch(err) {
                                        console.log('Error in Getting SF timesheet entries! ', err.message)
                                    }
                                })    
                            } else {
                                console.log(`Could not find the bulkpay user! `, userId)
                            }
                            console.log(`Task Done!`)
                            done();
                        });
                     });

                     queue.run();
                } catch(e) {
                  console.log('Error in Getting SF timesheets! ', e.message)
                }
            } else {
                console.log('SF Timesheets null response')
            }
        }
        return []
    },
})