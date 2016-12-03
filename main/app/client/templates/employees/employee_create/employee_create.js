/*****************************************************************************/
/* EmployeeCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda'
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
            //upload = UserImages.insert(e.target.files[0]);
            //$('#filename').html(e.target.files[0].name);
        }
    },
    'click #createEmployee': function(e, tmpl){
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#createEmployee')[0]);
        l.start();
        const employeeProfile = {
            employeeId: $('[name="employeeId"]').val(),
            address: $('[name="address"]').val(),
            dateOfBirth: $('[data-field="dateOfBirth"]').val(),
            gender: $('[name="gender"]').val(),
            maritalStatus: $('[name="maritalStatus"]').val(),
            phone: $('[name="phone"]').val(),
            state: $('[name="state"]').val(),
            guarantorfullName: $('[name="guarantor.fullName"]').val(),
            guarantoremail: $('[name="guarantor.email"]').val(),
            guarantorphone: $('[name="guarantor.phone"]').val(),
            guarantoraddress: $('[name="guarantor.address"]').val(),
            guarantorcity: $('[name="guarantor.city"]').val(),
            guarantorstate: $('[name="guarantor.state"]').val(),
            location: $('[name="location"]').val(),
            position: $('[name="position"]').val(),
            hireDate: $('[name="hireDate"]').val(),
            confirmationDate: $('[name="confirmationDate"]').val(),
            status: $('[name="status"]').val(),
            terminationDate: $('[name="terminationDate"]').val(),
            paymentMethod: $('[name="paymentMethod"]').val(),
            bank: $('[name="bank"]').val(),
            accountNumber: $('[name="accountNumber"]').val(),
            accountName: $('[name="accountName"]').val(),
            pensionmanager: $('[name="pensionmanager"]').val(),
            RSAPin: $('[name="RSAPin"]').val()
        };
        const employee = {
            firstName: $('[name="firstName"]').val(),
            lastName: $('[name="lastName"]').val(),
            otherNames: $('[name="otherNames"]').val(),
            email: $('[name="email"]').val(),
            employeeProfile: employeeProfile,
            businessId: BusinessUnits.findOne()._id
        };
        console.log(employee);
        function returnBool(val){
            if(val === "Yes") return true;
            return false;
        };

        Meteor.call('account/create', employee, false, (err, res) => {
            l.stop();
            if (res){
                swal({
                    title: "Success",
                    text: `Employee Created`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Router.go('employees', {_id: Session.get('context')});
            } else {
                console.log(err);
                //err = JSON.parse(err.details);
                //// add necessary handler on error
                ////use details from schema.key to locate html tag and error handler
                //_.each(err, (obj) => {
                //    $('[name=' + obj.name +']').addClass('errorValidation');
                //    $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);
                //
                //})
            }
        });
    }

});

/*****************************************************************************/
/* EmployeeCreate: Helpers */
/*****************************************************************************/
Template.EmployeeCreate.helpers({
    positions: () => {
        return EntityObjects.find();
    }

});

/*****************************************************************************/
/* EmployeeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeCreate.onCreated(function () {
    //subscribe to all positions
    var self = this;
    console.log(Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeeCreate.onRendered(function () {
});

Template.EmployeeCreate.onDestroyed(function () {
});
