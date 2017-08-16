
Core.publish("HmoPlans", function (filter, limit, sort) {
    let hmoPlansCursor = HmoPlans.find(filter, {sort: sort, limit: limit});
    let hmoPlans = hmoPlansCursor.fetch();

    if (hmoPlans && hmoPlans.length > 0){
        return hmoPlansCursor;
    }
    return this.ready();
});

Core.publish("HmoPlansWithNoPagination", function (bid) {
    let hmoPlansCursor = HmoPlans.find({businessId: bid});
    let hmoPlans = hmoPlansCursor.fetch();

    if (hmoPlans && hmoPlans.length > 0){
        return hmoPlansCursor;
    }
    return this.ready();
});

Core.publish("HmoPlanChangeRequests", function (bid) {
    let user = this.userId;
    if(bid && user){
        let hmoPlanChangeRequestsCursor = HmoPlanChangeRequests.find({businessId: bid, employeeId: user});
        
        return [hmoPlanChangeRequestsCursor, HmoPlans.find({businessId: bid})];
    }
    return this.ready();
});