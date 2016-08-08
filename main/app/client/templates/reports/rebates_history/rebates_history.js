/*****************************************************************************/
/* RebatesHistory: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.RebatesHistory.events({
    'input .customerSearch': function(e, tmpl) {
        let $input = tmpl.$(".customerSearch");
        let searchText = $input.val();
        getCustomer(e, searchText, tmpl);

        if(searchText.length === 0){
            let filterConditions = Template.instance().reportData.get("filterConditions");
            delete filterConditions.customerId;
            delete filterConditions.customerName;
            Template.instance().reportData.set("filterConditions", filterConditions);
        }
    },


    'blur input.customerSearch': function(e, tmpl) {
        setTimeout(function() {
            tmpl.$('.customer-search-result').hide();
        }, 100);
    },

    'click .customer .customer-search-elem, mousedown .customer .customer-search-elem': function(e, tmpl) {
        let searchData = e.currentTarget.dataset;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.customerId = searchData.id;
        filterConditions.customerName = searchData.name;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },



    'input .promotionSearch': function(e, tmpl) {
        let $input = tmpl.$(".promotionSearch");
        let searchText = $input.val();
        getPromotion(e, searchText, tmpl, div);
        let div = '#divPromotionSearch';

        if(searchText.length === 0){
            let filterConditions = Template.instance().reportData.get("filterConditions");
            delete filterConditions.promotionId;
            delete filterConditions.promotionName;
            Template.instance().reportData.set("filterConditions", filterConditions);
        }
    },

    'blur input.promotionSearch': function(e, tmpl) {
        setTimeout(function() {
            tmpl.$('.customer-search-result').hide();
        }, 100);
    },

    'click .promotion .customer-search-elem, mousedown .promotion .customer-search-elem': function(e, tmpl) {
        let searchData = e.currentTarget.dataset;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.promotionId = searchData.id;
        filterConditions.promotionName = searchData.name;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },


    'input .orderNumber': function(e, tmpl) {
        let $input = tmpl.$(".orderNumber");
        let searchText = $input.val();
        let filterConditions = Template.instance().reportData.get("filterConditions");
        if(searchText.length === 0){
            delete filterConditions.orderNumber
        } else {
            filterConditions.orderNumber = searchText;
        }
        Template.instance().reportData.set("filterConditions", filterConditions);
    },

    'change #status': function(event){
        event.preventDefault();
        let status = [];
        let selected = $("#status").find("option:selected");
        _.each(selected, function(select){
            status.push(select.value)
        });
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions.status = status;
        Template.instance().reportData.set("filterConditions", filterConditions);
    },

    'click .order-entry': function(e, tmpl) {
        Router.go('orders.detail', {_id: this._id});
    },

    'dp.change .datepicker': function (e, tmpl) {
        let value = e.currentTarget.value;
        let id = e.currentTarget.id;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        filterConditions[id] = id === 'startDate' ? new Date(value) : moment(new Date(value)).endOf('day')._d;
        Template.instance().reportData.set("filterConditions", filterConditions);

        Session.set('re_rep_' + id, new Date(value));

    },
    'click .excel': function(event, tmpl){
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
            "Rebate Number",
            "Order Number",
            "Date Posted",
            "Type",
            "Status",
            "Customer",
            "promotionName",
            "Value"
        ];

        let filterConditions = Template.instance().reportData.get("filterConditions");
        let options = getOptions(filterConditions);
        Meteor.call("promotions/getExportData", options, function(err, data){
            if (err){
                console.log(err);
                resetButton();
            }  else {
                let exportData = {fields: fields, data: data};
                TDCExporter.exportAllData(exportData, "RebatesHistoryReport");
                resetButton();
            }
        });
    },

    'click [name=reports-home]': function (event, tmpl) {
        event.preventDefault();
        Router.go('reports.home');
    },

    'click a[href="#sort"]': function (e, tmpl) {
        let key = e.currentTarget.dataset.key;
        if (Session.get('rebatesHistorySortBy') === key) Session.set('rebatesHistorySortDirection', 0 - Number(Session.get('rebatesHistorySortDirection'))); //reverse sort direction
        else Session.set('rebatesHistorySortBy', key);
    },

    "change .createdBy": function (e, tmpl) {
        let value = e.currentTarget.value;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        if (value){
            filterConditions.userId = value;
        } else {
            delete  filterConditions.userId
        }
        Template.instance().reportData.set("filterConditions", filterConditions);
    },

    "change .rewardType": function (e, tmpl) {
        let value = e.currentTarget.value;
        let filterConditions = Template.instance().reportData.get("filterConditions");
        if (value){
            filterConditions.rewardSubType = value;
        } else {
            delete  filterConditions.rewardSubType
        }
        Template.instance().reportData.set("filterConditions", filterConditions);
    },
});

/*****************************************************************************/
/* RebatesHistory: Helpers */
/*****************************************************************************/
Template.RebatesHistory.helpers({
    salesUsers: function() {
        return Meteor.users.find().fetch();
    },
    startDate: function () {
        return Session.get('re_rep_startDate');
    },
    endDate: function () {
        return Session.get('re_rep_endDate');
    },
    assignee: function() {
        if(this.assigneeId)
            return getSalesPerson(this.assigneeId);
    },
    filterConditions: function(){
        return Template.instance().reportData.get("filterConditions")
    },
    rebates: function() {
        return Template.instance().rebates();
    },

    hasMoreRebates: function () {
        return Template.instance().rebates().count() >= Template.instance().limit.get();
    },

    sortedBy: function (key) {
        let sortIcon = Session.get('rebatesHistorySortDirection') === 1 ? 'glyphicon glyphicon-sort-by-attributes' : 'glyphicon glyphicon-sort-by-attributes-alt';
        return Session.get('rebatesHistorySortBy') === key ? sortIcon : '';
    },

    rebateStatusStyle: function() {
        if (this.status === 'pending') return 'text-warning';
        if (this.status === 'applied') return 'text-success';
    },

    rewardSubType: function () {
        let rewardT = PromotionRewardSubTypes.findOne({code: this.type});
        return rewardT && rewardT.name  ? rewardT.name :  "unspecified"
    },

    rewardSubTypes: function(){
        return PromotionRewardSubTypes.find().fetch()
    }

});

