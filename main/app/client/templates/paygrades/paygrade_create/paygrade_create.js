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
            positions: $('[name="positionIds"]').val(),
            taxRules: $('[name="taxRules"]').val(),
            pensionRule: $('[name="pensionRule"]').val(),
            status: $('[name="status"]').val()

        };
        if(tmpl.data){//edit action for updating tax
            const pygId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("paygrade/update", pygId, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update Pay Grade ${code}`, "error");
                } else {
                    swal("Successful Update!", `Succesffully update Pay Grade ${code}`, "success");
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
        console.log(assigned);
        //set the assigned dict;
        tmpl.dict.set("assigned", assigned);
    },
    'blur .calc': (e, tmpl) => {
        console.log($(e.target).val());
        let index = $(e.target).closest('tr')[0].rowIndex;
        //set value of assigned index and recalculate computation
        let assigned = tmpl.dict.get('assigned');
        assigned[index-1].value = $(e.target).val();
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
    'fixed': (derivative) => {
        return derivative == "Fixed";
    },
    'positions': () => {
        return EntityObjects.find();
    }

});

/*****************************************************************************/
/* PaygradeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.PaygradeCreate.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();
    if(this.data){
        self.dict.set("assigned", this.data); //set assigned to be data
    } else {
        self.dict.set("assigned", []);
    }
    let rules = new ruleJS('calc');
    rules.init();

    self.autorun(function(){
        //rerun computation if assigned value changes
        let assigned = self.dict.get('assigned');
        let input = $('input[type=text]');
        assigned.forEach((x,index) => {
            let formula = x.value;
            if(formula){
                //replace all wagetypes with values
                for (var i = 0; i < index; i++) {
                    var regex = new RegExp(assigned[i].code, "g");
                    formula = formula.replace(regex, assigned[i].parsedValue);
                }
                var parsed = rules.parse(formula, input);
                console.log(parsed);
                if (parsed.result !== null) {
                    x.parsedValue = parsed.result;
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

    });
    self.subscribe("PayTypes", Session.get('context'));
    self.subscribe("taxes", Session.get('context'));
    self.subscribe("pensions", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));


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
            console.log(assigned);
            self.dict.set('assigned', assigned);
            _super($item, container);
        }
    });
    
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
