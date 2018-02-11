/*****************************************************************************/
/* EntityCreate: Event Handlers */
/*****************************************************************************/

import Ladda from 'ladda'
Template.EntityCreate.events({
    'click #createEntity': (e, tmpl) => {
        e.preventDefault();
        let entityNameElem = $('[name="name"]')
        let entityNameParentElem = entityNameElem.parent()
        let tokenFieldShadowInput = entityNameParentElem.find('.token-input').val()

        let nameOfEntity = tokenFieldShadowInput || entityNameElem.val();
        console.log(`Name of entity: ${JSON.stringify(nameOfEntity)}`)

        if(nameOfEntity.length < 1) {
            swal("Validation error", `Entity name should not be empty`, "error");
            return
        }

        const details = {
            businessId: Session.get('context'),
            name: nameOfEntity,
            parentId: getParent($('[name="level"]:checked').val()),
            otype: $('[name="otype"]').val(),
            status: $('[name="status"]').val(),
            properties: getProp(),
            createdBy: Meteor.userId()
        };
        function getParent(val) {
            if (!Template.instance().isroot.get()) {
                let selectedNodeId = Template.instance().data.node
                let selectedNodeData = EntityObjects.findOne({_id: selectedNodeId})

                switch (val) {
                    case "sibling":
                        //parent id = entity.parent
                        return selectedNodeData.parentId;
                    case  "child":
                        return selectedNodeData._id;
                }
            }else {
                return null;
            }

        };
        function getProp(){
           let prop = {};
            prop.supervisor =  $('[name="supervisor"]').val();
            prop.alternateSupervisor =  $('[name="alternateSupervisor"]').val();
            prop.costCenter = $('[name="costCenter"]').val();
            return prop;
        };

        let l = Ladda.create(tmpl.$('#createEntity')[0]);
        l.start();

        if(tmpl.data.edit === "true"){//edit action for updating paytype
            const ptId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("paytype/update", tmpl.data._id, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update object ${name}`, "error");
                } else {
                    swal("Successful Update!", `Succesffully update Node Object ${name}`, "success");
                    Modal.hide("EntityCreate");
                }
            });

        } else{ //New Action for creating paytype}
            Meteor.call('entityObject/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('EntityCreate');
                    swal({
                        title: "Success",
                        text: `Node Object Created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                    window.location.reload()
                } else {
                    err = JSON.parse(err.details);
                    // add necessary handler on error
                    //use details from schema.key to locate html tag and error handler
                    _.each(err, (obj) => {
                        $('[name=' + obj.name +']').addClass('errorValidation');
                        $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);

                    })
                }
            });
        }
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
/* EntityCreate: Helpers */
/*****************************************************************************/
Template.EntityCreate.helpers({
    'disabled': () => {
        //checks form and enable button when all is complete
        let condition = false;
        if(condition)
            return "disabled";
        return "";
    },
    'edit': () => {
        return Template.instance().data.action == "edit";
        //use ReactiveVar or reactivedict instead of sessions..
    },
    'parentName': () => {
        let selectedNodeData = EntityObjects.findOne({_id: Template.instance().data.node})

        return selectedNodeData ? selectedNodeData.name : ""
        // let parentId = selectedNodeData.parentId
        // console.log("Parent id: " + parentId);

        // if(parentId){
        //     return EntityObjects.findOne({_id: parentId}).name;
        // }
        // let root = Template.instance().isroot.get();
        // if(root) {
        //     return BusinessUnits.findOne().name;
        // } else {
        //     return EntityObjects.findOne().name;
        // }
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
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    }
});

/*****************************************************************************/
/* EntityCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EntityCreate.onCreated(function () {
    //node root means company level parent id = null
    let self = this;
    self.showProp = new ReactiveVar();
    self.ccAssignment = new ReactiveVar(true);
    let baseCompany = self.data.node === "root";
    //set reactiveVar to indicate node selection
    self.isroot = new ReactiveVar( baseCompany );

    let entitySelectedSubscription = null

    if(!baseCompany){
        entitySelectedSubscription = self.subscribe("getEntity", self.data.node);
    }
    self.subscribe("getPositions", Session.get('context'));

    self.autorun(function() {
        if(entitySelectedSubscription && entitySelectedSubscription.ready()) {
            let selectedNodeData = EntityObjects.findOne({_id: self.data.node})
            self.subscribe("getEntity", selectedNodeData.parentId);
        }
    })

});

Template.EntityCreate.onRendered(function () {
    //init dropdown
    $('select.dropdown').dropdown();
    console.log('template data is ', Template.instance().data);

    $('#new-entity-name').tokenfield()
});

Template.EntityCreate.onDestroyed(function () {

});
