/*****************************************************************************/
/* ApprovalConfigCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda'
Template.ApprovalConfigCreate.events({
  'click #new-hotel-close': (e, tmpl) => {
    Modal.hide('ApprovalConfigCreate');
  },
  'click #deleteApproval': function(e, tmpl) {
    event.preventDefault();
    let self = this;

    swal({
      title: "Are you sure?",
      text: "You will not be able to recover this Approval Config",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    }, () => {
      const aprovalId = self._id;
      const code = self.name;

      Meteor.call('approvalConfig/delete', aprovalId, (err, res) => {
        if(!err){
          Modal.hide();
          swal("Deleted!", `Approval Config: ${code} has been deleted.`, "success");
        }
      });
    });
  },
  "blur [id*='approvalLabel']": function(e, tmpl){
    e.preventDefault()

    let approvalConfig = tmpl.approvalConfig.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1));

    approvalConfig.approvals[index].approvalLabel = $(e.currentTarget).html();
    tmpl.approvalConfig.set(approvalConfig);
  },
  "blur [id*='alternativeApprovalLabel']": function(e, tmpl){
    e.preventDefault()

    let approvalConfig = tmpl.approvalConfig.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1));

    approvalConfig.approvals[index].approvalLabelAlternative = $(e.currentTarget).html();
    tmpl.approvalConfig.set(approvalConfig);
  },
  "change [id*='approvalUserId']": function(e, tmpl){
    e.preventDefault()

    let approvalConfig = tmpl.approvalConfig.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1));

    approvalConfig.approvals[index].approvalUserId = $(e.currentTarget).val();
    console.log('approvalConfig', approvalConfig)
    tmpl.approvalConfig.set(approvalConfig);
  },
  "change [id*='approvalAlternativeUserId']": function(e, tmpl){
    e.preventDefault()

    let approvalConfig = tmpl.approvalConfig.curValue;
    const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1));

    approvalConfig.approvals[index].approvalAlternativeUserId = $(e.currentTarget).val();
    tmpl.approvalConfig.set(approvalConfig);
  },
  "change [name='numberOfApprovals']": function (e, tmpl) {
    const approvalConfig = tmpl.approvalConfig.get();
    const numberOfApprovals = parseInt($(e.currentTarget).val());
    /************* Determine previous number of approvals  ******************/
    const prevNoOfApprovals = approvalConfig.approvals.length;
    /************* Filter labels and approval levels  ******************/
    if (prevNoOfApprovals > numberOfApprovals) {
      for (let i = 0; i < prevNoOfApprovals; i++) {
        const currentNoOfApprovals = i + 1;
        if (currentNoOfApprovals > numberOfApprovals) {
          approvalConfig.approvals.splice(i, 1);
        }
      }
    } else {
      for (let i = prevNoOfApprovals; i < numberOfApprovals; i++) {
        const currentNoOfApprovals = prevNoOfApprovals + 1;
        approvalConfig.approvals.push(singleApproval(currentNoOfApprovals));
      }
    }

    tmpl.approvalConfig.set({
      ...approvalConfig,
      numberOfApprovals
    })
  },
  'click #save': (e, tmpl) => {
    let approvalConfig = tmpl.approvalConfig.get();
    let isInternational = $('#isInternational').is(':checked');
    let transportationMode = $('[name=transportationMode]').val();
    let level = $('[name=level]').val();
    const name = $("#approval-name").val()
    approvalConfig = {
      ...approvalConfig,
      isInternational,
      createdAt: new Date(),
      name,
      transportationMode,
      level
    }
    console.log('approvalConfig', approvalConfig)

    Template.instance().errorMessage.set(null);

    let approvalConfigContext = Core.Schemas.ApprovalsConfigs.namedContext("approvalConfigForm");
    approvalConfigContext.validate(approvalConfig);
    if (approvalConfigContext.isValid()) {
      console.log('Approval Config is Valid!');
    } else {
      console.log('Approval Config is not Valid!');
    }
    console.log(approvalConfigContext._invalidKeys);

    e.preventDefault();
    let l = Ladda.create(tmpl.$('#save')[0]);
    l.start();

    Meteor.call('approvalConfig/create', approvalConfig, (err, res) => {
      l.stop();
      if (res){
        swal({
          title: "Success",
          text: `New Approval added`,
          confirmButtonClass: "btn-success",
          type: "success",
          confirmButtonText: "OK"
        });
        Modal.hide('ApprovalConfigCreate');
      } else {
        console.log(err);
        swal("Save Failed", "Unable to Save Approval", "error");
      }
    });
  },
  'click #update': (e, tmpl) => {
    let approvalConfig = tmpl.approvalConfig.get();
    let isInternational = $('#isInternational').is(':checked');
    let transportationMode = $('[name=transportationMode]').val();
    let level = $('[name=level]').val();
    approvalConfig = {
      ...approvalConfig,
      isInternational,
      transportationMode,
      level
    }
    console.log('approvalConfig:' + approvalConfig);

    Template.instance().errorMessage.set(null);

    e.preventDefault();
    let l = Ladda.create(tmpl.$('#update')[0]);
    l.start();

    let approvalConfigContext = Core.Schemas.ApprovalsConfigs.namedContext("approvalConfigForm");
    approvalConfigContext.validate(approvalConfig);
    if (approvalConfigContext.isValid()) {
      console.log('Approval Config is Valid!');
    } else {
      console.log('Approval Config is not Valid!');
    }
    console.log(approvalConfigContext._invalidKeys);

    Meteor.call('approvalConfig/update', tmpl.data._id, approvalConfig, (err, res) => {
      l.stop();
        if (res){
          swal({
            title: "Success",
            text: `Approval Config Updated`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });
          Modal.hide('ApprovalConfigCreate');
        } else {
          console.log(err);
          swal("Update Failed", "Cannot Update Approval Config", "error");
        }
    });
  }
});

