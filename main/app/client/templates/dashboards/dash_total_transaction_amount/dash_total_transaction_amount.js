/*****************************************************************************/
/* DashTotalTransactionAmount: Event Handlers */
/*****************************************************************************/
Template.DashTotalTransactionAmount.events({
  'click a[href="#annually"]': function (e, tmpl) {
    Template.instance().totalTransactions.set(
      "totalTransactionsFilter",
      "Year"
    );
  },
  'click a[href="#quarter"]': function (e, tmpl) {
    Template.instance().totalTransactions.set(
      "totalTransactionsFilter",
      "Quarter"
    );
  },
  'click a[href="#monthly"]': function (e, tmpl) {
    Template.instance().totalTransactions.set(
      "totalTransactionsFilter",
      "Month"
    );
  },
  'click a[href="#all"]': function (e, tmpl) {
    Template.instance().totalTransactions.set("totalTransactionsFilter", "All");
  },
  'click a[href="#week"]': function (e, tmpl) {
    Template.instance().totalTransactions.set(
      "totalTransactionsFilter",
      "Week"
    );
  },
  'click a[href="#today"]': function (e, tmpl) {
    Template.instance().totalTransactions.set(
      "totalTransactionsFilter",
      "Today"
    );
  },
  "click .slide-right": function (e, tmpl) {
    index = Session.get("amount-index") || 0;
    index++;
    Session.set("amount-index", index);
  },
  "click .slide-left": function (e, tmpl) {
    index = Session.get("amount-index") || 0;
    index--;
    Session.set("amount-index", index);
  },
});

/*****************************************************************************/
/* DashTotalTransactionAmount: Helpers */
/*****************************************************************************/
Template.DashTotalTransactionAmount.helpers({
  result: function () {
    return Template.instance().totalTransactions.get("filterResult");
  },

  adjResultTotal: function () {
    let result = Template.instance().totalTransactions.get("filterResult");
    let totalAmount = result ? result.totalAmount : 0;
    return totalAmount;
    //    return totalAmount >= 1000000000 ? totalAmount / 1000 : totalAmount;
  },

  nearestThou: function () {
    let result = Template.instance().totalTransactions.get("filterResult");
    let totalAmount = result ? result.totalAmount : 0;
    return totalAmount >= 1000000000 ? "('000)" : "";
  },

  transactionFilter: function () {
    return Template.instance().totalTransactions.get("totalTransactionsFilter");
  },

  filterResult: function () {
    return Template.instance().totalTransactions.get("filterResult");
  },
  enableLoading: function () {
    return Template.instance().totalTransactions.get("showLoading");
  },

  inc: function () {
    index = Session.get("amount-index");
    length = Template.instance().totalTransactions.get("states").length;

    return index < length - 1 ? true : false;
  },

  dec: function () {
    index = Session.get("amount-index");
    length = Template.instance().totalTransactions.get("states").length;

    return 0 < index ? true : false;
  },

  state: function () {
    states = Template.instance().totalTransactions.get("states");
    index = Session.get("amount-index") || 0;
    return states[index];
  },
});

/*****************************************************************************/
/* DashTotalTransactionAmount: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTotalTransactionAmount.onCreated(function () {
  let instance = this;
  instance.totalTransactions = new ReactiveDict();
  instance.totalTransactions.set("showLoading", true);
  instance.totalTransactions.set("states", [
    // {
    //   title: "Total"
    // },
    {
      title: "Total VAT",
      value: "Total VAT",
    },
    {
      title: "Total WHT",
      value: "Total WHT",
    },
    {
      title: "Total WHV",
      value: "Total WHV",
    },
  ]);
  Session.set("amount-index", 0);

  let transactionVolumeFilter = Template.instance().totalTransactions.get(
    "totalTransactionsFilter"
  );

  if (!transactionVolumeFilter) {
    instance.totalTransactions.set("totalTransactionsFilter", "Year");
  }

  instance.autorun(function () {
    transactionVolumeFilter = Template.instance().totalTransactions.get(
      "totalTransactionsFilter"
    );
    instance.totalTransactions.set("showLoading", true);
    index = Session.get("amount-index");
    state = Template.instance()
      .totalTransactions.get("states")
      [index].value.replace(/ /g, "_");
    let industryFilter = Session.get("industryFilter");
    let companyFilter = Session.get("companyFilter");
    let companyNames = "all";

    if (industryFilter && industryFilter != "all") {
      const filter = {
        industry: industryFilter,
        status: "ACTIVE",
      };
      let companies = Companies.find(filter).fetch();
      companyNames = companies.map((company) => company.name);
    }

    if (companyFilter && companyFilter != "all") {
      company = Companies.findOne({
        _id: companyFilter,
      });
      companyNames = [company.name];
    }

    if (Core.isStakeholder()) {
      const companyId = Meteor.user().profile.companyId;
      const company = Companies.findOne({
        _id: companyId,
      });
      companyNames = [company.name];
    }

    Meteor.call(
      "transactions/totalAmount",
      state,
      transactionVolumeFilter,
      companyNames,
      function (err, res) {
        if (res) {
          let data = getTransactionData(res);
          if (data) {
            instance.totalTransactions.set("filterResult", data);
            instance.totalTransactions.set("showLoading", false);
          }
        }
      }
    );
  });
});

Template.DashTotalTransactionAmount.onRendered(function () {});

Template.DashTotalTransactionAmount.onDestroyed(function () {});

function getTransactionData(data) {
  if (data) {
    let negative = false;
    let current = data.currentDuration[0]
      ? data.currentDuration[0].totalAmount
      : 0;
    let totalRecord = data.currentDuration[0]
      ? data.currentDuration[0].count
      : 0;
    if (data.previousDuration) {
      let previous = data.previousDuration[0]
        ? data.previousDuration[0].totalAmount
        : 0;
      if (previous) {
        let diff = ((current - previous) / previous) * 100;
        if (diff < 0) negative = true;
        return {
          totalRecord: totalRecord,
          totalAmount: current,
          percentage: Math.abs(diff),
          oldTotal: previous,
          negative: negative,
        };
      } else {
        return { totalRecord: totalRecord, totalAmount: current };
      }
    } else {
      return { totalRecord: totalRecord, totalAmount: current };
    }
  }
}
