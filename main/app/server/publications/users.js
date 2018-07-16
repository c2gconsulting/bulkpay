

/**
 * Employee
 * Publish profile of Employee
 *
 * @params {String} business id -  view users for this business
 */

Core.publish("employees", function (node,businessId) {
    this.unblock(); // eliminate wait time impact

    let selector = {};
    let nodeSelector = {};

    node = node == "root"? null : node;
    nodeSelector = {$and: [{"parentId": node},{otype: "Position"},{businessId: businessId}]};

    //get all entities of node
    let entities = EntityObjects.find(nodeSelector).map(x => {
        return x._id;
    });
    selector = { "businessIds": businessId, "employeeProfile.position": {$in: entities}, "employee":true };

    if (entities){
        //return all meteor users in that position
        return [Meteor.users.find(selector, {
            fields: {
                "emails": true,
                "employee": true,
                "profile": true,
                "employeeProfile": true,
                "username": true
            }
        }),UserImages.find({})];
    } else {
        return this.ready();
    }

});
Meteor.publish("allEmployees", function (businessId) {
    this.unblock(); // eliminate wait time impact
    let selector = { "businessIds": businessId, employee: true };
    console.log('selector:');
    console.log(selector)
    check(businessId, String);
    console.log('businessId1:');
    console.log(businessId)
    if (businessId){
        console.log('businessId2:');
        console.log(businessId)
        //return all meteor users in that position
        let employees = Meteor.users.find(selector, {
            fields: {
                "_id": true,
                "emails": true,
                "employee": true,
                "profile": true,
                "employeeProfile": true,
                "username": true,
                "roles": true,
                "customUsername": true,
                "personalEmailAddress": true,
                "directSupervisorId": true,
                "directAlternateSupervisorId": true
            }
        })
        return [employees, UserImages.find({})];
    } else {
        return this.ready();
    }

});


Core.publish("allEmployeesForInfiniteScroll", function (businessId, limit, sort) {
    this.unblock(); // eliminate wait time impact

    let selector = { "businessIds": businessId, employee: true };
    check(businessId, String);

    if (businessId){
        //return all meteor users in that position
        let employees = Meteor.users.find(selector, {
            fields: {
                "_id": true,
                "emails": true,
                "employee": true,
                "profile": true,
                "employeeProfile": true,
                "username": true,
                "roles": true,
                "customUsername": true,
                "personalEmailAddress": true,
                "directSupervisorId": true,
                "directAlternateSupervisorId": true
            },
            limit: limit,
            sort: sort
        })
        return [employees, UserImages.find({})];
    } else {
        return this.ready();
    }
});


Core.publish("subUsers", function (businessId) {
    this.unblock(); // eliminate wait time impact
    check(businessId, String);
    let currentId = this.userId;
    let user = Meteor.users.findOne({_id: currentId});

    if (user && user.employeeProfile.employment && user.employeeProfile.employment.position){
       let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
            return x._id
        });
        //return all meteor users in that position
        let selector = { "businessIds": businessId, employee: true, "employeeProfile.employment.position": {$in: positions} };
        return [Meteor.users.find(selector, {
            fields: {
                "emails": true,
                "employee": true,
                "profile": true,
                "employeeProfile": true,
                "username": true
            }
        }),UserImages.find({})];
    } else {
        return this.ready();
    }

});



/**
 * Users
 * Publish profile of  users
 *
 */

Core.publish("Users", function (sort, limit) {

    if (Core.hasAdminAccess(this.userId)) {
        sort = sort || {};
        limit = limit || 24;
        return Meteor.users.find({}, {
            fields: {
                "emails": true,
                "profile": true,
                "salesProfile": true,
                "username": true,
                "createdAt": true
            }, sort: sort, limit: limit
        });
    }
    return this.ready();
});

/**
 * User
 * Publish profile of  user
 *
 */

Core.publish("User", function (id) {
    if (Core.hasAdminAccess(this.userId) || this.userId === id) {
        return Meteor.users.find({_id: id});
    } else {
        return this.ready();
    }
});

Core.publish("activeEmployees", function (businessId) {
    this.unblock(); // eliminate wait time impact
    let selector = { 'businessIds': businessId, 'employee': true, 'employeeProfile.employment.status': "Active" };
    check(businessId, String);
    if (businessId) {
        //return all meteor users in that position
        return Meteor.users.find(selector, {
            fields: {
                "emails": true,
                "employee": true,
                "profile": true,
                "employeeProfile": true,
                "username": true
            }
        });
    } else {
        return this.ready();
    }

});
