/*****************************************************************************/
/* SupplementaryLeaveCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore';

Template.SupplementaryLeaveCreate.events({
    'click #TaxButton': (e, tmpl) => {
        event.preventDefault();
        let newTaxRuleCode = $('[name="code"]').val();
        let newTaxRuleName = $('[name="name"]').val();

        if(!newTaxRuleCode || newTaxRuleCode.trim().length < 1) {
            swal("Validation error", `Please enter a valid code`, "error");
            return;
        } else if(!newTaxRuleName || newTaxRuleName.trim().length < 1) {
            swal("Validation error", `Please enter a valid name`, "error");
            return;
        }
        let businessId = Session.get('context')
        //--
        let l = Ladda.create(tmpl.$('#TaxButton')[0]);
        l.start();
        let details = null;
        
        if(tmpl.isUsingEffectiveTaxRate.get()) {
            let effectiveTaxRate = $('#effectiveTaxRate').val()
            let effectiveTaxRateAsNumber = parseFloat(effectiveTaxRate)

            details = {
                businessId: businessId,
                code: $('[name="code"]').val(),
                name: $('[name="name"]').val(),
                isUsingEffectiveTaxRate : true,
                effectiveTaxRate: !isNaN(effectiveTaxRateAsNumber) ? effectiveTaxRateAsNumber : 0,
                employees: Core.returnSelection($('[name="employee"]')),
            };
        } else {
            details = {
                businessId: businessId,
                code: $('[name="code"]').val(),
                name: $('[name="name"]').val(),
                isUsingEffectiveTaxRate : false,
                grossIncomeRelief: parseInt($('[name="grossIncomeRelief"]').val()) || 20,
                consolidatedRelief: parseInt($('[name="consolidatedRelief"]').val()) || 200000,
                bucket: $('[name="bucket"]').val(),
                status: $('[name="status"]').val(),
                rules:  tmpl.dict.get("taxRules")
            };

            let grossIncomeBucket = $('[name="grossIncomeBucket"]').val()
            if(grossIncomeBucket && grossIncomeBucket.length > 0) {
                details.grossIncomeBucket = grossIncomeBucket
            }
        }
        //--

        if(tmpl.data){//edit action for updating tax
            const tId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("tax/update", tId, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update tax ${code}`, "error");
                } else {
                    swal("Successful Update!", `Tax ${code} was updated successfully`, "success");
                    Modal.hide("TaxCreate");
                }
            });
        } else{ //New Action for creating paytype}
            Meteor.call('tax/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('TaxCreate');
                    swal({
                        title: "Success",
                        text: `Tax Created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    err = JSON.parse(err.details);
                    // add necessary handler on error
                    //use details from schema.key to locate html tag and error handler
                    _.each(err, (obj) => {
                        $('[name=' + obj.name +']').addClass('errorValidation');
                        $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);
                    })
                }
            });
        }
    },
    'change #useEffectiveTaxRate': (e, tmpl) => {
        Template.instance().isUsingEffectiveTaxRate.set(e.currentTarget.checked)
    },
    'click #deleteTax': (e, tmpl) => {
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Tax",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            //call backend method to delete the tax
            const ptId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call('tax/delete', ptId, (err, res) => {
                if(!err){
                    swal("Deleted!", `tax ${code} has been deleted.`, "success");
                    Modal.hide("TaxCreate");
                }
            });

        });
    },
    'click #add-rule-button': (e,tmpl) => {
        e.preventDefault();
        console.log("clicked me will probably add a tr to the end of the table");
        //Modal.show("AddRule");

        let rules = tmpl.dict.get("taxRules");
        let newRuleToAdd = {
          upperLimit : 0,
          rate : 0
        };
        if(rules.length == 0) {
          newRuleToAdd.range = "First";
          rules.push(newRuleToAdd);
          Template.instance().indexOfSelectedTaxRuleForEdit.set(0);
        } else if(rules.length === 1) {
          newRuleToAdd.range = "Over";
          rules.push(newRuleToAdd);
          Template.instance().indexOfSelectedTaxRuleForEdit.set(1);
        } else if(rules.length >= 2) {
          let lastTaxRule = rules[rules.length - 1];
          lastTaxRule.range = "Next";

          newRuleToAdd.range = "Over";
          rules.push(newRuleToAdd);
          Template.instance().indexOfSelectedTaxRuleForEdit.set(rules.length - 1);
        }
        tmpl.dict.set("taxRules", rules);

        Template.instance().isATaxRuleSelectedForEdit.set(true);
    },
    'click .deletetr': (e,tmpl) => {
        e.preventDefault();
        const rowIndex = e.target.closest('tr').rowIndex - 1;
        //get dict taxRule and delete the index
        let rules = tmpl.dict.get("taxRules");
        // remove the rowIndex from the array element
        if(rules[rowIndex] !== undefined){
            rules.splice(rowIndex,1);
            rules.forEach((aRule, index) => {
              if(index === 0) {
                aRule.range = "First";
              } else {
                aRule.range = "Next";
                if(index === rules.length - 1) {
                  aRule.range = "Over";
                }
              }
              //rules[index] = aRule;
            })
        }
        tmpl.dict.set("taxRules", rules);
        e.stopPropagation();    // To prevent 'click .aTaxRuleItem' from being called
    },
    'click .aTaxRuleItem': (e, tmpl) => {
      console.log("a tax rule was clicked");
      let taxRuleRowElement = e.currentTarget;

      let taxRuleRowName = taxRuleRowElement.getAttribute("name");
      let taxRuleRowNameParts = taxRuleRowName.split("_");
      let taxRuleIndex = taxRuleRowNameParts[1];
      console.log("taxRuleIndex: " + taxRuleIndex);
      taxRuleIndex = parseInt(taxRuleIndex);
      Template.instance().indexOfSelectedTaxRuleForEdit.set(taxRuleIndex);

      Template.instance().isATaxRuleSelectedForEdit.set(true);
    },
    'click #confirmTaxRuleEdit': (e, tmpl) => {
      const rowElement = e.currentTarget.closest('tr');
      let jqueryRowElement = $(rowElement);
      let rowUpperLimit = jqueryRowElement.find('td [name="taxRuleToEditUpperLimit"]');
      let rowUpperLimitVal = rowUpperLimit.val();
      console.log("Row upperlimit val: " + rowUpperLimitVal);

      let rowRate = jqueryRowElement.find('td [name="taxRuleToEditRate"]');
      let rowRateVal = rowRate.val();
      console.log("Row rate val: " + rowRateVal);

      e.stopPropagation();    // To prevent 'click .aTaxRuleItem' from being called
      //--
      const rowIndex = rowElement.rowIndex - 1;

      let rules = tmpl.dict.get("taxRules");
      // remove the rowIndex from the array element
      if(rules[rowIndex] !== undefined){
        let rule = rules[rowIndex];
        rule.upperLimit = rowUpperLimitVal;
        rule.rate = rowRateVal;
        //rules[rowIndex] = rule;
        tmpl.dict.set("taxRules", rules);
      }

      Template.instance().indexOfSelectedTaxRuleForEdit.set(null);
      Template.instance().isATaxRuleSelectedForEdit.set(false);
    },
    'click #cancelTaxRuleEdit': (e, tmpl) => {
      e.preventDefault();
      e.stopPropagation();    // To prevent 'click .aTaxRuleItem' from being called

      Template.instance().indexOfSelectedTaxRuleForEdit.set(null);
      Template.instance().isATaxRuleSelectedForEdit.set(false);
    }
});

/*****************************************************************************/
/* SupplementaryLeaveCreate: Helpers */
/*****************************************************************************/
Template.registerHelper('equals',(a,b)=>{
  return a == b;
});

