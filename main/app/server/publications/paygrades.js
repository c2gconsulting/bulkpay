/**
 * Paygrades publications
 */

Core.publish("paygrades", function (businessId) {
    check(businessId, String);
    return PayGrades.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("paygrade", function (id) {
    return PayGrades.find({_id: id});
});

Core.publish("assignedGrades", function (position) {
    return PayGrades.find({positions: position});
});

Core.publish("getpositionGrades", function (ids) {
    check(ids, Array);
    return PayTypes.find({_id: {$in: ids}});
});
//
//Core.publishComposite("getpositionGrades", function (position) {
//    return {
//        find: function () {
//            return PayGrades.find({positions: position});
//        },
//        children: [
//            {
//                find: function (payGrade) {
//                    let ptype = payGrade.payTypes;
//                    let ids = ptype.map(function(t){return t.paytype});
//                    console.log(ids);
//                    return PayTypes.find({_id: {$in: ids}});
//                }
//            }
//        ]
//    }
//});



