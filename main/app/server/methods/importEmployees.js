Meteor.methods({

    /*
        Please note! This method does not handle employee photo, position, paygrade, paytypes.
        It simply eases the burden of entering employee information into the system.
    */

    "parseEmployeesUpload": function(data, businessId){
        check(data, Array);
        check(businessId, String);

        this.unblock()

        let successCount = 0;
        let skipped = [];
        let skippedCount = 0;
        let errorCount = 0;
        let errors = [];
        //--
        _.each(data, function (d, index) {
            if (Object.keys(d).length === 1){
                data.splice(index, 1);
            }
        });

        // let validateCsvFile = () => {
        //     for (let i = 0; i < data.length; i++) {
        //         let item   = data[i];
        //         item.businessId = businessId;
        //         errors.push({line: (i + 1), error: e, rowData: item});
        //         // errorCount += 1
        //     }
        // }

        let getEmployeeDocumentForInsert = (csvRow) => {
          let guarantor = () => {
              return {
                  fullName: csvRow.GuarantorFullName,
                  email: csvRow.GuarantorEmail,
                  phone: csvRow.GuarantorPhone,
                  address: csvRow.GuarantorAddress,
                  city: csvRow.GuarantorCity,
                  state: csvRow.GuarantorState
              }
          };
          let emergencyContact = () => {
              return [{
                  name: csvRow.EmergencyContactFullName,
                  email: csvRow.EmergencyContactEmail,
                  phone: csvRow.EmergencyContactPhone,
                  address: csvRow.EmergencyContactAddress,
                  city: csvRow.EmergencyContactCity,
                  state: csvRow.EmergencyContactState
              }];
          }
          function payment() {
              return {
                  paymentMethod: csvRow.PaymentMethod,
                  bank: csvRow.Bank,
                  accountNumber: csvRow.AccountNumber,
                  accountName: csvRow.AccountName,
                  pensionmanager: csvRow.Pensionmanager,
                  RSAPin: csvRow.RSANumber,
                  taxPayerId: csvRow.TaxPayerId
              }
          };
          let employment = () => {
              let hireDate = csvRow.EmploymentHireDate;
              let terminationDate = csvRow.EmploymentTerminationDate;
              let confirmationDate =  csvRow.EmploymentConfirmationDate;

              const details = {
                  position: null,
                  paygrade: null,
                  paytypes: [],
                  status: csvRow.Status
              };
              if(hireDate)
                  details.hireDate = new Date(hireDate);
              if(terminationDate)
                  details.terminationDate = new Date(terminationDate);
              if(confirmationDate)
                  details.confirmationDate = new Date(confirmationDate);
              return details;
          };

          const employeeProfile = {
              employeeId: csvRow.EmployeeId,
              address: csvRow.Address,
              dateOfBirth: new Date(csvRow.DateOfBirth),
              gender: csvRow.Gender,
              maritalStatus: csvRow.MaritalStatus,
              phone: csvRow.Phone,
              state: csvRow.State,
              photo: null,
              guarantor: guarantor(),
              employment: employment(),
              emergencyContact: emergencyContact(),
              payment: payment()
          };

          const newEmployeeDoc = {
              firstName: csvRow.FirstName,
              lastName: csvRow.LastName,
              otherNames: csvRow.OtherNames,
              email: csvRow.Email,
              employeeProfile: employeeProfile,
              businessId: businessId
          };
          return newEmployeeDoc;
        }

        for (let i = 0; i < data.length; i++ ) {
            let item = data[i];
            // let errorItem = _.find(errors, function (e) {
            //     return e.line === i
            // });
            item.businessId = businessId;
            let employeeDocument = getEmployeeDocumentForInsert(item);
            //console.log(`Employee document: ${JSON.stringify(employeeDocument)}`)
            let employeeDocumentEmployeeId = employeeDocument.employeeProfile.employeeId;

            // let doesEmployeeWithEmployeeIdOrEmailExist = Meteor.users.findOne({
            //   "employeeProfile.employeeId": employeeDocumentEmployeeId,
            //   "businessIds": {"$in" : [businessId]}
            // });
            let doesEmployeeWithEmailExist = Meteor.users.findOne({
              "emails": {$elemMatch: {address: employeeDocument.email}},
              "businessIds": {"$in" : [businessId]}
            });

            if (doesEmployeeWithEmailExist){
                console.log(`Duplicate email employee skipped`)
                item.ErrorLine = (i + 1)
                skipped.push(item);
                skippedCount += 1
            } else {
                try {
                    let options = {};
                    options.email = employeeDocument.email; // tempo
                    options.firstname = employeeDocument.firstName;
                    options.lastname =  employeeDocument.lastName;
                    options.employee =  true;
                    options.tenantId = Core.getTenantId(Meteor.userId());
                    options.employeeProfile = employeeDocument.employeeProfile;
                    options.businessIds = [employeeDocument.businessId];
                    let accountId = Accounts.createUser(options);
                    if(accountId){
                        successCount += 1
                        let roles = ["ess/all"];
                        Roles.setUserRoles(accountId, _.uniq(roles ), Roles.GLOBAL_GROUP);

                        //Accounts.sendEnrollmentEmail(accountId, employeeDocument.email);
                    } else {
                        errorCount += 1
                    }
                } catch(dbException) {
                    item.ErrorLine = (i + 1)
                    errors.push(item);
                    errorCount += 1
                }
            }
        }
        console.log(`Employees upload complete!`)
        return {skippedCount: skippedCount, skipped: skipped, success: successCount, failed: errorCount, errors: errors}
    }
});