/*****************************************************************************/
/* RebatesHistory: Lifecycle Hooks */
/*****************************************************************************/
Template.RebatesHistory.onCreated(function () {
    let self = this;
    self.reportData = new ReactiveDict();
    if (!self.reportData.get("filterConditions")){
        let filterConditions = {};
        filterConditions.startDate = moment().subtract(3, 'months').startOf("month")._d;
        filterConditions.endDate = moment().endOf('day')._d;
        self.reportData.set("filterConditions", filterConditions)
    }

    if (!Session.get('rebatesHistorySortBy')) {
        Session.set('rebatesHistorySortBy', 'createdAt');
        Session.set('rebatesHistorySortDirection', -1);
    }

    self.loaded = new ReactiveVar(0);
    self.limit = new ReactiveVar(getLimit());

    self.autorun(function () {
        let filterConditions = self.reportData.get("filterConditions");
        let options = getOptions(filterConditions);
        let limit = self.limit.get();
        let sortBy = Session.get('rebatesHistorySortBy');
        let sortDirection = Number(Session.get('rebatesHistorySortDirection') || -1);
        let sort = {};
        sort[sortBy] = sortDirection;
        let subscription = self.subscribe('ManageRebates', options, limit, sort);
        self.subscribe('PromotionRewardsSubType');
        if (subscription.ready()) {
            self.loaded.set(limit);
        }

        if (self.subscriptionsReady()) {
            try {
                Meteor.defer(function() {
                    self.$('.selectpicker').selectpicker('refresh');
                });
            } catch (e) {

            }
        }
    });

    // 3. Cursor
    self.rebates = function() {
        let filterConditions = self.reportData.get("filterConditions");
        let options = getOptions(filterConditions);
        let limit = self.loaded.get();
        let sortBy = Session.get('rebatesHistorySortBy');
        let sortDirection = Number(Session.get('rebatesHistorySortDirection') || -1);
        let sort = {};
        sort[sortBy] = sortDirection;
        return PromotionRebates.find(options, {sort: sort, limit: limit});
    };

    // long-span variables to improve UX
    if (!Session.get('re_rep_startDate')) {
        Session.set('re_rep_startDate', moment().subtract(3, 'months').startOf('month')._d);
        Session.set('re_rep_endDate', moment().endOf('day')._d);
    }
});

Template.RebatesHistory.onRendered(function () {
    var tmpl = Template.instance();
    //let instance = this;
    this.scrollHandler = function(e) {
        let threshold, target = $("#showMoreResults");
        if (!target.length) return;

        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if (target.offset().top < threshold) {
            if (!target.data("visible")) {
                target.data("visible", true);
                var limit = this.limit.get();
                limit += 24;
                this.limit.set(limit);
            }
        } else {
            if (target.data("visible")) {
                target.data("visible", false);
            }
        }
    }.bind(this);

    $(window).on('scroll', this.scrollHandler);
});

Template.RebatesHistory.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
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
            let res = tmpl.$('#customerName');
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

function getPromotion(e, searchText, tmpl, div){
    Meteor.call('promotions/getPromotions', searchText, function(err, promotions) {
        if (err) {
            console.log('Error: ' + err);
        } else {
            let obj = [],
                i = 0;
            _.forEach(promotions, function(c) {
                // text
                cText = c.name;
                if (cText && cText.length > 42) cText = cText.substring(0, 42) + '...';

                obj[i++] = { id: c._id, name: cText};
            });
            let res = tmpl.$("#divPromotionSearch");
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
            if (promotions && promotions.length > 0) tmpl.$(res).show();
            else tmpl.$(res).hide();

        }
    });
}


function getOptions(filterConditions) {
    let options = {}
    let userId = Meteor.userId();
    let timezone = Core.getTimezone(userId);
    let status = getStatus(filterConditions);

    if (status.length > 0 ){
        options["status"] = {$in: status}
    }

    if (filterConditions.customerId){
        options["customerId"] = filterConditions.customerId
    }

    if (filterConditions.promotionId){
        options["promotionId"] = filterConditions.customerId
    }

    if (filterConditions.rewardSubType){
        options['type'] = filterConditions.rewardSubType
    }

    if (filterConditions.orderNumber){
        options['orderNumber'] = Number(filterConditions.orderNumber)
    }

    let startDate, endDate;
    if (filterConditions.startDate){
        startDate = filterConditions.startDate
    }
    if (filterConditions.endDate){
        endDate = filterConditions.endDate
    }
    if (startDate && endDate){
        options["createdAt"] = {$gte : startDate, $lte : endDate}
    } else if (startDate){
        options["createdAt"] = {$gte : startDate}
    } else if (endDate) {
        options["createdAt"] = {$lte : endDate}
    } else {
        delete options["createdAt"]
    }
    return options
}

function getStatus(filterConditions){
    let status = [];
    let definedStatus = ["pending", "applied"];
    if (_.isArray(filterConditions.status) && filterConditions.status.length > 0){
        _.each(definedStatus, function(s){
            let foundStatus =  _.find(filterConditions.status, function(c){ return s === c });
            if (foundStatus){
                status.push(foundStatus)
            }
        });
    }
    return status
}



function getLimit() {
    return 24;
}
