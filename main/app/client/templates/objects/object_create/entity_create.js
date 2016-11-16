/*****************************************************************************/
/* EntityCreate: Event Handlers */
/*****************************************************************************/

import Ladda from 'ladda'
Template.EntityCreate.events({
    'click #createEntity': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#createEntity')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            name: $('[name="name"]').val(),
            parentId: getParent($('[name="level"]:checked').val()),
            otype: $('[name="otype"]').val(),
            status: $('[name="status"]').val()
        };
        function getParent(val) {
            if (!Template.instance().isroot.get()) {
                let entity = EntityObjects.findOne();
                console.log(entity);
                switch (val) {
                    case "sibling":
                        //parent id = entity.parent
                        console.log(entity.parentId, " AS RETURND ", val);
                        return entity.parentId;
                    case  "child":
                        return entity._id;
                        console.log(entity._id, "AS RETURNED ", val);
                }
            }else {
                return null;
            }

        };
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
            console.log("will perform a meteor call method");
            Meteor.call('entityObject/create', details, (err, res) => {
                console.log("about creating entity");
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
        console.log($(e.target).val());
        //if ( $( event.target ).val() === 'show' ) {
        //    template.templateDictionary.set( 'showExtraFields', true );
        //} else {
        //    template.templateDictionary.set( 'showExtraFields', false );
        //}
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
        let root = Template.instance().isroot.get();
        if(root)
            return BusinessUnits.findOne().name;
        return EntityObjects.findOne().name;
    },
    'checked': () => {
        return "checked";
        //check if action is edit and return the previous value
        //if(Template.instance().data)
        //    return Template.instance().data.isBase ? true:false;
        //return false;
    }
});

/*****************************************************************************/
/* EntityCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EntityCreate.onCreated(function () {
    //node root means company level parent id = null
    let self = this;
    let baseCompany = self.data.node === "root";
    //set reactiveVar to indicate node selection
    self.isroot = new ReactiveVar( baseCompany );
    if(!baseCompany){
        self.subscribe("getEntity", self.data.node).wait;
    }


});

Template.EntityCreate.onRendered(function () {
});

Template.EntityCreate.onDestroyed(function () {

});
