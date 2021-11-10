/*****************************************************************************/
/* logsList: Event Handlers */
/*****************************************************************************/
Template.logsList.events({
    "keyup #logSearch": function (e, tmpl) {
        let searchTerm = tmpl
            .$("#logSearch")
            .val()
            .trim();
        tmpl.elements.set("searchText", searchTerm);
        if (searchTerm.length >= 3) {
            if (searchTerm !== tmpl.lastSearchText) {
                Session.set("searchQueryReturned", false);
                Session.set("searchActive", true);
                tmpl.setSearchFunctionTimeOut(searchTerm);
            }
        } else {
            tmpl.limit.set(getLimit());
            Session.set("searchQueryReturned", false);
            Session.set("searchActive", false);
        }
        tmpl.lastSearchText = searchTerm;
    },

    "click #download": function (e, tmpl) {
        e.preventDefault();

        let logs, csv;
        if (Session.get("searchActive")) {
            logs = Template.logsList.__helpers.get("searchLogs").call();
            if (logs) logs = ReformatForAudit(logs)
            csv = Papa.unparse(logs);
        } else {
            logs = tmpl.logs();
            console.log('logs- logs', logs)
            if (logs) logs = ReformatForAudit(logs.fetch(), Meteor.users.find({}))
            // csv = Papa.unparse(logs.fetch());
            csv = Papa.unparse(logs);
        }

        if (logs.length < 1) {
            toastr.warning("No data to be exported", "Notice");
            throw "empy data";
        }

        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        let fileName = `logs-export-${Date.now()}.csv`;
        saveAs(blob, fileName);
    },

    "submit form": function (event) {
        event.preventDefault();
        let start = event.target.from.value;
        let end = event.target.to.value;
        let events = [];
        let collections = [];
        let selectedEvents = $("#event").find("option:selected");
        let selectedCollections = $("#collection").find("option:selected");

        _.each(selectedEvents, select => {
            events.push(select.value);
        });


        _.each(selectedCollections, select => {
            collections.push(select.value);
        })

        let duration = event.target.by.value;
        let filterConditions = {
            startDate: new Date(start),
            endDate: end ? moment(new Date(end))
                .endOf("day")
                .toDate() : moment(new Date()).endOf("day").toDate(),
            events,
            collections,
            duration: duration,
            searchText: Template.instance().elements.get("searchText")
        };
        Template.instance().reportData.set("filterConditions", filterConditions);
        Template.instance().setSearchFunctionTimeOut(filterConditions.searchText);
    },

    'click a[href="#sort"]': function (e, tmpl) {
		let key = e.currentTarget.dataset.key;
		if (Session.get('logSortBy') === key) Session.set('logSortDirection', 0 - Number(Session.get('logSortDirection'))); //reverse sort direction
		else Session.set('logSortBy', key);
	},
});

/*****************************************************************************/
/* logsList: Helpers */

/*****************************************************************************/
Template.logsList.helpers({
    searchText: function () {
        return Template.instance().elements.get("searchText");
    },
    activeStatus: function () {
        return s.capitalize(Session.get("logsListStatusFilter"));
    },
    mainSearchLogs: function () {
        return Template.instance().searchResults.get("results");
    },



    searchLogs: function () {
        var allResults = Template.logsList.__helpers
            .get("mainSearchLogs")
            .call();
        let logsListDurationFilter = Session.get("logsListDurationFilter");
        let startDate = moment().subtract(logsListDurationFilter, "months")._d;
        let limit = Template.instance().limit.get();
        let sortDirection = Number(Session.get("logSortDirection") || -1);
        let sortField = Session.get("logSortBy");
        let filteredResult = _.filter(allResults, function (result) {
            return (
                result &&
                moment(result.createdAt) > startDate
            );
        }).slice(0, limit - 1);




        return sortSearchResults(filteredResult, sortField, sortDirection);
    },

    hasMoreSearchResults: function () {
        return (
            Template.logsList.__helpers.get("mainSearchLogs").call().length >=
            Template.instance().limit.get()
        );
    },

    searchActive: function () {
        return Session.get("searchActive");
    },

    searchQueryReturned: function () {
        return Session.get("searchQueryReturned");
    },

    logs: function () {
        return Template.instance().logs();
    },

    openLogsCountFiltered: function () {
        let dFilter = Session.get("logsListDurationFilter");
        let startDate = moment().subtract(dFilter, "months")._d;

        let count;
        if (Session.get("searchActive")) {
            count = _.filter(
                Template.logsList.__helpers.get("mainSearchLogs").call(),
                function (data) {
                    return data.status === "OPEN" && moment(data.createdAt) > startDate;
                }
            ).length;
        } else {
            count = Logs.find({
                status: "OPEN",
                createdAt: { $gte: startDate }
            }).count();
        }
        return count ? count : "";
    },

    hasMoreLogs: function () {
        return (
            Template.instance()
                .logs()
                .count() >= Template.instance().limit.get()
        );
    },

    sortedBy: function (key) {
        let sortIcon =
            Session.get("logSortDirection") === 1
                ? "glyphicon glyphicon-sort-by-attributes"
                : "glyphicon glyphicon-sort-by-attributes-alt";
        return Session.get("logSortBy") === key ? sortIcon : "";
    },

    logsListType: function () {
        return Session.get("logsListType");
    },


});

