/*****************************************************************************/
/* DistributorOrdersChart: Event Handlers */
/*****************************************************************************/
Template.DistributorOrdersChart.events({
});

/*****************************************************************************/
/* DistributorOrdersChart: Helpers */
/*****************************************************************************/
Template.DistributorOrdersChart.helpers({
    ordersThisYear: function () {
        let orders = Template.instance().totalOrders.get('filterResult');
        let total = 0;
        if (orders) {
            _.each(orders.currentData, function (order) {
                total += order.count
            });
        }
        return total
    },
    result: function(){
        let data = Template.instance().totalOrders.get('filterResult');
        if (data){
          return  getOrderData(data)
        }
    }
});

/*****************************************************************************/
/* DistributorOrdersChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorOrdersChart.onCreated(function () {
    let instance = this;
    instance.totalOrders = new ReactiveDict();
    instance.autorun(function () {
        Meteor.call("customers/orderschart", Template.parentData()._id, function(err, res){
            if (res){
                instance.totalOrders.set('filterResult', res);
                var newData = [];
                let monthInNumber =  [1,2,3,4,5,6,7,8,9,10,11,12];
                _.each(monthInNumber, function (month) {
                    let foundData = _.find(res.currentData, function(r){return Number(r._id.month) === month});
                    if (foundData){
                        newData.push(foundData.count)
                    } else {
                        newData.push(0)
                    }
                });
                getBarChart(newData)
            }
        });
    });
});

Template.DistributorOrdersChart.onRendered(function () {
});

Template.DistributorOrdersChart.onDestroyed(function () {
});


function getBarChart(data) {
    
    function customTooltip (tooltip, tooltipid) {
        var tooltipEl = $('#' + tooltipid);
        if (!tooltip) {
            tooltipEl.css({
                opacity: 0
            });
            return;
        }
        tooltipEl.removeClass('above below');
        tooltipEl.addClass(tooltip.yAlign);
        var innerHtml = '';
        innerHtml += [
            '<div class="chartjs-tooltip-section">',
            '	<span class="chartjs-tooltip-value">' + tooltip.text + '</span>',
            '</div>'
        ].join('');
        tooltipEl.html(innerHtml);
        tooltipEl.css({
            opacity: 1,
            left: tooltip.chart.canvas.offsetLeft + tooltip.x + 'px',
            top: tooltip.chart.canvas.offsetTop + tooltip.y + 'px',
            fontFamily: tooltip.fontFamily,
            fontSize: tooltip.fontSize,
            fontStyle: tooltip.fontStyle
        });
    }

    var ordersChartData = {
        labels : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets : [
            {
                fillColor : "rgba(48,145,213,1)",
                strokeColor : "rgba(151,187,205,0.8)",
                highlightFill : "rgba(48,145,213,0.5)",
                highlightStroke : "rgba(151,187,205,1)",
                data : data
            }
        ]
    };

    var chart = new Chart(document.getElementById("ordersBar").getContext("2d")).Bar(ordersChartData, {
        responsive: true,
        barShowStroke: false,
        showTooltips: true,
        scaleShowHorizontalLines: false,
        scaleShowVerticalLines: false,
        scaleGridLineWidth: 1,
        barStrokeWidth : 2,
        barValueSpacing : 1,
        barDatasetSpacing : 1,

        showScale: false,
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",

        bezierCurve: false,
        bezierCurveTension: 0,
        pointDot: true,
        pointDotRadius: 4,
        pointDotStrokeWidth: 1,
        pointHitDetectionRadius: 5,
        datasetStroke: true,
        datasetStrokeWidth: 2,
        datasetFill: true,
        maintainAspectRatio: true,
        customTooltips: function(tooltip) {
            customTooltip(tooltip, 'chartjs-tooltip-orders')
        }
    });
}

function  getOrderData(data){
    if (data) {
        let negative = false;
        let totalRecord = 0
        _.each(data.currentData, function(d){
            totalRecord += d.count
        });
        if (data.previousDuration){
            let previousTotalRecord = data.previousDuration[0] ? data.previousDuration[0].count : 0;
            if (previousTotalRecord) {
                let diff = ((totalRecord - previousTotalRecord) / previousTotalRecord ) * 100;
                if (diff < 0) negative = true;
                return {totalRecord: totalRecord, percentage: Math.abs(diff),  negative: negative};
            } else {
                return {totalRecord: totalRecord};
            }
        } else {
            return {totalRecord: totalRecord};
        }
    }
}