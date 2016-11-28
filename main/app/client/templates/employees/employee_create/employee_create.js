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
        const employee = {
            businessId: BusinessUnits.findOne()._id,
            employeeId: $('[name="employeeId"]').val(),
            firstName: $('[name="firstName"]').val(),
            lastName: $('[name="lastName"]').val(),
            otherNames: $('[name="otherNames"]').val(),
            address: $('[name="address"]').val(),
            email: $('[name="email"]').val(),
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
        console.log(employee);
        function returnBool(val){
            if(val === "Yes") return true;
            return false;
        };
        if(tmpl.data){//edit action for updating paytype
            //const ptId = tmpl.data._id;
            //const code = tmpl.data.code;
            //Meteor.call("paytype/update", tmpl.data._id, details, (err, res) => {
            //    l.stop();
            //    if(err){
            //        swal("Update Failed", `Cannot Update paytype ${code}`, "error");
            //    } else {
            //        swal("Successful Update!", `Succesffully update paytype ${code}`, "success");
            //        Modal.hide("PaytypeCreate");
            //    }
            //});

        } else { //New Action for creating paytype}
            //Meteor.call('paytype/create', details, (err, res) => {
            //    l.stop();
            //    if (res){
            //        Modal.hide('PaytypeCreate');
            //        swal({
            //            title: "Success",
            //            text: `Company Created`,
            //            confirmButtonClass: "btn-success",
            //            type: "success",
            //            confirmButtonText: "OK"
            //        });
            //    } else {
            //        err = JSON.parse(err.details);
            //        // add necessary handler on error
            //        //use details from schema.key to locate html tag and error handler
            //        _.each(err, (obj) => {
            //            $('[name=' + obj.name +']').addClass('errorValidation');
            //            $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);
            //
            //        })
            //    }
            //});
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
