/*****************************************************************************/
/* Login: Event Handlers */
/*****************************************************************************/
Template.login.events({
	'submit form':function(e) {
		e.preventDefault();

    let email = $('[name="username"]').val();
		let password = $('[name="password"]').val();

		if(email.indexOf('@') >= 0) {
				// Meteor.loginWithPassword(email, password, function(err){
				// 	if (err) {
				// 		console.log(err);
				// 		$('div #login_error').removeClass('hide');
				// 		$('div #login_error').html('Your email or password is incorrect');
				// 	} else {
				// 		var currentRoute = Router.current().route.getName();

				// 		if (currentRoute == "login") {
				// 				Router.go("home");
				// 		} else {
				// 			console.log(`Current route is not login`)
				// 		}
				// 	}
				// })
				//--
				let hashedPassword = Package.sha.SHA256(password)

				Meteor.call('account/customLoginWithEmail', email, hashedPassword, function(err, res) {
					if(err) {
						$('div #login_error').removeClass('hide');
						$('div #login_error').html(err.reason);
					} else {
						$('div #login_error').addClass('hide');
						$('div #login_error').html('');

						if(res.status === true) {
							if(res.loginType === 'usingDefaultPassword') {
								Router.go('reset.password', {token: res.resetPasswordToken})
							} else {
								Meteor.loginWithPassword(email, password, function(err){
									if (!err) {
										var currentRoute = Router.current().route.getName();

										if (currentRoute == "login") {
												Router.go("home");
										} else {
											console.log(`Current route is not login`)
										}
									}
								})
							}
						}
					}
				})
		 } else {
				let hashedPassword = Package.sha.SHA256(password)
				Meteor.call('account/customLogin', email, hashedPassword, function(err, res) {
						if(err) {
							$('div #login_error').removeClass('hide');
							$('div #login_error').html(err.reason);
						} else {
							$('div #login_error').addClass('hide');
							$('div #login_error').html('');
							console.log(`res: `, res)

							if(res.status === true) {
								if(res.loginType === 'usingDefaultPassword') {
									Router.go('reset.password', {token: res.resetPasswordToken})
								} else {
									Meteor.loginWithPassword(res.userEmail, password, function(err){
										console.log(`err 1: `, err)
										if (!err) {
											var currentRoute = Router.current().route.getName();

											if (currentRoute == "login") {
													Router.go("home");
											} else {
												console.log(`Current route is not login`)
											}
										}
									});
								}
							}
						}
				})
		 }
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
