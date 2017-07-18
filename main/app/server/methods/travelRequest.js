import _ from 'underscore';


/**
 *  Travel Request Methods
 */
Meteor.methods({
    "TravelRequest/createDraft": function(businessUnitId, travelRequestDoc, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a travel request because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position
        console.log(`userPositionId: ${userPositionId}`)

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties) {
            let supervisorPositionId = userPosition.properties.supervisor
            console.log(`supervisorPositionId: ${supervisorPositionId}`)

            travelRequestDoc.createdBy = Meteor.userId()
            travelRequestDoc.status = 'Draft'
            travelRequestDoc.businessId = businessUnitId
            travelRequestDoc.supervisorPositionId = supervisorPositionId
            if(docId) {
                TravelRequisitions.update(docId, {$set: travelRequestDoc})
            } else{
                TravelRequisitions.insert(travelRequestDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have not supervisor to approve your requisition");
    },
    "TravelRequest/create": function(businessUnitId, travelRequestDoc, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position
        console.log(`userPositionId: ${userPositionId}`)

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties) {
            let supervisorPositionId = userPosition.properties.supervisor
            console.log(`supervisorPositionId: ${supervisorPositionId}`)

            travelRequestDoc.createdBy = Meteor.userId()
            travelRequestDoc.businessId = businessUnitId
            travelRequestDoc.supervisorPositionId = supervisorPositionId
            travelRequestDoc.status = 'Pending'

            if(docId) {
                TravelRequisitions.update(docId, {$set: travelRequestDoc})
            } else {
                TravelRequisitions.insert(travelRequestDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you do not have a supervisor to approve your requisition");
    },
    "TravelRequest/approve": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to approve a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position
        console.log(`userPositionId: ${userPositionId}`)

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc.supervisorPositionId === userPositionId) {
            TravelRequisitions.update(docId, {$set: {status: 'Treated'}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to approve requisition.")
        }
    },
    "TravelRequest/reject": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to reject a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc.supervisorPositionId === userPositionId) {
            TravelRequisitions.update(docId, {$set: {status: 'Rejected'}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to approve requisition.")
        }
    },
    "TravelRequest/markAsSeen": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc.createdBy === Meteor.userId()) {
            TravelRequisitions.update(docId, {$set: {isStatusSeenByCreator: true}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that requisition")
        }
    }
});
