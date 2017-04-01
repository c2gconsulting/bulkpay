/*****************************************************************************/
/* ImportEmployeesModal: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.ImportEmployeesModal.events({
    "click #employeesFileUpload": function (e, tmpl) {
        e.preventDefault();

        let file = $("#fileInput")[0].files[0];
        if (!file){
            swal('No File to Import', 'Please specify file to import', 'error');
            return
        }
        $('#employeesFileUpload').text('Uploading. Please wait ...')
        tmpl.$('#employeesFileUpload').attr('disabled', true);
        //--
        if (file.type !== "text/csv") {
            try {
                let l = Ladda.create(tmpl.$('#employeesFileUpload')[0]);
                l.stop();
                l.remove();
            } catch(e) {
                console.log(e);
            }
            return
        }

        tmpl.isUploading.set(true)

        Papa.parse( file, {
            header: true,
            complete( results, file ) {
                Meteor.call('parseEmployeesUpload', results.data, Session.get('context'), ( error, response ) => {
                    $('#employeesFileUpload').text('Upload File')
                    tmpl.$('#employeesFileUpload').attr('disabled', false);
                    tmpl.isUploading.set(false)

                    if ( error ) {
                        console.log(error.reason)
                        swal('Server Error!', 'Sorry, a server error has occurred. Please try again later.', 'error');
                    } else {
                        tmpl.response.set('response', response);    // For some weird reason Template.instance() doesn't work
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
            if (file.type !== "text/csv") {
                swal('Invalid file', "Only csv files allowed", 'error');
            }
        } else {
            $(".file-info").text("No file chosen")
        }
    },
    'click #recordsWithError': function(e, tmpl) {
        e.preventDefault()

        let fields = ['ErrorLine', 'FirstName','LastName','OtherNames','Email','EmployeeId','Address','DateOfBirth',
          'Gender','MaritalStatus','Phone','State','GuarantorFullName','GuarantorEmail','GuarantorPhone',
          'GuarantorAddress','GuarantorCity','GuarantorState','EmploymentHireDate',
          'EmploymentConfirmationDate','EmploymentTerminationDate','Status',
          'EmergencyContactFullName','EmergencyContactEmail','EmergencyContactPhone',
          'EmergencyContactAddress','EmergencyContactCity','EmergencyContactState','PaymentMethod',
          'Bank','AccountNumber','AccountName','Pensionmanager','RSANumber','TaxPayerId']

        let uploadResponse = tmpl.response.get('response'); // For some weird reason Template.instance() doesn't work
        let skippedAndErrors = Array.prototype.concat(uploadResponse.skipped, uploadResponse.errors)

        BulkpayExplorer.exportAllData({fields: fields, data: skippedAndErrors}, "Employee records with error");
    }
});

/*****************************************************************************/
/* ImportEmployeesModal: Helpers */
/*****************************************************************************/
Template.ImportEmployeesModal.helpers({
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
/* ImportEmployeesModal: Lifecycle Hooks */
/*****************************************************************************/
Template.ImportEmployeesModal.onCreated(function () {
    let self = this
    self.response = new ReactiveDict()

    self.isUploading = new ReactiveVar()
    self.isUploading.set(false)
});

Template.ImportEmployeesModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ImportEmployeesModal.onDestroyed(function () {
});
