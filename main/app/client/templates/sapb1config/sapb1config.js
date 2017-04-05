/*****************************************************************************/
/* SapB1Config: Event Handlers */
/*****************************************************************************/

Template.SapB1Config.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        var sapServerIpAddress = $('#sapServerIpAddress').val();
        var sapServerCompanyDatabaseName = $('#sapServerCompanyDatabaseName').val();

        if(sapServerIpAddress.length < 1) {
            swal("Validation error", `Please enter the I.P address of your SAP BusinessOne server`, "error");
            return
        } else if(sapServerCompanyDatabaseName.length < 1) {
            swal("Validation error", `Please enter the database name of your company on your SAP BusinessOne server`, "error");
            return
        }
        //--
        let sapConfig = {
            ipAddress : sapServerIpAddress,
            companyDatabaseName : sapServerCompanyDatabaseName
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
/* SapB1Config: Helpers */
/*****************************************************************************/
Template.SapB1Config.helpers({
    "paytype": (type) => {
        return Template.instance().paytypes.get();
    },
});

/*****************************************************************************/
/* SapB1Config: Lifecycle Hooks */
/*****************************************************************************/
Template.SapB1Config.onCreated(function () {
    let self = this;

    let context = Session.get('context');
    self.dict = new ReactiveDict();
    self.subscribe("PayTypes", context);

    self.errorMsg = new ReactiveVar();
    self.paytypes = new ReactiveVar();

    self.autorun(function(){
        if (Template.instance().subscriptionsReady()){
            self.paytypes.set(PayTypes.find({'status': 'Active'}).fetch());
        }
    });
});

Template.SapB1Config.onRendered(function () {
    $('select.dropdown').dropdown();

    var self = this;
    var oldIndex, newIndex;
    // fix a little rendering bug by clicking on step 1
    $('#step1').click();
    $('#progress-wizard-new').bootstrapWizard({
        onTabShow: function (tab, navigation, index) {
            tab.prevAll().addClass('done');
            tab.nextAll().removeClass('done');
            tab.removeClass('done');

            var $total = navigation.find('li').length;
            var $current = index + 1;

            if ($current >= $total) {
                $('#progress-wizard-new').find('.wizard .next').addClass('hide');
                $('#progress-wizard-new').find('.wizard .finish').removeClass('hide');
            } else {
                $('#progress-wizard-new').find('.wizard .next').removeClass('hide');
                $('#progress-wizard-new').find('.wizard .finish').addClass('hide');
            }

            var $percent = ($current / $total) * 100;
            $('#progress-wizard-new').find('.progress-bar').css('width', $percent + '%');
        },
        onTabClick: function (tab, navigation, index) {
            return true;
        }


    });
});

Template.SapB1Config.onDestroyed(function () {
});
