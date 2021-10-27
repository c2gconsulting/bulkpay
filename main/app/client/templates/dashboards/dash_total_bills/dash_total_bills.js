/*****************************************************************************/
/* DashTotalBills: Event Handlers */
/*****************************************************************************/
Template.DashTotalBills.events({
  'click a[href="#year"]': function (e, tmpl) {
    Template.instance().totalBills.set("totalBillsFilter", "Year");
  },
  'click a[href="#quarter"]': function (e, tmpl) {
    Template.instance().totalBills.set("totalBillsFilter", "Quarter");
  },
  'click a[href="#month"]': function (e, tmpl) {
    Template.instance().totalBills.set("totalBillsFilter", "Month");
  },
  'click a[href="#all"]': function (e, tmpl) {
    Template.instance().totalBills.set("totalBillsFilter", "All");
  },
  'click a[href="#week"]': function (e, tmpl) {
    Template.instance().totalBills.set("totalBillsFilter", "Week");
  },
  'click a[href="#today"]': function (e, tmpl) {
    Template.instance().totalBills.set("totalBillsFilter", "Today");
  },
});

/*****************************************************************************/
/* DashTotalBills: Helpers */
/*****************************************************************************/
Template.DashTotalBills.helpers({
  result: function () {
    return Template.instance().totalBills.get("filterResult");
  },

  billFilter: function () {
    return Template.instance().totalBills.get("totalBillsFilter");
  },

  filterResult: function () {
    return Template.instance().totalBills.get("filterResult");
  },
  enableLoading: function () {
    return Template.instance().totalBills.get("showLoading");
  },
});

/*****************************************************************************/
/* DashTotalBills: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTotalBills.onCreated(function () {
  let instance = this;
  instance.totalBills = new ReactiveDict();
  instance.totalBills.set("showLoading", true);

  let billVolumeFilter = Template.instance().totalBills.get("totalBillsFilter");

  if (!billVolumeFilter) {
    instance.totalBills.set("totalBillsFilter", "Year");
  }

  instance.autorun(function () {
    billVolumeFilter = Template.instance().totalBills.get("totalBillsFilter");
    instance.totalBills.set("showLoading", true);
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

    Meteor.call("bills/totalAmount", billVolumeFilter, companyNames, function (
      err,
      res
    ) {
      if (res) {
        let data = getBillData(res);
        if (data) {
          instance.totalBills.set("filterResult", data);
          instance.totalBills.set("showLoading", false);
        }
      }
    });
  });
});

Template.DashTotalBills.onRendered(function () {});

Template.DashTotalBills.onDestroyed(function () {});

function getBillData(data) {
  if (data) {
    let negative = false;
    let totalRecord = data.currentDuration[0]
      ? data.currentDuration[0].totalAmount
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
        return { totalRecord: totalRecord };
      }
    } else {
      return { totalRecord: totalRecord };
    }
  }
}