/*****************************************************************************/
/* logsList: Lifecycle Hooks */
/*****************************************************************************/
Template.logsList.onCreated(function () {
    // LogSubs.clear();
    let logStatusFilter = Session.get("logsListStatusFilter");
    let dFilter = Session.get("logsListDurationFilter")
        ? Session.get("logsListDurationFilter")
        : 12;
    let startDate = moment().subtract(dFilter, "months")._d;
    let logsListType = Session.get("logsListType");
    Session.set("startDate", startDate);

    if (!logsListType) {
        Session.set("logsListType", "standardOrders");
    }

    if (!logStatusFilter) {
        // Session.set("logsListStatusFilter", "OPEN");
        Session.set("logsListDurationFilter", 12);
    }

    if (!Session.get("logSortBy")) {
        Session.set("logSortBy", "createdAt");
        Session.set("logSortDirection", -1);
    }

    if (!Session.get("searchActive")) {
        Session.set("searchActive", false);
    }

    let instance = this;

    instance.reportData = new ReactiveDict();

    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    instance.ready = new ReactiveVar();

    instance.searchResults = new ReactiveDict();
    instance.searchResults.set("results", []);
    instance.searchFunctionTimeOut = null;
    instance.elements = new ReactiveDict();
    instance.elements.set("queryIds", []);
    instance.lastSearchText = "";

    if (!instance.reportData.get("filterConditions")) {
        let filterConditions = {};
        instance.reportData.set("filterConditions", filterConditions);
    }

    let query = function (queryObject) {
        //Core.SearchConnection.call('search/local', 'logs', queryObject.searchTerm, Core.getSearchAuth(), function (error, results) {
        const filter = instance.reportData.get("filterConditions");
        Meteor.call("logs/searchLogs", queryObject.searchTerm, filter , function (
            error,
            results
        ) {
            if (!error) {
                let currentQueryIds = instance.elements.get("queryIds");
                if (
                    queryObject.queryId === currentQueryIds[currentQueryIds.length - 1]
                ) {
                    instance.searchResults.set("results", results);
                    instance.elements.set("queryIds", []);
                    Session.set("searchQueryReturned", true);
                }
            } else {
                console.log(error);
            }
        });
    };

    instance.setSearchFunctionTimeOut = function (searchTerm) {
        Meteor.clearTimeout(instance.searchFunctionTimeOut);
        let queryId = Random.id();
        instance.searchFunctionTimeOut = Meteor.setTimeout(function () {
            query({
                searchTerm: searchTerm,
                queryId: queryId
            });
        }, 500);
        let currentQueryIds = instance.elements.get("queryIds");
        currentQueryIds.push(queryId);
        instance.elements.set("queryIds", currentQueryIds);
    };

    instance.autorun(function () {
        let limit = instance.limit.get();
        let sortBy = Session.get("logSortBy");
        let sortDirection = Number(Session.get("transactionsDirection") || -1);
        let sort = {};
        sort[sortBy] = sortDirection;
        let subFilter = {};



        let subscription = Meteor.subscribe("Logs", {}, {_id: 0, event: 1, collectionName: 1, createdAt: 1}, sortBy);

        if (subscription.ready()) {
            instance.loaded.set(limit);
        }

        // 3. Cursor
        instance.logs = function () {
            let dFilter = Session.get("logsListDurationFilter");
            let startDate = moment().subtract(dFilter, "months")._d;
            let sortBy = Session.get("logSortBy");
            let sortDirection = Number(Session.get("logSortDirection") || -1);

            let options = {};
            options.sort = {};
            options.sort[sortBy] = sortDirection;
            options.limit = 100;

            let filter = {};
            

            logsListFilter = Template.instance().reportData.get(
                "filterConditions"
            );

            let searchTerm = logsListFilter.searchText;



            if (
                logsListFilter.startDate &&
                logsListFilter.endDate >= logsListFilter.startDate
            ) {
                filter["createdAt"] = {
                    $gte: logsListFilter.startDate,
                    $lte: logsListFilter.endDate
                };
            } else if (
                logsListFilter.startDate &&
                logsListFilter.endDate < logsListFilter.startDate
            ) {
                filter["createdAt"] = {
                    $gte: logsListFilter.startDate
                };
            } else {
                filter["createdAt"] = {
                    $gte: startDate
                };
            }

            if (logsListFilter.events && logsListFilter.events.length > 0) {
                filter["event"] = { $in: logsListFilter.events };
            }


            if (logsListFilter.collections && logsListFilter.collections.length > 0) {
                filter["collectionName"] = { $in: logsListFilter.collections };
            }

            if (searchTerm){
                filter["$or"] = [
                    { "event": { '$regex': `${searchTerm}`, '$options': 'i' } },
                    { "collectionName": { '$regex': `${searchTerm}`, '$options': 'i' } },
                    { "user.email": { '$regex': `${searchTerm}`, '$options': 'i' } },
                ]
            };


            return Logs.find(filter, options);
        };
    });
});

