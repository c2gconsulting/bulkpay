/*****************************************************************************/
/* Login: Event Handlers */
/*****************************************************************************/
Template.login.events({
	'submit form':function(e) {
		e.preventDefault();
    console.log("you just clicked a submit button");

    let email = $('[name="username"]').val();
		let password = $('[name="password"]').val();

		Meteor.loginWithPassword(email, password, function(err){
			if (err) {
				console.log(err);
				$('div #login_error').removeClass('hide');
				$('div #login_error').html('Your email or password is incorrect');
			} else {
        var currentRoute = Router.current().route.getName();
				console.log(`Log in successful. Current route: ${currentRoute}`)

        if (currentRoute == "login") {
            Router.go("home");
        } else {
					console.log(`Current route is not login`)
				}
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
Template.login.helpers({
	tenantUrl: function(){
		return document.location.hostname; //placeholder
	}
});

/*****************************************************************************/
/* Login: Lifecycle Hooks */
/*****************************************************************************/
Template.login.onCreated(function () {
});

Template.login.onRendered(function () {
});

Template.login.onDestroyed(function () {
});
