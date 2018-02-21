let soap = require('soap');
let sapHanaWsdl = 'https://sandbox.hsdf.systems:8001/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/post_gl/215/post_gl/post_gl?sap-client=215';


const HanaIntegrationHelper = {
  getAuthHeader: (sfConfig) => {
      const username = sfConfig.username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
      const password = sfConfig.password

      const authenticationToken = new Buffer(`${username}:${password}`).toString('base64')
    
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
  }
}


/**
*  SuccessFactors Integration Methods
*/
Meteor.methods({
'hanaIntegration/testConnection': function (businessId, hanaConfig) {
    if (!this.userId) {
        throw new Meteor.Error(401, "Unauthorized");
    }
    this.unblock()
    //--
    if(hanaConfig) {
      //http://34.232.137.239:8000/JournalEntryOdataService/journalentry.xsodata?$metadata&$format=json
      //   let connectionUrl = `${hanaConfig.protocol}://${hanaConfig.serverHostUrl}/JournalEntryOdataService/journalentry.xsodata?$metadata&$format=json`

      const baseUrl = `${hanaConfig.protocol}://${hanaConfig.serverHostUrl}`
      const connectionUrl = `${baseUrl}/JournalEntryOdataService/journalentry.xsodata/GLAccounts?$top=1&$format=json`

      const requestHeaders = HanaIntegrationHelper.getAuthHeader(hanaConfig)

      let errorResponse = null
      try {
          let connectionTestResponse = HTTP.call('GET', connectionUrl, {headers: requestHeaders});
          // console.log(`connectionTestResponse: `, connectionTestResponse)

          if(connectionTestResponse && connectionTestResponse.statusCode === 200) {
              let config = SapHanaIntegrationConfigs.findOne({businessId: businessId});
              if(config) {
                SapHanaIntegrationConfigs.update(config._id, {$set : hanaConfig});
              } else {
                hanaConfig.businessId = businessId
                SapHanaIntegrationConfigs.insert(hanaConfig)
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
    } else {
        return '{"status": false, "message": "Successfactors Config empty"}'
    }
  },
  'hanaIntegration/fetchGlAccounts': function (businessUnitId) {
      if (!this.userId) {
          throw new Meteor.Error(401, "Unauthorized");
      }
      this.unblock();

      let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})
      if(config) {
          const requestHeaders = HanaIntegrationHelper.getAuthHeader(config)
          const baseUrl = `${config.protocol}://${config.serverHostUrl}`
          const glAccountsQueryUrl = `${baseUrl}/JournalEntryOdataService/journalentry.xsodata/GLAccounts?$top=300&$format=json`
        //   http://34.232.137.239:8000/JournalEntryOdataService/journalentry.xsodata/GLAccounts?$top=300&$format=json

          let getToSync = Meteor.wrapAsync(HTTP.get);
          const glAccountsRes = getToSync(glAccountsQueryUrl, {headers: requestHeaders})

          if(glAccountsRes) {
              try {
                  let glAccountsData = JSON.parse(glAccountsRes.content)
                  return HanaIntegrationHelper.getOdataResults(glAccountsData)
              } catch(e) {
                console.log('Error in Getting Hana G/L Accounts! ', e.message)
              }
          } else {
              console.log('Error in Getting Hana G/L Accounts! null response')
          }
      }
      return []
  },
    'hanaIntegration/postPayrunResults': function (businessUnitId, period) {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock()

        let errorResponse = null
        try {
            let payRunResult = Payruns.find({period: period, businessId: businessUnitId}).fetch();
            // let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})

            // if(!config) {
            //     return JSON.stringify({
            //         "status": false,
            //         "message": "Your company's SAP HANA integration setup has not been done"
            //     })
            // }
            let user = Meteor.user();
            let tenantId = user.group;
            let tenant = Tenants.findOne(tenantId)        
            let localCurrency = {}
            if (tenant) {
                localCurrency = tenant.baseCurrency;
            }
            
            const authHeaders = HanaIntegrationHelper.getAuthHeader({
                username: 'SAP_INSTALL', password: 'Awnkg0akm'
            })

            // soap.createClient(sapHanaWsdl, { wsdl_headers: authHeaders }, function(err, client) {
            //     console.log(`err: `, err);
            //     console.log(`client: `, client)
            // });

            soap.createClientAsync(sapHanaWsdl, { wsdl_headers: authHeaders })
            .then((client) => {
                // console.log(`client: `, client)
                // console.log(`client: `, client.describe())
                console.log(`client: `, JSON.stringify(client.describe(), null, 4))
                const journal = {
                    Accountgl: {
                        'item': [{
                            ItemnoAcc: '1',
                            GlAccount: '0063005000',
                            ItemText: 'Payroll Journal',
                            PstngDate: '2017-01-01',
                            ValueDate: '2017-01-01',
                            FmArea: '1000',
                            TaxCode: 'V0',
                            Costcenter: '0017101101',
                            Orderid: '',
                            Fund: '10000000',
                            FundsCtr: '17101101',
                            GrantNbr: 'NOT-RELEVANT'
                        }]
                    },
                    Currencyamount: {
                        'item': [{
                            ItemnoAcc: 1,
                            Currency: 'NGN',
                            AmtDoccur: '2100'
                        }]
                    },
                    Documentheader: {
                        PstngDate: '2017-02-21',
                        FiscYear: 2018
                    }
                }

                return client.AccDocumentPost(journal, function(err, result, rawResponse, soapHeader, rawRequest) {
                    console.log(`err: `, err)
                    console.log(`result: `, result)
                    console.log(`rawResponse: `, rawResponse)
                    console.log(`soapHeader: `, soapHeader)
                })

                // return client.AccDocumentPost(args);
                // return {}
            }).then((result) => {
                console.log('Result: ', result);
            }).catch((error) => {
                console.log(`error: `, error)
            })
        } catch(e) {
            errorResponse = '{"status": false, "message": "Could not connect to SAP Integration service"}'
        }
    }
})
