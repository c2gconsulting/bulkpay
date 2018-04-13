/*****************************************************************************/
/* ResultEntry: Event Handlers */
/*****************************************************************************/
import Ladda from "ladda";

Template.ResultEntry.events({
    'click #PayGroupButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayGroupButton')[0]);
        l.start();
    },
    'click .payslip': (e, tmpl) => {
        // console.log("what i'm sending to payslip is ", JSON.stringify(tmpl.data.payslip));

        let payLoadForPayslip = {
            payslip: tmpl.data.payslip,
            payslipWithCurrencyDelineation: tmpl.data.payslipWithCurrencyDelineation,
            displayAllPaymentsUnconditionally: true
        }
        console.log("payslip info ");
        console.log(payLoadForPayslip.payslip);

        let findObjectByKey = function (array, key, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    return array[i];
                }
            }
            return null;
        };

        const paygrade = PayGrades.findOne({_id: payLoadForPayslip.payslip.employee.gradeId})

        if(paygrade) {
            console.log(paygrade.payTypePositionIds);

            payLoadForPayslip.payslip.benefit.sort(function(a, b){
                let aa = findObjectByKey(paygrade.payTypePositionIds, "paytype", a.payTypeId);
                let aaPosition = 99;
                if (aa){
                    aaPosition = parseInt(aa.paySlipPositionId);
                }

                let bb = findObjectByKey(paygrade.payTypePositionIds, "paytype", b.payTypeId);

                let bbPosition = 99;
                if (bb){
                    bbPosition = parseInt(bb.paySlipPositionId);
                }

                return aaPosition - bbPosition;
            });

            payLoadForPayslip.payslip.deduction.sort(function(a, b){
                let aa = findObjectByKey(paygrade.payTypePositionIds, "paytype", a.payTypeId);
                let aaPosition = 99;
                if (aa){
                    aaPosition = parseInt(aa.paySlipPositionId);
                }

                let bb = findObjectByKey(paygrade.payTypePositionIds, "paytype", b.payTypeId);

                let bbPosition = 99;
                if (bb){
                    bbPosition = parseInt(bb.paySlipPositionId);
                }

                return aaPosition - bbPosition;
            });

            payLoadForPayslip.payslip.others.sort(function(a, b){
                let aa = findObjectByKey(paygrade.payTypePositionIds, "paytype", a.payTypeId);
                let aaPosition = 99;
                if (aa){
                    aaPosition = parseInt(aa.paySlipPositionId);
                }

                let bb = findObjectByKey(paygrade.payTypePositionIds, "paytype", b.payTypeId);

                let bbPosition = 99;
                if (bb){
                    bbPosition = parseInt(bb.paySlipPositionId);
                }

                return aaPosition - bbPosition;
            });

        }

        Session.set('currentSelectedPaySlip', payLoadForPayslip)
        $("#payrunResultsTab").removeClass( "active" )
        $("#selectedPaySlipTab").addClass( "active" )

        $(".payrunResults").removeClass( "active" )
        $(".selectedPaySlip").addClass( "active" )

        // Modal.show('Payslip', payLoadForPayslip);
    },
    'click .log': (e, tmpl) => {
        Modal.show('Log', tmpl.data.log);
    }
});

/*****************************************************************************/
/* ResultEntry: Helpers */
/*****************************************************************************/
Template.ResultEntry.helpers({
    getlineColor: (status) => {
        return status? 'error': 'success';
    }

});

/*****************************************************************************/
/* ResultEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.ResultEntry.onCreated(function () {

});

Template.ResultEntry.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ResultEntry.onDestroyed(function () {
});
