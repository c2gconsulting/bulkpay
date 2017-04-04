/*****************************************************************************/
/* sapb1config: Event Handlers */
/*****************************************************************************/

Template.sapb1config.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var sapServerIpAddress = $('#sapServerIpAddress').val();
        var sapServerPort = $('#sapServerPort').val();
        var sapServerDatabaseName = $('#sapServerDatabaseName').val();

        if(sapServerIpAddress.length < 1) {
            swal("Validation error", `Please enter the I.P address of your SAP BusinessOne server`, "error");
            return
        } else if(sapServerDatabaseName.length < 1) {
            swal("Validation error", `Please enter the Database name of your company on your SAP BusinessOne server`, "error");
            return
        }
        //--
        let sapConfig = {
            ipAddress : sapServerIpAddress,
            databaseName : sapServerDatabaseName
        }

        let businessUnitId = Session.get('context')
        Meteor.call('sapB1integration/testConnectionToWindowsService', businessUnitId, sapConfig, (err, res) => {
            if (!err){
                console.log(`Test connection response: ${JSON.stringify(res)}`)
            } else {
                swal("Server error", `Please try again at a later time`, "error");
            }
        });
    }
});

/*****************************************************************************/
/* sapb1config: Helpers */
/*****************************************************************************/
Template.sapb1config.helpers({
    'errorMsg': function() {
      return Template.instance().errorMsg.get();
    }
});

/*****************************************************************************/
/* sapb1config: Lifecycle Hooks */
/*****************************************************************************/
Template.sapb1config.onCreated(function () {
    let self = this;

    self.errorMsg = new ReactiveVar();
});

Template.sapb1config.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.sapb1config.onDestroyed(function () {
});
