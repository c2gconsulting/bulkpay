/**
 *  Entity Object Methods
 */
Meteor.methods({
    "entityObject/import":  function(position) {
        console.log('this.userId', this.userId)
        const positionCondition = [{name: position.name}, { 'properties.code': position.properties.code }];
        const positionFound = EntityObjects.findOne({ $and: positionCondition })
        console.log('positionFound', positionFound)
        try {
            if (positionFound) {
                return EntityObjects.update({ $and: positionCondition }, { $set: position })
            } else {
                return EntityObjects.insert(position)
            }
        } catch (error) {
            console.log('entityObject/import - error', error)
            // throw new Meteor.Error(401, error.message || error);
        }
    },

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

        if(obj.name.indexOf(',') !== -1) {
            let entityNamesInName = obj.name.split(',')
            entityNamesInName.forEach(anEntityName => {
                //console.log(`Entity name: ${anEntityName}`)
                if(anEntityName.length > 0) {
                    EntityObjects.insert({
                        parentId:obj.parentId,
                        name: anEntityName,
                        otype:obj.otype, businessId: obj.businessId,
                        order: order,properties:obj.properties
                    });
                }
            })
        } else {
            EntityObjects.insert({
                parentId:obj.parentId,
                name:obj.name,
                otype:obj.otype, businessId: obj.businessId,
                order: order,properties:obj.properties
            });
        }

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
    "entityObject/update": function(id, entity){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);

        //--
        console.log("entity to update: " + JSON.stringify(entity))

        EntityObjects.update({_id:id}, {$set:entity});
    },
    "entityObject/getNodeChildren": function(entity){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        let children = EntityObjects.find({$query:{parent: entity}, $orderby:{order:1}});
        return children;
    },
    "entityObject/getDecendants": function(entity){
        //get decendants in tree structure. refactor this method
        let data;
        let stack=[];
        let cursor = EntityObjects.findOne({_id: entity});
        let object = {};
        object.id= cursor._id,
        object.className = "asso-" + cursor._id+ " middle-level";
        object.name = cursor.name;
        object.otype = cursor.otype;
        stack.push(object);
        let i = 0;
        while (stack.length>0){
            i += 1;
            let currentnode = stack.pop();
            //let children = EntityObjects.find({parentId:currentnode._id});
            //addclassname for current node useful in the org tree
            let id= currentnode._id || currentnode.id;
            currentnode.className = "asso-" + id+ " middle-level";
            //currentnode.children = EntityObjects.find({parentId: currentnode._id}).fetch();
            currentnode.children = EntityObjects.aggregate(
                [
                    {
                        $match: {parentId: id}
                    },
                    {
                        $project: {
                            _id: 0,
                            otype: 1,
                            name: 1,
                            id: "$_id"
                        }
                    },
                    {
                        $sort:{order:1}
                    }
                ]
            );
            if(i == 1)
                data = currentnode;
            //doc.children = db.product.find({_id: {$in: doc.children}}).toArray();
            currentnode.children.forEach(function(child){
                stack.push(child);
            })
        }
        return data;

    },
    "entityObject/getBaseCompany": function(businessId){
        //get all objects and children without a parentId as root and return tree
        //check if BU exist and user is autorized to call this function
        let bu = BusinessUnits.find({_id: businessId}).fetch();
        if(bu){
            let object = EntityObjects.find({parentId: null, businessId: businessId});
            let all = {
                'id': "root",
                'className': ' top-level',
                'name': bu[0].name,
                'otype': "Company",
                'children': []
            };
            object.forEach(function(entity){
                Meteor.call("entityObject/getDecendants", entity._id, function(err, res){
                    if(!err)
                        all.children.push(res);
                })
            });
            return all;
        } else{
            throw new Meteor.Error(401, "Business Not Found");
        }

    },
    'getPositionName': function(id){
        let entityObj = EntityObjects.findOne({_id: id})
        if(entityObj) {
            const name = entityObj.name;
            console.log(`position name for ${id} is `, name);
            return name;
        }
        return ""
    },
    "entityObject/updateMaxHoursInDay": function(id, maxHours){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();
        check(id, String);

        //--
        EntityObjects.update({_id:id}, {$set:{
            maxHoursInDayForTimeWriting: maxHours
        }});
    },
});
