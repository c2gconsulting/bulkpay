import Ladda from 'ladda';

/*****************************************************************************/
/* ResetMyPassword: Event Handlers */
/*****************************************************************************/
Template.ResetMyPassword.events({
  'submit form': function(e, tmpl) {
    e.preventDefault();

    var newPassword = tmpl.find('[name="newPassword"]').value;
    var newPasswordConfirm = tmpl.find('[name="confirmPassword"]').value;

    if(newPassword.trim().length < 1) {
      tmpl.$('div.signin_email').removeClass('hide');
      tmpl.$('div.signin_email').addClass('has-error');

      tmpl.$('div.signin_email span').html('Please enter your new password');
      return;
    } else if(newPasswordConfirm.trim().length < 1) {
      tmpl.$('div.signin_email').removeClass('hide');
      tmpl.$('div.signin_email').addClass('has-error');

      tmpl.$('div.signin_email span').html('Please confirm your new password');
      return;
    } else if(newPassword !== newPasswordConfirm) {
        tmpl.$('div.signin_email').removeClass('hide');
        tmpl.$('div.signin_email').addClass('has-error');

        tmpl.$('div.signin_email span').html('Your new password must be the same as your confirm password');
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

    Accounts.resetPassword(tmpl.currentToken.get(), newPassword, function(err) {
        try {
          let l = Ladda.create(tmpl.$('#btn-send')[0]);
          l.stop();
          l.remove();
        } catch (e) {
          console.log(e);
        }
        //--
        tmpl.$('div.signin_email').removeClass('hide');
        if (err) {
          tmpl.$('div.signin_email').removeClass('alert-success');
          tmpl.$('div.signin_email').addClass('alert-danger');

          tmpl.$('div.signin_email span').html('Sorry, an error occurred in resetting your password. Please try again later.');
          return err;
        } else {
          tmpl.$('div.signin_email').addClass('alert-success');
          tmpl.$('div.signin_email').removeClass('alert-danger');

          tmpl.$('div.signin_email span').html('Your password was successfully reset!');
          tmpl.$('#btn-send').text('Reset');
          return true;
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
Template.ResetMyPassword.onCreated(function() {
  let self = this;

  self.currentToken = new ReactiveVar()
  self.currentToken.set(Router.current().params.token)

});

Template.ResetMyPassword.onRendered(function() {});

Template.ResetMyPassword.onDestroyed(function() {});
