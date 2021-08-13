import _ from 'underscore';

/**
 * Accounts handlers
 * creates a login type "anonymous"
 * default for all unauthenticated visitors
 */
/*
 Accounts.registerLoginHandler(function (options) {
 if (!options.anonymous) {
 return void 0;
 }
 let loginHandler;
 let stampedToken = Accounts._generateStampedLoginToken();
 let userId = Accounts.insertUserDoc({
 services: {
 anonymous: true
 },
 token: stampedToken.token
 });
 loginHandler = {
 type: "anonymous",
 userId: userId
 };
 return loginHandler;
 });
 */

/**
 * Accounts.onCreateUser event
 * adding either a guest or anonymous role to the user on create
 * adds Accounts record for user profile
 *
 * see: http://docs.meteor.com/#/full/accounts_oncreateuser
 */

Accounts.onCreateUser(function (options, user) {
    let tenantId = options.tenantId;
    let roles = {};

    user.profile = {};

    let fullName = [options.firstname, options.lastname];


    user.profile['fullName'] = fullName.join(" ");
    user.profile['firstname'] = options.firstname;
    user.profile['lastname'] = options.lastname;


    user.employee = options.employee;
    user.employeeProfile = options.employeeProfile || {};

    user.salesProfile = options.salesProfile || {};
    user.salesProfile['salesAreas'] = options.salesAreas;
    user.roles = options.roles || {};
    user.businessIds = options.businessIds || [];
    user.group = tenantId;

    // assign user to his tenant Partition
    Partitioner.setUserGroup(user._id, tenantId);

    return user;
});

let getPasswordResetToken = function(user, userId, email) {
    var token = Random.secret();
    var when = new Date();
    var tokenRecord = {
        token: token,
        email: email,
        when: when,
        reason: 'reset'
    };
    Meteor.users.update(userId, {$set: {
        "services.password.reset": tokenRecord
    }});

    Meteor._ensure(user, 'services', 'password').reset = tokenRecord;

    return token
}

/**
 * Accounts.onLogin event
 * automatically push checkoutLogin when users login.
 * let"s remove "anonymous" role, if the login type isn't "anonymous"
 * @param
 * @returns
 */
Accounts.onLogin(function (options) {
    /*
     let update = {
     $pullAll: {}
     };

     update.$pullAll["roles." + Core.getTenantId()] = ["anonymous"];

     Meteor.users.update({
     _id: options.user._id
     }, update, {
     multi: true
    });*/
});


/**
 * Core Account Methods
 */
