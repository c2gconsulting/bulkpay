/**
 *  Project Methods
 */
Meteor.methods({

    "project/createFromSuccessfactors": function(projects) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        this.unblock();

        let projectCodes = Object.keys(projects) || []
        projectCodes.forEach(code => {
            const project = projects[code]

            const foundProject = Projects.findOne({name: code})
            if(foundProject) {
                if(project.description) {
                    Projects.update({_id: foundProject._id}, {$set: {
                        description: project.description
                    }})
                }
            } else {
                Projects.insert(project);
            }
        })
        return true;
    },
    "project/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete and if leave type can be deleted
        if(Core.hasLeaveManageAccess(this.userId)){
            Projects.remove({_id: id});
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized");
        }
    }
});

