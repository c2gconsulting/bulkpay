/**
 * orders
 */

Core.publish("StockTransfers", function (sort, limit) {
    return StockTransfers.find({},{
        sort: sort, limit: limit
    });

});


Core.publish("StockTransfer", function(id){
    return StockTransfers.find({ _id: id });
})