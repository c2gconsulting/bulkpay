import _ from 'underscore';


/*****************************************************************************/
/* EmployeesReport: Event Handlers */
/*****************************************************************************/
Template.EmployeesReport.events({
  'change [name=reportType]': (e, tmpl ) => {
    let selectedReportType = $(e.target).val()

    tmpl.selectedReportType.set(selectedReportType)
  },
  'change [name=units]': (e, tmpl ) => {
    tmpl.selectedUnitIds.set(Core.returnSelection($(e.target)))
  },
  'change [name=payGrades]': (e, tmpl ) => {
    tmpl.selectedPayGradeIds.set(Core.returnSelection($(e.target)))
  },
  'click #getResult': function(e, tmpl) {
      e.preventDefault();
      const startTime = $('[name="startTime"]').val();
      const endTime = $('[name="endTime"]').val();

      const selectedReportType = tmpl.selectedReportType.get()

      if(!selectedReportType) {
        swal('No Report type', 'Please select a report type', 'error');
        return
      }

        let selectedUnitId = ''
        let selectedPayGradeId = ''
        let findCriteria = null

        if(selectedReportType === 'payGrade') {
            // selectedPayGradeId = $('[name="payGrades"]').val()
            selectedPayGradeId = tmpl.selectedPayGradeIds.get() || []
            findCriteria = {
                'employeeProfile.employment.paygrade': {$in: selectedPayGradeId},
                businessIds: Session.get('context'),
                "employee": true
            }
        } else if(selectedReportType === 'unit') {
            selectedUnitId = tmpl.selectedUnitIds.get() || []

            let positionIds = selectedUnitId.map(aUnitId => {
                let positions = EntityObjects.find({
                    parentId: aUnitId,
                    otype: 'Position'
                }).fetch()
                return _.pluck(positions, '_id')
            })
            const flattenedPositionIds = _.flatten(positionIds)

            findCriteria = {
                'employeeProfile.employment.position': {$in: flattenedPositionIds},
                businessIds: Session.get('context'),
                "employee": true
            }              
        } else if(selectedReportType === 'activeEmployees') {
            findCriteria = {
                'employeeProfile.employment.status': 'Active',
                businessIds: Session.get('context'),
                "employee": true
            }
        } else if(selectedReportType === 'inactiveEmployees') {
            findCriteria = {
                'employeeProfile.employment.status': 'Inactive',
                businessIds: Session.get('context'),
                "employee": true
            }
        }
        //--
        tmpl.$('#getResult').text('Preparing... ');
        tmpl.$('#getResult').attr('disabled', true);
        try {
            let l = Ladda.create(tmpl.$('#getReportForPeriodForDisplay')[0]);
            l.start();
        } catch(e) {
        }
        //--
        let resetButton = function() {
            try {
                let l = Ladda.create(tmpl.$('#getResult')[0]);
                l.stop();
                l.remove();
            } catch(e) {
            }

            tmpl.$('#getResult').text(' View');
            tmpl.$('#getResult').removeAttr('disabled');
        };

        Meteor.call('reports/employees', findCriteria, function(err, res) {
            resetButton()
            if(res) {
                tmpl.employeesThatMeetCriteria.set(res)
            } else {
                tmpl.employeesThatMeetCriteria.set([])

                swal('No result found', err.reason, 'error');
            }
        });
  }
});

/*****************************************************************************/
/* EmployeesReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
return moment(date).format('MMYYYY');
});

Template.EmployeesReport.helpers({
  'tenant': function(){
      let tenant = Tenants.findOne();
      return tenant.name;
  },
  'month': function(){
      return Core.months()
  },
  'year': function(){
      return Core.years();
  },
  'employees': () => {
      return Meteor.users.find({"employee": true});
  },
  'locations': () => {
      return EntityObjects.find({
        otype: 'Location',
        businessId: Session.get('context')
      })
  },
  'units': () => {
    return EntityObjects.find({
      otype: 'Unit',
      businessId: Session.get('context')
    })
  },
  'paygrades': () => {
     return PayGrades.find({
       businessId: Session.get('context')
     });
  },
  getNameForUnit: (unit) => {
    let parentsText = ""
    
    if(unit.parentId) {
      let possibleParent = EntityObjects.findOne({_id: unit.parentId})

        if(possibleParent) {
          parentsText = possibleParent.name + " >> " + unit.name
          return parentsText
        } else return unit.name
    } else return unit.name
  },
  isUnitDropDownDisabled: () => {
    const selectedReportType = Template.instance().selectedReportType.get()
    return (selectedReportType === 'unit')
  },
  isPayGradeDropDownDisabled: () => {
    const selectedReportType = Template.instance().selectedReportType.get()    
    return (selectedReportType === 'payGrade')
  },
  'employeesThatMeetCriteria': function() {
      return Template.instance().employeesThatMeetCriteria.get()
  },
  'isLastIndex': function(array, currentIndex) {
      return (currentIndex === (array.length - 1))
  },
  limitText: function(text) {
      if(text && text.length > 10) {
          return `${text.substring(0, 30)} ...`
      }
      return text
  },
  inc: function(num) {
      return num + 1
  }
});

/*****************************************************************************/
/* EmployeesReport: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeesReport.onCreated(function () {
  let self = this;
  // self.subscribe("getPositions", Session.get('context'));
  let businessUnitId = Session.get('context')

  self.selectedReportType = new ReactiveVar()
  self.employeesThatMeetCriteria = new ReactiveVar()

  self.selectedPayGradeIds = new ReactiveVar()
  self.selectedUnitIds = new ReactiveVar()

  self.subscribe("paygrades", businessUnitId)
  self.subscribe('getCostElement', businessUnitId)
  self.subscribe('getPositions', businessUnitId)
  
  // self.subscribe('getLocationEntity', businessUnitId)
});

Template.EmployeesReport.onRendered(function () {
  self.$('select.dropdown').dropdown();

  $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.EmployeesReport.onDestroyed(function () {
});
