/*****************************************************************************/
/* ImportEmployeePaytypesModal: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.ImportEmployeePaytypesModal.events({
    'click #downloadSampleCsv': function(e, tmpl) {
        e.preventDefault()
        let fields = ['EmployeeUniqueId','EmployeeFullName', 'PaygradeUniqueId']

        let payTypes = PayTypes.find().fetch();
        payTypes.forEach(aPayType => {
            fields.push(aPayType.title + "-" + aPayType._id)
        })

        let allEmployees = Meteor.users.find({"employee": true}).fetch();
        console.log("allEmployees:")
        console.log(allEmployees)
        let dataForSampleCsv = allEmployees.map(anEmployee => {
            return {
                EmployeeUniqueId: anEmployee._id,
                EmployeeFullName: anEmployee.profile.fullName,
                PaygradeUniqueId: ""
            }
        })
        BulkpayExplorer.exportAllData({fields: fields, data: dataForSampleCsv}, "EmployeePaytypesAssignmentSample");
    },
    'click #downloadCsvWithAllPaygrades': function(e, tmpl) {
        e.preventDefault()
        let fields = ['PaygradeName', 'PaygradeUniqueId']

        let payGrades = PayGrades.find().fetch();
        let dataForAllPaygradesCsv = payGrades.map(aPayGrade => {
            return {
                PaygradeName: aPayGrade.description,
                PaygradeUniqueId: aPayGrade._id
            }
        })
        BulkpayExplorer.exportAllData({fields: fields, data: dataForAllPaygradesCsv}, "AllPaygradesInCompany");
    },
    'click #downloadCsvWithAllPaytypes': function(e, tmpl) {
        e.preventDefault()
        let fields = ['PaytypeName', 'PaytypeUniqueId']

        let payTypes = PayTypes.find().fetch();
        let dataForAllPaytypesCsv = payTypes.map(aPayType => {
            return {
                PaytypeName: aPayType.title,
                PaytypeUniqueId: aPayType._id
            }
        })
        BulkpayExplorer.exportAllData({fields: fields, data: dataForAllPaytypesCsv}, "AllPaytypesInCompany");
    },
    "click #employeesFileUpload": function (e, tmpl) {
        e.preventDefault();

        let file = $("#fileInput")[0].files[0];
        if (!file){
            swal('No File to Import', 'Please specify file to import', 'error');
            return
        }
        console.log(`File type: ${file.type}`)
        let fileExtension = file.name.split('.').pop()
        console.log(`File extension: ${fileExtension}`)
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
                Meteor.call('parseEmployeePaytypesUpload', results.data, Session.get('context'), function ( error, response ) {
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
        let fields = ['ErrorLine', 'Error', 'EmployeeUniqueId','EmployeeFullName']

        let uploadResponse = tmpl.response.get('response'); // For some weird reason Template.instance() doesn't work
        let skippedAndErrors = Array.prototype.concat(uploadResponse.skipped, uploadResponse.errors)

        BulkpayExplorer.exportAllData({fields: fields, data: skippedAndErrors}, "EmployeeRecordsWithError");
    }
});

/*****************************************************************************/
/* ImportEmployeePaytypesModal: Helpers */
/*****************************************************************************/
Template.ImportEmployeePaytypesModal.helpers({
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
/* ImportEmployeePaytypesModal: Lifecycle Hooks */
/*****************************************************************************/
Template.ImportEmployeePaytypesModal.onCreated(function () {
    let self = this
    self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("paygrades", Session.get('context'));
    self.subscribe("PayTypes", Session.get('context'));

    self.response = new ReactiveDict()

    self.isUploading = new ReactiveVar()
    self.isUploading.set(false)
});

Template.ImportEmployeePaytypesModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ImportEmployeePaytypesModal.onDestroyed(function () {
    Modal.hide('ImportEmployeePositionsModal')
});
