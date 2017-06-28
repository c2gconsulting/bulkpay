/*****************************************************************************/
/* PaygradeCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore'
Template.PaygradeCreate.events({
    'click #PayGradeButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayGradeButton')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            code: $('[name="code"]').val(),
            description: $('[name="description"]').val(),
            positions: Core.returnSelection($('[name="positions"]')),
            payGroups: Core.returnSelection($('[name="paygroups"]')),
            status: $('[name="status"]').val(),
            payTypes: getPaytypes(),
            payTypePositionIds: payTypesPositionOnPayrunExport()
        };

        let currencyCode = $('[name="currencyCode"]').val()
        details['netPayAlternativeCurrency'] = currencyCode

        function getPaytypes(){
            let paytypes =  [];
            let assigned = Template.instance().dict.get('assigned');
            //return relevant fields
            
            assigned.forEach((x, payTypeIndex) => {
                let payment = {};
                payment.paytype = x._id;
                payment.value = x.value;
                payment.displayInPayslip = x.displayInPayslip;

                // let payTypePositionId = $('#paySlipPaytypes > tbody > tr').eq(payTypeIndex).find('td').eq(0).find('input').eq(0).val()
                // let payTypePositionIdAsNum = parseInt(payTypePositionId)

                // if(!isNaN(payTypePositionIdAsNum)) {
                //     payment.paySlipPositionId = payTypePositionIdAsNum
                // } else {
                //     payment.paySlipPositionId = payTypeIndex
                // }
                paytypes.push(payment);
            });
            return paytypes;
        };

        function payTypesPositionOnPayrunExport() {
            let paytypes =  [];
            let payTypesPositionOnPayrunExport = Template.instance().payTypesPositionOnPayrunExport.get()

            payTypesPositionOnPayrunExport.forEach((x, payTypeIndex) => {
                let payment = {};
                payment.paytype = x._id;
                payment.value = x.value;
                payment.displayInPayslip = x.displayInPayslip;

                payment.paySlipPositionId = payTypeIndex

                paytypes.push(payment);
            });
            return paytypes;
        };
        
        if(tmpl.data){//edit action for updating tax
            const pygId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("paygrade/update", pygId, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update Pay Grade ${code}`, "error");
                } else {
                    swal("Success!", `Successfully updated Pay Grade ${code}`, "success");
                    Modal.hide("PaygradeCreate");
                }
            });

        } else{ //New Action for creating paytype}
            Meteor.call('paygrade/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('PaygradeCreate');
                    swal({
                        title: "Success",
                        text: `Pay Grade Created`,
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
                    swal("error", "Please check all components are entired", "error");
                }
            });
        }
    },
    'click .payment': (e, tmpl) => {
        let selected = $(e.target).is(":checked");
        let assigned = tmpl.dict.get("assigned");
        let id = $(e.target).attr('id');
        if(selected){
            //add to assigned components
            let selectedPay = PayTypes.find({_id: id}).fetch()[0];
            assigned.push(selectedPay);
            //assigned.sort();
        } else {
            let index = _.findIndex(assigned, {_id: id});
            assigned.splice(index, 1);
        }
        assigned = _.sortBy(assigned, 'derivative');
        //set the assigned dict;
        tmpl.dict.set("assigned", assigned);
    },
    'click .payslip': (e, tmpl) => {
        let selected = $(e.target).is(":checked");
        let assigned = tmpl.dict.get("assigned");
        let id = $(e.target).attr('id');

        let index = parseInt(id);
        assigned[index].displayInPayslip = selected;
        //set the assigned dict;
        tmpl.dict.set("assigned", assigned);
    },
    'blur .calc': (e, tmpl) => {
        let index = $(e.target).closest('tr')[0].rowIndex;
        //set value of assigned index and recalculate computation
        let assigned = tmpl.dict.get('assigned');
        assigned[index-1].value = $(e.target).val().toUpperCase();
        tmpl.dict.set('assigned', assigned);
    },
    'keypress input': (e, tmpl) => {
        if (e.keyCode == 13) {
            $(e.target).blur();
        }
    }
});

/*****************************************************************************/
/* PaygradeCreate: Helpers */
/*****************************************************************************/
Template.PaygradeCreate.helpers({
    'selected': (context,val) => {
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
    'pensions': () => {
        return Pensions.find({}).fetch();
    },
    'taxrules': () => {
        return Tax.find({}).fetch();
    },
    "paytype": (type) => {
        return PayTypes.find({type: type}).fetch();
    },
    'assigned': () => {
        return Template.instance().dict.get('assigned');
    },
    'payTypesWithPositionOnPayrunExport': () => {
        return Template.instance().payTypesPositionOnPayrunExport.get()
    },
    'fixed': (derivative) => {
        return derivative == "Fixed";
    },
    'positions': () => {
        return EntityObjects.find();
    },
    'paygroup': () => {
        return PayGroups.find();
    },
    selectedObj: function (x) {
        let self = this;
        let selected;
        let prop = Template.instance().data[x];
        selected = _.find(prop, function(r) {
            return r ===  self._id;
        });
        if (selected){
            return "selected"
        }
    },
    selectedNetPayAlternateCurrency: function(currency) {
        if(Template.instance().data) {
            if(Template.instance().data.netPayAlternativeCurrency) {
                if(currency === Template.instance().data.netPayAlternativeCurrency) {
                    return "selected"
                }
            }
        }
    },
    'checked': (id) => {
        if(Template.instance().data){
           let index =  _.findLastIndex(Template.instance().data.payTypes, {paytype: id});
            return index !== -1? true:false;
        }

        return false;
    },
    'displayInSlip': (id) => {
        if(Template.instance().data){
           let index =  _.findLastIndex(Template.instance().data.payTypes, {paytype: id});
            if(index !== -1)
                return Template.instance().data.payTypes[index].displayInPayslip;
        }

        //return false;
    },
    'action': () => {
        data = Template.instance().data;
        if(data){
            return `PAYGRADE - ${data.code} (${data.description})`
        } else {
            return 'New Pay Grade'
        }
    },
    'allCurrencies': () => {
        return Core.currencies();
    }
});

/*****************************************************************************/
/* PaygradeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.PaygradeCreate.onCreated(function () {
    let self = this;
    let context = Session.get('context');
    self.dict = new ReactiveDict();
    self.payTypesPositionOnPayrunExport = new ReactiveVar()
    self.payTypesPositionOnPayrunExport.set([])

    self.subscribe("PayTypes", context);
    self.subscribe("taxes", context);
    self.subscribe("pensions", context);
    self.subscribe("getPositions", context);
    self.subscribe("payGroups", context);
    self.subscribe("getbuconstants", context);
    self.subscribe("paygrades", context);

    let selectedPayGradeIdForEdit = Session.get('selectedPayGradeForEdit')
    self.currentPayGrade = new ReactiveVar()

    if(self.data) {
        //populate and map paytypes
        self.autorun(function(){
            if (Template.instance().subscriptionsReady()){
                self.data.payTypes.forEach(x=>{
                    //extend all assigned paytypes with reference doc. properties
                    let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
                    delete ptype.paytype;
                    _.extend(x, ptype);
                    return x;
                });
                self.dict.set("assigned", self.data.payTypes); //set assigned to be data
                // console.log(self.data.payTypes);
                //--
                if(selectedPayGradeIdForEdit) {
                    let currentPayGrade = PayGrades.findOne(selectedPayGradeIdForEdit)
                    self.currentPayGrade.set(currentPayGrade);

                    if(currentPayGrade) {
                        if(currentPayGrade.payTypePositionIds && currentPayGrade.payTypePositionIds.length > 0) {
                            currentPayGrade.payTypePositionIds.forEach(x=>{
                                let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
                                if(ptype) {
                                    delete ptype.paytype;
                                    _.extend(x, ptype);
                                }
                            });
                            self.payTypesPositionOnPayrunExport.set(currentPayGrade.payTypePositionIds)
                        } else {
                            self.payTypesPositionOnPayrunExport.set(self.data.payTypes)
                        }
                    }
                }
            }
        });
    } else {
        self.dict.set("assigned", []);
    }
    let rules = new ruleJS('calc');
    rules.init();


    self.autorun(function(){
        //rerun computation if assigned value changes
        let assigned = self.dict.get('assigned');
        let input = $('input[type=text]');
        if(assigned){
            assigned.forEach((x,index) => {
                let formula = x.value;
                if(formula){
                    //replace all wagetypes with values
                    for (var i = 0; i < index; i++) {
                        const code = assigned[i].code? assigned[i].code.toUpperCase():assigned[i].code;
                        const regex = getPayRegex(code);
                        formula = formula.replace(regex, assigned[i].parsedValue);
                    }
                    //do the same for all contansts and replace the values
                    //will find a better way of doing this... NOTE
                    let k = Constants.find().fetch();
                    k.forEach(c => {
                        const code = c.code? c.code.toUpperCase():c.code;
                        const regex = getPayRegex(code);
                        formula = formula.replace(regex, c.value);
                    });
                    var parsed = rules.parse(formula, input);
                    if (parsed.result !== null) {
                        x.parsedValue = parsed.result.toFixed(2);  //defaulting to 2 dp ... Make configurable;
                        x.monthly = (parsed.result / 12).toFixed(2);
                    }
                    //
                    if (parsed.error) {
                        x.parsedValue = parsed.error;
                        x.monthly = ""
                    }
                } else {
                    x.parsedValue = "";
                    x.monthly = "";
                }
            });
            self.dict.set('assigned', assigned);
        }
    });
});

Template.PaygradeCreate.onRendered(function () {
    var self = this;
    var oldIndex, newIndex;
    
    // fix a little rendering bug by clicking on step 1
    $('#step1').click();

    $('#progress-wizard-new').bootstrapWizard({
        onTabShow: function (tab, navigation, index) {
            tab.prevAll().addClass('done');
            tab.nextAll().removeClass('done');
            tab.removeClass('done');

            var $total = navigation.find('li').length;
            var $current = index + 1;

            if ($current >= $total) {
                $('#progress-wizard-new').find('.wizard .next').addClass('hide');
                $('#progress-wizard-new').find('.wizard .finish').removeClass('hide');
            } else {
                $('#progress-wizard-new').find('.wizard .next').removeClass('hide');
                $('#progress-wizard-new').find('.wizard .finish').addClass('hide');
            }

            var $percent = ($current / $total) * 100;
            $('#progress-wizard-new').find('.progress-bar').css('width', $percent + '%');
        },
        onTabClick: function (tab, navigation, index) {
            return true;
        }
    });
    //initialize rule table
    $('#derivativeTable').sortable({
        containerSelector: 'table',
        itemPath: '> tbody',
        itemSelector: 'tr',
        placeholder: '<tr class="placeholder"/>',
        onDragStart: function ($item, container, _super) {
            oldIndex = $item.index();
            //$item.appendTo($item.parent());
            _super($item, container);
        },
        onDrop: function($item, container, _super) {
            newIndex = $item.index() ;//.attr('id'));
            //get assigned
            let assigned = self.dict.get('assigned');
            assigned.move(oldIndex, newIndex);
            self.dict.set('assigned', assigned);
            //--
            _super($item, container);
        }
    });

    //--Make paytypes in payslip sortable
    $('#paySlipPaytypes').sortable({
        containerSelector: 'table',
        itemPath: '> tbody',
        itemSelector: 'tr',
        placeholder: '<tr class="placeholder"/>',
        onDragStart: function ($item, container, _super) {
            oldIndex = $item.index();
            //$item.appendTo($item.parent());
            _super($item, container);
        },
        onDrop: function($item, container, _super) {
            newIndex = $item.index() ;
            //--
            let payTypesPositionOnPayrunExport = self.payTypesPositionOnPayrunExport.get()
            let aPaytype = payTypesPositionOnPayrunExport[oldIndex]
            aPaytype.paySlipPositionIndex = newIndex
            payTypesPositionOnPayrunExport.move(oldIndex, newIndex);

            self.payTypesPositionOnPayrunExport.set(payTypesPositionOnPayrunExport)
            //--
            _super($item, container);
        }
    });

    $('select.dropdown').dropdown();
});

Template.PaygradeCreate.onDestroyed(function () {

});
Array.prototype.move = function (old_index, new_index) {
    while (old_index < 0) {
        old_index += this.length;
    }
    while (new_index < 0) {
        new_index += this.length;
    }
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};
