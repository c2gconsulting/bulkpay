/*****************************************************************************/
/* DashOverviewChart: Event Handlers */
/*****************************************************************************/
Template.DashOverviewChart.events({
});

/*****************************************************************************/
/* DashOverviewChart: Helpers */
/*****************************************************************************/
Template.DashOverviewChart.helpers({
    enableLoading: function () {
        return  Template.instance().orderGraph.get('showLoading');
    }
});

/*****************************************************************************/
/* DashOverviewChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DashOverviewChart.onCreated(function () {
    let instance = this;
    instance.orderGraph = new ReactiveDict();
    instance.orderGraph.set('showLoading', true);
    instance.autorun(function () {
        instance.orderGraph.set('showLoading', true);
        Meteor.call("orders/chart", function(err, res){
            if (res){
                var newData = [];
                let currentMonth = moment().month();
                let monthInNumber =  _.range(1, currentMonth + 2);
                _.each(monthInNumber, function (month) {
                    let foundData = _.find(res, function(r){return Number(r._id.month) === month})
                    if (foundData){
                        newData.push(foundData.count)
                    } else {
                        newData.push(0)
                    }
                });
                instance.orderGraph.set('showLoading', false);
                drawChart(newData, monthInNumber)
            }
        });
    });
});

Template.DashOverviewChart.onRendered(function () {
    Deps.autorun(function () { drawChart(); });
});

Template.DashOverviewChart.onDestroyed(function () {
});



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

    var salesChartData = {
        labels: getChatMonthLabel(months),
        datasets: [
            {
                label: "Orders",
                fillColor: "rgb(224, 241, 247)",
                strokeColor: "rgb(25, 163, 209)",
                pointColor: "rgb(25, 163, 209)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "rgb(224, 241, 247)",
                pointHighlightStroke: "#fff",
                data: data
            }
        ]
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
        scaleShowVerticalLines: true,
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
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%=datasets[i].label%></li><%}%></ul>",
        //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: true,
        //Boolean - whether to make the chart responsive to window resizing
        responsive: true
    };

    //Create the line chart
    salesChart.Line(salesChartData, salesChartOptions);

    //---------------------------
    //- END MONTHLY SALES CHART -
    //---------------------------
}
