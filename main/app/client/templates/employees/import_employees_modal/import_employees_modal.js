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
            Template.instance().response.set('error', "No file to import");
            return
        } else {
            Template.instance().response.set('error', undefined);
        }
        $('#employeesFileUpload').text('Uploading. Please wait ...')
        tmpl.$('#employeesFileUpload').attr('disabled', true);
        //--
        // try {
        //     let l = Ladda.create(tmpl.$('#employeesFileUpload')[0]);
        //     l.start();
        // } catch(e) {
        //     console.log(e);
        // }
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
        Papa.parse( file, {
            header: true,
            complete( results, file ) {
                Meteor.call('parseEmployeesUpload', results.data, Session.get('context'), ( error, response ) => {
                    $('#employeesFileUpload').text('Upload File')
                    tmpl.$('#employeesFileUpload').attr('disabled', false);
                    if ( error ) {
                        console.log(error.reason)
                        swal('Server Error!', 'Sorry, a server error has occurred. Please try again later.', 'error');
                    } else {
                        Session.set("response", response)
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
/* ImportEmployeesModal: Helpers */
/*****************************************************************************/
Template.ImportEmployeesModal.helpers({
    'response': () => {
        return Session.get("response")
    },
    'error': () => {
        return Template.instance().response.get('error');
    }
});

/*****************************************************************************/
/* ImportEmployeesModal: Lifecycle Hooks */
/*****************************************************************************/
Template.ImportEmployeesModal.onCreated(function () {
    let self = this;
    self.response = new ReactiveDict();
    Session.set("response", undefined);
});

Template.ImportEmployeesModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ImportEmployeesModal.onDestroyed(function () {
});
