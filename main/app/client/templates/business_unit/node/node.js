/*****************************************************************************/
/* Oneoff: Event Handlers */
/*****************************************************************************/
Template.Node.events({
});

/*****************************************************************************/
/* Oneoff: Helpers */
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
    'nodeProperties': () => {

    },

    'icon': (type) => {
        switch (type){
            case "Unit":
                return "fa-sitemap";
            case "Position":
                return "fa-vcard";
            case "Location":
                return "fa-map-marker";
            case "Job":
                return "fa-pie-chart";
            case "Person":
                return "fa-user"
        };

    },
    'businessid': () => {
        return Session.get('context');
    }
});

/*****************************************************************************/
/* Oneoff: Lifecycle Hooks */
/*****************************************************************************/
Template.Node.onCreated(function () {
    var self = this;
    //get session value for node and determine subscription
   self.autorun(function(){
       let node = Session.get('node');
       let bu = Session.get('context');
       if(node === "root")
           node = null;
       self.subscribe("getChildrenEntityObject", node, bu);
   });
});

Template.Node.onRendered(function () {
});

Template.Node.onDestroyed(function () {
});