Template.SupplementaryLeaveCreate.helpers({
    selected(context, val) {
        if(Template.instance().data){
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    },
    isSelected(context, val) {
        if(Template.instance().data){
            return Template.instance().data[context] === val ? true : false;
        }
    },
    selectedObj: function (x) {
        if(Template.instance().data){
            let self = this;
            let selected;
            let prop = Template.instance().data[x];
            selected = _.find(prop, function(r) {
                return r ===  self._id;
            });
            if (selected){
                return "selected"
            }
        }
    },
    'modalHeaderTitle': function() {
      return Template.instance().data.modalHeaderTitle || "New Tax Rule";
    },
    ranges(){
        //var ranges = ['FIRST', 'NEXT', 'OVER'];
        //if ($scope.singleTax) {
        //    if (_.find($scope.singleTax.rules, function (rule) { return rule.range === 'FIRST' })) {
        //        ranges.splice(ranges.indexOf('FIRST'), 1);
        //    }
        //    if (_.find($scope.singleTax.rules, function (rule) { return rule.range === 'OVER' })) {
        //        ranges.splice(ranges.indexOf('OVER'), 1);
        //    }
        //}
        //$scope.ranges = ranges;
    },
    rule() {
        //get default rule for new tax
        return Template.instance().dict.get("taxRules") || [];
    },
    isTaxRuleSelected : function() {
      console.log("isTaxRuleSelected called: " + Template.instance().isATaxRuleSelectedForEdit.get());

      return Template.instance().isATaxRuleSelectedForEdit.get();
    },
    indexOfSelectedTaxRule : function() {
      return Template.instance().indexOfSelectedTaxRuleForEdit.get();
    },
    edit() {
        return Template.instance().data ? true : false
    },
    isUsingEffectiveTaxRate: function() {
        return Template.instance().isUsingEffectiveTaxRate.get()
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    "paytype": () => {
        return Template.instance().paytypes.get()
    }
});

/*****************************************************************************/
/* SupplementaryLeaveCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.SupplementaryLeaveCreate.onCreated(function () {
    let self = this
    let businessUnitId = Session.get('context');

    self.subscribe("PayTypes", businessUnitId);
    self.subscribe("allEmployees", businessUnitId);
    //--
    self.paytypes = new ReactiveVar()

    this.dict = new ReactiveDict();

    this.isUsingEffectiveTaxRate = new ReactiveVar()
    this.isUsingEffectiveTaxRate.set(false)

    this.isATaxRuleSelectedForEdit = new ReactiveVar();
    this.isATaxRuleSelectedForEdit.set(false);

    this.indexOfSelectedTaxRuleForEdit = new ReactiveVar();
    this.indexOfSelectedTaxRuleForEdit.set(null);
    //--
    this.currentIndexOfDraggedTaxRule = new ReactiveVar();
    this.currentIndexOfDraggedTaxRule.set(null);
    //--
    if(self.data){
        if(self.data.isUsingEffectiveTaxRate) {
            self.isUsingEffectiveTaxRate.set(this.data.isUsingEffectiveTaxRate)
        } else {
            if(self.data.rules) {
                self.dict.set("taxRules", this.data.rules);
            } else {
                self.dict.set("taxRules", DefaultRule);
            }
        }
    } else {
        self.dict.set("taxRules", DefaultRule);
    }

    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            self.paytypes.set(PayTypes.find({'status': 'Active'}).fetch())
        }
    })
});

Template.SupplementaryLeaveCreate.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();
});

Template.SupplementaryLeaveCreate.onDestroyed(function () {
});
