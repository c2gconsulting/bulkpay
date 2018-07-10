import { HTTP } from 'meteor/http'
// var options = { host: 'hdc01.ad.hsdf.org.ng', 
//                 path: '/adfs/oauth2/authorize',
//                 method:'GET' };
// HTTP.call(options,
//  {
//   params: {
//     "response_type":"code",
//     "client_id":"1db8ab0d-9d08-4a89-95ca-f69daa5f701d",
//     "redirect_uri":"http://sandbox.bulkpay.co/_oauth/adfsoauth",
//     "resource":"sandbox.bulkpay.co/business/pdgypekWZKA3yTgEa"

//   }
// }, function( error, response ) {
//   if ( error ) {
//     console.log( error );
//   } else {
//     console.log( response );  }
// });
var response = HTTP.call( 'GET', 'hdc01.ad.hsdf.org.ng/adfs/oauth2/authorize', {
  params: {
        "response_type":"code",
        "client_id":"1db8ab0d-9d08-4a89-95ca-f69daa5f701d",
        "redirect_uri":"http://sandbox.bulkpay.co/_oauth/adfsoauth",
        "resource":"sandbox.bulkpay.co/business/pdgypekWZKA3yTgEa"
    
      }
} );
console.log("response is:" );
console.log(response );