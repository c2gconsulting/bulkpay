
Core.publish("alltimedata", function (businessId) {
    this.unblock();
    check(businessId, String);

    let currentId = this.userId;
    let user = Meteor.users.findOne({_id: currentId});
    if (user &&  user.employeeProfile &&
        user.employeeProfile.employment && user.employeeProfile.employment.position){
        let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
            return x._id
        });

        const selector = {
            businessIds: businessId,
            employee: true,
            "employeeProfile.employment.position": {$in: positions}
        };
        const users = Meteor.users.find(selector).fetch();
        const allSubs = getIds(users);
        allSubs.push(currentId);
        const allPositions = getPositions(allSubs);

        return [
            TimeWritings.find({employeeId: {$in: allSubs}}),
            TimeRecord.find({createdBy: {$in: allSubs}}),
            Leaves.find({employeeId: {$in: allSubs}}),
            LeaveTypes.find({businessId: businessId, status: 'Active'}),
            EntityObjects.find({_id: {$in: allPositions}})
        ];
    } else {
        return this.ready();
    }
});

Core.publish("timewritings", function (businessId, superviseeUserIds) {
    this.unblock();
    check(businessId, String);

    return [
        TimeWritings.find({employeeId: {$in: superviseeUserIds}}),
        Leaves.find({employeeId: {$in: superviseeUserIds}})
    ];
});

Core.publish("timewritingsformonth", function (businessId, month, year) {
    this.unblock();
    check(businessId, String);

    // const monthAsNum = Number(month - 1)
    // const yearAsNum = Number(year)

    // const monthMoment = moment().month(monthAsNum).year(yearAsNum)
    // const monthStartMoment = monthMoment.clone().startOf('month')
    // const monthEndMoment = monthMoment.clone().endOf('month')

    // const monthStart = monthStartMoment.format('YYYY-MM-DDTHH:mm:ss')
    // const monthEnd = monthEndMoment.format('YYYY-MM-DDTHH:mm:ss')

    // return TimeWritings.find({
    //     businessId: businessId,
    //     day: {$gte: monthStartMoment.toDate(), $lte: monthEndMoment.toDate()}
    // });

    return TimeWritings.find({
        businessId: businessId
    });
});


Core.publish("timesForDay", function (businessId, dayAsDate) {
    this.unblock();
    check(businessId, String);

    var dayStart = moment(dayAsDate).startOf('day').toDate();
    var dayEnd = moment(dayAsDate).endOf('day').toDate();

    let timesFound = TimeWritings.find({
        employeeId: this.userId,
        day: {$gte: dayStart, $lt: dayEnd}
    });
    return timesFound
});


function getIds(users){
    const newUsers = [...users];
    const ids = newUsers.map(x => {
        return x._id;
    });
    return ids;
}

function getPositions(users){
    const newArray = Meteor.users.find({_id: {$in: users}}).fetch().map(x => {
        if(x.employeeProfile.employment.position)
            return x.employeeProfile.employment.position
    });
    return newArray;
}
