/*****************************************************************************/
/* ImportSupplementaryLeavesModal: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.ImportSupplementaryLeavesModal.events({
    'click #downloadSampleCsv': function(e, tmpl) {
        e.preventDefault()
        let allEmployees = Meteor.users.find({"employee": true}).fetch();
        let dataForSampleCsv = allEmployees.map(anEmployee => {
            return {
                EmployeeUniqueId: anEmployee._id,
                EmployeeFullName: anEmployee.profile.fullName,
                LeaveBalanceInDays: ""
            }
        })

        let fields = ['EmployeeUniqueId','EmployeeFullName', 'LeaveBalanceInDays']

        Hub825Explorer.exportAllData({fields: fields, data: dataForSampleCsv}, "EmployeeLeaveBalanceSample");
    },
    "click #employeesFileUpload": function (e, tmpl) {
        e.preventDefault();

        let file = $("#fileInput")[0].files[0];
        if (!file){
            swal('No File to Import', 'Please specify file to import', 'error');
            return
        }
        let fileExtension = file.name.split('.').pop()
        //--

        if (file.type !== "text/csv") {
            if(fileExtension !== 'csv') {// This is important because on Windows OS, the file.type won't be 'text/csv'
                swal('Invalid file', "Only csv files allowed", 'error');
                return
            }
        }
        $('#employeesFileUpload').text('Uploading. Please wait ...')
        tmpl.$('#employeesFileUpload').attr('disabled', true);
        tmpl.isUploading.set(true)

        Papa.parse(file, {
            header: true,
            complete( results, file ) {
                Meteor.call('parseEmployeeSupplementaryLeaveBalanceUpload', results.data, Session.get('context'), function ( error, response ) {
                    $('#employeesFileUpload').text('Upload File')
                    tmpl.$('#employeesFileUpload').attr('disabled', false);
                    tmpl.isUploading.set(false)

                    if ( error ) {
                        console.log(error.reason)
                        swal('Server Error!', 'Sorry, a server error has occurred. Please try again later.', 'error');
                    } else {
                        tmpl.response.set('response', response);
                    }
                });
            }
        });
    },
    "click .uploadIcon": function (e, tmpl) {
        e.preventDefault();
        tmpl.$("#fileInput").trigger('click');
    },
    "change #fileInput": function (e) {
        let file =  e.target.files[0];
        if (file) {
            $(".file-info").text(file.name);
            console.log(`File type: ${file.type}`)
            let fileExtension = file.name.split('.').pop()
            console.log(`File extension: ${fileExtension}`)

            if (file.type !== "text/csv") {
                if(fileExtension !== 'csv') {// This is important because on Windows OS, the file.type won't be 'text/csv'
                    swal('Invalid file', "Only csv files allowed", 'error');
                }
            }
        } else {
            $(".file-info").text("No file chosen")
        }
    },
    'click #recordsWithError': function(e, tmpl) {
        e.preventDefault()

        let fields = ['ErrorLine', 'Error', 'EmployeeUniqueId','EmployeeFullName', 'LeaveBalanceInDays']

        let uploadResponse = tmpl.response.get('response'); // For some weird reason Template.instance() doesn't work
        let skippedAndErrors = Array.prototype.concat(uploadResponse.skipped, uploadResponse.errors)

        Hub825Explorer.exportAllData({fields: fields, data: skippedAndErrors}, "RecordsWithError");
    }
});

/*****************************************************************************/
/* ImportSupplementaryLeavesModal: Helpers */
/*****************************************************************************/
Template.ImportSupplementaryLeavesModal.helpers({
    'response': () => {
        return Template.instance().response.get('response');
    },
    'error': () => {
        let uploadResponse = Template.instance().response.get('response');
        if(uploadResponse) {
            let skippedCount = uploadResponse.skippedCount
            let errorCount = uploadResponse.failed

            if((skippedCount + errorCount) > 0) {
                return true
            }
        } else {

        }
    },
    'isUploading': () => {
        return Template.instance().isUploading.get()
    }
});

/*****************************************************************************/
/* ImportSupplementaryLeavesModal: Lifecycle Hooks */
/*****************************************************************************/
Template.ImportSupplementaryLeavesModal.onCreated(function () {
    let self = this
    self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));
    self.subscribe("getCostElement", Session.get('context'));

    self.subscribe("getLocationEntity", Session.get('context'));
    
    self.response = new ReactiveDict()

    self.isUploading = new ReactiveVar()
    self.isUploading.set(false)
});

Template.ImportSupplementaryLeavesModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ImportSupplementaryLeavesModal.onDestroyed(function () {
    Modal.hide('ImportSupplementaryLeavesModal')
});
