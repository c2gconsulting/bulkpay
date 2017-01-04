/**
 *  paygrade Methods
 */
Meteor.methods({

    /* paygrade
     */

    "payrun/process": function(obj){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(paygrade, Core.Schemas.PayGrade);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the paygrades. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let pgId = PayGrades.insert(paygrade);
        return {_id: pgId};
    },
    "paygrade/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        PayGrades.remove({_id: id});
        return true;
    },
    "paygrade/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = PayGrades.update(selector, {$set: details} );
        return result;
    }

});

