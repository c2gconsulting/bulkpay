/*****************************************************************************/
/* DistributorCreditsChart: Event Handlers */
/*****************************************************************************/
Template.DistributorCreditsChart.events({
});

/*****************************************************************************/
/* DistributorCreditsChart: Helpers */
/*****************************************************************************/
Template.DistributorCreditsChart.helpers({
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
/* DistributorCreditsChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorCreditsChart.onCreated(function () {
    let account = Template.parentData().account;
    Meteor.call("customers/transactionChart", Template.parentData()._id, "currentRebates",
        "currentDeposits", "currentBalance", function(err, res){
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
            creditsChart(newData, account)
        }

    });
});

Template.DistributorCreditsChart.onRendered(function () {
});

Template.DistributorCreditsChart.onDestroyed(function () {
});


function creditsChart(data, account){
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

    var rebatesPieChart = new Chart($("#rebatesPie").get(0).getContext("2d"));
    
    let filled, gap = 0;

    if (account) {
        filled = account.currentRebates;
        gap = account.currentDeposits;
    }

    var rebatesPieData = [
        {
            value: filled,
            color: "#0099cc",
            highlight: "#0099cc",
            label: "Rebates"
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
    var rebatesLineOptions = {
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
                customTooltip(tooltip, 'chartjs-tooltip-rebates')
            }
    };

    rebatesPieChart.Doughnut(rebatesPieData, rebatesLineOptions);
    
    var rebatesBarChartData = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets : [
            {
                label: "Orders",
                fillColor : "#e1edf6",
                strokeColor : "#0099cc",
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

    /*
    rebatesLineOptions['customTooltips'] =  function(tooltip) {
        customTooltip(tooltip, 'chartjs-tooltip-rebates')
    }; */
    

    new Chart(document.getElementById("rebatesLine").getContext("2d")).Line(rebatesBarChartData, rebatesLineOptions);
}