/*
 * Stock adjustment publications
 *
 * */

Core.publish("StockAdjustments", function (sort, limit) {
  return StockAdjustments.find({}, {
    sort: sort, limit: limit
  });
});


/*
 * Single StockAdjustment publication
 *
 * */
Core.publish("StockAdjustment", function (id) {
  return StockAdjustments.find({_id: id});
});

