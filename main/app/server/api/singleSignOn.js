Meteor.startup(function() {
    ServiceConfiguration.configurations.upsert(
        { service: "adfsoauth" },
        {
            $set: {
                clientId: "1db8ab0d-9d08-4a89-95ca-f69daa5f701d",
                loginStyle: "popup",
                secret: "none",
                publicCertPath : "/hdc01/c$/Certificates Export/Certs/Public key/hdc01.ad.hsdf.org.ng-2018-06-25-064557.cer",
                resource : "sandbox.bulkpay.co/business/pdgypekWZKA3yTgEa",
                profileNameField : "commonname",
                oauthAdfsUrl : "https://hdc01.ad.hsdf.org.ng/adfs/oauth2",
                redirectUrl: "http://sandbox.bulkpay.co/_oauth/adfsoauth"
            }
        }
    );
});
