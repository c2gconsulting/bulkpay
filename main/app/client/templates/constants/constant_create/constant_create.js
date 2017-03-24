/*****************************************************************************/
/* ConstantCreate: Event Handlers */
/*****************************************************************************/
Template.ConstantCreate.events({
});

/*****************************************************************************/
/* ConstantCreate: Helpers */
/*****************************************************************************/
Template.ConstantCreate.helpers({
    'businessId': () => {
        return BusinessUnits.findOne()._id;
    },
    'status': () => {
        return [{label: "Active", value: "Active"},{label: "Inactive", value: "Inactive"}];
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    },
    'formType': () => {
        if(Template.instance().data)
            return "updateConstantForm";
        return "ConstantForm";
    },
    'data': () => {
        return Template.instance().data ? true:false;
    }
});



/*****************************************************************************/
/* ConstantCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.ConstantCreate.onCreated(function () {

});

Template.ConstantCreate.onRendered(function () {
    $('div#constantCodeDiv label').append('<span class="asterisk important-input">*</span>')
    $('div#constantTitleDiv label').append('<span class="asterisk important-input">*</span>')
    $('div#constantValueDiv label').append('<span class="asterisk important-input">*</span>')
});

Template.ConstantCreate.onDestroyed(function () {
});
