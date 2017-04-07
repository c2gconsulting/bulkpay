/*****************************************************************************/
/* PayrunNew: Event Handlers */
/*****************************************************************************/
Template.PayrunNew.events({
    'click #startProcessing': (e,tmpl) => {
        let payGrades = function(){
            let selected = [];
            $("input:checkbox[name=paygrades]:checked").each(function () {
                selected.push($(this).attr("id"));
            });
            return selected;
        };
        let annualPay = function(){
            let selected = [];
            $("input:checkbox[name=selectAnnual]:checked").each(function () {
                selected.push($(this).attr("id"));
            });
            console.log(selected);
            return selected;
        };
        var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        const params = {
            employees: Core.returnSelection($('[name="employee"]')),
            paygrades: payGrades(),
            period: {
                month: $('[name="paymentPeriod.month"]').val(),
                year: $('[name="paymentPeriod.year"]').val(),

            },
            type: $('input[name=runtype]:checked').val(),
            annuals: annualPay()
        };
        //check if any valid selection is made
        if (params.employees.length > 0 || params.paygrades.length > 0){
            Meteor.call("payrun/process",  params, Session.get('context'), (err, res) => {
                if(res){
                    console.log(JSON.stringify(res));
                    //set result as reactive dict payResult
                    tmpl.dict.set("payResult", res);
                } else{
                    console.log(err);
                }
                Blaze.remove(view);
            })
        } else {
            Blaze.remove(view);
            swal("notice","A valid selection must be made", "error");
        }


    },
    'change [name="annualPay"]': (e, tmpl) => {
        tmpl.includePay.set($(e.target).is(':checked'));

    },
    'change [name="employee"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        selected.length > 0 ? tmpl.showPayGrade.set(false):tmpl.showPayGrade.set(true);
        //add employee paygrades
        let employeeGrade = selected.map(x => {
            return Meteor.users.findOne({_id: x, 'employee': true}).employeeProfile.employment.paygrade;
        });
        tmpl.grades.set(employeeGrade);
    },
    'change [name="paygrades"]': (e, tmpl) => {
        let selected = [];
        $("input:checkbox[name=paygrades]:checked").each(function () {
            selected.push($(this).attr("id"));
        });
        tmpl.grades.set(selected);
    },
    'hover .table tbody tr': (e,tmpl) => {
        console.log('hover called');
    }
});

/*****************************************************************************/
/* PayrunNew: Helpers */
/*****************************************************************************/
Template.PayrunNew.helpers({
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'paygrades': () => {
       return PayGrades.find();
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    "showPayGrade": () => {
        return Template.instance().showPayGrade.get();
    },
    "showAnnualPay": () => {
        return Template.instance().includePay.get();
    },
    'annualPay': () => {
        return PayTypes.find().fetch();
    },
    'checkInitial': (index) => {
        return index === 0 ? 'checked': null;
    },
    'nopayresult': () =>{
        const payresult = Template.instance().dict.get('payResult');
        if (!payresult) return true;
        return false;
    },
    'employeeResult': () => {
        const payResult = Template.instance().dict.get('payResult');
        if (payResult) {
            return payResult.payObj.result;
        }
    },
    'processingError': () => {
        const payresult = Template.instance().dict.get('payResult');
        return payresult.payObj.error.length;
    }
});

/*****************************************************************************/
/* Payments: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunNew.onCreated(function () {
    let self = this;
    self.subscribe("paygrades", Session.get('context'));
    self.subscribe("activeEmployees", Session.get('context'));
    self.dict = new ReactiveDict();
    self.showPayGrade = new ReactiveVar(true);
    self.grades = new ReactiveVar([]);
    self.includePay = new ReactiveVar(false);
    // if annual payment included, subscribe to all annual pay.
    self.autorun(function(){
        let includeType = self.includePay.get();
        let selectedGrade = self.grades.get();
        if (includeType)
            self.subscribe("AdditionalPayTypes", selectedGrade, Session.get('context'));
    })
});

Template.PayrunNew.onRendered(function () {
     $('select.dropdown').dropdown();
    // //
    // let selected = [];
    // $("input:checkbox[name=paygrades]:checked").each(function () {
    //     selected.push($(this).attr("id"));
    // });
    // Template.instance().grades.set(selected);
    // Show aciton upon row hover
});

Template.PayrunNew.onDestroyed(function () {
});
