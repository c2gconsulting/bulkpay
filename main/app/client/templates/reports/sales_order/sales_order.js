/*****************************************************************************/
/* SalesOrder: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.SalesOrder.events({
    'change [name=selectReportType]': function(e, tmpl) {
        let reportType = tmpl.$('[name=selectReportType]').val();
        let filter = Template.instance().reportData.get('reportFilter');
        filter.reportType = reportType;
        Template.instance().reportData.set('reportFilter', filter);
        /*
        Meteor.defer(function () {
            tmpl.$('.rselectpicker').selectpicker('refresh');
        })*/

        refreshReport(tmpl);

        
    },
    'click .add-btn': function(e, tmpl) {
        let filterInputs = Session.get('filterInputs') || [];
        let inputId = Random.id();
        filterInputs.push({_id: inputId, selectedOption: false});
        Session.set('filterInputs', filterInputs);

        var selectedValues = Session.get("nonSelectable") || [];
        let selectedOptions = [];
        Meteor.defer(function () {
            $(".sel select :selected").each(function(){
                let v = $(this).val();
                if(v){
                    selectedOptions.push(v);
                }

            });
        });
        let numberOfAddedFilters = 1;
        numberOfAddedFilters += $(".sel select").length;
        Template.instance().reportData.set('addedFilters', numberOfAddedFilters);
        if (selectedOptions.length > 0){
            Session.set("nonSelectable",  selectedOptions)
        }
    },

    'click .delete-btn': function(e, tmpl) {
        let filterInputs = Session.get('filterInputs') || [];
        let self = this;
        filterInputs = _.reject(filterInputs, function(x) {
            return x._id === self._id
        });

        Session.set('filterInputs', filterInputs);
        let selectedOptions = [];
        Meteor.defer(function () {
            $(".sel select :selected").each(function(){
                let v = $(this).val();
                if(v){
                    selectedOptions.push(v);
                }

            });
        });
        let numberOfAddedFilters = 1;
        numberOfAddedFilters -= $(".sel select").length;
        Template.instance().reportData.set('addedFilters', numberOfAddedFilters);
        Session.set("nonSelectable",  selectedOptions)

        //refresh report
        refreshReport(tmpl);
    },

    "click .submit-btn": function (e, tmpl) {
        refreshReport(tmpl);
    },

    "change select": function (e, tmpl) {
        var selectedValues = Session.get("nonSelectable") || [];
        let ab = []
        $(".sel select :selected").each(function(){
            let v = $(this).val();
            if(v){
                ab.push(v);
            }
        });
        if (ab.length > 0){
            Session.set("nonSelectable",  ab)
        }

        let selectedValue = e.currentTarget.value;
        if ( !selectedValue){
            tmpl.$('option').each(function() {
                $(this).removeAttr('disabled');
            });
        }

        tmpl.$('option').each(function() {
            let value = $(this).val();
            let sel =  _.find(ab, function(s) {return s === value });
            if (sel) {
                $(this).attr('disabled', true)
            } else {
                $(this).removeAttr('disabled');
            }
        });



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
            "Label",
            "Gross Sales",
            "Average Order Value",
            "Taxes",
            "No. Of Orders"
        ];
        let data = [];

        let results = Template.instance().reportData.get('results');
        _.each(results, function(r) {
            data.push([
                r.label,
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
        if (Session.get('salesOrderSortBy') === key) Session.set('salesOrderSortDirection', 0 - Number(Session.get('salesOrderSortDirection'))); //reverse sort direction
        else Session.set('salesOrderSortBy', key);
    }
});

/*****************************************************************************/
/* SalesOrder: Helpers */
/*****************************************************************************/
Template.SalesOrder.helpers({
    reportTypes: function() {
        return ["Customer", "Salesperson", "Location", "Price List Group", "Product Variant"]
    },
    startDate: function () {
        return moment().subtract(3, 'months').startOf("month")._d
    },
    endDate: function () {
        return moment().endOf('day')._d
    },
    
    optionsForReportType: function(selected){
      return Session.get("options")
    },

    selectedReportType: function(){
        let filter = Template.instance().reportData.get('reportFilter');
        if (filter) {
            return filter.reportType
        }
    },

    selectableOptions: function(inputId){
        let options = Template.instance().reportData.set('selectable', options);
    },

    filterInputs: function(reportType) {
        let b = [];
        let a = ["Customer Name", "Sales Location", "Salesperson"];
        if (reportType === "Product Variant") {
            b = ["Product Variant/SKU"]
        }
        let options =  a.concat(b);
        Session.set("options", options);
        return Session.get('filterInputs');
    },
    
    canAddLine: function (){
        return Template.instance().reportData.get("hideAddition")
    }, 
    
    results: function(){
        let results = Template.instance().reportData.get("results") || []
        let sortDirection = Session.get('salesOrderSortDirection');
        let sortBy = Session.get('salesOrderSortBy');
        if (sortDirection === -1){
            return _.sortBy(results, sortBy);
        } else {
            return _.sortBy(results, sortBy).reverse();
        }
    },

    sumTotal: function(){
        let results = Template.instance().reportData.get("results") || [];
        let total = 0;
        let count = 0;
        let average = 0;
         _.each(results, function(result){
            total += result.totalAmount;
            count += result.count;
            average += result.average
         });
        return {total: total, count: count, average: average}
    },

    sortedBy: function (key) {
        let sortIcon = Session.get('salesOrderSortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
        return Session.get('salesOrderSortBy') === key ? sortIcon : '';
    }
});

/*****************************************************************************/
/* SalesOrder: Lifecycle Hooks */
/*****************************************************************************/
Template.SalesOrder.onCreated(function () {
    let instance = this;
    instance.reportData = new ReactiveDict();

    if (!Session.get('salesOrderSortBy')) {
        Session.set('salesOrderSortBy', 'label');
        Session.set('salesOrderSortDirection', -1);
    }

    if (!instance.reportData.get("reportFilter")){
        let start =  moment().subtract(3, 'months').startOf("month")._d;
        let end =  moment().endOf('day')._d;
        let filterObject = {
            startDate: start,
            endDate: end,
            reportType: "Customer"
        };
        instance.reportData.set("reportFilter", filterObject);
        instance.reportData.set("addedFilters", 1);
        var filterInputs =  [];
        var inputId = Random.id();
        filterInputs.push({_id: inputId, selectedOption: false});
        instance.reportData.set("filterObject", filterObject);
    }

    instance.salesReportChart = undefined;

    instance.getGraphData = function (dataArray) {
        var labels = [];
        var values = [];
        _.each(dataArray, function (data) {
            labels.push(data.label.substring(0, 15));
            values.push(data.totalAmount);
        });
        return {
            labels: labels,
            data: values
        };
    };

    instance.autorun(function() {
        let allOptions = Session.get("options") || [];
        let selected = instance.reportData.get("addedFilters");
        if (selected > 0 && selected >= allOptions.length){
            instance.reportData.set("hideAddition", false);
        } else {
            instance.reportData.set("hideAddition", true);
        }
        let filterObject = instance.reportData.get("filterObject");
        Meteor.call('orders/getReportData', filterObject, function(err, res) {
            if(err){
                console.log(err)
            } else {
                instance.reportData.set('results', res);

                var graphData = instance.getGraphData(res);

                var salesChartCanvas = document.getElementById('intelligenceSalesOrderReportCanvas').getContext("2d");

                var salesChartData = {
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

                if (!instance.salesReportChart) {
                  instance.salesReportChart = new Chart(salesChartCanvas).Line(salesChartData, salesChartOptions);
                } else {
                  instance.salesReportChart.destroy();
                  instance.salesReportChart = new Chart(salesChartCanvas).Line(salesChartData, salesChartOptions);
                }

            }
        });
    });
    
});

Template.SalesOrder.onRendered(function () {
    let self = this;
});

Template.SalesOrder.onDestroyed(function () {
});


/*****************************************************************************/
/* SelectableOptions: Helpers */
/*****************************************************************************/
Template.SelectableOptions.helpers({
    optionsForReportType: function(selected){
        return Session.get("options")
    },
});

/*****************************************************************************/
/* SelectableOptions: Helpers */
/*****************************************************************************/
Template.SelectableOptions.onCreated(function () {
    let instance = this;
    instance.selectData = new ReactiveDict();
});

/*****************************************************************************/
/* SelectableOptions: Helpers */
/*****************************************************************************/


Template.SelectableOptions.onRendered(function () {
    let self = this;
    this.autorun(function() {
        let selected = Session.get("nonSelectable");
        self.$('option').each(function() {
            let value = self.$(this).val();
            if (value){
                let sel =  _.find(selected, function(s) {return s === value });
                if (sel) {
                    self.$(this).attr('disabled', true)
                } else {
                    self.$(this).removeAttr('disabled');
                }
            } else {
                self.$("option").removeAttr('disabled')
            }
        });
    })
});


Template.SelectableOptions.events({
  'change select': function (e, tmpl) {
      let self = this;
      let selectedValue = tmpl.$('select').val();
      let filterInputs = Session.get('filterInputs') || [];
      if (filterInputs.length > 0){
          let select = _.find(filterInputs, function (i) {
              return i._id === self._id
          });
          if (select){
              if (selectedValue){
                  select.selectedOption = selectedValue;
              } else {
                  delete  select.selectedOption;
              }
              delete select.value;
              delete select.valueName;
              Session.set('filterInputs', filterInputs);
          }
      }
  },

    'input .search': function(e, tmpl) {
        let $input = tmpl.$(".search");
        let searchText = $input.val();
        let self = this;
        if (self.selectedOption){
            let option = self.selectedOption;
            if(option === "Customer Name"){
                getCustomer(e, searchText, tmpl, self)
            }

            if (option === "Sales Location"){
                getSalesLocations(e, searchText, tmpl, self)
            }

            if (option === "Salesperson"){
                getAssignee(e, searchText, tmpl, self)
            }

            if (option === "Product Variant/SKU"){
                getProductVariant(e, searchText, tmpl, self)
            }
        }
    },

    'click .customer-search-elem, mousedown .customer-search-elem': function(e, tmpl) {
        let searchData = e.currentTarget.dataset;
        let self = this;
        let filterInputs = Session.get('filterInputs') || [];
        if (filterInputs.length > 0){
            let select = _.find(filterInputs, function (i) {
                return i._id === self._id
            });
            if (select){
                    select.value = searchData.id;
                    select.valueName = searchData.name;
                    Session.set('filterInputs', filterInputs);
            }
        }
    },

    'blur input.search': function(e, tmpl) {
        setTimeout(function() {
            tmpl.$('.customer-search-result').hide();
        }, 100);
    }

});


function getCustomer(e, searchText, tmpl, self){
    Meteor.call('customers/getCustomers', searchText, function(err, customers) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            let obj = [],
                i = 0;
            _.forEach(customers, function(c) {

                // text
                cText = c.name || c.description;
                if (cText && cText.length > 42) cText = cText.substring(0, 42) + '...';

                obj[i++] = { id: c._id, name: cText, customerNumber: c.customerNumber };
            });
            let res = tmpl.$('#divCustomerSearch');
            tmpl.$(res).html('');
            _.forEach(obj, function(el) {
                tmpl.$(res).append('' +
                    '<div class="customer-search-elem" data-id="' + el['id'] + '" data-name="' + el['name'] + '"><div>' +
                    '<div class="col-sm-10 col-xs-10 n-side-padding">' +
                    el['name'] + ' <span class="text-muted"><small>' + el['customerNumber'] + '</small></span>' +
                    '</div>' +
                    '<div class="col-sm-2 col-xs-2 n-side-padding fs11 text-right">' +
                    '<span class="text-muted"><a href="' + Router.path('distributors.detail', { _id: el['id'] }) + '" data-id="' + el['id'] + '" class="customer-link">View</a></span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</div><div class="clearfix"></div></div>'
                );
            });
            if (customers && customers.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();

        }
    });
}

function getSalesLocations(e, searchText, tmpl, self){
    Meteor.call('locations/getLocations', searchText, function(err, locations) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            let obj = [],
                i = 0;
            _.forEach(locations, function(c) {

                // text
                cText = c.name;
                if (cText && cText.length > 42) cText = cText.substring(0, 42) + '...';

                obj[i++] = { id: c._id, name: cText};
            });
            let res = tmpl.$('#divCustomerSearch');
            tmpl.$(res).html('');
            _.forEach(obj, function(el) {
                tmpl.$(res).append('' +
                    '<div class="customer-search-elem" data-id="' + el['id'] + '" data-name="' + el['name'] + '"><div>' +
                    '<div class="col-sm-10 col-xs-10 n-side-padding">' +
                    el['name'] +
                    '</div>' +
                    '<div class="col-sm-2 col-xs-2 n-side-padding fs11 text-right">' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</div><div class="clearfix"></div></div>'
                );
            });
            if (locations && locations.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();

        }
    });
}


function getAssignee(e, searchText, tmpl, self){
    Meteor.call('accounts/getUsers', searchText, function(err, users) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            let obj = [],
                i = 0;
            _.forEach(users, function(c) {

                // text
                cText = c.profile.fullName;
                if (cText && cText.length > 42) cText = cText.substring(0, 42) + '...';

                obj[i++] = { id: c._id, name: cText};
            });
            let res = tmpl.$('#divCustomerSearch');
            tmpl.$(res).html('');
            _.forEach(obj, function(el) {
                tmpl.$(res).append('' +
                    '<div class="customer-search-elem" data-id="' + el['id'] + '" data-name="' + el['name'] + '"><div>' +
                    '<div class="col-sm-10 col-xs-10 n-side-padding">' +
                    el['name'] +
                    '</div>' +
                    '<div class="col-sm-2 col-xs-2 n-side-padding fs11 text-right">' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</div><div class="clearfix"></div></div>'
                );
            });
            if (users && users.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();

        }
    });
}

