/*****************************************************************************/
/* Tenants: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.NewTenant.events({
    'click .registration-form .btn-previous': function(e, tmpl){
        $(e.target).parents('fieldset').fadeOut(400, function() {
            $(this).prev().fadeIn();
        });
    },
    'click .registration-form .btn-next': function(e, tmpl){
        var parent_fieldset = $(e.target).parents('fieldset');
        var next_step = true;
        var validEmail = true;
        var passwordMatch = true ;

        parent_fieldset.find('input[type="text"], input[type="password"], textarea').each(function() {
            if( $(this).val() == "" ) {
                $(this).addClass('input-error');
                next_step = false;
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        //validate email
        let email = parent_fieldset.find('[name=form-email]')[0];
        if(email){
            validEmail = ValidateEmail($(email).val());
            if(!validEmail) $(email).addClass('input-error');
        }

        //validate password
        let password = parent_fieldset.find('[name=form-password]')[0];
        let password_confirm = parent_fieldset.find('[name=form-repeat-password]')[0];
        // check if password and password confirm matches
        if(password){
            //check if password matches password_confirmatioin
            //otherwise set field as error
            passwordMatch = $(password).val() === $(password_confirm).val();
            if(!passwordMatch) {
                $(password_confirm).addClass('input-error');
            }
        }



        if( next_step  && validEmail && passwordMatch) {
            parent_fieldset.fadeOut(400, function() {
                $(this).next().fadeIn();
            });
        }
    },
    'submit .registration-form': function(e,tmpl){
        var error = false;
        e.preventDefault();
        //dissable button
        tmpl.$('#signup').attr('disabled', true);
        $(e.target).find('input[type="text"], input[type="password"], textarea').each(function() {
            if( $(this).val() == "" ) {
                $(this).addClass('input-error');
                error = true;
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        if(!error){
            let l = Ladda.create(tmpl.$('#signup')[0]);
            l.start();
            let user = {}; let tenant = {};
            //populate tenants and user data.
            let name = $('[name="business-name"]').val();
            let industry = $('[name="industry"]').val();
            let address = $('[name="address"]').val();
            let email = $('[name="form-email"]').val();
            let password = $('[name="form-password"]').val();
            let country = $('[name="country"]').val();
            let currency = $('[name="currency"]').val();
            user.email = email; user.password = password;
            tenant.name = name; tenant.industry = industry; tenant.addressBook = [{address1: address}];
            tenant.country = country; tenant.currencies = [currency];
            //create tenant and default tenant user
            Meteor.call('registerBusiness', user, tenant, function(err, result){
                l.stop();
                tmpl.$('#signup').removeAttr('disabled');
                console.log(err,result);
                if(result){
                    swal({
                        title: "Success",
                        text: `Your business has been created and a notification has been sent to your root account mail address.`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                    Router.go('home');
                } else {
                    swal({
                        title: "Oops!",
                        text: err,
                        confirmButtonClass: "btn-error",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                }
            });
        } else {
            tmpl.$('#signup').removeAttr('disabled');
        }
    },
    'blur .form-email': function(e,tmpl){
        //validate email
        let valid =  ValidateEmail($(e.target).val());
        if(!valid) $(e.target).addClass('input-error');
    },
    'focus .registration-form input[type="text"], focus .registration-form input[type="password"], focus .registration-form textarea': function(e,tmpl){
        $(e.target).removeClass('input-error');
    }

});

/*****************************************************************************/
/* Tenants: Helpers */
/*****************************************************************************/
Template.NewTenant.helpers({
    countries: function () {
        return Core.IsoCountries();
    },
    currencies: function(){
        return Core.currencies();
    }
});

/*****************************************************************************/
/* Tenants: Lifecycle Hooks */
/*****************************************************************************/
Template.NewTenant.onCreated(function () {
});

Template.NewTenant.onRendered(function () {
    //$.backstretch("");

    $('#top-navbar-1').on('shown.bs.collapse', function(){
        $.backstretch("resize");
    });
    $('#top-navbar-1').on('hidden.bs.collapse', function(){
        $.backstretch("resize");
    });

    /*
     Form
     */
    $('.registration-form fieldset:first-child').fadeIn('slow');

});

Template.NewTenant.onDestroyed(function () {
});

function ValidateEmail(mail)
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
        return (true)
    }
    return (false)
}
