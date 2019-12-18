/*****************************************************************************/
/* EmployeeTimeManagement: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.EmployeeTimeManagement.events({
  'change [name="paymentPeriod.month"]': (e, tmpl) => {
      tmpl.selectedMonth.set($(e.target).val());
  },
  'change [name="paymentPeriod.year"]': (e, tmpl) => {
      tmpl.selectedYear.set($(e.target).val());
  },
  'hover .table tbody tr': (e,tmpl) => {
      console.log('hover called');
  },
  selectedMonth: function (val) {
      if(Template.instance().selectedMonth.get()) {
          return Template.instance().selectedMonth.get() === val ? selected="selected" : '';
      }
  },
  selectedYear: function (val) {
      if(Template.instance().selectedYear.get()) {
          return Template.instance().selectedYear.get() === val ? selected="selected" : '';
      }
  },
  'click #createTimeRecordWeekOne': function(e,tmpl){
      e.preventDefault();
      let user = Meteor.user()

      const month = tmpl.selectedMonth.get()
      const year = tmpl.selectedYear.get()
      Session.set("year", year);
      Session.set("month", month);
      Session.set("weekIndex", "1");

      const weekIndex = Session.get("weekIndex")
      let timeRecordResult = TimeRecord.findOne({"createdBy":user._id,"period.year":year,"period.month":month,"period.weekIndex":weekIndex});

      if(timeRecordResult){
        swal({
            title: "Oops!",
            text: "You have already created a time record for this period",
            confirmButtonClass: "btn-danger",
            type: "error",
            confirmButtonText: "OK"
        });
      }else{
        Router.go('employee.time.management.create', {_id: Session.get('context')});
      }

  //    Router.go('employee.time.management.create',{_id: Session.get('context')});
  },
  'click #createTimeRecordWeekTwo': function(e,tmpl){
      e.preventDefault();
      let user = Meteor.user()

      const month = tmpl.selectedMonth.get()
      const year = tmpl.selectedYear.get()
      Session.set("year", year);
      Session.set("month", month);
      Session.set("weekIndex", "2");

      const weekIndex = Session.get("weekIndex")
      let timeRecordResult = TimeRecord.findOne({"createdBy":user._id,"period.year":year,"period.month":month,"period.weekIndex":weekIndex});

      if(timeRecordResult){
        swal({
            title: "Oops!",
            text: "You have already created a time record for this period",
            confirmButtonClass: "btn-danger",
            type: "error",
            confirmButtonText: "OK"
        });
      }else{
        Router.go('employee.time.management.create', {_id: Session.get('context')});
      }






  },
  'click #createTimeRecordWeekThree': function(e,tmpl){
        e.preventDefault();
        let user = Meteor.user()

        const month = tmpl.selectedMonth.get()
        const year = tmpl.selectedYear.get()
        Session.set("year", year);
        Session.set("month", month);
        Session.set("weekIndex", "3");

        const weekIndex = Session.get("weekIndex")
        let timeRecordResult = TimeRecord.findOne({"createdBy":user._id,"period.year":year,"period.month":month,"period.weekIndex":weekIndex});

         if(timeRecordResult){
          swal({
              title: "Oops!",
              text: "You have already created a time record for this period",
              confirmButtonClass: "btn-danger",
              type: "error",
              confirmButtonText: "OK"
          });
        }else{
          Router.go('employee.time.management.create', {_id: Session.get('context')});
        }

    },

    'click #createTimeRecordWeekFour': function(e,tmpl){
          e.preventDefault();
          let user = Meteor.user()

          const month = tmpl.selectedMonth.get()
          const year = tmpl.selectedYear.get()
          Session.set("year", year);
          Session.set("month", month);
          Session.set("weekIndex", "4");

          const weekIndex = Session.get("weekIndex")
          let timeRecordResult = TimeRecord.findOne({"createdBy":user._id,"period.year":year,"period.month":month,"period.weekIndex":weekIndex});
        if(timeRecordResult){
            swal({
                title: "Oops!",
                text: "You have already created a time record for this period",
                confirmButtonClass: "btn-danger",
                type: "error",
                confirmButtonText: "OK"
            });
          }else{
            Router.go('employee.time.management.create', {_id: Session.get('context')});
          }

      },
      'click #createTimeRecordWeekFive': function(e,tmpl){
        e.preventDefault();
        let user = Meteor.user()

        const month = tmpl.selectedMonth.get()
        const year = tmpl.selectedYear.get()
        Session.set("year", year);
        Session.set("month", month);
        Session.set("weekIndex", "5");

        const weekIndex = Session.get("weekIndex")
        let timeRecordResult = TimeRecord.findOne({"createdBy":user._id,"period.year":year,"period.month":month,"period.weekIndex":weekIndex});
      if(timeRecordResult){
          swal({
              title: "Oops!",
              text: "You have already created a time record for this period",
              confirmButtonClass: "btn-danger",
              type: "error",
              confirmButtonText: "OK"
          });
        }else{
          Router.go('employee.time.management.create', {_id: Session.get('context')});
        }

    },
    'click #createTimeRecordWeekSix': function(e,tmpl){
        e.preventDefault();
        let user = Meteor.user()

        const month = tmpl.selectedMonth.get()
        const year = tmpl.selectedYear.get()
        Session.set("year", year);
        Session.set("month", month);
        Session.set("weekIndex", "6");

        const weekIndex = Session.get("weekIndex")
        let timeRecordResult = TimeRecord.findOne({"createdBy":user._id,"period.year":year,"period.month":month,"period.weekIndex":weekIndex});
      if(timeRecordResult){
          swal({
              title: "Oops!",
              text: "You have already created a time record for this period",
              confirmButtonClass: "btn-danger",
              type: "error",
              confirmButtonText: "OK"
          });
        }else{
          Router.go('employee.time.management.create', {_id: Session.get('context')});
        }

    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();




        if ((status === "Draft") || (status === "Pending") || (status === "Rejected By Supervisor") || (status === "Rejected By Budget Holder")){
            Modal.show('TravelRequisition2Create', invokeReason);
        }else{
            Modal.show('TravelRequisition2Detail', invokeReason);
        }

    },

    'click .paginateLeft': function(e, tmpl) {

    },
    'click .paginateRight': function(e, tmpl) {

    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

Template.registerHelper('repeat', function(max) {
    return _.range(max - 1); // undescore.js but every range impl would work
});

/*****************************************************************************/
/* EmployeeTimeManagement: Helpers */
/*****************************************************************************/
Template.EmployeeTimeManagement.helpers({
  'month': function(){
      return Core.months()
  },
  'year': function(){
      return Core.years();
  },
  'weeks': function(){
      return Template.instance().weeksInMonth.get();
  },
  selectedMonth: function (val) {
      if(Template.instance().selectedMonth.get()) {
          return Template.instance().selectedMonth.get() === val ? selected="selected" : '';
      }
  },
  selectedYear: function (val) {
      if(Template.instance().selectedYear.get()) {
          return Template.instance().selectedYear.get() === val ? selected="selected" : '';
      }
  },

    'travelRequestsICreated': function() {
        return Template.instance().travelRequestsICreated.get()
    },
    'month': function(){
        return Core.months();
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear(); x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    },

    'totalTripCostNGN': function(currentTimeRecord) {
        if(currentTimeRecord) {
            currentTimeRecord.totalTripCostNGN = totalTripCostNGN;

            return totalTripCostNGN;
        }
    },
    'getPrintUrl': function(currentTimeRecord) {
        if(currentTimeRecord) {
            return Meteor.absoluteUrl() + 'business/' + currentTimeRecord.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTimeRecord._id
        }
    }

});

