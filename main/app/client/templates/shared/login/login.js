import Ladda from 'ladda';

/*****************************************************************************/
/* Login: Event Handlers */
/*****************************************************************************/
Template.Login.events({
	'submit form':function(e, tmpl) {
		e.preventDefault();
		
		// Load button animation
		tmpl.$('#btn-login').text('SIGNING IN...');
		tmpl.$('#btn-login').attr('disabled', true);
		
		try {
			let l = Ladda.create(tmpl.$('#btn-login')[0]);
			l.start();
		} catch(e) {
			console.log(e);
		}
		
		var email = tmpl.find('[type="email"]').value;
		var password = tmpl.find('[type="password"]').value;
	
		Meteor.loginWithPassword(email, password, function(err){
			// End button animation
			try {
				let l = Ladda.create(tmpl.$('#btn-login')[0]);
				l.stop();
				l.remove();
			} catch(e) {
				console.log(e);
			}
			
			if (err) {
				console.log(err);
				tmpl.$('div.signin_email').addClass('has-error');
				tmpl.$('span.help-block').html('Your email or password is incorrect');
				tmpl.$('#btn-login').text('SIGN IN');
				tmpl.$('#btn-login').removeAttr('disabled');
			} 
		});
	},
	'click #reset-password-l': function(e, tmpl) {
		e.preventDefault();

		Router.go('reset.password');
	}
});

/*****************************************************************************/
/* Login: Helpers */
/*****************************************************************************/
Template.Login.helpers({
	tenantUrl: function(){
		return document.location.hostname; //placeholder
	}
});

/*****************************************************************************/
/* Login: Lifecycle Hooks */
/*****************************************************************************/
Template.Login.onCreated(function () {
});

Template.Login.onRendered(function () {
});

Template.Login.onDestroyed(function () {
});
