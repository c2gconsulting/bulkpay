/*****************************************************************************/
/* PaygradeCreate: Event Handlers */
/*****************************************************************************/
Template.PaygradeCreate.events({
});

/*****************************************************************************/
/* PaygradeCreate: Helpers */
/*****************************************************************************/
Template.PaygradeCreate.helpers({
});

/*****************************************************************************/
/* PaygradeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.PaygradeCreate.onCreated(function () {
});

Template.PaygradeCreate.onRendered(function () {
    // fix a little rendering bug by clicking on step 1
    //$('#step1').click();
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

Template.PaygradeCreate.onDestroyed(function () {
});
