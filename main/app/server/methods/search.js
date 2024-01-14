Meteor.methods({
  "search/tripRequest": function (
    searchText,
    conditions,
    searchListFilter = {}
  ) {
    console.log("logs/searchLogs", searchText, logsListFilter);

    let startDate = moment().subtract(12, "months")._d;

    let filter = {
      $or: [
        { description: { $regex: `${searchText}`, $options: "i" } },
        { collectionName: { $regex: `${searchText}`, $options: "i" } },
        { "user.email": { $regex: `${searchText}`, $options: "i" } },
      ],
    };

    if (conditions["$and"] && conditions["$and"][1]["$or"]) {
      conditions["$and"][1]["$or"] = [
        ...conditions["$and"][1]["$or"],
        { description: { $regex: `${searchText}`, $options: "i" } },
        { collectionName: { $regex: `${searchText}`, $options: "i" } },
        { "user.email": { $regex: `${searchText}`, $options: "i" } },
      ];
      filter = { ...conditions };
    } else {
      filter = {
        ...conditions,
        $or: [
          { description: { $regex: `${searchText}`, $options: "i" } },
          { collectionName: { $regex: `${searchText}`, $options: "i" } },
          { "user.email": { $regex: `${searchText}`, $options: "i" } },
        ],
      };
    }

    if (
      searchListFilter.startDate &&
      searchListFilter.endDate >= searchListFilter.startDate
    ) {
      filter["createdAt"] = {
        $gte: searchListFilter.startDate,
        $lte: searchListFilter.endDate,
      };
    } else if (
      searchListFilter.startDate &&
      searchListFilter.endDate < searchListFilter.startDate
    ) {
      filter["createdAt"] = {
        $gte: searchListFilter.startDate,
      };
    } else {
      filter["createdAt"] = {
        $gte: startDate,
      };
    }

    if (searchListFilter.events && searchListFilter.events.length > 0) {
      filter["event"] = { $in: searchListFilter.events };
    }

    if (
      searchListFilter.collections &&
      searchListFilter.collections.length > 0
    ) {
      filter["collectionName"] = { $in: searchListFilter.collections };
    }

    console.log("filter ", filter);

    return TravelRequisition2s.find(filter).fetch();
  },
});
