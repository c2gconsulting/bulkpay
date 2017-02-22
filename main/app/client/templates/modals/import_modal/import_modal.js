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
        let overwrite = $("#check-overwrite").is(":checked")
        Papa.parse( file, {
            header: true,
            complete( results, file ) {
                Meteor.call( 'parseUpload', results.data, Session.get('context'), overwrite, period, ( error, response ) => {
                    if ( error ) {
                        console.log(error.reason)
                    } else {
                        swal('Upload Complete', response, 'success');
                        Session.set("response", response)
                        $("#fileupload").val('');
                        $(".file-info").text("No file chosen")
                        Modal.hide('ImportModal');
                    }
                    try {
                        let l = Ladda.create(tmpl.$('#upload')[0]);
                        l.stop();
                        l.remove();
                    } catch(e) {
                        console.log(e);
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
