/*****************************************************************************/
/* DashTotalPaidBills: Event Handlers */
/*****************************************************************************/
Template.DashTotalPaidBills.events({
  'click a[href="#year"]': function (e, tmpl) {
    Template.instance().paidBills.set("totalPaidBillsFilter", "Year");
  },
  'click a[href="#quarter"]': function (e, tmpl) {
    Template.instance().paidBills.set("totalPaidBillsFilter", "Quarter");
  },
  'click a[href="#month"]': function (e, tmpl) {
    Template.instance().paidBills.set("totalPaidBillsFilter", "Month");
  },
  'click a[href="#all"]': function (e, tmpl) {
    Template.instance().paidBills.set("totalPaidBillsFilter", "All");
  },
  'click a[href="#week"]': function (e, tmpl) {
    Template.instance().paidBills.set("totalPaidBillsFilter", "Week");
  },
  'click a[href="#today"]': function (e, tmpl) {
    Template.instance().paidBills.set("totalPaidBillsFilter", "Today");
  },
});

/*****************************************************************************/
/* DashTotalPaidBills: Helpers */
/*****************************************************************************/
Template.DashTotalPaidBills.helpers({
  result: function () {
    return Template.instance().paidBills.get("filterResult");
  },

  billFilter: function () {
    return Template.instance().paidBills.get("totalPaidBillsFilter");
  },

  filterResult: function () {
    return Template.instance().paidBills.get("filterResult");
  },
  enableLoading: function () {
    return Template.instance().paidBills.get("showLoading");
  },
});

/*****************************************************************************/
/* DashTotalPaidBills: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTotalPaidBills.onCreated(function () {
  let instance = this;
  instance.paidBills = new ReactiveDict();
  instance.paidBills.set("showLoading", true);

  let billVolumeFilter = Template.instance().paidBills.get(
    "totalPaidBillsFilter"
  );

  if (!billVolumeFilter) {
    instance.paidBills.set("totalPaidBillsFilter", "Year");
  }

  instance.autorun(function () {
    billVolumeFilter = Template.instance().paidBills.get(
      "totalPaidBillsFilter"
    );
    instance.paidBills.set("showLoading", true);
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
      "bills/totalPaidAmount",
      billVolumeFilter,
      companyNames,
      function (err, res) {
        if (res) {
          let data = getBillData(res);

          if (data) {
            instance.paidBills.set("filterResult", data);
            instance.paidBills.set("showLoading", false);
          }
        }
      }
    );
  });
});

Template.DashTotalPaidBills.onRendered(function () {});

Template.DashTotalPaidBills.onDestroyed(function () {});

function getBillData(data) {
  if (data) {
    let negative = false;
    let current = data.currentDuration[0] ? data.currentDuration[0].count : 0;
    let totalRecord = data.currentDuration[0]
      ? data.currentDuration[0].totalAmount
      : 0;
    let amount = current || 0;
    if (data.previousDuration) {
      let previous = data.previousDuration[0]
        ? data.previousDuration[0].count
        : 0;
      let previousTotalRecord = data.previousDuration[0]
        ? data.previousDuration[0].totalAmount
        : 0;
      let previousAverage = previous / previousTotalRecord || 0;
      if (previousAverage) {
        let diff = ((amount - previousAverage) / previousAverage) * 100;
        if (diff < 0) negative = true;
        return {
          totalRecord: totalRecord,
          totalAmount: amount,
          percentage: Math.abs(diff),
          oldTotal: previous,
          negative: negative,
        };
      } else {
        return { totalRecord: totalRecord, totalAmount: amount };
      }
    } else {
      return { totalRecord: totalRecord, totalAmount: amount };
    }
  }
}
