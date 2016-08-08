import Ladda from 'ladda';

/*****************************************************************************/
/* ResetMyPassword: Event Handlers */
/*****************************************************************************/
Template.ResetMyPassword.events({
  'submit form': function(e, tmpl) {
    e.preventDefault();

    // Load button animation
    tmpl.$('#btn-send').text('SENDING...');
    tmpl.$('#btn-send').attr('disabled', true);

    try {
      let l = Ladda.create(tmpl.$('#btn-send')[0]);
      l.start();
    } catch (e) {
      console.log(e);
    }

    var email = tmpl.find('[type="email"]').value;

    Meteor.call('accounts/sendResetPasswordEmail', email, function(error, result) {
      if (error) {
        try {
          let l = Ladda.create(tmpl.$('#btn-send')[0]);
          l.stop();
          l.remove();
        } catch (e) {
          console.log(e);
        }
        tmpl.$('div.signin_email').addClass('has-error');
        tmpl.$('span.help-block').html('Your email could not be found in our database');
      }
      if (result) {
        // End button animation
        try {
          let l = Ladda.create(tmpl.$('#btn-send')[0]);
          l.stop();
          l.remove();
        } catch (e) {
          console.log(e);
        }
        tmpl.$('div.signin_email').addClass('has-success');
        tmpl.$('span.help-block').html('Reset password link has been sent to your email');
        tmpl.$('#btn-send').text('Send reset link');

      }
    });
  }
});

/*****************************************************************************/
/* ResetMyPassword: Helpers */
/*****************************************************************************/
Template.ResetMyPassword.helpers({});

/*****************************************************************************/
/* ResetMyPassword: Lifecycle Hooks */
/*****************************************************************************/
Template.ResetMyPassword.onCreated(function() {});

Template.ResetMyPassword.onRendered(function() {});

Template.ResetMyPassword.onDestroyed(function() {});
