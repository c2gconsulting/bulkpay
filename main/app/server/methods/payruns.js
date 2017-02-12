import _ from 'underscore';
/**
 *  Payruns Methods
 */
Meteor.methods({

    /* Payment run
     */

    "payrun/process": function(obj, businessId){
        //check if user is in businessId
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        this.unblock();
        console.log(obj);
        let employees = obj.employees;
        const paygrades = obj.paygrades;
        const period = obj.period;
        const runtype = obj.type;
        check(employees, Array);
        check(period, Object);
        check(runtype, String);
        check(paygrades, Array);
        let res;

        //get all selected employees --Condition-- if employees selected, ideally there should be no paygrade
        if(employees.length === 0 && paygrades.length > 0){
            res = getActiveEmployees(paygrades, period, businessId);
            //res contains employees ready for payment processing

            if(res && res.length > 0){
               processEmployeePay(res, businessId);
            }
        } else if(employees.length > 0){
            //get all employees specified
            //return empoloyee and reason why payroll cannot be run for such employee if any
           const users = Meteor.users.find({_id: {$in: employees}}).fetch();
            users && processEmployeePay(users, businessId);
        }

        //just return something for now .... testing
        return {_id: 1};
    }

});

function processEmployeePay(employees, businessId){
    let paygrades = [];
    let payresult = [];
    //lazyload paygrades
    employees.forEach(x => {
        let pg = x.employeeProfile.employment.paygrade;  //paygrade
        let pt = x.employeeProfile.employment.paytypes;  //paytype
        let grade,pgp;  //grade(paygrade) && pgp(paygroup);
        let gradeIndex = _.findLastIndex(paygrades, {_id: pg});
        let empSpecificType;  //contains employee payments derived from paygrade
        if(gradeIndex !== -1){
            grade = paygrades[gradeIndex];
            empSpecificType = determineRule(pt, grade);
        } else {
            //get paygrade and update paygrades
            grade = getEmployeeGrade(pg);
            if(grade) {
                paygrades.push(grade);
                empSpecificType = determineRule(pt, grade);
            }
        }
        if(grade && grade.hasOwnProperty('payGroups') && grade.payGroups.length > 0){
              //console.log(grade);
            pgp = grade.payGroups[0]; //first element of paygroup// {review}
        }

        //payElemnts derivation;
        const {tax, pension} = getPaygroup(pgp);
        let defaultTaxBucket = 0, pensionBucket = 0, log = [];  //check if pagrade uses default tax bucket
        let assignedTaxBucket, grossIncomeBucket = 0;
        let empDerivedPayElements = [];

        let rules = new ruleJS();
        rules.init();
        try{
            //let formular = x.value
            let paytypes = empSpecificType.map(x => {    //changes paygrades of currently processed employee to include paytypes
                let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
                delete x.paytype;
                _.extend(x, ptype);

                return x;
            });
            paytypes.forEach((x,index) => {
                let input = [], processing = [];

                let boundary = JSON.parse(JSON.stringify(paytypes)); //available types as at current processing
                boundary.length = index + 1;
                //format boundary for display in log
                let clone = boundary.map(x => {
                    let b = {};
                    b.code = x.code;
                    b.value = x.value;
                    return b;
                });
                input = input.concat(clone);

                let formula = x.value;
                let old = formula;
                if (formula) {
                    //replace all wagetypes with values
                    for (var i = 0; i < index; i++) {
                        const code = paytypes[i].code ? paytypes[i].code.toUpperCase() : paytypes[i].code;
                        const pattern = `\\b${code}\\b`;
                        const regex = new RegExp(pattern, "g");
                        formula = formula.replace(regex, paytypes[i].value);

                    }
                    //do the same for all contansts and replace the values
                    //will find a better way of doing this... NOTE
                    let k = Constants.find({'businessId': businessId, 'status': 'Active'}).fetch();  //limit constant to only Bu constant
                    k.forEach(c => {
                        const code = c.code ? c.code.toUpperCase() : c.code;
                        const pattern = `\\b${code}\\b`;
                        const regex = new RegExp(pattern, "g");
                        formula = formula.replace(regex, c.value);

                    });
                    processing.push({code: x.code, previous: old, derived: formula});
                    var parsed = rules.parse(formula, '');

                    if (parsed.result !== null) {
                        x.parsedValue = x.type === "Deduction"? parsed.result.toFixed(2) * -1: parsed.result.toFixed(2) ;  //defaulting to 2 dp ... Make configurable;
                        processing.push({code: x.code, derived : x.parsedValue});
                        //negate value if paytype is deduction.
                        //add parsed value to defaultTax bucket if paytype is taxable
                        defaultTaxBucket += x.taxable? parseFloat(x.parsedValue): 0;
                        //assigned bucket if one of the paytype is selected as tax bucket
                        assignedTaxBucket = x._id === tax.bucket ? parseFloat(x.parsedValue): null;
                        processing.push({code: x.code, taxBucket: defaultTaxBucket});
                        //if paytype in pension then add to default pension buket
                        const ptIndex = pension && _.indexOf(pension.payTypes, x._id);
                        pensionBucket += ptIndex !== -1? parseFloat(x.parsedValue): 0; // add parsed value to pension bucket if paytype is found
                        //gross income for pension relief;
                        grossIncomeBucket += tax.grossIncomeBucket === x._id? parseFloat(x.parsedValue): 0;
                        processing.push({code: x.code, pensionBucket: pensionBucket});
                    } else {
                        //when there is an error, stop processing this employee and move to the next one
                        processing.push(parsed);
                    }
                    log.push = {input: input, processing: processing};
                    empDerivedPayElements.push(x);
                    //
                }
            })
        }catch(e){
            console.log(e);
        }
        //further process after evaluation of all paytypes pension calculation and tax calculation

        //get employee and employer contribution
        const {employerPenContrib, employeePenContrib} = getPensionContribution(pensionBucket, pension);

        //get tax;
        const taxBucket = assignedTaxBucket || defaultTaxBucket; //automatically use default tax bucket if tax bucket not found
        const netTax = calculateTax(employeePenContrib, taxBucket,grossIncomeBucket, tax);





    });

};

