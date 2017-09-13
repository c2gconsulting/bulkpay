/*****************************************************************************/
/* ImportModal: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.ImportModal.events({
    "click #upload": function (e, tmpl) {
        e.preventDefault();
        const month = $('[name="paymentPeriod.month"]').val();
        const year = $('[name="paymentPeriod.year"]').val();
        if(!(month && year)){
            swal('error', "Please select payment / deduction period", 'error');
            return;
        }
        const period = month + year;
        
        let file = $("#fileupload")[0].files[0];
        if (!file){
            swal('No File to Import', 'Please specify file to import', 'error');
            Template.instance().response.set('error', "No file to import");
            return
        } else {
            Template.instance().response.set('error', undefined);
        }
        //--
        let fileExtension = file.name.split('.').pop()
        //--
        if (file.type !== "text/csv") {
            if(fileExtension !== 'csv') {// This is important because on Windows OS, the file.type won't be 'text/csv'
                Template.instance().response.set('error', "Only csv files allowed");
                return
            }
        }
        Template.instance().response.set('error', undefined);

        $('#upload').text('Please wait ... ')
        tmpl.$('#upload').attr('disabled', true);

        let overwrite = $("#check-overwrite").is(":checked")
        Papa.parse( file, {
            header: true,
            complete( results, file ) {
                Meteor.call( 'parseUpload', results.data, Session.get('context'), overwrite, period, ( error, response ) => {
                    try {
                        let l = Ladda.create(tmpl.$('#upload')[0]);
                        l.stop();
                        l.remove();
                    } catch(e) {
                        console.log(e);
                    }
                    //--
                    $('#upload').text('Upload File')
                    tmpl.$('#upload').attr('disabled', false);
                    tmpl.isUploading.set(false)

                    if ( error ) {
                        swal('Server Error!', 'Sorry, a server error has occurred. Please try again later.', 'error');
                    } else {    
                        // $("#fileupload").val('');
                        // $(".file-info").text("No file chosen")

                        tmpl.response.set('response', response);
                    }
                });
            }
        });
    },
    "click .uploadIcon": function (e, tmpl) {
        e.preventDefault();
        tmpl.$("#fileupload").trigger('click');
    },
    "change #fileupload": function (e) {
        let file =  e.target.files[0];
        if (file) {
            $(".file-info").text(file.name);
            console.log(`File type: ${file.type}`)
            let fileExtension = file.name.split('.').pop()
            console.log(`File extension: ${fileExtension}`)

            if (file.type !== "text/csv") {
                if(fileExtension !== 'csv') {// This is important because on Windows OS, the file.type won't be 'text/csv'
                    Template.instance().response.set('error', "Invalid file type selected. Only csv files allowed");
                } else {
                    Template.instance().response.set('error', undefined);
                }
            } else {             
                Template.instance().response.set('error', undefined);   
            }
        } else {
            $(".file-info").text("No file chosen")
        }
    },
    'click #recordsWithError': function(e, tmpl) {
        e.preventDefault()
        let fields = ['line', 'error', 'employee','paytype', 'amount']

        let uploadResponse = tmpl.response.get('response'); // For some weird reason Template.instance() doesn't work
        let skippedAndErrors = Array.prototype.concat(uploadResponse.skipped, uploadResponse.errors)

        BulkpayExplorer.exportAllData({fields: fields, data: skippedAndErrors}, "Records With Error");
    }
});

/*****************************************************************************/
/* ImportModal: Helpers */
/*****************************************************************************/
Template.ImportModal.helpers({
    'response': () => {
        return Template.instance().response.get('response');
    },
    'error': () => {
        return Template.instance().response.get('error');
    },
    'month': function(){
        return Core.months()
    },
    'years': function(){
        return Core.years();
    },
    'error': () => {
        let uploadResponse = Template.instance().response.get('response');
        if(uploadResponse) {
            let skippedCount = uploadResponse.skippedCount
            let errorCount = uploadResponse.failed

            if((skippedCount + errorCount) > 0) {
                return true
            }
        }
    },
    'isUploading': () => {
        return Template.instance().isUploading.get()
    }
});

/*****************************************************************************/
/* ImportModal: Lifecycle Hooks */
/*****************************************************************************/
Template.ImportModal.onCreated(function () {
    let self = this;

    self.response = new ReactiveDict();
    Session.set("response", undefined);

    self.isUploading = new ReactiveVar()
    self.isUploading.set(false)
});

Template.ImportModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ImportModal.onDestroyed(function () {
});