Template.logsList.onRendered(function () {
    var tmpl = Template.instance();
    tmpl.$("#dfilter").val(Session.get("logsListDurationFilter"));

    //let instance = this;
    this.scrollHandler = function (e) {
        let threshold,
            target = $("#showMoreResults");
        if (!target.length) return;

        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if (target.offset().top < threshold) {
            if (!target.data("visible")) {
                target.data("visible", true);
                var limit = this.limit.get();
                limit += 25;
                this.limit.set(limit);
            }
        } else {
            if (target.data("visible")) {
                target.data("visible", false);
            }
        }
    }.bind(this);

    $(window).on("scroll", this.scrollHandler);
});

Template.logsList.onDestroyed(function () {
    // $(window).off('scroll', this.scrollHandler);
    // Session.set('searchActive', false);
    // IndirectOrderSubs.clear();
});

function getLimit() {
    return 20;
}

function resetlogSearchFilter() {
    delete Session.keys["logsListStatusFilter"];
    delete Session.keys["logsListApprovalStatusFilter"];
}

const ReformatForAudit = (logs) => {
    const newLogs = [];
    for (let i = 0; i < logs.length; i++) {
        const element = logs[i];
        newLogs.push({
            event: element.event,
            collectionName: element.collectionName,
            url: element.url,
            user: element.user.email || "",
            description: element.newData.description || "",
            oldDescription: element.oldData.description || "",
            newStatus: element.newData.status || "",
            oldStatus: element.oldData.status || "",
            createdAt: element.createdAt
        })
    }
    return newLogs;
}

const sortSearchResults = (arrayToSort, sortField, sortDirection) => {
    switch (sortField) {
        case "createdAt":
            arrayToSort.sort(function (a, b) {
                return sortDirection === 1
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
            });
            break;
        case "collection":
            arrayToSort.sort(function (a, b) {
                var firstCollection = a.collectionName.toLowerCase();
                var secondCollection = b.collectionName.toLowerCase();
                return sortDirection === 1
                    ? firstCollection > secondCollection
                    : secondCollection > firstCollection;
            });
            break;
        case "event":
            arrayToSort.sort(function (a, b) {
                var firstEvent = a.event.toLowerCase();
                var secondEvent = b.event.toLowerCase();
                return sortDirection === 1
                    ? firstEvent > secondEvent
                    : secondEvent > firstEvent;
            });
            break;
        case "user":
            arrayToSort.sort(function (a, b) {
                var firstUser = a.user.email.toLowerCase();
                var secondUser = b.user.email.toLowerCase();
                return sortDirection === 1
                    ? firstUser > secondUser
                    : secondUser > firstUser;
            });
            break;
    }
    return arrayToSort;
};
