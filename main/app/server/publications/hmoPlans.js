
Core.publish("HmoPlans", function (filter, limit, sort) {
    let hmoPlansCursor = HmoPlans.find(filter, {sort: sort, limit: limit});
    let hmoPlans = hmoPlansCursor.fetch();

    if (hmoPlans && hmoPlans.length > 0){
        return hmoPlansCursor;
    }
    return this.ready();
});
