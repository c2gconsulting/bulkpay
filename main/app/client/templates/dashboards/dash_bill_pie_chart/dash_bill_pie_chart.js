/*****************************************************************************/
/* DashBillsPieChart: Event Handlers */
/*****************************************************************************/
Template.DashBillsPieChart.events({
  'click a[href="#year"]': function (e, tmpl) {
    Template.instance().picChartData.set("dateFilter", "Year");
  },
  'click a[href="#month"]': function (e, tmpl) {
    Template.instance().picChartData.set("dateFilter", "Month");
  },
  'click a[href="#all"]': function (e, tmpl) {
    Template.instance().picChartData.set("dateFilter", "All");
  },
  'click a[href="#week"]': function (e, tmpl) {
    Template.instance().picChartData.set("dateFilter", "Week");
  },
  'click a[href="#today"]': function (e, tmpl) {
    Template.instance().picChartData.set("dateFilter", "Today");
  },
});

/*****************************************************************************/
/* DashBillsPieChart: Helpers */
/*****************************************************************************/
Template.DashBillsPieChart.helpers({
  result: function () {
    return Template.instance().picChartData.get("filterResult");
  },

  billFilter: function () {
    return Template.instance().picChartData.get("dateFilter");
  },

  textColor: function (status) {
    if (status === "OPEN") return "text-dark-yellow";
    if (status === "PARTIALLY_PAID") return "text-blue";
    if (status === "FULLY_PAID") return "text-green";
    if (status === "AWAITING_PAYMENT") return "text-purple";
    if (status === "DISPUTED") return "text-red";
    if (status === "PENDING_APPROVAL") return "text-yellow";
  },

  totalRecord: function () {
    let total = 0;
    let data = Template.instance().picChartData.get("filterResult");
    _.each(data, function (i) {
      total += i.total;
    });
    return total;
  },

  percentageRatio: function (total, totalRec) {
    //let diff = ( (total - totalRec) / ( (total + totalRec) / 2 ) ) * 100;
    if (!totalRec) return 0;

    let p = (total / totalRec) * 100;
    p = Math.abs(p);
    p = Math.round(p);
    return p;
  },
  enableLoading: function () {
    return Template.instance().picChartData.get("showLoading");
  },
});

/*****************************************************************************/
/* DashBillsPieChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DashBillsPieChart.onCreated(function () {
  let instance = this;
  instance.picChartData = new ReactiveDict();
  instance.picChartData.set("showLoading", true);

  let dateFilter = Template.instance().picChartData.get("dateFilter");

  if (!dateFilter) {
    instance.picChartData.set("dateFilter", "Year");
  }

  instance.autorun(function () {
    dateFilter = Template.instance().picChartData.get("dateFilter");
    instance.picChartData.set("showLoading", true);
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

    Meteor.call("bills/statusChart", dateFilter, companyNames, function (
      err,
      res
    ) {
      if (res) {
        instance.picChartData.set("filterResult", res);
        instance.picChartData.set("showLoading", false);
        runPieChat(res);
      }
    });
  });
});

Template.DashBillsPieChart.onRendered(function () {
  Deps.autorun(function () {
    runPieChat();
  });
});

Template.DashBillsPieChart.onDestroyed(function () {});

Template.DashBillsPieChart.rendered = function () {
  Deps.autorun(function () {
    runPieChat();
  });
};

function runPieChat(data) {
  //-------------
  //- PIE CHART -
  //-------------
  // Get context with jQuery - using jQuery's .get() method.
  var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
  var pieChart = new Chart(pieChartCanvas);
  var PieData = [];


  _.each(data, function (d) {
    let chartData = {};
    chartData.value = d.total;
    chartData.color = displayFor(d.status);
    chartData.highlight = displayFor(d.status);
    chartData.label = d.status;
    PieData.push(chartData);
  });

  var pieOptions = {
    //Boolean - Whether we should show a stroke on each segment
    segmentShowStroke: true,
    //String - The colour of each segment stroke
    segmentStrokeColor: "#fff",
    scaleStepWidth: 500,
    //Number - The width of each segment stroke
    segmentStrokeWidth: 1,
    //Number - The percentage of the chart that we cut out of the middle
    percentageInnerCutout: 50, // This is 0 for Pie charts
    //Number - Amount of animation steps
    animationSteps: 100,
    //String - Animation easing effect
    animationEasing: "easeOutBounce",
    //Boolean - Whether we animate the rotation of the Doughnut
    animateRotate: true,
    //Boolean - Whether we animate scaling the Doughnut from the centre
    animateScale: false,
    //Boolean - whether to make the chart responsive to window resizing
    responsive: true,
    // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
    maintainAspectRatio: false,
    //String - A legend template
    legendTemplate:
      '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>',
    //String - A tooltip template
    tooltipTemplate: "<%=value %> <%=label%> BILLS",
  };
  //Create pie or douhnut chart
  // You can switch between pie and douhnut using the method below.
  pieChart.Doughnut(PieData, pieOptions);
  //-----------------
  //- END PIE CHART -
  //-----------------
}
function displayFor(status) {
  if (status === "OPEN") return "#b8b858";
  if (status === "PARTIALLY_PAID") return "#00c0ef";
  if (status === "FULLY_PAID") return "#00a65a";
  if (status === "AWAITING_PAYMENT") return "#c1a5d6";
  if (status === "DISPUTED") return "#f56954";
  if (status === "PENDING_APPROVAL") return "#f39c12";
}
