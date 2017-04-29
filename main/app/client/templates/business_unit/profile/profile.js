/**
 * Created by eariaroo on 4/18/17.
 */
import { Tracker } from 'meteor/tracker';

Template.BuProfile.events({
// simulate file upload will use collectionFS and save files to aws s3
    'change #uploadBtn': function(e){
        if (e.target.files && e.target.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#profile-img').attr('src', e.target.result)
            };
            reader.readAsDataURL(e.target.files[0]);

            let upload = BusinessUnitLogoImages.insert(e.target.files[0]);
            console.log(`Upload result: ${JSON.stringify(upload)}`)
            //$('#filename').html(e.target.files[0].name);

            let businessUnitId = Session.get('context')

            Meteor.call('businessunit/updateLogoImage', businessUnitId, upload, (err, res) => {
                if (res){
                    swal({
                        title: "Success",
                        text: `Company logo update was successful!`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(`No file selected`)
        }
    },
    'click #update': function(e, tmp) {
        e.preventDefault()

        let companyName = $('input[name="companyName"]').val();
        let companyLocation = $('input[name="companyLocation"]').val();

        let businessUnitId = Session.get('context')

        Meteor.call('businessunit/updateNameAndLocation', businessUnitId, companyName, companyLocation, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `Company profile update was successful!`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                console.log(err);
            }
        });
    }
});


/*****************************************************************************/
/* BuProfile: Helpers */
/*****************************************************************************/
Template.BuProfile.helpers({
    'businessUnit': function() {
        return Template.instance().businessUnit.get()
    },
    'getBusinessUnitLogo': function(){
        let businessUnitImageId = Template.instance().businessUnit.get().logoId
        if(businessUnitImageId) {
            let businessUnitLogo = BusinessUnitLogoImages.findOne({_id: businessUnitImageId})
            return businessUnitLogo
        }
    }
});

Template.BuProfile.onCreated(function(){
    var self = this;

    self.businessUnit = new ReactiveVar()

    let businessUnitId = Session.get('context')
    let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)

    self.autorun(function(){
        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            console.log(`Business unit: ${JSON.stringify(businessUnit)}`)
            self.businessUnit.set(businessUnit)

            if(businessUnit.logoId) {
                self.subscribe("BusinessUnitLogoImage", businessUnit.logoId)
            }
        }
    })
});

Template.BuProfile.onRendered(function(){
    let self = this;

});
