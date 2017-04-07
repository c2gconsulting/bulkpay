/*****************************************************************************/
/* TestSapConfigModal: Event Handlers */
   //sab1 stands for S.A.P Business One
/*****************************************************************************/

Template.TestSapConfigModal.events({
    'click #testConnection': (e,tmpl) => {
        var sapServerIpAddress = $('#sapServerIpAddress').val();
        var sapCompanyDatabaseName = $('#sapServerCompanyDatabaseName').val();
        var protocol = $('#protocol').val();

        if(sapServerIpAddress.length < 1) {
            swal("Validation error", `Please enter the I.P address of your SAP BusinessOne server`, "error");
            return
        } else if(sapCompanyDatabaseName.length < 1) {
            swal("Validation error", `Please enter the database name of your company on your SAP BusinessOne server`, "error");
            return
        }
        //--
        let sapConfig = {
            ipAddress : sapServerIpAddress,
            sapCompanyDatabaseName : sapCompanyDatabaseName,
            protocol : protocol
        }

        let businessUnitId = Session.get('context')
        Meteor.call('sapB1integration/testConnection', businessUnitId, sapConfig, (err, res) => {
            if (!err){
                console.log(`Test connection response: ${res}`)
                let responseAsObj = JSON.parse(res)
                console.log(responseAsObj)

                let dialogType = (responseAsObj.status === true) ? "success" : "error"
                swal("Connection Status", responseAsObj.message, dialogType);
            } else {
                swal("Server error", `Please try again at a later time`, "error");
            }
        });
    }
});

/*****************************************************************************/
/* TestSapConfigModal: Helpers */
/*****************************************************************************/
Template.TestSapConfigModal.helpers({
    'companyConnectionInfo': function() {
        let sapBusinessUnitConfig = Template.instance().sapBusinessUnitConfig.get()
        if(sapBusinessUnitConfig) {
            return {
                sapCompanyDatabaseName : sapBusinessUnitConfig.sapCompanyDatabaseName,
                ipAddress : sapBusinessUnitConfig.ipAddress,
                protocol : sapBusinessUnitConfig.protocol
            }
        }
        return null
    }
});

/*****************************************************************************/
/* TestSapConfigModal: Lifecycle Hooks */
/*****************************************************************************/
Template.TestSapConfigModal.onCreated(function () {
    let self = this;
});

Template.TestSapConfigModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.TestSapConfigModal.onDestroyed(function () {
    Modal.hide('TestSapConfigModal')
});
