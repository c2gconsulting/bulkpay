/*****************************************************************************/
/* Returns: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.Returns.events({
    'submit form': function(event){
        event.preventDefault();
        let start =  event.target.from.value;
        let end =  event.target.to.value;
        let status = [];
        let selected = $("#status").find("option:selected");
        _.each(selected, function(select){
            status.push(select.value)
        });
        let duration =   event.target.by.value;
        let filterObject = {
            startDate: new Date(start),
            endDate: moment(new Date(end)).endOf('day')._d,
            status: status,
            duration: duration
        };
        Template.instance().reportData.set('reportFilter', filterObject);
    },

    "click .excel": function(event, tmpl){
        event.preventDefault();
        tmpl.$('.excel').text('Preparing... ');
        tmpl.$('.excel').attr('disabled', true);
    

        try {
            let l = Ladda.create(tmpl.$('.excel')[0]);
            l.start();
        } catch(e) {
            console.log(e);
        }


        let resetButton = function() {
            // End button animation
            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.stop();
                l.remove();
            } catch(e) {
                console.log(e);
            }

            tmpl.$('.excel').text(' Export to CSV');
            // Add back glyphicon
            $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
            tmpl.$('.excel').removeAttr('disabled');
        }

        var fields = [
            "Date",
            "Gross Returns",
            "Average Return Value",
            "Taxes",
            "No. Of Returns"
        ];
        let data = [];

        let results = Template.instance().reportData.get('reportData');
        _.each(results, function(r) {
            data.push([
                r.date,
                r.totalAmount,
                r.average,
                r.taxes,
                r.count
            ]);
        });

       let exportData = {fields: fields, data: data};
        TDCExporter.exportAllData(exportData, "Report");
        resetButton()
     
    },

    'click [name=reports-home]': function (event, tmpl) {
        event.preventDefault();
        Router.go('reports.home');
    },

    'click a[href="#sort"]': function (e, tmpl) {
        let key = e.currentTarget.dataset.key;
        if (Session.get('returnsSortBy') === key) Session.set('returnsSortDirection', 0 - Number(Session.get('returnsSortDirection'))); //reverse sort direction
        else Session.set('returnsSortBy', key);
    }
});

/*****************************************************************************/
/* Returns: Helpers */
/*****************************************************************************/
Template.Returns.helpers({
    startDate: function () {
        return moment().subtract(3, 'months').startOf("month")._d;
    },
    endDate: function () {
        return moment().endOf("day")._d;
    },
    results: function() {
        let results = Template.instance().reportData.get('reportData');
        let sortDirection = Session.get('returnsSortDirection');
        let sortBy = Session.get('returnsSortBy');
        if (sortDirection === -1){
            return _.sortBy(results, sortBy);
        } else {
            return _.sortBy(results, sortBy).reverse();
        }
    },
    result: function() {
        let sumTotalAmount = 0;
        let sumAverage = 0;
        let sumTaxes = 0;
        let totalRecords = 0;
        let data = Template.instance().reportData.get('reportData');
        _.each(data, function (d) {
            sumTotalAmount += d.totalAmount;
            sumAverage += d.average;
            sumTaxes += d.taxes;
            totalRecords += d.count
        });

      return {sumTotalAmount: sumTotalAmount, sumAverage: sumAverage, sumTaxes: sumTaxes, totalRecords: totalRecords}
    },

    sortedBy: function (key) {
        let sortIcon = Session.get('returnsSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
        return Session.get('returnsSortBy') === key ? sortIcon : '';
    }

});

/*****************************************************************************/
/* Returns: Lifecycle Hooks */
/*****************************************************************************/
Template.Returns.onCreated(function () {
    let instance = this;
    instance.reportData = new ReactiveDict();

    if (!instance.reportData.get("reportFilter")){
        let start =  moment().subtract(3, 'months').startOf("month")._d;
        let end =  moment().endOf('day')._d;
        let filterObject = {
            startDate: start,
            endDate: end,
            duration: "month"
        }
        instance.reportData.set("reportFilter", filterObject)
    }

    if (!Session.get('returnsSortBy')) {
        Session.set('returnsSortBy', 'date');
        Session.set('returnsSortDirection', -1);
    }

    instance.returnsReportChart = undefined;

    instance.getGraphData = function (dataArray) {
        var filter = instance.reportData.get("reportFilter");
        switch (instance.reportData.get("reportFilter").duration) {
            case 'month':
                var dateStart = moment(filter.startDate);
                var dateEnd = moment(filter.endDate);
                var timeValues = [];
                while (dateEnd > dateStart) {
                    timeValues.push(dateStart.format('YYYY-MM-DD'));
                    dateStart.add(1,'month');
                }
                var values = [];

                _.each(timeValues, function (timeValue, index) {
                    var sum = 0
                    _.each(dataArray, function (data) {
                        if (moment(timeValue).startOf('month').isSame(moment(data.date).startOf('month'))) {
                            sum += data.totalAmount;
                        }
                    });
                    timeValues[index] = moment(timeValue).format('MMM, YYYY');
                    values.push(sum);
                });
                return {
                    labels: timeValues,
                    data: values
                };
            case 'week':
                var dateStart = moment(filter.startDate);
                var dateEnd = moment(filter.endDate);
                var timeValues = [];
                while (dateEnd > dateStart) {
                    timeValues.push(dateStart.format('YYYY-MM-DD'));
                    dateStart.add(1,'week');
                }
                var values = [];
                _.each(timeValues, function (timeValue, index) {
                    var sum = 0
                    _.each(dataArray, function (data) {
                        if (moment(data.date).year() === moment(timeValue).year() && moment(data.date).week() === moment(timeValue).week()) {
                            sum += data.totalAmount;
                        }
                    });
                    timeValues[index] = 'Week ' + moment(timeValue).format('ww, YYYY');
                    values.push(sum);
                });
                return {
                    labels: timeValues,
                    data: values
                };
            case 'day':
                var dateStart = moment(filter.startDate);
                var dateEnd = moment(filter.endDate);
                var timeValues = [];
                while (dateEnd > dateStart) {
                    timeValues.push(dateStart.format('YYYY-MM-DD'));
                    dateStart.add(1,'day');
                }
                var values = [];
                _.each(timeValues, function (timeValue, index) {
                    var sum = 0
                    _.each(dataArray, function (data) {
                        if (moment(data.date).isSame(timeValue, 'day')) {
                            sum += data.totalAmount;
                        }
                    });
                    timeValues[index] = moment(timeValue).format('MMM Do, YY');
                    values.push(sum);
                });
                return {
                    labels: timeValues,
                    data: values
                };
        }
    };

    instance.autorun(function () {
        let  filterConditions =  instance.reportData.get("reportFilter");
        Meteor.call("returnorders/returnsData", filterConditions, function(err, res){

            instance.reportData.set('reportData', res);
            var graphData = instance.getGraphData(res);

            var returnsChartCanvas = document.getElementById('intelligenceReturnsReportCanvas').getContext("2d");

            var returnsChartData = {
                labels: graphData.labels,
                datasets: [{
                    label: "Orders",
                    fillColor: "rgb(224, 241, 247)",
                    strokeColor: "rgb(25, 163, 209)",
                    pointColor: "rgb(25, 163, 209)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "rgb(224, 241, 247)",
                    pointHighlightStroke: "#fff",
                    data: graphData.data
                }]
            };


            var returnsChartOptions = {
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

            if (!instance.returnsReportChart) {
              instance.returnsReportChart = new Chart(returnsChartCanvas).Line(returnsChartData, returnsChartOptions);
            } else {
              instance.returnsReportChart.destroy();
              instance.returnsReportChart = new Chart(returnsChartCanvas).Line(returnsChartData, returnsChartOptions);
            }
        });
    });
});

Template.Returns.onRendered(function () {
});

Template.Returns.onDestroyed(function () {
});


Template.Returns.rendered = function() {
    let self = this;

    self.$('#datetimepicker5').datetimepicker({
        defaultDate: moment().subtract(3, 'months').startOf("month")._d,
    });

};


