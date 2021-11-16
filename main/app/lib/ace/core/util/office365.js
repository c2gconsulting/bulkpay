
const trimString = str => (str || "").trim();
const toUpperCase = str => (str || "").toUpperCase();
const toLowerCase = str => (str || "").toLowerCase();

// { createdAt: Sun Oct 31 2021 19:21:42 GMT+0100 (WAT),
//     _id: 'BzrGtCLe57yAmiZEG',
//     services: 
//      { office365: 
//         { id: '7d26da16-0897-4fae-990d-6fa8d46cdfa4',
//           accessToken: 'eyJ0eXAiOiJKV1QiLCJub25jZSI6Ii1rTy1WYXAtQkJ1TXNuVkZ6T19keWpuLXlUaTlIamVwQ1N0RzFOZ3MyNzgiLCJhbGciOiJSUzI1NiIsIng1dCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC84NWNhODkyYi05MGIxLTQxZWQtYTE3MS1hNDVhYjQ2MzA0ODIvIiwiaWF0IjoxNjM1NzA0MjAxLCJuYmYiOjE2MzU3MDQyMDEsImV4cCI6MTYzNTcwODk1NCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFTUUEyLzhUQUFBQW1WNlVyclVOck9xTmVxWDdHYk0yUGZpczhUTmtGRXFWc3E0OFlMMmRFcDg9IiwiYW1yIjpbInB3ZCJdLCJhcHBfZGlzcGxheW5hbWUiOiJPaWxzZXJ2IExpbWl0ZWQiLCJhcHBpZCI6ImZjOTc0NWM4LTk3OWItNDQxZS1iZmExLWJjNTBkZGJkZWNjMiIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiQWRtaW4iLCJnaXZlbl9uYW1lIjoiUGxhdGZvcm0iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxOTcuMjEwLjI4LjIwNiIsIm5hbWUiOiJQbGF0Zm9ybSBBZG1pbiIsIm9pZCI6IjdkMjZkYTE2LTA4OTctNGZhZS05OTBkLTZmYThkNDZjZGZhNCIsInBsYXRmIjoiNSIsInB1aWQiOiIxMDAzMjAwMENFQzMzQ0UzIiwicmgiOiIwLkFURUFLNG5LaGJHUTdVR2hjYVJhdEdNRWdzaEZsX3libHg1RXY2RzhVTjI5N01JeEFQTS4iLCJzY3AiOiJVc2VyLlJlYWQgcHJvZmlsZSBvcGVuaWQgZW1haWwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJoZ1BqX3g0WHN5R3pXMjE5SjcxbkJSMjhJUnZGa1MzZU8tQVRTZnM0MGVZIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFGIiwidGlkIjoiODVjYTg5MmItOTBiMS00MWVkLWExNzEtYTQ1YWI0NjMwNDgyIiwidW5pcXVlX25hbWUiOiJwbGF0Zm9ybS5hZG1pbkBvaWxzZXJ2bHRkLW5nLmNvbSIsInVwbiI6InBsYXRmb3JtLmFkbWluQG9pbHNlcnZsdGQtbmcuY29tIiwidXRpIjoiX2dzaXFPaDdia2VRalRTLXUtWTBBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19zdCI6eyJzdWIiOiJYQXZLS3RxOXdpaUFmT05kd0Mxa3FDZXhsMk5zRFZVZlpWQjl5cm5TMFJjIn0sInhtc190Y2R0IjoxNTEzMTU3Njg2fQ.FucarP2LhdTv4N8q0i2e5MSZewkTwMv7Eokd5z_Er2RNEgtudbgBW4FCrRTGTrhRKoEThEaLDDbKdwuI4sEZMTR1R9flirK_fmTOwCUNUqFk6s_-p3eTSPP9ZVzFHEK5TXq0JjlQsGhD_uLM36OWzX4SCesrL5jMzNo91H9jzVB7-IBuc2Tn86TIxn1cXwB9pdKxyOifAkrritMVHJstQtxuu3S7gmUBtswSHMUY1__U8jpZsPbk6IR2PeDdpXGqvyoU0UzCevxvxFG9cqh6SG2tR-UaEvDZK0yugxM5wsEJy6d4QPM4Zage5HrBiKwM-suq1K-gjeilTFpG8gmLtg',
//           displayName: 'Platform Admin',
//           givenName: 'Platform',
//           surname: 'Admin',
//           username: 'platform.admin',
//           userPrincipalName: 'platform.admin@oilservltd-ng.com',
//           mail: 'platform.admin@oilservltd-ng.com',
//           jobTitle: null,
//           mobilePhone: null,
//           businessPhones: [],
//           officeLocation: null,
//           preferredLanguage: 'en-GB'
//        } 
//    } 
// }

