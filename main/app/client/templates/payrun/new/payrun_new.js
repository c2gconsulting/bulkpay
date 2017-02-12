/*****************************************************************************/
/* Payments: Event Handlers */
/*****************************************************************************/
Template.PayrunNew.events({
    'click #startProcessing': (e,tmpl) => {
        let payGrades = function(){
            let selected = [];
            $("input:checkbox[name=paygrades]:checked").each(function () {
                console.log("each called");
                selected.push($(this).attr("id"));
            });
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
            type: $('[name="runtype"]').val()
        }

        Meteor.call("payrun/process",  params, Session.get('context'), (err, res) => {
            if(res){
                console.log("success", res);
            } else{
                console.log("err", err)
            }
            Blaze.remove(view);
        })
    },
    'change [name="employee"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        selected.length > 0 ? tmpl.showPayGrade.set(false):tmpl.showPayGrade.set(true);
    },
    'click [name="paygrades"]': (e, tmpl) => {

    }
});

/*****************************************************************************/
/* Payments: Helpers */
/*****************************************************************************/
Template.PayrunNew.helpers({
    'month': function(){
        return Core.months()
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear(); x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    'paygrades': () => {
       return PayGrades.find();
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    "showPayGrade": () => {
        return Template.instance().showPayGrade.get();
    }
});

/*****************************************************************************/
/* Payments: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunNew.onCreated(function () {
    let self = this;
    self.subscribe("paygrades", Session.get('context'));
    self.subscribe("activeEmployees", Session.get('context'));
    self.showPayGrade = new ReactiveVar(true);
    //
});

Template.PayrunNew.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.PayrunNew.onDestroyed(function () {
});
