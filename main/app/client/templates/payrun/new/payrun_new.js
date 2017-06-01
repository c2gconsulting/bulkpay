/*****************************************************************************/
/* PayrunNew: Event Handlers */
/*****************************************************************************/

let ReportUtils = {}

ReportUtils.getPayTypeHeaders = function(employeePayments) {
    let payTypeHeaders = ['Employee']

    employeePayments.forEach(anEmployeeData => {
        anEmployeeData.payment.forEach(anEmployeePayType => {
            if(anEmployeePayType.id) {
                let doesPayTypeHeaderExist = _.find(payTypeHeaders, function(aPayType) {
                    return aPayType.id && (aPayType.id === anEmployeePayType.id && aPayType.code === anEmployeePayType.code)
                })
                if(!doesPayTypeHeaderExist) {
                    payTypeHeaders.push({
                        id: anEmployeePayType.id,
                        code: anEmployeePayType.code,
                        description: anEmployeePayType.description
                    })
                }
            }
        })
    })
    payTypeHeaders.push({
        id: 'totalDeduction',
        code: 'totalDeduction',
        description: 'Total Deduction'
    })
    payTypeHeaders.push({
        id: 'netPay',
        code: 'netPay',
        description: 'Net Pay'
    })
    return {payTypeHeaders}
}

ReportUtils.getPayTypeValues = function(employeePayments, payTypeHeaders) {
    let payTypeValues = []

    employeePayments.forEach(anEmployeeData => {
        let aRowOfPayTypeValues = []

        payTypeHeaders.forEach(aPaytypeHeader => {
            if(aPaytypeHeader === 'Employee') {
                let employee = Meteor.users.findOne({_id: anEmployeeData.employeeId});
                aRowOfPayTypeValues.push(employee.profile.fullName)
                return
            }
            //--
            let payDetails = _.find(anEmployeeData.payment, function(aPayType) {
                return aPayType.id && (aPaytypeHeader.id === aPayType.id && aPaytypeHeader.code === aPayType.code)
            })
            if(payDetails) {
                let payAmount = payDetails.amountLC
                if(payDetails.type === 'Deduction') {
                    if(payAmount > 0) {
                        payAmount *= -1
                    }
                }
                aRowOfPayTypeValues.push(payAmount)
            } else if(aPaytypeHeader.id === 'netPay') {
                let netPay = _.find(anEmployeeData.payment, function(aPayType) {
                    return (aPayType.code === 'NMP')
                })
                if(netPay) {
                    aRowOfPayTypeValues.push(netPay.amountLC)
                }
            } else if(aPaytypeHeader.id === 'totalDeduction') {
                let totalDeduction = _.find(anEmployeeData.payment, function(aPayType) {
                    return (aPayType.code === 'TDEDUCT')
                })
                if(totalDeduction) {
                    aRowOfPayTypeValues.push(totalDeduction.amountLC)
                }
            } else {
                aRowOfPayTypeValues.push("---")
            }
        })
        payTypeValues.push(aRowOfPayTypeValues)
    })
    return payTypeValues
}


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
                    // console.log(`Payrun results: ${JSON.stringify(res)}`);
                    Session.set('currentPayrunPeriod', res.period);

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
    'click #export-to-csv': (e,tmpl) => {
        const payResult = Template.instance().dict.get('payResult');
        if (payResult) {
            let payTypeHeaders = ReportUtils.getPayTypeHeaders(payResult.payObj.payrun) 

            let formattedHeader = payTypeHeaders.payTypeHeaders.map(aHeader => {
                return aHeader.description || aHeader
            })
            //--
            let reportData = ReportUtils.getPayTypeValues(payResult.payObj.payrun, payTypeHeaders.payTypeHeaders)

            BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData}, 
                `Payrun results export`);
        } else {
            swal('Error', 'No payrun results', 'error')
        }
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
            console.log(`pay result`, payResult.payObj.result)
            return payResult.payObj.result;
        }
    },
    'processingError': () => {
        const payresult = Template.instance().dict.get('payResult');
        return payresult.payObj.error.length;
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

    //--
    self.selectedMonth = new ReactiveVar();
    self.selectedYear = new ReactiveVar();
    //--
    let theMoment = moment();
    self.selectedMonth.set(theMoment.format('MM'))
    self.selectedYear.set(theMoment.format('YYYY'))
    //--

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
