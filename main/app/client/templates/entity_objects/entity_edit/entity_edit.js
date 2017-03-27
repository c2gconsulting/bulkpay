/*****************************************************************************/
/* EntityEdit: Event Handlers */
/*****************************************************************************/

import Ladda from 'ladda'

Template.EntityEdit.events({
    'click #createEntity': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#createEntity')[0]);
        l.start();
        const details = {
            name: $('[name="name"]').val(),
            otype: $('[name="otype"]').val(),
            status: $('[name="status"]').val(),
            properties: getProp()
        };
        function getProp(){
           let prop = {};
            prop.supervisor =  $('[name="supervisor"]').val();
            prop.alternateSupervisor =  $('[name="alternateSupervisor"]').val();
            prop.costCenter = $('[name="costCenter"]').val();
            return prop;
        };

        Meteor.call("entityObject/update", tmpl.data.node._id, details, (err, res) => {
            l.stop();
            if(err){
                swal("Update Failed", `Cannot Update object ${name}`, "error");
            } else {
                swal("Successful Update!", `Successfully updated Node Object ${name}`, "success");
                Modal.hide("EntityEdit");
            }
        });
    },
    'change [name=otype]': (e, tmpl ) => {
        if ( $(e.target ).val() === 'Position' ) {
            tmpl.showProp.set(true);
        } else {
            tmpl.showProp.set(false);
        }
        //for unit show costcenters ... refactor code...
        if($(e.target ).val() === 'Unit' ){
            tmpl.ccAssignment.set(true);
        } else{
            tmpl.ccAssignment.set(false);
        }

    }
});

/*****************************************************************************/
/* EntityEdit: Helpers */
/*****************************************************************************/
Template.EntityEdit.helpers({
    'disabled': () => {
        //checks form and enable button when all is complete
        let condition = false;
        if(condition)
            return "disabled";
        return "";
    },
    'currentEntityData': () => {
      return Template.instance().currentEntityData.get();
    },
    'parentName': (parentId) => {
        console.log("Parent id: " + parentId);

        if(parentId){
            return EntityObjects.findOne({_id: parentId}).name;
        }
        let root = Template.instance().isroot.get();
        if(root) {
            return BusinessUnits.findOne().name;
        } else {
            return EntityObjects.findOne().name;
        }
    },
    'checked': (prop) => {
        if(Template.instance().data)
            return Template.instance().data[prop];
        return false;
    },
    'selectedPos': () => {
        return Template.instance().showProp.get();
    },
    'positions': () => {
       return EntityObjects.find({otype: "Position"})
    },
    'unit': () => {
       return Template.instance().ccAssignment.get();
    },
    selected: function (context, val) {
        if(Template.instance().data){
            //get value of the option element
            //check and return selected if the template instce of data.val matches
            return Template.instance().data.node[context] === val ? selected="selected" : '';
        }
    },
    getSelectedSupervisor: function (context, val) {
        if(Template.instance().data){
            //get value of the option element
            //check and return selected if the template instce of data.val matches
            return Template.instance().data.node.properties[context] === val ? selected="selected" : '';
        }
    }
});

/*****************************************************************************/
/* EntityEdit: Lifecycle Hooks */
/*****************************************************************************/
Template.EntityEdit.onCreated(function () {
    //node root means company level parent id = null
    let self = this;
    self.currentEntityData = new ReactiveVar();

    self.showProp = new ReactiveVar();            // For if the selected node has otype "Position"
    self.ccAssignment = new ReactiveVar(true);

    let baseCompany = self.data.node === "root";
    //set reactiveVar to indicate node selection
    self.isroot = new ReactiveVar( baseCompany );
    if(!baseCompany){
        self.subscribe("getEntity", self.data.node._id).wait;
    } else {
    }
    self.subscribe("getPositions", Session.get('context'));
    //--
    self.autorun(function() {
        self.currentEntityData.set(EntityObjects.findOne({_id: self.data.node._id}));
        console.log(`currentEntityData: ${self.currentEntityData.get()}`)

        if(self.currentEntityData.get().otype === "Position") {
           self.showProp.set(true);
           self.ccAssignment.set(false);
        } else if(self.currentEntityData.get().otype === "Unit") {
           self.showProp.set(false);
           self.ccAssignment.set(true);
        } else {
          self.showProp.set(false);
        }
    });
});

Template.EntityEdit.onRendered(function () {
    //init dropdown
    $('select.dropdown').dropdown();

    console.log('template data is ', JSON.stringify(Template.instance().data));

    //$('[name="otype"]').val(Template.instance().data.node.otype);
});

Template.EntityEdit.onDestroyed(function () {

});
