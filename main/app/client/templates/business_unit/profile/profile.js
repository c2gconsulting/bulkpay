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

            let upload = () => {
                if ($('#uploadBtn')[0].files[0])
                    return UserImages.insert($('#uploadBtn')[0].files[0]);
            }

            //upload = BusinessUnitLogoImages.insert(e.target.files[0]);
            //$('#filename').html(e.target.files[0].name);
        }
    },
});


/*****************************************************************************/
/* BuProfile: Helpers */
/*****************************************************************************/
Template.BuProfile.helpers({
    'businessUnitName': function() {
        return Template.instance().businessUnit.get().name
    },
    'businessUnitLocation': function() {
        return Template.instance().businessUnit.get().location
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
            //console.log(`Business unit: ${JSON.stringify(businessUnit)}`)

            self.businessUnit.set(businessUnit)
        }
    })
});

Template.BuProfile.onRendered(function(){
    let self = this;

});
