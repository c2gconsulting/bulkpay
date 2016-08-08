

const getAggregation = (duration) => {
  let object = {}, dateTo, dateFrom;
  switch (duration) {
    case 'Today':
      dateTo = moment().format('YYYY-MM-DD');
      dateFrom = moment().subtract(14,'d').format('YYYY-MM-DD');
      object.match = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
      object.range = {
        $dayOfMonth: '$postingDate'
      };
      break;
    case 'Monthly':
      dateTo = moment().endOf('month')._d;
      dateFrom = moment().startOf('year')._d;
      object.match = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
      object.range = {
        $month: '$postingDate'
      };
      break;
    case 'Annual':
      dateTo = moment().endOf('month')._d;
      object.match = {
        $lte: new Date(dateTo)
      };
      object.range = {
        $year: '$postingDate'
      };
      break;
  }
  return object;
};

Meteor.methods({

  "customertransactions/transactions": function (duration, customerId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    let tenantId = Core.getTenantId(Meteor.userId());
    let aggregateOptions = getAggregation(duration);

    return CustomerTransactions.aggregate([
      { $match: { _groupId: tenantId, customerId: customerId, postingDate: aggregateOptions.match  } },
      {
        "$project": {
          "duration": aggregateOptions.range,
          "type": "$transactionType",
          "date": "$postingDate"
        }
      },
      {
        "$group": {
          "_id": {
            "time": "$duration",
            "transaction": "$type",
            "date": "$date"
          },
          count: {
            "$sum": 1
          }
        }
      }
    ]);
  }
});