/*****************************************************************************/
/* StaffCategoryCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda'
Template.StaffCategoryCreate.events({
    'click #new-hotel-close': (e, tmpl) => {
      Modal.hide('StaffCategoryCreate');
    },
    'click #deleteStaffCategory': function(e, tmpl) {
        event.preventDefault();
        let self = this;

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Staff Category",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            const staffcategoryId = self._id;
            const code = self.code;

            Meteor.call('staffCategory/delete', staffcategoryId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Staff Category: ${code} has been deleted.`, "success");
                }
            });
        });
    },
    'click #save': (e, tmpl) => {
      let mealDailyRate = parseFloat($('[name=mealDailyRate]').val());
      let hotelDailyRate = parseFloat($('[name=hotelDailyRate]').val());
      let name = $('[name=name]').val();
      let perdiem = parseFloat($('[name=perdiem]').val());
      let isInternational = $('#isInternational').is(':checked');
      let groundTransport = parseFloat($('[name=groundTransport]').val());
      let airportPickupDropOffCost = parseFloat($('[name=airportPickupDropOffCost]').val());
      // let notificationEmail = $('[name=notificationEmail]').val();
      let currency = $('[name=currency]').val();
      let categoryType = $('[name=categoryType]').val();
      console.log('currency:' + currency);
  
        Template.instance().errorMessage.set(null);
  
        let newStaffCategory = {
          businessId: Session.get('context'),
          hotelDailyRate : hotelDailyRate,
          mealDailyRate : mealDailyRate,
          name : name,
          perdiem : perdiem,
          currency : currency,
          category: categoryType || "Executive Management",
          isInternational: isInternational,
          groundTransport: groundTransport,
          airportPickupDropOffCost: airportPickupDropOffCost,
          currency : currency
        };
        

        let staffCategoryContext = Core.Schemas.StaffCategory.namedContext("staffCategoryForm");
        staffCategoryContext.validate(newStaffCategory);
        if (staffCategoryContext.isValid()) {
            console.log('Staff Category is Valid!');
        } else {
            console.log('Staff Category is not Valid!');
        }
        console.log(staffCategoryContext._invalidKeys);
  
        e.preventDefault();
        let l = Ladda.create(tmpl.$('#save')[0]);
        l.start();

        Meteor.call('staffCategory/create', newStaffCategory, (err, res) => {
          l.stop();
            if (res){
                swal({
                    title: "Success",
                    text: `New Staff Category added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('StaffCategoryCreate');
            } else {
                console.log(err);
                swal("Save Failed", "Unable to Save Staff Category", "error");
            }
        });
      
    },
    'click #update': (e, tmpl) => {
      let mealDailyRate = parseFloat($('[name=mealDailyRate]').val());
      let hotelDailyRate = parseFloat($('[name=hotelDailyRate]').val());
      let name = $('[name=name]').val();
      let perdiem = parseFloat($('[name=perdiem]').val());
      let isInternational = $('#isInternational').is(':checked');
      let groundTransport = parseFloat($('[name=groundTransport]').val());
      let airportPickupDropOffCost = parseFloat($('[name=airportPickupDropOffCost]').val());
      // let notificationEmail = $('[name=notificationEmail]').val();
      let currency = $('[name=currency]').val();
      let categoryType = $('[name=categoryType]').val();
      console.log('currency:' + currency);
  
        Template.instance().errorMessage.set(null);
  
        Template.instance().errorMessage.set(null);
  
        let updatedStaffCategory = {
          businessId: Session.get('context'),
          hotelDailyRate : hotelDailyRate,
          mealDailyRate : mealDailyRate,
          name : name,
          perdiem : perdiem,
          currency : currency,
          category: categoryType || "Executive Management",
          isInternational: isInternational,
          groundTransport: groundTransport,
          airportPickupDropOffCost: airportPickupDropOffCost,
          currency : currency
        };
        
        e.preventDefault();
        let l = Ladda.create(tmpl.$('#update')[0]);
        l.start();

        let staffCategoryContext = Core.Schemas.StaffCategory.namedContext("staffCategoryForm");
        staffCategoryContext.validate(updatedStaffCategory);
        if (staffCategoryContext.isValid()) {
            console.log('Staff Category is Valid!');
        } else {
            console.log('Staff Category is not Valid!');
        }
        console.log(staffCategoryContext._invalidKeys);
  
        Meteor.call('staffCategory/update', tmpl.data._id, updatedStaffCategory, (err, res) => {
          l.stop();
            if (res){
              swal({
                title: "Success",
                text: `Staff Category Updated`,
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
            Modal.hide('StaffCategoryCreate');
            } else {
              console.log(err);
                swal("Update Failed", "Cannot Update Staff Category", "error");
            }
        });
      
    }
  });
  
  /*****************************************************************************/
  /* StaffCategoryCreate: Helpers */
  /*****************************************************************************/
  Template.StaffCategoryCreate.helpers({
    travelcityList() {
        return  Travelcities.find();
    },
    staffCategories() {
      return Core.StaffCategories
    },
    categoryType() {
      return "category"
    },
   'edit': () => {
    return Template.instance().data ? true:false;
    //use ReactiveVar or reactivedict instead of sessions..
    },
    'hotel': () => {
        return Template.instance().data.name;
    },
    'checked': (prop) => {
      if(Template.instance().data)
          return Template.instance().data[prop];
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
  /* StaffCategoryCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.StaffCategoryCreate.onCreated(function () {
    let self = this;
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
    self.subscribe("travelcities", Session.get('context'));
  });
  
  Template.StaffCategoryCreate.onRendered(function () {
  });
  
  Template.StaffCategoryCreate.onDestroyed(function () {
  });
  