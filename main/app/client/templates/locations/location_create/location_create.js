import Ladda from 'ladda';

/*****************************************************************************/
/* LocationCreate: Event Handlers */
/*****************************************************************************/
Template.LocationCreate.events({
    'click #saveLocation': function (e, tmpl) {
        e.preventDefault();

        let location = Template.instance().elements.get('location');

        tmpl.$('#saveLocation').attr('disabled', true);
        try {
            let l = Ladda.create(tmpl.$('#saveLocation')[0]);
            l.start();
        } catch (e) {
            console.log(e);
        }

        var resetButton = function () {
            try {
                let l = Ladda.create(tmpl.$('#saveLocation')[0]);
                l.stop();
                l.remove();
            } catch (e) {
                console.log(e);
            }
        };

        var handleResponse = function (error, response) {
            resetButton();
            if (error) {
                swal({
                    title: 'Oops!',
                    text: error.reason,
                    confirmButtonClass: 'btn-error',
                    type: 'error',
                    confirmButtonText: 'OK'
                });
            } else {
                Modal.hide('LocationCreate');
                swal({
                    title: 'Success',
                    text: Session.get('editLocation') ? 'Location Updated' : 'Location has been created',
                    confirmButtonClass: 'btn-success',
                    type: 'success',
                    confirmButtonText: 'OK'
                });
            }
        };

        let locationContext = Core.Schemas.Location.namedContext("locationForm");
        if (locationContext.isValid()) {
            // always set holdStock to true
            location.holdsStock = true;

            if (Session.get('editLocation')) {
                // edit location
                Meteor.call('locations/updateLocation', location._id, location, function (error, response) {
                    handleResponse(error, response);
                });
            } else {
                // create new Location
                Meteor.call('locations/createLocation', location, function (error, response) {
                    handleResponse(error, response);
                });
            }

        } else {
            // handle errors here...
        }
    },

    'blur input[name=locationName]': function (e, tmpl) {
        let location = Template.instance().elements.get('location');
        let value = e.currentTarget.value;
        if (value && value.trim().length > 0) {
            location.name = value;
        } else {
            delete location.name;
        }
        Template.instance().elements.set('location', location);
    },
    'blur input[name=address1]': function (e, tmpl) {
        let location = Template.instance().elements.get('location');
        location.address1 =  e.currentTarget.value;
        Template.instance().elements.set('location', location);
    },
    'blur input[name=address2]': function (e, tmpl) {
        let location = Template.instance().elements.get('location');
        location.address2 =  e.currentTarget.value;
        Template.instance().elements.set('location', location);
    },
    'blur input[name=locationCity]': function (e, tmpl) {
        let location = Template.instance().elements.get('location');
        let value = e.currentTarget.value;
        if (value && value.trim().length > 0) {
            location.city = value;
        } else {
            delete location.city;
        }
        Template.instance().elements.set('location', location);
    },
    'blur input[name=locationPostal]': function (e, tmpl) {
        let location = Template.instance().elements.get('location');
        location.postal =  e.currentTarget.value;
        Template.instance().elements.set('location', location);
    },
    'blur input[name=locationState]': function (e, tmpl) {
        let location = Template.instance().elements.get('location');
        location.state =  e.currentTarget.value;
        Template.instance().elements.set('location', location);
    }
});

/*****************************************************************************/
/* LocationCreate: Helpers */
/*****************************************************************************/
Template.LocationCreate.helpers({
    location: function () {
        return Template.instance().elements.get('location');
    },
    enableSubmit: function () {
        let locationContext = Core.Schemas.Location.namedContext("locationForm");
        return locationContext.isValid() ? '' : 'disabled';
    },
    modalTitle: function () {
        return Session.get('editLocation') ? 'Edit Location' : 'Create a new Location';
    }
});

/*****************************************************************************/
/* LocationCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LocationCreate.onCreated(function () {

    let instance = this;
    instance.elements = new ReactiveDict();
    
    let editLocation = Session.get('editLocation');
    instance.elements.set('location', editLocation ? editLocation : {
        country: Core.getTenantCountry(),
        holdsStock: true,
        status: 'active'
    });

    let locationContext = Core.Schemas.Location.namedContext("locationForm");

    instance.autorun(function () {

        locationContext.validate(instance.elements.get('location'));
        if (locationContext.isValid()) {
            console.log('Location is Valid!');
        } else {
            console.log('Location is not Valid!');
        }
        console.log(locationContext._invalidKeys);

    });
    
});

Template.LocationCreate.onRendered(function () {
});

Template.LocationCreate.onDestroyed(function () {
    // remove location from session
    Session.set('editLocation', undefined);
});

