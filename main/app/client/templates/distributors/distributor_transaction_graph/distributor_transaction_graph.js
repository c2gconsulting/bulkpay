/*****************************************************************************/
/* DistributorTransactionGraph: Event Handlers */
/*****************************************************************************/
Template.DistributorTransactionGraph.events({
  'change #option1': function () {
    Template.instance().customerTransactionsGraphFilter.set('Today');
  },

  'change #option2': function () {
    Template.instance().customerTransactionsGraphFilter.set('Monthly');
  },

  'change #option3': function () {
    Template.instance().customerTransactionsGraphFilter.set('Annual');
  }

});

/*****************************************************************************/
/* DistributorTransactionGraph: Helpers */
/*****************************************************************************/
Template.DistributorTransactionGraph.helpers({
  transactionStatus: function () {
    return Session.get('hasRecord') ? '' : 'hidden';
  },
  hasTransactions: function () {
    return !Session.get('hasRecord');
  }
});

/*****************************************************************************/
/* DistributorTransactionGraph: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorTransactionGraph.onCreated(function () {

  let instance = this;
  Session.set('hasRecord', false);
  instance.customerTransactionsGraphFilter = new ReactiveVar('Today');
  instance.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  instance.customerTransactionsTypes = [
    {
      label: 'Payments',
      type: 'payments',
      fillColor: 'transparent',
      strokeColor: '#669933',
      pointColor: '#669933',
      pointStrokeColor: '#fff',
      pointHighlightFill: 'rgb(224, 241, 247)',
      pointHighlightStroke: '#fff',
      data: []
    }, {
      label: 'Rebates',
      type: 'rebates',
      fillColor: 'transparent',
      strokeColor: 'rgb(25, 163, 209)',
      pointColor: 'rgb(25, 163, 209)',
      pointStrokeColor: '#fff',
      pointHighlightFill: 'rgb(224, 241, 247)',
      pointHighlightStroke: '#fff',
      data: []
    }, {
      label: 'Invoices',
      type: 'invoices',
      fillColor: 'transparent',
      strokeColor: '#05365b',
      pointColor: '#05365b',
      pointStrokeColor: '#fff',
      pointHighlightFill: 'rgb(224, 241, 247)',
      pointHighlightStroke: '#fff',
      data: []
    }, {
      label: 'Other Credits',
      type: 'other_credits',
      fillColor: 'transparent',
      strokeColor: '#3ff4be',
      pointColor: '#3ff4be',
      pointStrokeColor: '#fff',
      pointHighlightFill: 'rgb(224, 241, 247)',
      pointHighlightStroke: '#fff',
      data: []
    }, {
      label: 'Other Debits',
      type: 'other_debits',
      fillColor: 'transparent',
      strokeColor: '#a7695c',
      pointColor: '#a7695c',
      pointStrokeColor: '#fff',
      pointHighlightFill: 'rgb(224, 241, 247)',
      pointHighlightStroke: '#fff',
      data: []
    }
  ];

  instance.getData = function (type) {
    return _.find(instance.customerTransactionsTypes, function (currentType) {
      return currentType.type === type;
    });
  };

  instance.getChartData = function (transactionTypes) {
    var object = {
      labels: [],
      dataSets: []
    };

    if (instance.customerTransactionsGraphFilter.get() === 'Monthly') {
      for (var x = 0; x <= 11; x++) {
        object.labels.push(x);
      }
    }

    _.each(transactionTypes, function (type) {
      if (instance.customerTransactionsGraphFilter.get() !== 'Monthly' && object.labels.indexOf(type._id.time) === -1) {
        object.labels.push(type._id.time);
      }
      if (!_.find(object.dataSets, function (set) { return type._id.transaction === set.type })) {
        object.dataSets.push(instance.getData(type._id.transaction));
      }
    });

    _.each(object.labels, function (label) {
      _.each(object.dataSets, function (set) {
        let count = 0;
        _.each(transactionTypes, function (currentType) {
          if (currentType._id.transaction === set.type && currentType._id.time === label) {
            count += currentType.count;
          }
        });
        set.data.push(count);
      });
    });

    return object;
  };

  instance.transformLabels = function (labels) {
    let newLabels;
    switch (instance.customerTransactionsGraphFilter.get()) {
      case 'Today':
        let day = new Date().getDay() + 1;
        newLabels = [];
        _.each(labels, function (label) {
          let singleLabel;
          if (parseInt(label) > day) {
            let month = instance.months[new Date().getMonth()];
            singleLabel = month + ', ' + label;
          } else {
            let month = instance.months[new Date().getMonth() + 1];
            singleLabel = month + ', ' + label;
          }
          newLabels.push(singleLabel);
        });
        return newLabels;
      case 'Monthly':
        newLabels = [];
        _.each(labels, function (label) {
          newLabels.push(instance.months[parseInt(label)]);
        });
        return newLabels;
      case 'Annual':
        return labels;
    }

  };

  instance.salesChart = undefined;

  instance.autorun(function () {
    Meteor.call('customertransactions/transactions', instance.customerTransactionsGraphFilter.get(), Template.parentData()._id, function (error, data) {

      Session.set('hasRecord', data.length > 0 ? true : false);

      let chartData = instance.getChartData(data);
        let salesChartCanvas = document.getElementById("transactionCanvas").getContext("2d");
        var salesChartData = {
          labels: instance.transformLabels(chartData.labels),
          datasets: chartData.dataSets
        };
        var salesChartOptions = {
          //Boolean - If we should show the scale at all
          showScale: true,
          //Boolean - Whether grid lines are shown across the chart
          scaleShowGridLines: true,
          //String - Colour of the grid lines
          scaleGridLineColor: "rgba(0,0,0,.05)",
          //Number - Width of the grid lines
          scaleGridLineWidth: 1,
          //Boolean - Whether to show horizontal lines (except X axis)
          scaleShowHorizontalLines: true,
          //Boolean - Whether to show vertical lines (except Y axis)
          scaleShowVerticalLines: false,
          //Boolean - Whether the line is curved between points
          bezierCurve: true,
          //Number - Tension of the bezier curve between points
          bezierCurveTension: 0,
          //Boolean - Whether to show a dot for each point
          pointDot: true,
          //Number - Radius of each point dot in pixels
          pointDotRadius: 4,
          //Number - Pixel width of point dot stroke
          pointDotStrokeWidth: 1,
          //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
          pointHitDetectionRadius: 5,
          //Boolean - Whether to show a stroke for datasets
          datasetStroke: true,
          //Number - Pixel width of dataset stroke
          datasetStrokeWidth: 2,
          //Boolean - Whether to fill the dataset with a color
          datasetFill: true,
          //String - A legend template
          legendTemplate: "<ul class=\"list-unstyled list-inline <%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span class=\"icon-circle\" style=\"color:<%=datasets[i].strokeColor%>\"></span>&nbsp;<%=datasets[i].label%></li><%}%></ul>",
          //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
          maintainAspectRatio: true,
          //Boolean - whether to make the chart responsive to window resizing
          responsive: true
        };

        if (!instance.salesChart) {
          instance.salesChart = new Chart(salesChartCanvas).Line(salesChartData, salesChartOptions);
        } else {
          instance.salesChart.destroy();
          instance.salesChart = new Chart(salesChartCanvas).Line(salesChartData, salesChartOptions);
        }
        document.getElementById('transactionsLegend').innerHTML = instance.salesChart.generateLegend();

    });
  });

});

Template.DistributorTransactionGraph.onRendered(function () {
});

Template.DistributorTransactionGraph.onDestroyed(function () {
});
