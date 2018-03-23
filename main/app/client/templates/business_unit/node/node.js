/*****************************************************************************/
/* Oneoff: Event Handlers */
/*****************************************************************************/
Template.Node.events({
    'click #delete-bu': function(event, tmpl){
        event.preventDefault();
        //Check user is authorized to delete business unit
        let bu = this._id;
        //swal("are you sure", "do you want to delete ")
        swal({
                title: "Are you sure?",
                text: "All Objects Under this Business will be deleted!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                Meteor.call('businessunit/delete', bu, function(err, res){
                    if(err){
                        swal("Error!", "Cannot delete company", "error");
                    } else {
                        //swal("Good job!", "You clicked the button!", "success");
                        //Router.go('businessunits');
                        swal("Deleted!", "Company Deleted", "success");
                    }

                });


            });
    },
    'click .addnode': (e, tmpl) => {
        e.preventDefault();
        let selectedNode = Session.get('node');
        console.log(`Selected node for new member: ${selectedNode}`)
        
        Modal.show('EntityCreate', {node: selectedNode, action: "create"});
    },
    'click #saveLocationMaxHours': (e, tmpl) => {
        e.preventDefault();

        let maxHoursInDay = $('#maxHoursInDay').val()
        if(!isNaN(parseFloat(maxHoursInDay))) {
            maxHoursInDay = parseFloat(maxHoursInDay)

            let selectedNode = Session.get('node');
            console.log(`Selected node for new member: ${selectedNode}`)
     
            Meteor.call('entityObject/updateMaxHoursInDay', selectedNode, maxHoursInDay, (err, res) => {
                console.log(`Err: `, err)
                if(!err) {
                    swal("Maximum hours in day for Time Writing", "Save successful" , "success");
                }
            })
        }
    },
});

/*****************************************************************************/
/* Node: Helpers */
/*****************************************************************************/
Template.Node.helpers({
    'node': () => {
        let node = Session.get('node');
        let nodeProp;
        if(node === "root"){
            node = null;
            let company = BusinessUnits.findOne();
            nodeProp = {};   //simulate entity and with Root bu
            nodeProp.name = company.name; nodeProp.otype = "Company";
        } else {
            nodeProp = EntityObjects.findOne({_id: node}) || {};
        }
        nodeProp.children = EntityObjects.find({parentId: node}).fetch();
        console.log(nodeProp);
        return nodeProp;
    },
    'icon': (type) => {
        switch (type){
            case "Unit":
                return "fa-sitemap";
            case "Position":
                return "fa-star";
            case "Location":
                return "fa-map-marker";
            case "Job":
                return "fa-pie-chart";
            case "Person":
                return "fa-user"
        };

    },
    'isChildAUnit': (type) => {
        return type === "Unit" ? true : false;
    },
    'businessid': () => {
        return Session.get('context');
    },
    'employees': () => {
        return Meteor.users.find({employee: true});
    },
    'positionName': (positionId) => {
        let entity = EntityObjects.findOne({"_id": positionId})
        if(entity) {
            return entity.name
        }
    },
    'unitHead': (positionId) => {
        return !!EntityObjects.findOne({"_id": positionId}).unitHead == true? "hod":"";
    },
    "images": (id) => {
        return UserImages.findOne({_id: id});

    },
    'hasPayrollAccess': function() {
        let userId = Meteor.userId()

        return Core.hasPayrollAccess(userId);
    },
    'isTwoStepApprovalEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTwoStepApprovalEnabled
        }
    },
    'maxHoursInDayForTimeWritingPerLocationEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.maxHoursInDayForTimeWritingPerLocationEnabled
        }
    }
});

/*****************************************************************************/
/* Oneoff: Lifecycle Hooks */
/*****************************************************************************/
Template.Node.onCreated(function () {
    var self = this;

    self.businessUnitCustomConfig = new ReactiveVar();
    let businessUnitId = Session.get('context')

    //get session value for node and determine subscription
   self.autorun(function(){
       let node = Session.get('node');
       let bu = Session.get('context');
       if(node === "root")
           node = null;
       self.subscribe("getSupervisors", node);
       self.subscribe("getChildrenEntityObject", node, bu);
       self.subscribe("employees", node, bu);

       //also subscribe to all employees in the department
        
        //console.log("Member node template data: " + JSON.stringify(Template.instance().data));
        
        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
            if(!err) {
                self.businessUnitCustomConfig.set(res)
            }
        })
   });
});

Template.Node.onRendered(function () {
});

Template.Node.onDestroyed(function () {
});

//----------

Template.MemberNode.events({

  'click .deletenode': (e, tmpl) => {
      e.preventDefault();
      let selectedNodeElement = e.currentTarget;
      let entityId = selectedNodeElement.getAttribute("name");
      e.stopPropagation();

      swal({
          title: "Are you sure?",
          text: "This node will only be deleted if there are no active children",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
      }, function(){
          Meteor.call("entityObject/delete", entityId, function(err,res){
              if(!err){
                  console.log(res);
                  Tracker.flush();
                  swal("Deleted!", "Node deleted" , "success");
                  window.location.reload()
              } else {
                  console.log(err);
                  swal("Deleted!", err , "error");
              }
          })

      });
  },
  'click .editnode': (e, tmpl) => {
      e.preventDefault();

      let selectedNodeElement = e.currentTarget;
      let entityId = selectedNodeElement.getAttribute("name");
      e.stopPropagation();

      let selectedNode = EntityObjects.findOne({"_id": entityId})
      Modal.show('EntityEdit', {node: selectedNode});
  },
  'click .selectedNodeChildUnit': (e, tmpl) => {
      e.preventDefault();
      let userId = Meteor.userId()

      if(Core.hasPayrollAccess(userId)) {
            let selectedNodeElement = e.currentTarget;
            let unitId = selectedNodeElement.getAttribute("name");

            Modal.show('BusinessUnitActivities', unitId);
      }
  },
  'click .selectedLeafNode': (e, tmpl) => {
      e.preventDefault();
      let selectedNodeElement = e.currentTarget;
      let entityId = selectedNodeElement.getAttribute("name");

      let nodeProp = EntityObjects.findOne({_id: entityId});

      swal(nodeProp.name, nodeProp.otype , "success");
  }
});

Template.MemberNode.helpers({
  'isChildAUnit': (type) => {
      return type === "Unit" ? true : false;
  },
  'icon': (type) => {
      switch (type){
          case "Unit":
              return "fa-sitemap";
          case "Position":
              return "fa-star";
          case "Location":
              return "fa-map-marker";
          case "Job":
              return "fa-pie-chart";
          case "Person":
              return "fa-user"
      };
  }
});

Template.MemberNode.onCreated(function () {
    var self = this;
    
    //console.log("Member node template data: " + JSON.stringify(Template.instance().data));    
    self.autorun(function(){
    });
});

Template.MemberNode.onRendered(function () {
});

Template.MemberNode.onDestroyed(function () {
});
