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
        console.log(assigned);
        //set the assigned dict;
        tmpl.dict.set("assigned", assigned);
    },
    'blur [name="value"]': (e, tmpl) => {
        console.log("perform calculation from top to down")
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
        assigned.forEach(x => {
            let formula = x.value;
            //var parsed = rules.parse(formula, input);
            //if (parsed.result !== null) {
            //    x.value = parsed.result;
            //}
            //
            //if (parsed.error) {
            //    x.value = parsed.error;
            //
            //}
        });
        self.dict.set('assigned', assigned);

    });
    self.subscribe("PayTypes", Session.get('context'));
    self.subscribe("taxes", Session.get('context'));
    self.subscribe("pensions", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));


});

Template.PaygradeCreate.onRendered(function () {
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
        onDrop: function($item, container, _super) {
            console.log($item);
            console.log(container);
            _super($item, container);
        }
    });



});

Template.PaygradeCreate.onDestroyed(function () {
});