function getProductVariant(e, searchText, tmpl, self){
    Meteor.call('products/getAllVariants', searchText, function(err, variants) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            let obj = [],
                i = 0;
            _.each(variants, function(v) {

                // text
                vText = v.name || v.description;
                if (vText && vText.length > 36) vText = vText.substring(0, 36) + '..';

                // amount
                vAmountString = '';
                vAmount = 0;
                if (v.variantPrices && v.variantPrices.length > 0) {
                    vAmount = v.variantPrices[0].value;
                } else {
                    vAmount = v.wholesalePrice;
                }

                vAmountString = Core.numberWithDecimals(vAmount);

                vCode = v.code ? ', ' + v.code : '';

                // quantity
                vQuantity = 0;
                if (v.locations && v.locations.length > 0) {
                    vQuantity = v.locations[0].stockOnHand;
                    obj[i++] = [v._id, vText, vAmountString, vQuantity, v.code, v.name, v.uom, vAmount, vCode];
                }
            });
            let res = tmpl.$("#divCustomerSearch");
            tmpl.$(res).html('');
            _.forEach(obj, function(el) {
                tmpl.$(res).append('' +
                    '<div class="customer-search-elem" data-price="' + el[7] + '" data-available="' + el[3] + '" data-name="' + el[5] + '" data-uom="' + el[6] + '" data-code="' + el[4] + '" data-id="' + el[0] + '" data-caption="' + el[1] + '"><div>' +
                    '<div class="col-sm-9 col-xs-9 n-side-padding">' +
                    el[1] + '<span class="text-muted"><small>' + el[8] + '</small></span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</div><div class="clearfix"></div></div>'
                );
            });
            if (variants && variants.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();
        }

    });
}

function refreshReport(tmpl) {
    let reportType = tmpl.$('[name=selectReportType]').val();
    let startDate =  tmpl.$('[name=from]').val();
    let endDate =  tmpl.$('[name=to]').val();
    startDate = new Date(startDate);
    endDate = moment(new Date(endDate)).endOf('day')._d;
    let filterObject = {
        startDate: startDate,
        endDate: endDate,
        reportType: reportType
    };
    let queryParams = prepareFinalObject(filterObject);
    tmpl.reportData.set("filterObject", queryParams)
}

function prepareFinalObject(object) {
    let filterObject = object;
    let filterInputs = Session.get("filterInputs") || []
    let inputData = [];
    if (filterInputs.length > 0 ){
        _.each(filterInputs, function (i){
            if (i.selectedOption && i.value){
                inputData.push(i)
            }
        });
    }

    if (inputData.length > 0 ){
        filterObject.queryConditions = inputData
    }
    return filterObject
}