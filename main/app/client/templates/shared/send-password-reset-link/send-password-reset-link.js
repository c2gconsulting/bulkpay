import Ladda from 'ladda';

/*****************************************************************************/
/* SendPasswordResetLink: Event Handlers */
/*****************************************************************************/
Template.SendPasswordResetLink.events({
  'submit form': function(e, tmpl) {
    e.preventDefault();

    var email = tmpl.find('[type="email"]').value;

    if(email.trim().length < 1) {
      tmpl.$('div.signin_email').removeClass('hide');
      tmpl.$('div.signin_email').addClass('has-error');

      tmpl.$('div.signin_email span').html('Please enter your email address');
      return;
    }
    //--
    tmpl.$('div.signin_email').addClass('hide');
    tmpl.$('div.signin_email').removeClass('has-error');

    //Load button animation
    tmpl.$('#btn-send').text('SENDING...');
    tmpl.$('#btn-send').attr('disabled', true);

    try {
      let l = Ladda.create(tmpl.$('#btn-send')[0]);
      l.start();
    } catch (e) {
      console.log(e);
    }

    Meteor.call('accounts/sendResetPasswordEmail', email, function(error, result) {
      try {
        let l = Ladda.create(tmpl.$('#btn-send')[0]);
        l.stop();
        l.remove();
      } catch (e) {
        console.log(e);
      }
      //--
      tmpl.$('div.signin_email').removeClass('hide');
      if (error) {
        tmpl.$('div.signin_email').removeClass('alert-success');
        tmpl.$('div.signin_email').addClass('alert-danger');

        tmpl.$('div.signin_email span').html('Your email could not be found in our database');
      }
      if (result) {
        tmpl.$('div.signin_email').addClass('alert-success');
        tmpl.$('div.signin_email').removeClass('alert-danger');

        tmpl.$('div.signin_email span').html('The reset password link has been sent to your email');
        tmpl.$('#btn-send').text('Send reset link');
      }
    });
  }
});

/*****************************************************************************/
/* SendPasswordResetLink: Helpers */
/*****************************************************************************/
Template.SendPasswordResetLink.helpers({});

/*****************************************************************************/
/* SendPasswordResetLink: Lifecycle Hooks */
/*****************************************************************************/
Template.SendPasswordResetLink.onCreated(function() {});

Template.SendPasswordResetLink.onRendered(function() {});

Template.SendPasswordResetLink.onDestroyed(function() {});
