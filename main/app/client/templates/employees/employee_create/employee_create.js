/*****************************************************************************/
/* EmployeeCreate: Event Handlers */
/*****************************************************************************/
Template.EmployeeCreate.events({
    // simulate file upload will use collectionFS and save files to aws s3
    'change #uploadBtn': function(e){
            if (e.target.files && e.target.files[0]) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    $('#profile-img')
                        .attr('src', e.target.result)
                };

                reader.readAsDataURL(e.target.files[0]);
                $('#filename').html(e.target.files[0].name);
            }
    }
});

/*****************************************************************************/
/* EmployeeCreate: Helpers */
/*****************************************************************************/
Template.EmployeeCreate.helpers({
});

/*****************************************************************************/
/* EmployeeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeCreate.onCreated(function () {
});

Template.EmployeeCreate.onRendered(function () {
});

Template.EmployeeCreate.onDestroyed(function () {
});
