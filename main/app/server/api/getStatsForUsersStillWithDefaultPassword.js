var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
});


if (Meteor.isServer) {
    var Auth = {};

    Auth.getStatsForUsersStillWithDefaultPassword = function() {
      let allDaarUsers = Meteor.users.find({businessIds: 'tgC7zYJf9ceSBmoT9'}).fetch()
      console.log(`Num allDaarUsers :: `, allDaarUsers.length)
      
      let numDaarUsersWithRealPassword = 0
      let numDaarUsersWithDefaultPassword = 0
      let daarUsersWithRealPassword = []
      let daarUsersWithDefaultPassword = []

      for (let aDaarUser of allDaarUsers) {
          let hashedDefaultPassword = Package.sha.SHA256("123456") 
          let defaultPassword = {digest: hashedDefaultPassword, algorithm: 'sha-256'};

          let defaultLoginResult = Accounts._checkPassword(aDaarUser, defaultPassword);  

          let firstName = aDaarUser.profile.firstname
          let lastName = aDaarUser.profile.lastname
          let email = aDaarUser.emails[0] ? aDaarUser.emails[0].address : ''

          if(defaultLoginResult.error) {
              daarUsersWithRealPassword.push({
                  firstName : firstName,
                  lastName: lastName,
                  email: email
              })
              numDaarUsersWithRealPassword += 1
          } else {
              daarUsersWithDefaultPassword.push({
                  firstName : firstName,
                  lastName: lastName,
                  email: email
              })
              numDaarUsersWithDefaultPassword += 1
          }
      }
      //--
      // console.log(`daarUsersWithRealPassword: \n${JSON.stringify(daarUsersWithRealPassword)}\n`)
      // console.log(`daarUsersWithDefaultPassword: \n${JSON.stringify(daarUsersWithDefaultPassword)}\n\n`)
      // //--
      console.log(`numDaarUsersWithRealPassword: ${numDaarUsersWithRealPassword}\n`)
      console.log(`numDaarUsersWithDefaultPassword: ${numDaarUsersWithDefaultPassword}\n`)
      console.log(`All done!`)
      return {daarUsersWithRealPassword, daarUsersWithDefaultPassword, numDaarUsersWithRealPassword, numDaarUsersWithDefaultPassword}
  } 

  Api.addRoute('v1/getStatsForUsersStillWithDefaultPassword', {
      get: {
          action: function(){
              return Auth.getStatsForUsersStillWithDefaultPassword()
          }
      }
  });
}
