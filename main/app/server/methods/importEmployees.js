Meteor.methods({

    "parseEmployeesUpload": function(data, businessId){
        check(data, Array);
        check(businessId, String);

        let errorCount = 0;
        let successCount = 0;
        let skippedCount = 0;
        let errors = [];

        _.each(data, function (d, index) {
            if (Object.keys(d).length === 1){
                data.splice(index, 1);
            }
        });

        let validateCsvFile = () => {
            for (let i = 0;i < data.length; i++) {
                let item   = data[i];
                item.businessId = businessId;
                // errors.push({line: i, error: e});
                // errorCount += 1
            }
        }

        let getEmployeeDocumentForInsert = (csvRow) => {
          let guarantor = () => {
              return {
                  fullName: csvRow.GuarantorFullName,
                  email: csvRow.GurantorEmail,
                  phone: csvRow.GurantorPhone,
                  address: csvRow.GurantorAddress,
                  city: csvRow.GurantorCity,
                  state: csvRow.GurantorState
              }
          };
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
                  position: csvRow.PositionCode,
                  paygrade: csvRow.PayGradeCode,
                  paytypes: [],
                  status: csvRow.Status,
              }
              if(hireDate)
                  details.hireDate = new Date(hireDate);
              if(terminationDate)
                  details.terminationDate = new Date(terminationDate);
              if(confirmationDate)
                  details.confirmationDate = new Date(confirmationDate);
              return details;
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

        let removeQuotedCommaIfExists = (word) => {

        }

        validateCsvFile();

        for ( let i = 0; i < data.length; i++ ) {
            let item = data[i];
            console.log(`An employee row: ${JSON.stringify(item)}`)

            let errorItem = _.find(errors, function (e) {
                return e.line === i
            });
            if (!errorItem) {
                let employeeDocument = getEmployeeDocumentForInsert(item);
                console.log(`Employee document: ${JSON.stringify(employeeDocument)}`)
                let employeeDocumentEmployeeId = employeeDocument.employeeProfile.employeeId;

                let doesEmployeeWithEmployeeIdOrEmailExist = Meteor.users.findOne({
                  $and: [{"employeeProfile.employeeId": employeeDocumentEmployeeId}, {"businessId": {"$in" : [businessId]}}]
                });

                if (doesEmployeeWithEmployeeIdOrEmailExist){
                    skippedCount += 1
                } else {
                    // let newCurrencyId = Currencies.insert(item);
                    // if (newCurrencyId){
                    //     successCount += 1
                    // } else {
                    //     errorCount += 1
                    // }
                    successCount += 1
                }
            }
        }
        return {skipped: skippedCount, success: successCount, failed: errorCount}
    }
});