function derivePayElement(person){
    let gradePaytypes = PayGrades.find({_id: person.employeeProfile.employment.paygrade});

    return "done";
    //get employee pay grade
}

function getEmployeeGrade(gradeId){
    return PayGrades.findOne({_id: gradeId, status: 'Active'});
}

function determineRule(paytype, gradetype){
    //gradetype contains processing rules while paytypes contains personal employee rules
    let pt = gradetype.payTypes;
    const empGrade = pt.map(x => {
        let index = _.findLastIndex(paytype, {'paytype': x.paytype});
        if(index !== -1){
            //derive rule based on employee assigned if no value assinged, use grade derivative
            if(paytype[index].value){
                x.value = paytype[index].value;
            }
        }
        //return same rule
        return x;
    });
    //console.log(empGrade);
    return empGrade;
}
function getPaygroup(paygrade){
    const pg = PayGroups.findOne({_id: paygrade, status: 'Active'});
    const penTax = {};
    if(pg){
        if(pg.tax) {
            const tax = Tax.findOne({_id : pg.tax, status: 'Active'});
            tax? penTax.tax = tax:null;
        }
        if(pg.pension) {
            const pension = Pensions.findOne({_id: pg.pension, status: 'Active'});
            pension? penTax.pension = pension: null;
        }
    }
    return penTax;

}
//return employer and employee contribution
function getPensionContribution(pensionBucket, pension){
    //@import pension bucket float, pension doc.
    //all elements of pension already derived into pensionBucket
    //calculate employer and employee contribution
    if(pension) {
        const eerate = pension.employeeContributionRate;
        const errate = pension.employerContributionRate;
        const employee = (eerate / 100) * pensionBucket;
        const employer = (errate / 100) * pensionBucket;
        return {employeePenContrib: employee, employerPenContrib: employer};
    } else {
        return {employeePenContrib: null, employerPenContrib: null}
    }

}

//from taxable income calculate tax and return value
function calculateTax(pension,taxBucket,grossIncomeBucket, tax){
    //@import taxBucket (defualt tax bucket or valuated passed bucket)
    //@import tax (tax doc configured )
    //calculate reliefs
    //no checks done yet exceptions NAN undefined checkes
    //return result {finalTax: log[] }
    let grossIncomeRelief = (tax.grossIncomeRelief / 100) * grossIncomeBucket;
    let consolidatedRelief = tax.consolidatedRelief;
    const totalRelief = grossIncomeRelief + consolidatedRelief + pension;
    let taxableIncome = taxBucket - totalRelief;
    let totalTax = 0;
    //apply tax rules on taxable income
    const rules = tax.rules;
    //add log for debugging
    //deduct upper limit from taxable income
    //no need to calcuate tax if taxable income
    for(let i = 0; i < rules.length; i++){
        let x = rules[i];
        taxableIncome = taxableIncome - x.upperLimit;
        //get rate on taxable income
        if(taxableIncome > 0){
            totalTax += (x.rate / 100) * x.upperLimit;
        } else {
            totalTax += (x.rate / 100) * taxableIncome;
            break;
        }
    };

    return totalTax / 12 //as net tax;
}