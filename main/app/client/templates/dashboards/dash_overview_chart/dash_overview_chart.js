/*****************************************************************************/
/* DashOverviewChart: Event Handlers */
/*****************************************************************************/
Template.DashOverviewChart.events({});

/*****************************************************************************/
/* DashOverviewChart: Helpers */
/*****************************************************************************/
Template.DashOverviewChart.helpers({
  enableLoading: function () {
    return Template.instance().billGraph.get("showLoading");
  },
});

/*****************************************************************************/
/* DashOverviewChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DashOverviewChart.onCreated(function () {
  let instance = this;
  instance.billGraph = new ReactiveDict();
  instance.billGraph.set("showLoading", true);
  instance.autorun(function () {
    instance.billGraph.set("showLoading", true);

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

    Meteor.call("bills/paidChart", companyNames, function (err, res) {
      if (res) {
        var paidBillsData = [];
        let currentMonth = moment().month();
        let monthInNumber = _.range(1, currentMonth + 2);
        _.each(monthInNumber, function (month) {
          let foundData = _.find(res, function (r) {
            return Number(r._id.month) === month;
          });
          if (foundData) {
            paidBillsData.push(foundData.count);
          } else {
            paidBillsData.push(0);
          }
        });
        Session.set("TotalPaidBills", paidBillsData);
      }
    });
    Meteor.call("bills/chart", companyNames, function (err, res) {
      if (res) {
        var newData = [];
        let currentMonth = moment().month();
        let monthInNumber = _.range(1, currentMonth + 2);
        _.each(monthInNumber, function (month) {
          let foundData = _.find(res, function (r) {
            return Number(r._id.month) === month;
          });
          if (foundData) {
            newData.push(foundData.count);
          } else {
            newData.push(0);
          }
        });
        instance.billGraph.set("showLoading", false);
        drawChart(newData, monthInNumber);
      }
    });
  });
});

Template.DashOverviewChart.onRendered(function () {
  // Deps.autorun(function() {
  //   drawChart();
  // });
});

Template.DashOverviewChart.onDestroyed(function () {});

function drawChart(data, months) {
  /* ChartJS
   * -------
   * Here we will create a few charts using ChartJS
   */

  //-----------------------
  //- MONTHLY SALES CHART -
  //-----------------------

  // Get context with jQuery - using jQuery's .get() method.
  var salesChartCanvas = $("#salesChart").get(0).getContext("2d");
  // This will get the first returned node in the jQuery collection.
  var salesChart = new Chart(salesChartCanvas);

  months.push(2);
  months.push(3);
  months.push(4);
  months.push(5);
  months.push(6);
  months.push(7);
  months.push(8);
  months.push(9);
  months.push(10);
  months.push(11);
  months.push(12);

  var salesChartData = {
    labels: getChatMonthLabel(months),
    datasets: [
      {
        label: "TotalBills",
        fillColor: "rgb(224, 241, 247)",
        strokeColor: "rgb(25, 163, 209)",
        pointColor: "rgb(25, 163, 209)",
        fill: false, // 3: no fill
        pointStrokeColor: "#fff",
        pointHighlightFill: "rgb(224, 241, 247)",
        pointHighlightStroke: "#fff",
        data,
        // data: [20,30,20,50,33,70,55,90,56,77,23,45]
      },
      {
        label: "TotalPaidBills",
        fillColor: "rgb(209, 25, 25)",
        strokeColor: "rgb(209, 25, 25)",
        pointColor: "rgb(209, 25, 25)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "rgb(209, 25, 25)",
        pointHighlightStroke: "#fff",
        data: Session.get("TotalPaidBills"),
        // data: [15,20,14,21,32,34,56,34,24,43,34,25]
      },
    ],
  };

  var salesChartOptions = {
    datasetFill: false,
  };

  //Create the line chart
  salesChart.Line(salesChartData, salesChartOptions);

  //---------------------------
  //- END MONTHLY SALES CHART -
  //---------------------------
}