Meteor.methods({
    /*
     * check if current user has password
     */
    "accounts/currentUserHasPassword": function () {
        let user;
        user = Meteor.users.findOne(Meteor.userId());
        if (user.services.password) {
            return true;
        }
        return false;
    },
    "account/customLoginWithEmail": function(userEmail, hashedPassword,businessId) {
        if(!userEmail) {
            throw new Meteor.Error(401, "Email not specified");
        }
        if(!hashedPassword) {
            throw new Meteor.Error(401, "Password not specified");
        }

        console.log('Meteor.users()', Meteor.users.find())

        let user = Meteor.users.findOne({
            'emails.address': userEmail,
            // 'businessIds': businessId
        })
        console.log("user is:")
        console.log(user)


                // let user1 = Meteor.users.findOne({
                //     'employeeProfile.employeeId': employeeId,
                //     // 'businessIds': businessId
                // })
                // console.log("user1 is:")
                // console.log(user1)
        if(user) {
            if(!user.services.password || !user.services.password.bcrypt) {
                throw new Meteor.Error(401, "Sorry, you cannot log-in at the moment. You may have to click the enrollment link sent to your email");
            }

            let myPassword = {digest: hashedPassword, algorithm: 'sha-256'};
            let loginResult = Accounts._checkPassword(user, myPassword);
             console.log(`loginResult: `, loginResult)
            // console.log(`myPassword: `, myPassword)


            if(loginResult.error) {
                throw loginResult.error
            } else {
                let hashedDefaultPassword = Package.sha.SHA256("123456")
                let hashedDefaultPasswordObj = {digest: hashedDefaultPassword, algorithm: 'sha-256'};
                let defaultLoginResult = Accounts._checkPassword(user, hashedDefaultPasswordObj);

                if(defaultLoginResult.error) {
                    Meteor.users.update({_id: user._id}, {$set: {
                        isUsingDefaultPassword: false
                    }})
                    return {status: true, loginType: 'usingRealPassword', userEmail: userEmail}
                } else {
                    Meteor.users.update({_id: user._id}, {$set: {
                        isUsingDefaultPassword: true
                    }})
                }
                //--
                if(user.employeeProfile && user.employeeProfile.employment
                    && user.employeeProfile.employment.status === 'Active') {
                    return {
                        status: true,
                        loginType: 'usingEmail',
                        userEmail: userEmail
                    }
                } else {
                    if(user.businessIds.length === 0) {
                        return {
                            status: true,
                            loginType: 'usingEmail',
                            userEmail: userEmail
                        }
                    } else {
                        throw new Meteor.Error(401, "User is not active")
                    }
                }
            }
        } else {
            throw new Meteor.Error(401, "Email does not exist");
        }
    },
    "account/customLogin": function(usernameOrEmail, hashedPassword) {
        // if(!usernameOrEmail) {
        //     throw new Meteor.Error(401, "Username/Email not specified");
        // }
        if(!hashedPassword) {
            throw new Meteor.Error(401, "Password not specified");
        }

        let user = Meteor.users.findOne({customUsername: usernameOrEmail})

        if(user) {
            if(!user.services.password || !user.services.password.bcrypt) {
                throw new Meteor.Error(401, "Sorry, you cannot log-in at the moment. You may have to click the enrollment link sent to your email");
            }

            let myPassword = {digest: hashedPassword, algorithm: 'sha-256'};
            let loginResult = Accounts._checkPassword(user, myPassword);
            console.log(`loginResult: `, loginResult)

            if(loginResult.error) {
                throw loginResult.error
            } else {
                if(user.employeeProfile && user.employeeProfile.employment
                    && user.employeeProfile.employment.status === 'Active') {
                    let hashedDefaultPassword = Package.sha.SHA256("123456")
                    let defaultPassword = {digest: hashedDefaultPassword, algorithm: 'sha-256'}

                    let defaultLoginResult = Accounts._checkPassword(user, defaultPassword);
                    let userEmail = user.emails[0].address
                    console.log(`userEmail: `, userEmail)

                    if(userEmail) {
                        if(defaultLoginResult.error) {
                            Meteor.users.update({_id: user._id}, {$set: {
                                isUsingDefaultPassword: false
                            }})
                            return {status: true, loginType: 'usingRealPassword', userEmail: userEmail}
                        } else {
                            Meteor.users.update({_id: user._id}, {$set: {
                                isUsingDefaultPassword: true
                            }})
                            let resetPasswordToken = getPasswordResetToken(user, user._id, userEmail)

                            return {
                                status: true,
                                loginType: 'usingDefaultPassword',
                                resetPasswordToken: resetPasswordToken,
                                userEmail: userEmail
                            }
                        }
                    } else {
                        Meteor.users.update({_id: user._id}, {$set: {
                            isUsingDefaultPassword: true
                        }})
                        let resetPasswordToken = getPasswordResetToken(user, user._id, usernameOrEmail)

                        return {
                            status: true,
                            loginType: 'usingDefaultPassword',
                            resetPasswordToken: resetPasswordToken,
                            userEmail: userEmail
                        }
                    }
                } else {
                    throw new Meteor.Error(401, "User is not active");
                }
            }
        } else {
          //  throw new Meteor.Error(401, "Username does not exist");
        }
    },
    "account/update": function (user, userId) {
        check(user, Object);
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
                "employeeProfile.employeeId": user.employeeProfile.employeeId,
                "emails.0.address": user.emails[0].address,
                "profile.fullName": user.profile.fullName,
                "profile.firstname": user.profile.firstname,
                "profile.lastname": user.profile.lastname,
                "profile.workPhone": user.profile.workPhone,
                "profile.homePhone": user.profile.homePhone,
                // "employeeProfile.photo": user.employeeProfile.photo,
                "roles": user.roles,
                "notifications": user.notifications,
                "salesProfile": user.salesProfile
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/updatePersonalData": function (user, userId) {
        check(user, Object);
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
                "employeeProfile.employeeId": user.employeeProfile.employeeId,
                "emails.0.address": user.emails[0].address,
                "profile.fullName": user.profile.fullName,
                "profile.firstname": user.profile.firstname,
                "profile.lastname": user.profile.lastname,
                "profile.othernames": user.profile.othernames,
                "employeeProfile.maidenName": user.employeeProfile.maidenName,
                "personalEmailAddress": user.personalEmailAddress,

                "employeeProfile.address": user.employeeProfile.address,
                "employeeProfile.dateOfBirth": user.employeeProfile.dateOfBirth,
                "employeeProfile.gender": user.employeeProfile.gender,
                "employeeProfile.maritalStatus": user.employeeProfile.maritalStatus,
                "employeeProfile.phone": user.employeeProfile.phone,
                "employeeProfile.nationality": user.employeeProfile.nationality,
                "employeeProfile.state": user.employeeProfile.state,
                "employeeProfile.workLocation": user.employeeProfile.workLocation,
                "employeeProfile.religion": user.employeeProfile.religion,
                "employeeProfile.bloodGroup": user.employeeProfile.bloodGroup,
                "employeeProfile.disability": user.employeeProfile.disability,
                "employeeProfile.numberOfChildren": user.employeeProfile.numberOfChildren,
                "employeeProfile.workExperiences": user.employeeProfile.workExperiences,
                "employeeProfile.appraisalGradeLevel": user.employeeProfile.appraisalGradeLevel
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/updateNextOfKinData": function (user, userId) {
        check(user, Object);
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
              "employeeProfile.guarantor.fullName": user.employeeProfile.guarantor.fullName,
              "employeeProfile.guarantor.email": user.employeeProfile.guarantor.email,
              "employeeProfile.guarantor.phone": user.employeeProfile.guarantor.phone,
              "employeeProfile.guarantor.address": user.employeeProfile.guarantor.address,
              "employeeProfile.guarantor.city": user.employeeProfile.guarantor.city,
              "employeeProfile.guarantor.state": user.employeeProfile.guarantor.state
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/updateBeneficiaryData": function (user, userId) {
        check(user, Object);
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
              "employeeProfile.beneficiary.fullName": user.employeeProfile.beneficiary.fullName,
              "employeeProfile.beneficiary.email": user.employeeProfile.beneficiary.email,
              "employeeProfile.beneficiary.phone": user.employeeProfile.beneficiary.phone,
              "employeeProfile.beneficiary.address": user.employeeProfile.beneficiary.address,
              "employeeProfile.beneficiary.city": user.employeeProfile.beneficiary.city,
              "employeeProfile.beneficiary.state": user.employeeProfile.beneficiary.state
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/updateEmergencyContactData": function (user, userId) {
        check(user, Object);
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
              "employeeProfile.emergencyContact.0.name": user.employeeProfile.emergencyContact[0].name,
              "employeeProfile.emergencyContact.0.email": user.employeeProfile.emergencyContact[0].email,
              "employeeProfile.emergencyContact.0.phone": user.employeeProfile.emergencyContact[0].phone,
              "employeeProfile.emergencyContact.0.address": user.employeeProfile.emergencyContact[0].address,
              "employeeProfile.emergencyContact.0.city": user.employeeProfile.emergencyContact[0].city,
              "employeeProfile.emergencyContact.0.state": user.employeeProfile.emergencyContact[0].state
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/updateEmploymentData": function (user, userId) {
        check(user, Object);
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            let hireDate = user.employeeProfile.employment.hireDate

            if(hireDate) {
                hireDate = new Date(hireDate)
            }

            let confirmationDate = user.employeeProfile.employment.confirmationDate
            if(confirmationDate) {
                confirmationDate = new Date(confirmationDate)
            }
            let terminationDate = user.employeeProfile.employment.terminationDate
            if(terminationDate) {
                terminationDate = new Date(terminationDate)
            }
            let directSupervisorId = user.directSupervisorId;
            let directAlternateSupervisorId = user.directAlternateSupervisorId;


            let updateObj = {
                "employeeProfile.employment.position": user.employeeProfile.employment.position,
                "employeeProfile.employment.paygrade": user.employeeProfile.employment.paygrade,
                "employeeProfile.employment.hireDate": hireDate,
                "employeeProfile.employment.confirmationDate": confirmationDate,
                "employeeProfile.employment.status": user.employeeProfile.employment.status,
                "employeeProfile.employment.terminationDate": terminationDate,
                "directSupervisorId": directSupervisorId,
                "directAlternateSupervisorId": directAlternateSupervisorId
            }

            if(account.employeeProfile.employment.status !== user.employeeProfile.employment.status) {
                updateObj['employeeProfile.employment.statusChangeHistory'] = account.employeeProfile.employment.statusChangeHistory || []
                updateObj['employeeProfile.employment.statusChangeHistory'].push({
                    status: user.employeeProfile.employment.status,
                    date: new Date(),
                    changedBy: Meteor.userId()
                })
            }

            Meteor.users.update({_id: account._id}, {$set: updateObj});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/saveNewPromotion": function (userId, newPromotion) {
        check(userId, String);

        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }

        let account =  Meteor.users.findOne(userId);
        if (account){
            if(!newPromotion) {
                throw new Meteor.Error(404, "Promotion details was not specified");
            }
            if(!newPromotion.payGradeId) {
                throw new Meteor.Error(404, "Paygrade for promotion was not specified");
            }

            let newPromotionPayGrade = PayGrades.findOne(newPromotion.payGradeId);
            if(!newPromotionPayGrade) {
                throw new Meteor.Error(404, "Paygrade details for promotion could not be found in database");
            }

            newPromotion.payGradeName = newPromotionPayGrade.code

            if(!newPromotion.positionId) {
                throw new Meteor.Error(404, "Position for promotion was not specified");
            }

            let positionIds = newPromotionPayGrade.positions
            let isNewPromotionPositionAllowedForPaygrade = _.find(positionIds, function(aPositionId) {
                return aPositionId === newPromotion.positionId
            })
            if(!isNewPromotionPositionAllowedForPaygrade) {
                throw new Meteor.Error(404, "Position of promotion does not belong to selected Paygrade");
            }

            if(newPromotion.positionId) {
                let newPromotionPosition = EntityObjects.findOne(newPromotion.positionId);
                if(newPromotionPosition) {
                    newPromotion.positionName = newPromotionPosition.name
                }
            }
            //--
            let updateObj = {}
            updateObj['employeeProfile.employment.promotionsHistory'] = account.employeeProfile.employment.promotionsHistory;

            newPromotion._id = Random.id();

            if(!account.employeeProfile.employment.promotionsHistory) {
                let initialEmployeeEmploymentPosition = {
                    payGradeId: account.employeeProfile.employment.paygrade,
                    positionId: account.employeeProfile.employment.position,
                    date: account.employeeProfile.employment.hireDate,
                    _id: Random.id()
                };
                const employeeInitialPayGradeId = account.employeeProfile.employment.paygrade
                const emploeeInitialPositionId = account.employeeProfile.employment.position

                if(employeeInitialPayGradeId) {
                    let employeeInitialPayGrade = PayGrades.findOne(employeeInitialPayGradeId);
                    if(employeeInitialPayGrade) {
                        initialEmployeeEmploymentPosition.payGradeName = employeeInitialPayGrade.code
                    }
                }
                if(emploeeInitialPositionId) {
                    let emploeeInitialPosition = EntityObjects.findOne(emploeeInitialPositionId);
                    if(emploeeInitialPosition) {
                        initialEmployeeEmploymentPosition.positionName = emploeeInitialPosition.name
                    }
                }

                updateObj['employeeProfile.employment.promotionsHistory'] = [initialEmployeeEmploymentPosition]
            }

            updateObj['employeeProfile.employment.promotionsHistory'].push(newPromotion)
            Meteor.users.update({_id: account._id}, {$set: updateObj});
            //--
            Meteor.users.update({_id: account._id}, {$set: {
                "employeeProfile.employment.position": newPromotion.positionId,
                "employeeProfile.employment.paygrade": newPromotion.payGradeId,
            }});

            return true
        }
    },
    "account/updatePayTypesData": function (payTypesArray, userId, hourlyRate, dailyRate) {
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
              "employeeProfile.employment.paytypes": payTypesArray,
              "employeeProfile.employment.hourlyRate": hourlyRate,
              "employeeProfile.employment.dailyRate": dailyRate

            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/netPayAllocation": function (userId, hasNetPayAllocation, foreignCurrency, rateToBaseCurrency, foreignCurrencyAmount) {
        check(userId, String);

        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account) {
            let updateObj = null
            if(hasNetPayAllocation === true) {
                updateObj = {
                    hasNetPayAllocation : hasNetPayAllocation,
                    foreignCurrency: foreignCurrency,
                    rateToBaseCurrency: rateToBaseCurrency,
                    foreignCurrencyAmount: foreignCurrencyAmount
                }
            } else {
                updateObj = {
                    hasNetPayAllocation: false,
                    foreignCurrency: null,
                    foreignCurrencyAmount: null
                }
            }
            Meteor.users.update({_id: account._id}, {$set: {
              "employeeProfile.employment.netPayAllocation": updateObj
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },

    "account/updatePaymentData": function (user, userId) {
        check(user, Object);
        check(userId, String);
        //check(user.businessId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
              "employeeProfile.payment.paymentMethod": user.employeeProfile.payment.paymentMethod,
              "employeeProfile.payment.bank": user.employeeProfile.payment.bank,
              "employeeProfile.payment.accountNumber": user.employeeProfile.payment.accountNumber,
              "employeeProfile.payment.accountName": user.employeeProfile.payment.accountName,
              "employeeProfile.payment.pensionmanager": user.employeeProfile.payment.pensionmanager,
              "employeeProfile.payment.RSAPin": user.employeeProfile.payment.RSAPin,
              "employeeProfile.payment.taxPayerId": user.employeeProfile.payment.taxPayerId,
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/getUsernamesByIds": function (userIds) {
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        this.unblock();
        let users = Meteor.users.find({_id: {$in: userIds}}).fetch();
        let data = {};

        _.each(users, function (user) {
            data[user._id] = {
                username: user.username,
                email: user.emails[0].address,
                assigneeCode: user.salesProfile ? user.salesProfile.originCode : "",
                fullName: user.profile.fullName
            };
        });
        return data
    },

    "account/updateNotifications": function(notifications, userId){
        check(notifications, Object);
        check(userId, String);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }
        let account =  Meteor.users.findOne(userId);
        if (account){
            Meteor.users.update({_id: account._id}, {$set: {
                "notifications": notifications
            }});
            return true
        } else {
            throw new Meteor.Error(404, "Account Not found");
        }
    },
    "account/create": function (user, sendEnrollmentEmail) {
        check(user, Object);
        check(sendEnrollmentEmail, Boolean);
        if (!Meteor.userId()){
            throw new Meteor.Error(404, "Unauthorized");
        }

        let foundEmail =  Meteor.users.findOne({"emails.address": user.email});
        if (foundEmail){
            throw new Meteor.Error(404, "Email already exists");
        }
        //also check if employee number is unique ... allowing users to enter thier employee ids for compatibility
        let numberExist = Meteor.users.findOne({$and: [{"employeeProfile.employeeId": user.employeeId}, {"businessId": {"$in" : [user.businessId]}}]});
        if (numberExist) {
            throw new Meteor.Error(404, "Employee Id already taken ")
        }
        let options = {};
        console.log('termination date is ', user.employeeProfile.employment.terminationDate);
            Core.hasPayrollAccess()
        options.email = user.email; // tempo
        options.firstname = user.firstName;
        options.lastname =  user.lastName;
        options.employee =  true;
        options.tenantId = Core.getTenantId(Meteor.userId());
        //options.roles = ["employee/all"];
        options.employeeProfile = user.employeeProfile;
        options.businessIds = [user.businessId];
        let accountId = Accounts.createUser(options);
        if(accountId){
            let roles = ["ess/all"];
            Roles.setUserRoles(accountId, _.uniq(roles ), Roles.GLOBAL_GROUP);
        }
        if (sendEnrollmentEmail){
            Accounts.sendEnrollmentEmail(accountId, user.email);
        }
        return true
    },

    "accounts/sendNewUserEmail": function(businessId, userId) {
        let user = Meteor.users.findOne({
            _id: userId,
            businessIds: {"$in" : [businessId]}
        })

        if(user) {
            let userEmail = user.emails[0].address
            if(userEmail) {
                try {
                    Accounts.sendEnrollmentEmail(userId, userEmail);
                    return "Email sent successfully if valid"
                } catch(e) {
                   throw new Meteor.Error(500, e.message);
                }
            } else {
                throw new Meteor.Error(404, 'User does not have an email address');
            }
        } else {
            throw new Meteor.Error(404, 'User does not exist for company');
        }
    },

    "accounts/resetToDefaultUsernameAndPassword": function(businessId, userId) {
        let foundUser = Meteor.users.findOne({
            _id: userId,
            businessIds: {"$in" : [businessId]}
        })

        if(foundUser) {
          let userFirstName = foundUser.profile.firstname || ""
          let userLastName = foundUser.profile.lastname || ""
          //--
          userFirstName = userFirstName.trim()
          userLastName = userLastName.trim()
          //--
          let defaultUsername = userFirstName + "." + userLastName
          defaultUsername = defaultUsername.toLowerCase()

          Meteor.users.update(foundUser._id, {$set: {customUsername: defaultUsername}})
          Accounts.setPassword(foundUser._id, "123456")
          return defaultUsername
        } else {
            throw new Meteor.Error(404, 'User does not exist for company');
        }
    },
    "accounts/resetToDefaultPassword": function(businessId, userId) {
        let foundUser = Meteor.users.findOne({
            _id: userId,
            businessIds: {"$in" : [businessId]}
        })

        if(foundUser) {
          Accounts.setPassword(foundUser._id, "123456")

        } else {
            throw new Meteor.Error(404, 'User does not exist for company');
        }
    },

    /*
     * invite new admin users
     * (not consumers) to secure access in the dashboard
     * to permissions as specified in packages/roles
     */
    "accounts/inviteTenantMember": function (tenantId, email, name) {
        if (!Core.hasAdminAccess()) {
            throw new Meteor.Error(403, "Access denied");
        }
        let currentUserName;
        let tenant;
        let token;
        let user;
        let userId;
        check(tenantId, String);
        check(email, String);
        check(name, String);
        this.unblock();
        tenant = Tenants.findOne(tenantId);

        if (!Core.hasOwnerAccess()) {
            throw new Meteor.Error(403, "Access denied");
        }

        Core.configureMailUrl();

        if (tenant && email && name) {
            let currentUser = Meteor.user();
            if (currentUser) {
                if (currentUser.profile) {
                    currentUserName = currentUser.profile.name;
                } else {
                    currentUserName = currentUser.username;
                }
            } else {
                currentUserName = "Admin";
            }

            user = Meteor.users.findOne({
                "emails.address": email
            });

            if (!user) {
                userId = Accounts.createUser({
                    email: email,
                    username: name
                });
                user = Meteor.users.findOne(userId);
                if (!user) {
                    throw new Error("Can't find user");
                }
                token = Random.id();
                Meteor.users.update(userId, {
                    $set: {
                        "services.password.reset": {
                            token: token,
                            email: email,
                            when: new Date()
                        }
                    }
                });
                SSR.compileTemplate("tenantMemberInvite", Assets.getText("server/emailTemplates/tenantMemberInvite.html"));
                try {
                    Email.send({
                        to: email,
                        from: currentUserName + " <" + tenant.emails[0] + ">",
                        subject: "You have been invited to join " + tenant.name,
                        html: SSR.render("tenantMemberInvite", {
                            homepage: Meteor.absoluteUrl(),
                            tenant: tenant,
                            currentUserName: currentUserName,
                            invitedUserName: name,
                            url: Accounts.urls.enrollAccount(token)
                        })
                    });
                } catch (_error) {
                    throw new Meteor.Error(403, "Unable to send invitation email.");
                }
            } else {
                SSR.compileTemplate("tenantMemberInvite", Assets.getText("server/emailTemplates/tenantMemberInvite.html"));
                try {
                    Email.send({
                        to: email,
                        from: currentUserName + " <" + tenant.emails[0] + ">",
                        subject: "You have been invited to join the " + tenant.name,
                        html: SSR.render("tenantMemberInvite", {
                            homepage: Meteor.absoluteUrl(),
                            tenant: tenant,
                            currentUserName: currentUserName,
                            invitedUserName: name,
                            url: Meteor.absoluteUrl()
                        })
                    });
                } catch (_error) {
                    throw new Meteor.Error(403, "Unable to send invitation email.");
                }
            }
        } else {
            throw new Meteor.Error(403, "Access denied");
        }
        return true;
    },

    /*
     * send an email to consumers on sign up
     */
    "accounts/sendWelcomeEmail": function (tenantId, userId) {
        let email;
        check(tenant, Object);
        this.unblock();
        email = Meteor.user(userId).emails[0].address;
        Core.configureMailUrl();
        SSR.compileTemplate("welcomeNotification", Assets.getText("server/emailTemplates/welcomeNotification.html"));
        Email.send({
            to: email,
            from: tenant.emails[0],
            subject: "Welcome to " + tenant.name + "!",
            html: SSR.render("welcomeNotification", {
                homepage: Meteor.absoluteUrl(),
                tenant: tenant,
                user: Meteor.user()
            })
        });
        return true;
    },


    /*
     * accounts/addUserPermissions
     * @param {Array|String} permission
     *               Name of role/permission.  If array, users
     *               returned will have at least one of the roles
     *               specified but need not have _all_ roles.
     * @param {String} [group] Optional name of group to restrict roles to.
     *                         User"s Roles.GLOBAL_GROUP will also be checked.
     * @returns {Boolean} success/failure
     */
    "accounts/addUserPermissions": function (userId, permissions, group) {
        if (!Core.hasAdminAccess()) {
            throw new Meteor.Error(403, "Access denied");
        }
        check(userId, Match.OneOf(String, Array));
        check(permissions, Match.OneOf(String, Array));
        check(group, Match.Optional(String));
        this.unblock();
        try {
            return Roles.addUsersToRoles(userId, permissions, group);
        } catch (error) {
            return Core.Log.info(error);
        }
    },

    /*
     * accounts/removeUserPermissions
     */
    "accounts/removeUserPermissions": function (userId, permissions, group) {
        if (!Core.hasAdminAccess()) {
            throw new Meteor.Error(403, "Access denied");
        }
        check(userId, String);
        check(permissions, Match.OneOf(String, Array));
        check(group, Match.Optional(String, null));
        this.unblock();
        try {
            return Roles.removeUsersFromRoles(userId, permissions, group);
        } catch (error) {
            Core.Log.info(error);
            throw new Meteor.Error(403, "Access Denied");
        }
    },

    /*
     * accounts/setUserPermissions
     */
    "accounts/setUserPermissions": function (userId, permissions, group) {
        if (!Core.hasAdminAccess()) {
            throw new Meteor.Error(403, "Access denied");
        }
        check(userId, String);
        check(permissions, Match.OneOf(String, Array));
        check(group, Match.Optional(String));
        this.unblock();
        try {
            return Roles.setUserRoles(userId, permissions, group);
        } catch (error) {
            return Core.Log.info(error);
        }
    },

    "accounts/getUsers": function (searchText, options) {
        this.unblock();

        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }

        options = options || {};
        options.limit = 10;
        options.fields = {
            "profile.fullName": 1
        };
        options.sort = { name: 1 };

        if(searchText && searchText.length > 0) {
            var regExp = Core.buildRegExp(searchText);
            var selector =
            { $or: [
                {"profile.fullName": regExp},
                {"salesProfile.originCode": regExp}
            ]};
            return Meteor.users.find(selector, options).fetch();
        }
    },
    /*
     * accounts/updateServiceConfiguration
     */
    "accounts/updateServiceConfiguration": (service, fields) => {
        check(service, String);
        check(fields, Array);
        const dataToSave = {};

        _.each(fields, function (field) {
            dataToSave[field.property] = field.value;
        });

        if (Core.hasPermission(["dashboard/accounts"])) {
            return ServiceConfiguration.configurations.upsert({
                service: service
            }, {
                $set: dataToSave
            });
        }
        return false;
    },

    /*
     * Send reset email
     */
    "accounts/sendResetPasswordEmail": (email) => {
        let user = Accounts.findUserByEmail(email);

        if(!user)
            throw new Meteor.Error(404, "User not found");

        try {
            Accounts.sendResetPasswordEmail(user._id, email);
            return true;
        } catch (error) {
            Core.Log.info(error);
        }
    },

    "accountCreate": function (user, sendEnrollmentEmail) {
        check(user, Object);
        check(sendEnrollmentEmail, Boolean);
        //this method is an unauthenticated method that allows creation of defualt tenant users
        let foundEmail =  Meteor.users.findOne({"emails.address": user.email});
        if (foundEmail){
            throw new Meteor.Error(404, "Email already exists");
        }

        let options = {};

        options.email = user.email; // temporary
        options.firstname = user.firstName;
        options.lastname =  user.lastName;
        options.tenantId = Core.getTenantId(Meteor.userId());
        options.roles = user.roles;
        options.employeenumber = Core.schemaNextSeqNumber('employee', options.tenantId);

        let accountId = Accounts.createUser(options);
        if (sendEnrollmentEmail){
            Accounts.sendEnrollmentEmail(accountId, user.email);
        }
        return true
    }
});
