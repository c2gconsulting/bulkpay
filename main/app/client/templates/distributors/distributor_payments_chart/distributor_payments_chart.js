/*****************************************************************************/
/* DistributorPaymentsChart: Event Handlers */
/*****************************************************************************/
Template.DistributorPaymentsChart.events({
});

/*****************************************************************************/
/* DistributorPaymentsChart: Helpers */
/*****************************************************************************/
Template.DistributorPaymentsChart.helpers({
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
/* DistributorPaymentsChart: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorPaymentsChart.onCreated(function () {
    let instance = this;
    instance.orderGraph = new ReactiveDict();
    let account = Template.parentData().account;
    instance.autorun(function () {
        Meteor.call("customers/transactionChart", Template.parentData()._id, "currentBalance",
            "currentDeposits", "currentRebates", function(err, res){
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
                    paymentsChart(newData, account);
                }

        });
    });
});

Template.DistributorPaymentsChart.onRendered(function () { 
});

Template.DistributorPaymentsChart.onDestroyed(function () {
});

function paymentsChart(data, account) {

    var rndSF = function() {
        return Math.round(Math.random()*500);
    };


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

    var creditsPieChart = new Chart($("#creditsPie").get(0).getContext("2d"));
    

    let filled, gap = 0;

    if (account) {
        filled = account.availableBalance;
        gap = account.currentBalance < account.availableBalance ? 0 : account.currentBalance - account.availableBalance;
    }

    var creditsPieData = [
        {
            value: filled,
            color: "#f07e2c",
            highlight: "#f07e2c",
            label: "Available"
        },
        {
            value: gap,
            color: "#d4d4d4",
            highlight: "#d4d4d4",
            label: "Held"
        }
    ];

    var creditsLineOptions = {
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

    creditsLineOptions['customTooltips'] =  function(tooltip) {
        customTooltip(tooltip, 'chartjs-tooltip-credits')
    };

    creditsPieChart.Doughnut(creditsPieData, creditsLineOptions);
    //------------------
    var creditsBarChartData = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets : [
            {
                label: "Orders",
                fillColor : "#f2ded0",
                strokeColor : "#f07e2c",
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
    new Chart(document.getElementById("creditsLine").getContext("2d")).Line(creditsBarChartData, creditsLineOptions);
  
    
}