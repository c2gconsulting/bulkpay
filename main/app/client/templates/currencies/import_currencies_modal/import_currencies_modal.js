/*****************************************************************************/
/* ImportCurrenciesModal: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.ImportCurrenciesModal.events({
    "click #upload": function (e, tmpl) {
        e.preventDefault();
        const month = $('[name="paymentPeriod.month"]').val();
        const year = $('[name="paymentPeriod.year"]').val();
        if(!(month && year)){
            swal('error', "Please select currencies period", 'error');
            return;
        }
        const period = month + year;
        console.log('period', period);
        let  file = $("#fileupload")[0].files[0];
        if (!file){
            swal('No File to Import', 'Please specify file to import', 'error');
            Template.instance().response.set('error', "No file to import");
            return
        } else {
            Template.instance().response.set('error', undefined);
        }
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
        Papa.parse( file, {
            header: true,
            complete( results, file ) {
                console.log("About to upload to server!");

                Meteor.call('parseCurrenciesUpload', results.data, Session.get('context'), period, ( error, response ) => {
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
                    } else {
                        //swal('Upload Complete', response, 'success');
                        Session.set("response", response)
                        //$("#fileupload").val('');
                        //$(".file-info").text("No file chosen")
                        //Modal.hide('ImportCurrenciesModal');
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
            if (file.type !== "text/csv") {
                Template.instance().response.set('error', "Invalid file type selected. Only csv files allowed");
            } else {
                Template.instance().response.set('error', undefined);
            }
        } else {
            $(".file-info").text("No file chosen")
        }
    }
});

/*****************************************************************************/
/* ImportCurrenciesModal: Helpers */
/*****************************************************************************/
Template.ImportCurrenciesModal.helpers({
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
/* ImportCurrenciesModal: Lifecycle Hooks */
/*****************************************************************************/
Template.ImportCurrenciesModal.onCreated(function () {
    let self = this;
    self.response = new ReactiveDict();
    Session.set("response", undefined);
});

Template.ImportCurrenciesModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ImportCurrenciesModal.onDestroyed(function () {
});
