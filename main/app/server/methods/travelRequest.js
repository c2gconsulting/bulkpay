import _ from 'underscore';



let TravelRequestHelper = {
    sendRequisitionCreated: function(supervisorFullName, createdByEmail, createdByFullName, 
        description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
        console.log(`inside sendRequisitionCreated`)
        try {
            SSR.compileTemplate("travelRequestNotification", Assets.getText("emailTemplates/travelRequestNotification.html"));
            Email.send({
                to: createdByEmail,
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                subject: "Travel Request created!",
                html: SSR.render("travelRequestNotification", {
                    user: supervisorFullName,
                    createdBy: createdByFullName,
                    description: description,
                    unit: unitName,
                    dateRequired: dateRequired,
                    reason: requisitionReason,
                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    }
}

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

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties 
            && (userPosition.properties.supervisor || userPosition.properties.alternateSupervisor)) {
            let supervisorPositionId = userPosition.properties.supervisor || ""
            let alternateSupervisorPositionId = userPosition.properties.alternateSupervisor || ""

            travelRequestDoc.createdBy = Meteor.userId()
            travelRequestDoc.businessId = businessUnitId
            travelRequestDoc.supervisorPositionId = supervisorPositionId
            travelRequestDoc.alternativeSupervisorPositionId = alternateSupervisorPositionId
            travelRequestDoc.status = 'Pending'

            if(docId) {
                TravelRequisitions.update(docId, {$set: travelRequestDoc})
            } else {
                TravelRequisitions.insert(travelRequestDoc)
            }
            //--
            let createdBy = Meteor.users.findOne(Meteor.userId())
            
            let createdByEmail = createdBy.emails[0].address;
            let createdByFullName = createdBy.profile.fullName
            let unit = EntityObjects.findOne({_id: travelRequestDoc.unitId, otype: 'Unit'})
            let unitName = unit.name
            let dateRequired = ''
            if(travelRequestDoc.dateRequired) {
                dateRequired = moment(travelRequestDoc.dateRequired).format('DD/MM/YYYY')
            }
            let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/travelrequests/approvalslist`
            //--
            let supervisors = []
            let alternateSupervisors = []

            if(supervisorPositionId) {
                supervisors = Meteor.users.find({
                    'employeeProfile.employment.position': supervisorPositionId
                }).fetch()
            }

            if(alternateSupervisorPositionId) {
                alternateSupervisors = Meteor.users.find({
                    'employeeProfile.employment.position': alternateSupervisorPositionId
                }).fetch()
            }
            if(supervisors && supervisors.length > 0) {
                supervisors.forEach(aSupervisor => {
                    TravelRequestHelper.sendRequisitionCreated(
                        aSupervisor.profile.fullName,
                        createdByEmail, createdByFullName, 
                        travelRequestDoc.description, 
                        unitName,
                        dateRequired,
                        travelRequestDoc.requisitionReason,
                        approvalsPageUrl)
                })
            }
            if(alternateSupervisors && alternateSupervisors.length > 0) {
                alternateSupervisors.forEach(aSupervisor => {
                    TravelRequestHelper.sendRequisitionCreated(
                        aSupervisor.profile.fullName,
                        createdByEmail, createdByFullName, 
                        travelRequestDoc.description, 
                        unitName,
                        dateRequired,
                        travelRequestDoc.requisitionReason,
                        approvalsPageUrl)
                })
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you do not have a supervisor to approve your requisition");
    },
    "TravelRequest/approve": function(businessUnitId, docId) {
        if(!this.userId && !Core.hasTravelRequisitionApproveAccess(this.userId)){
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
    "TravelRequest/reject": function(businessUnitId, docId) {
        if(!this.userId && !Core.hasTravelRequisitionApproveAccess(this.userId)){
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
