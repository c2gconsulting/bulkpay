/**
 *  Currencies Methods
 */
Meteor.methods({
    "currency/create": function(currency){
        console.log(`Currency details: ${JSON.stringify(currency)}`)
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }

        try {
            check(currency, Core.Schemas.Currency);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the currency. Please correct and retry");
        }
        this.unblock();

        let numberOfCurrencyWithSameCode = Currencies.find({code: currency.code}).count();
        if(numberOfCurrencyWithSameCode > 0) {
            let errMsg = "Sorry, that currency can't be created because it is already exists.";
            throw new Meteor.Error(409, errMsg);
        } else {
            console.log("About to insert");
            let newCurrencyId = Currencies.insert(currency);
            return {_id: newCurrencyId};
        }
    },
    "currency/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        Currencies.remove({_id: id});
    },
    "currency/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission

        check(id, String);
        const selector = {
            _id: id
        };
        const result = Currencies.update(selector, {$set: details} );
        return result;
    }
});