/*****************************************************************************/
/* ApprovalConfigCreate: Helpers */
/*****************************************************************************/
Template.ApprovalConfigCreate.helpers({
  travelcityList() {
    return  Travelcities.find();
  },
  'employees': () => {
    return Meteor.users.find({employee: true});
  },
  'edit': () => {
  return Template.instance().data ? true:false;
  //use ReactiveVar or reactivedict instead of sessions..
  },
  'hotel': () => {
    return Template.instance().data.name;
  },
  approvalConfig(){
    return Template.instance().approvalConfig.get();
  },
  approvalUserIdSelected(val, index){
    const approvalConfig = Template.instance().approvalConfig.get();
    const currentIndex = index + 1;
    if(approvalConfig && val && currentIndex){
      if(approvalConfig.approvals[parseInt(index)].approvalUserId === val){
        console.log('#approvalUserId_' + index)
        // $('#approvalUserId_' + index).dropdown('set selected', approvalConfig.approvals[parseInt(index)].approvalUserId);
        $('#approvalUserId_' + index).dropdown('set selected', val);
        return true
      }
    }
  },
  approvalAlternativeUserIdSelected(val, index){
    const approvalConfig = Template.instance().approvalConfig.get();
    const currentIndex = index + 1; 
    if(approvalConfig && val && currentIndex){
      if(approvalConfig.approvals[parseInt(index)].approvalAlternativeUserId === val){
        console.log('#approvalAlternativeUserId_' + index)
        // $('#approvalAlternativeUserId_' + index).dropdown('set selected', approvalConfig.approvals[parseInt(index)].approvalAlternativeUserId);
        $('#approvalAlternativeUserId_' + index).dropdown('set selected', val);
        return true
      }
    }
  },
  'checked': (prop) => {
    const approvalConfig = Template.instance().approvalConfig.get();
    if(approvalConfig) return approvalConfig[prop];
    return false;
  },
  selected(context,val) {
    let self = this;

    if(Template.instance().data){
      //get value of the option element
      //check and return selected if the template instce of data.context == self._id matches
      if(val){
          return Template.instance().data[context] === val ? selected="selected" : '';
      }
      return Template.instance().data[context] === self._id ? selected="selected" : '';
    }
  },
  'errorMessage': function() {
    return Template.instance().errorMessage.get()
  }
});

  /*****************************************************************************/
  /* ApprovalConfigCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.ApprovalConfigCreate.onCreated(function () {
    let self = this;
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
    self.approvalConfig = new ReactiveVar();
    self.employees = new ReactiveVar();
    if (Template.instance().data) {
      self.approvalConfig.set({
        ...Template.instance().data,
      });
    } else {
      self.approvalConfig.set({
        createdBy: Meteor.user()._id,
        businessId: Session.get('context'),
        numberOfApprovals : 1,
        name : '',
        level: 'Level 1',
        transportationMode: 'AIR',
        isInternational: false,
        approvals : [{
          approvalUserId: '',
          approvalAlternativeUserId: '',
          approvalLabel: `Step 1 Approval`,
          approvalLabelAlternative: `Step 1 Alternative Approval`
        }]
      });
    }
    self.subscribe("travelcities", Session.get('context'));
  });
  
  Template.ApprovalConfigCreate.onRendered(function () {
  });
  
  Template.ApprovalConfigCreate.onDestroyed(function () {
  });
  
const singleApproval = function(label) {
  if (!label) {
    throw Error('Label not provided')
  }

  return {
    approvalUserId: '',
    approvalAlternativeUserId: '',
    approvalLabel: `Step ${label} Approval`,
    approvalLabelAlternative: `Step ${label} Alternative Approval`
  }
}
