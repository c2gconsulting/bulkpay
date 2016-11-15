/**
 *  Entity Object Methods
 */
Meteor.methods({

    "entityObject/create": function(obj) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        console.log(obj);

        try {
            check(obj, Core.Schemas.EntityObject);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the Entity Object. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have entityObject create permission
        this.unblock();

        let existingelemscount = EntityObjects.find({parentId:obj.parentId}).count();
        let order = (existingelemscount+1)*10;
        EntityObjects.insert({parentId:obj.parentId, name:obj.name, otype:obj.otype, businessId: obj.businessId, order: order});
        //{ "_id" : "LG", "parent" : "Electronics", "someadditionalattr" : "test", "order" : 40 }
        return true;
    },
    "entityObject/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete and all dependent objects are cleared
        //check if any active child and prevent delete
        let descendants=[];
        let stack=[];
        let object = EntityObjects.findOne({_id: id});
        stack.push(object);
        if(object){
            while (stack.length>0){
                let currentnode = stack.pop();
                let children = EntityObjects.find({parentId:currentnode._id});
                children.forEach(function(child){
                    if(child.status == "Active")
                        throw new Meteor.Error(401, "Object cannot be deleted as there are active children");
                    stack.push(child);
                })
            }
            EntityObjects.remove({_id: id});
            return true;
        } else
            return false;


    },
    "entityObject/update": function(entity){
        existingelemscount = EntityObjects.find({parent:entity}).count();
        neworder = (existingelemscount+1)*10;
        EntityObjects.update({_id:entity},{$set:{parent:'Cell_Phones_and_Smartphones', order:neworder}}); //set all parameters
        //{ "_id" : "LG", "order" : 60, "parent" : "Cell_Phones_and_Smartphones", "someadditionalattr" : "test" }
    },
    "entityObject/getNodeChildren": function(entity){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        let children = EntityObjects.find({$query:{parent: entity}, $orderby:{order:1}});
        return children;
    },
    "entityObject/getDecendants": function(entity){
        //get decendants in tree structure.
        let data;
        let descendants=[];
        let stack=[];
        let object = EntityObjects.findOne({_id: entity});
        console.log(object);
        stack.push(object);
        let i = 0;
        while (stack.length>0){
            i += 1;
            let currentnode = stack.pop();
            //let children = EntityObjects.find({parentId:currentnode._id});
            currentnode.children = EntityObjects.find({parentId: currentnode._id}).fetch();
            if(i == 1)
                data = currentnode;
            //doc.children = db.product.find({_id: {$in: doc.children}}).toArray();
            currentnode.children.forEach(function(child){
                //descendants.push(child);
                stack.push(child);
            })
        }
        return data;

    }

});

