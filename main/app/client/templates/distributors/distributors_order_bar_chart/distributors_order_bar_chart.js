/*****************************************************************************/
/* DistributorsOrderBarChart: Event Handlers */
/*****************************************************************************/
Template.DistributorsOrderBarChart.events({
});

/*****************************************************************************/
/* DistributorsOrderBarChart: Helpers */
/*****************************************************************************/
Template.DistributorsOrderBarChart.helpers({
    totalOrders: function() {
        let orders = Template.instance().totalMonthOrders.get('filterResult');
        let total = 0;
        if (orders) {
            _.each(orders.currentData, function(order){
                total += order.count
            });
        }
        return total
    }
});

/*****************************************************************************/
/* DistributorsOrderBarChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorsOrderBarChart.onCreated(function () {
    let instance = this;
    instance.totalMonthOrders = new ReactiveDict();
    instance.autorun(function () {
        Meteor.call("customers/orderschart", Template.parentData()._id, function(err, res){
            if (res){
                instance.totalMonthOrders.set('filterResult', res);
                var newData = [];
                let currentMonth = moment().month();
                let monthInNumber =  _.range(1, currentMonth + 2);
                _.each(monthInNumber, function (month) {
                    let foundData = _.find(res.currentData, function(r){return Number(r._id.month) === month});
                    if (foundData){
                        newData.push(foundData.count)
                    } else {
                        newData.push(0)
                    }
                });
                barChart(newData, monthInNumber)
            }
            var rndSF = function() {
                return Math.round(Math.random()*100);
            };

        });
    });
});

Template.DistributorsOrderBarChart.onRendered(function () {
    Deps.autorun(function () { barChart(); });
});

Template.DistributorsOrderBarChart.onDestroyed(function () {
});


function barChart(data, months){
    var rndSF = function() {
        return Math.round(Math.random()*500);
    };
    var barChartData = {
        labels: getChatMonthLabel(months),
        datasets : [
            {
                label: "Orders",
                fillColor : "#e1edf6",
                strokeColor : "#079ccd",
                highlightFill : "transparent",
                highlightStroke : "transparent",
                pointColor: "transparent",
                pointStrokeColor: "transparent",
                pointHighlightFill: "#f07e2c",
                pointHighlightStroke: "#fff",
                data : data
            }
        ]
    };

    var ctx = document.getElementById("oChart").getContext("2d");
    new Chart(ctx).Line(barChartData, {
        showScale: false,
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        scaleShowHorizontalLines: false,
        scaleShowVerticalLines: false,
        bezierCurve: false,
        bezierCurveTension: 0,
        pointDot: true,
        pointDotRadius: 4,
        pointDotStrokeWidth: 1,
        pointHitDetectionRadius: 5,
        datasetStroke: true,
        datasetStrokeWidth: 2,
        datasetFill: true,
        legendTemplate: "<ul class=\"list-unstyled list-inline <%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span class=\"icon-circle\" style=\"color:<%=datasets[i].strokeColor%>\"></span>&nbsp;<%=datasets[i].label%></li><%}%></ul>",
        maintainAspectRatio: true,
        responsive: true
    });
}