const formatUserOffice326Info = (userOffice365) => ({
    emails: [{
        address: trimString(userOffice365.mail),
        verified: false 
    }],
    profile: {
        fullName: toUpperCase(userOffice365.displayName),
        firstname: toUpperCase(userOffice365.givenName),
        lastname: toUpperCase(userOffice365.surname)
    },
    employee: true,
    employeeProfile: {
        employeeId: 000000000,
        address: toUpperCase(userOffice365.address),
        gender: 'MALE',
        maritalStatus: null,
        phone: userOffice365.mobilePhone || '',
        state: '',
        photo: null,
        guarantor:  {
            fullName: null,
            email: null,
            phone: null,
            address: null,
            city: null,
            state: null
        },
        employment: {
            hireDate: new Date(),
            terminationDate: null,
            position: '',
            status: 'Active'
        },
        emergencyContact: [],
        payment: {
            paymentMethod: '',
            bank: 'FIDTNGLA',
            accountNumber: 6553511766,
            payGrade: 'TECH 5',
            bankCountry: 'NG',
            payLevel: 1,
            pensionmanager: '',
            RSAPin: '',
            taxPayerId: ''
        }
    },
   services: { office365: { id: userOffice365.id, accessToken: userOffice365.accessToken } },
   roles: { __global_roles__: [ 'ess/all' ] },
   customUsername: userOffice365.username,
   username: userOffice365.username,
   positionDesc: 'PWHT MATE',
   positionId: '40000640',
   lineManagerId: '40000093',
   hodPositionId: '40000093',
   costCenterId: '0000001071',
   organizationalUnit: '20000006',
})

const getEmailDomain = (emailAdress = "") => {
    const [address, mailDomain] = emailAdress.split('@');
    return mailDomain
}

const updateLoginServiceFor = (user, newUser) => {
    if (user && user.services && !user.services.office365) {
        return Meteor.users.update({ 'emails.address': newUser.emails[0].address }, { $set: {
            "services.office365": newUser.services.office365
        }})
    }
}

const office365Logger = (foundUser, office365, options) => {
    console.log('foundUser', foundUser)
    console.log('office365', office365)
    console.log('options', options)
}

Core.office365AuthenticationSuite = (user, tenantId, options) => {
    let userExist = false;
    if (!tenantId && user.services && user.services.office365) {
        const { services: { office365 } } = user
        if (office365) {
            const dDomain = getEmailDomain(office365.mail);
            const foundUser = Meteor.users.findOne({ 'emails.address': { '$regex': `${dDomain}`, '$options': 'i' } });
            office365Logger(foundUser, office365, options)
            tenantId = foundUser.group
            const newUser = formatUserOffice326Info(office365)
            const existedUser = Meteor.users.findOne({ 'emails.address': newUser.emails[0].address })
            if (existedUser) {
                user = existedUser;
                updateLoginServiceFor(existedUser, newUser);
                userExist = !!existedUser
            } else {
                delete user.services;
                user = { ...user, ...newUser }
            }
            user.businessIds = foundUser.businessIds
            user.tenantId = foundUser.group
        }
    }

    return { user, tenantId, userExist }
}
