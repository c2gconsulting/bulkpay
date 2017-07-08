Template.BusinessUnit.events({
    'click #newUnit': function(event){
        event.preventDefault();
        let bus = BusinessUnits.find();
        //add none to array list after calling.fetch()
        //bus.unshift({_id: null, name: "Parent Business Unit"});
        Modal.show('newBuModal', bus);
    }
});

Template.registerHelper('trimString', function(passedString, startstring, endstring) {
    var theString = passedString.substring( startstring, endstring );
    return new Handlebars.SafeString(theString)
});

Template.BusinessUnit.helpers({
    'bus': function(){
        return BusinessUnits.find();
    }

});

Template.BusinessUnit.onCreated(function(){
    let self = this;
    self.subscribe("BusinessUnits");

});

Template.BusinessUnit.onRendered(function(){
    jQuery(document).ready(function(){

        "use strict";

        function showTooltip(x, y, contents) {
            jQuery('<div id="tooltip" class="tooltipflot">' + contents + '</div>').css( {
                position: 'absolute',
                display: 'none',
                top: y + 5,
                left: x + 5
            }).appendTo("body").fadeIn(200);
        }

        /*****SIMPLE CHART*****/

        var newCust = [[0,1], [1, 1], [2,1], [3, 1], [4, 1], [5, 1], [6, 1]];
        var retCust = [[0,1], [1, 1], [2,1], [3, 1], [4, 1], [5, 1], [6, 1]];

        var plot = jQuery.plot(jQuery("#basicflot"),
            [{
                data: newCust,
                label: "Previous Period",
                color: "#03c3c4"
            },
                {
                    data: retCust,
                    label: "Current Period",
                    color: "#905dd1"
                }
            ],
            {
                series: {
                    lines: {
                        show: false
                    },
                    splines: {
                        show: true,
                        tension: 0.4,
                        lineWidth: 1,
                        fill: 0.4
                    },
                    shadowSize: 0
                },
                points: {
                    show: true,
                },
                legend: {
                    container: '#basicFlotLegend',
                    noColumns: 0
                },
                grid: {
                    hoverable: true,
                    clickable: true,
                    borderColor: '#ddd',
                    borderWidth: 0,
                    labelMargin: 5,
                    backgroundColor: '#fff'
                },
                yaxis: {
                    min: 0,
                    max: 15,
                    color: '#eee'
                },
                xaxis: {
                    color: '#eee'
                }
            });

        var previousPoint = null;
        jQuery("#basicflot").bind("plothover", function (event, pos, item) {
            jQuery("#x").text(pos.x.toFixed(2));
            jQuery("#y").text(pos.y.toFixed(2));

            if(item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;

                    jQuery("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);

                    showTooltip(item.pageX, item.pageY,
                        item.series.label + " of " + x + " = " + y);
                }

            } else {
                jQuery("#tooltip").remove();
                previousPoint = null;
            }

        });

        jQuery("#basicflot").bind("plotclick", function (event, pos, item) {
            if (item) {
                plot.highlight(item.series, item.datapoint);
            }
        });


        /*****CHART 2 *****/

        var visitors = [[0,1], [1, 1], [2,1], [3, 1], [4, 1], [5, 1], [6, 1]];
        var unique = [[0,1], [1, 1], [2,1], [3, 1], [4, 1], [5, 1], [6, 1]];

        var plot = jQuery.plot(jQuery("#basicflot2"),
            [{
                data: visitors,
                label: "Previous Period",
                color: "#428bca"
            },
                {
                    data: unique,
                    label: "Current Period",
                    color: "#b830b3"
                }
            ],
            {
                series: {
                    lines: {
                        show: false
                    },
                    splines: {
                        show: true,
                        tension: 0.4,
                        lineWidth: 1,
                        fill: 0.5
                    },
                    shadowSize: 0
                },
                points: {
                    show: true
                },
                legend: {
                    container: '#basicFlotLegend2',
                    noColumns: 0
                },
                grid: {
                    hoverable: true,
                    clickable: true,
                    borderColor: '#ddd',
                    borderWidth: 0,
                    labelMargin: 5,
                    backgroundColor: '#fff'
                },
                yaxis: {
                    min: 0,
                    max: 15,
                    color: '#eee'
                },
                xaxis: {
                    color: '#eee'
                }
            });

        var previousPoint = null;
        jQuery("#basicflot2").bind("plothover", function (event, pos, item) {
            jQuery("#x").text(pos.x.toFixed(2));
            jQuery("#y").text(pos.y.toFixed(2));

            if(item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;

                    jQuery("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);

                    showTooltip(item.pageX, item.pageY,
                        item.series.label + " of " + x + " = " + y);
                }

            } else {
                jQuery("#tooltip").remove();
                previousPoint = null;
            }

        });

        jQuery("#basicflot2").bind("plotclick", function (event, pos, item) {
            if (item) {
                plot.highlight(item.series, item.datapoint);
            }
        });


        /*****CHART 3 *****/

        var impressions =       [[0,1], [1, 1], [2,1], [3, 1], [4, 1], [5, 1], [6, 1]];
        var uniqueimpressions = [[0,1], [1, 1], [2,1], [3, 1], [4, 1], [5, 1], [6, 1]];

        var plot = jQuery.plot(jQuery("#basicflot3"),
            [{
                data: impressions,
                label: "Previous Period",
                color: "#905dd1"
            },
                {
                    data: uniqueimpressions,
                    label: "Current Period",
                    color: "#428bca"
                }
            ],
            {
                series: {
                    lines: {
                        show: false
                    },
                    splines: {
                        show: true,
                        tension: 0.4,
                        lineWidth: 1,
                        fill: 0.4
                    },
                    shadowSize: 0
                },
                points: {
                    show: true
                },
                legend: {
                    container: '#basicFlotLegend3',
                    noColumns: 0
                },
                grid: {
                    hoverable: true,
                    clickable: true,
                    borderColor: '#ddd',
                    borderWidth: 0,
                    labelMargin: 5,
                    backgroundColor: '#fff'
                },
                yaxis: {
                    min: 0,
                    max: 15,
                    color: '#eee'
                },
                xaxis: {
                    color: '#eee'
                }
            });

        var previousPoint = null;
        jQuery("#basicflot3").bind("plothover", function (event, pos, item) {
            jQuery("#x").text(pos.x.toFixed(2));
            jQuery("#y").text(pos.y.toFixed(2));

            if(item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;

                    jQuery("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);

                    showTooltip(item.pageX, item.pageY,
                        item.series.label + " of " + x + " = " + y);
                }

            } else {
                jQuery("#tooltip").remove();
                previousPoint = null;
            }

        });

        jQuery("#basicflot3").bind("plotclick", function (event, pos, item) {
            if (item) {
                plot.highlight(item.series, item.datapoint);
            }
        });


        jQuery('#sparkline').sparkline([4,3,3,1,4,3,2,2,3,10,9,6], {
            type: 'bar',
            height:'30px',
            barColor: '#428BCA'
        });

        jQuery('#sparkline2').sparkline([9,8,8,6,9,10,6,5,6,3,4,2], {
            type: 'bar',
            height:'30px',
            barColor: '#999'
        });

        jQuery('#sparkline3').sparkline([4,3,3,1,4,3,2,2,3,10,9,6], {
            type: 'bar',
            height:'30px',
            barColor: '#428BCA'
        });

        jQuery('#sparkline4').sparkline([9,8,8,6,9,10,6,5,6,3,4,2], {
            type: 'bar',
            height:'30px',
            barColor: '#999'
        });

        jQuery('#sparkline5').sparkline([4,3,3,1,4,3,2,2,3,10,9,6], {
            type: 'bar',
            height:'30px',
            barColor: '#428BCA'
        });

        jQuery('#sparkline6').sparkline([9,8,8,6,9,10,6,5,6,3,4,2], {
            type: 'bar',
            height:'30px',
            barColor: '#999'
        });


        /***** BAR CHART *****/

        var m3 = new Morris.Bar({
            // ID of the element in which to draw the chart.
            element: 'bar-chart',
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: [
                { y: '2006', a: 30, b: 20 },
                { y: '2007', a: 75,  b: 65 },
                { y: '2008', a: 50,  b: 40 },
                { y: '2009', a: 75,  b: 65 },
                { y: '2010', a: 50,  b: 40 },
                { y: '2011', a: 75,  b: 65 },
                { y: '2012', a: 100, b: 90 }
            ],
            xkey: 'y',
            ykeys: ['a', 'b'],
            labels: ['Series A', 'Series B'],
            lineWidth: '1px',
            fillOpacity: 0.8,
            smooth: false,
            hideHover: true,
            resize: true
        });

        var delay = (function() {
            var timer = 0;
            return function(callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();

        jQuery(window).resize(function() {
            delay(function() {
                m3.redraw();
            }, 200);
        }).trigger('resize');

    });

});

Template.singleBu.helpers({
    'parentName': function(data){
        if(data.parentId){
            let bu = BusinessUnits.findOne({_id: data.parentId});
            return (bu) ? bu.name : '';
        }
        return null;
    },
    'businessUnitEmployeesCount': function() {
        //console.log(`Inside businessUnitEmployeesCount: ${businessUnitId}`)
        return Template.instance().employeesCount.get()
        //return Meteor.users.find({businessIds: businessUnitId}).count();
    }
});
Template.singleBu.events({
    'click .pointer': function(e) {
        e.preventDefault();
        //check if permissions // route default to employee time
        Router.go('bu.details', this.data);
        //Router.go('employee.time', this.data);


    }
});


/*****************************************************************************/
/* singleBu: Lifecycle Hooks */
/*****************************************************************************/
Template.singleBu.onCreated(function () {
    let self = this;
    //console.log(`Inside singleBu onCreated. biz unit id: ${self.data.data._id}`)
    self.employeesCount = new ReactiveVar();
    self.employeesCount.set("")

    Meteor.call('businessunit/getEmployeeNumber', self.data.data._id, (err, res) => {
        console.log("REs: " + res);
        console.log(`Err: ${JSON.stringify(err)}`)
        if(!err)
            self.employeesCount.set(res)
    })

    // self.autorun(() => {
    //     if(employeesSubscription.ready()) {
    //         let employeesCount = Meteor.users.find({businessIds: {$in: [self.data.data._id]}}).count()
    //         console.log(`Inside employeesSubscription ready. employeesCount: ${employeesCount}`)
    //
    //         self.employeesCount.set(employeesCount)
    //     }
    // })
});

Template.singleBu.onRendered(function () {
});

Template.singleBu.onDestroyed(function () {
});
