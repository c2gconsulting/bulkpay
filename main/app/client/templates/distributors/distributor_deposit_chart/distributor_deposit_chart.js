/*****************************************************************************/
/* DistributorDepositChart: Event Handlers */
/*****************************************************************************/
Template.DistributorDepositChart.events({
});

/*****************************************************************************/
/* DistributorDepositChart: Helpers */
/*****************************************************************************/
Template.DistributorDepositChart.helpers({
    currentAccountBalance: function(){
        var accounts =  this.account;
        var account =  _.sortBy(accounts, function(accounts){ return -accounts.createdAt; });
        return account[0]
    },
    numberToCurrency: function(number) {
        let currSymbol = this.currency.symbol ? this.currency.symbol : this.currency.iso; //default to ISO code if no symbol
        if (number) {
            return currSymbol + " " + Core.numberWithDecimals(number);
        } else {
            return currSymbol + " " + Core.numberWithDecimals(0);
        }
    }
});

/*****************************************************************************/
/* DistributorDepositChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorDepositChart.onCreated(function () {
    let instance = this;
    instance.orderGraph = new ReactiveDict();
    let account = Template.parentData().account;
    instance.autorun(function () {
        Meteor.call("customers/transactionChart", Template.parentData()._id, "currentDeposits",
            "currentRebates", "currentBalance", function(err, res){
            if (res){
                var newData = [];
                let monthInNumber =  [1,2,3,4,5,6,7,8,9,10,11,12];
                _.each(monthInNumber, function (month) {
                    let foundData = _.find(res.currentData, function(r){return Number(r._id.month) === month});
                    if (foundData){
                        newData.push(foundData.total)
                    } else {
                        newData.push(0)
                    }
                });
                depositChart(newData, account)
            }
            var rndSF = function() {
                return Math.round(Math.random()*100);
            };

        });
    });
});

Template.DistributorDepositChart.onRendered(function () {
});

Template.DistributorDepositChart.onDestroyed(function () {
});



function depositChart(data, account){
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

    var depositsPieChart = new Chart($("#dchart").get(0).getContext("2d"));

    let filled, gap = 0;

    if (account) {
        filled = account.currentDeposits;
        gap = account.currentRebates;
    }

    
    var depositsPieData = [
        {
            value: filled,
            color: "#669933",
            highlight: "#669933",
            label: "Deposits"
        },
        {
            value: gap,
            color: "#d4d4d4",
            highlight: "#d4d4d4",
            label: "Other"
        }
    ];

    /*
    var depositsPieOptions = {
        segmentShowStroke: true,
        segmentStrokeColor: "#fff",
        scaleStepWidth: 500,
        segmentStrokeWidth: 1,
        percentageInnerCutout: 50,
        animationSteps: 100,
        animationEasing: "easeOutBounce",
        animateRotate: false,
        animateScale: false,
        responsive: true,
        maintainAspectRatio: false,
        showTooltips: false
    };*/
    var depositsLineOptions = {
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
        maintainAspectRatio: true,
        responsive: true,
        showTooltips: true,
        customTooltips:
            function(tooltip) {
                customTooltip(tooltip, 'chartjs-tooltip-deposits')
            }
    };


    depositsPieChart.Doughnut(depositsPieData, depositsLineOptions);

    var depositsBarChartData = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets : [
            {
                label: "Orders",
                fillColor : "#e6f5d7",
                strokeColor : "#669933",
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
    new Chart(document.getElementById("depositsLine").getContext("2d")).Line(depositsBarChartData, depositsLineOptions);

}