/*****************************************************************************/
/* EmployeeTimeManagement: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTimeManagement.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')
    self.subscribe("allEmployees", Session.get('context'));

    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.travelRequestsICreated = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()
    //--
    self.selectedMonth = new ReactiveVar();
    self.selectedYear = new ReactiveVar();
    self.weeksInMonth = new ReactiveVar();
    //--
    let theMoment = moment();
    self.selectedMonth.set(theMoment.format('MM'))
    self.selectedYear.set(theMoment.format('YYYY'))
    //--

    self.currentTimeRecord = new ReactiveVar()


    self.totalTripCost = new ReactiveVar(0)



    self.subscribe('getCostElement', businessUnitId)
    self.subscribe("allTimeRecords", Session.get('context'));

    self.autorun(function() {


        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let timeRecordSub = self.subscribe("allTimeRecords", Session.get('context'));


        let weeksInMonth = function (year, month) {
            let today = new Date();
            year = today.getFullYear();
            month = today.getMonth();
            let firstDayOfMonth = new Date(year, month, 1);
            let firstDay = firstDayOfMonth.getDay();
            let lastOfMonth = new Date(year, month+1, 0);
            let daysInMonth = lastOfMonth.getDate();  
            switch(daysInMonth) {
                case 28:
                    if (firstDay === 1) {
                        return 4;
                    } else {
                        return 5;
                    }
                case 29:
                    return 5;
                case 30:
                    if (firstDay === 0) {
                        return 6;
                    } else {
                        return 5;
                    }
                case 31:
                    if (firstDay == 6 || firstDay == 0) {
                        return 6;
                    } else {
                        return 5;
                    }
                }
            }
            self.weeksInMonth.set(weeksInMonth)

    })



});

Template.EmployeeTimeManagement.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.EmployeeTimeManagement.onDestroyed(function () {
});
