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
        console.log('period', period);
        let file = $("#fileupload")[0].files[0];
        if (!file){
            swal('No File to Import', 'Please specify file to import', 'error');
            Template.instance().response.set('error', "No file to import");
            return
        } else {
            Template.instance().response.set('error', undefined);
        }
        //--
        console.log(`File type: ${file.type}`)
        let fileExtension = file.name.split('.').pop()
        console.log(`File extension: ${fileExtension}`)
        //--
        if (file.type !== "text/csv") {
            if(fileExtension !== 'csv') {// This is important because on Windows OS, the file.type won't be 'text/csv'
                Template.instance().response.set('error', "Only csv files allowed");
                return
            }
        }
        Template.instance().response.set('error', undefined);

        tmpl.$('#upload').attr('disabled', true);
        try {
            let l = Ladda.create(tmpl.$('#upload')[0]);
            l.start();
        } catch(e) {
            console.log(e);
        }
        if (file.type !== "text/csv") {
            try {
                let l = Ladda.create(tmpl.$('#upload')[0]);
                l.stop();
                l.remove();
            } catch(e) {
                console.log(e);
            }
            return
        }
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
                    if ( error ) {
                        console.log(error.reason)
                        swal('Error', `${error.reason}`, 'error');
                    } else {
                        console.log(`additional pay response`, response)
                        let skippedCount = response.skipped
                        let errorCount = response.failed

                        if((skippedCount + errorCount) > 0) {
                            let totalNumErrors = skippedCount + errorCount
                            swal('Error', `${totalNumErrors} error(s) exist in your upload file`, 'error');
                        } else {
                            swal('Success', "Upload success", 'success');
                            Session.set("response", response)
                            $("#fileupload").val('');
                            $(".file-info").text("No file chosen")
                            Modal.hide('ImportModal');
                        }
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
    }
});

/*****************************************************************************/
/* ImportModal: Helpers */
/*****************************************************************************/
Template.ImportModal.helpers({
    'response': () => {
        return Session.get("response")
    },
    'error': () => {
        return Template.instance().response.get('error');
    },
    'month': function(){
        return Core.months()
    },
    'years': function(){
        return Core.years();
    }

});

/*****************************************************************************/
/* ImportModal: Lifecycle Hooks */
/*****************************************************************************/
Template.ImportModal.onCreated(function () {
    let self = this;
    self.response = new ReactiveDict();
    Session.set("response", undefined);
});

Template.ImportModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ImportModal.onDestroyed(function () {
});
