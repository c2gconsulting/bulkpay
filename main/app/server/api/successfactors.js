var Api = new Restivus({
  useDefaultAuth: true,
  prettyJson: true
});


if (Meteor.isServer) {
  var Auth = {};

  // maps to /api/v1/successfactors/sync/newemployee
  Api.addRoute('v1/successfactors/sync/newemployee', {
      post: {
          action: function() {
              const postBody = this.bodyParams;
              console.log(`postBody: `, postBody);

              const headers = this.request.headers;
              console.log(`headers: `, headers)

              return {
                status: 'success',
                message: 'Got post body from successfactors'
              }
          }
      }
  });
}
