/*****************************************************************************/
/* DashTransactionVolumes: Event Handlers */
/*****************************************************************************/
Template.DashTransactionVolumes.events({
  'click a[href="#year"]': function (e, tmpl) {
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
  'click a[href="#month"]': function (e, tmpl) {
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
    index = Session.get("index") || 0;
    index++;
    Session.set("index", index);
  },
  "click .slide-left": function (e, tmpl) {
    index = Session.get("index") || 0;
    index--;
    Session.set("index", index);
  },
});

/*****************************************************************************/
/* DashTransactionVolumes: Helpers */
/*****************************************************************************/
Template.DashTransactionVolumes.helpers({
  result: function () {
    return Template.instance().totalTransactions.get("filterResult");
  },
  company: function () {
    return Session.get("companyDashboardFilter");
  },

  billFilter: function () {
    return Template.instance().totalTransactions.get("totalTransactionsFilter");
  },
  filterResult: function () {
    return Template.instance().totalTransactions.get("filterResult");
  },
  enableLoading: function () {
    return Template.instance().totalTransactions.get("showLoading");
  },

  inc: function () {
    index = Session.get("index");
    length = Template.instance().totalTransactions.get("states").length;

    return index < length - 1 ? true : false;
  },

  dec: function () {
    index = Session.get("index");
    length = Template.instance().totalTransactions.get("states").length;

    return 0 < index ? true : false;
  },

  state: function () {
    states = Template.instance().totalTransactions.get("states");
    index = Session.get("index") || 0;
    return states[index];
  },
});

/*****************************************************************************/
/* DashTransactionVolumes: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTransactionVolumes.onCreated(function () {
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
  Session.set("index", 0);

  let transactionVolumeFilter = Template.instance().totalTransactions.get(
    "totalTransactionsFilter"
  );

  if (!transactionVolumeFilter) {
    instance.totalTransactions.set("totalTransactionsFilter", "Year");
  }

  instance.autorun(function () {
    Meteor.subscribe("Company");
    transactionVolumeFilter = Template.instance().totalTransactions.get(
      "totalTransactionsFilter"
    );
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

    instance.totalTransactions.set("showLoading", true);
    index = Session.get("index");
    state = Template.instance()
      .totalTransactions.get("states")
      [index].value.replace(/ /g, "_");

    Meteor.call(
      "transactions/totalNumOfRecords",
      state,
      transactionVolumeFilter,
      companyNames,
      "totalTransactions",
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

Template.DashTransactionVolumes.onRendered(function () {});

Template.DashTransactionVolumes.onDestroyed(function () {});

function getTransactionData(data) {
  if (data) {
    let negative = false;
    let totalRecord = data.currentDuration[0]
      ? data.currentDuration[0].count
      : 0;
    if (data.previousDuration) {
      let previousTotalRecord = data.previousDuration[0]
        ? data.previousDuration[0].count
        : 0;
      if (previousTotalRecord) {
        let diff =
          ((totalRecord - previousTotalRecord) / previousTotalRecord) * 100;
        if (diff < 0) negative = true;
        return {
          totalRecord: totalRecord,
          percentage: Math.abs(diff),
          negative: negative,
        };
      } else {
        return {
          totalRecord: totalRecord,
        };
      }
    } else {
      return {
        totalRecord: totalRecord,
      };
    }
  }
}
