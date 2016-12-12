/*****************************************************************************/
/* EmployeeCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore';
Template.EmployeeCreate.events({
    // simulate file upload will use collectionFS and save files to aws s3
    'change #uploadBtn': function(e){
        if (e.target.files && e.target.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#profile-img')
                    .attr('src', e.target.result)
            };

            reader.readAsDataURL(e.target.files[0]);
            //upload = UserImages.insert(e.target.files[0]);
            //$('#filename').html(e.target.files[0].name);
        }
    },
    'click #createEmployee': function(e, tmpl){
        event.preventDefault();
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let l = Ladda.create(tmpl.$('#createEmployee')[0]);
        l.start();
        const employeeProfile = {
            employeeId: $('[name="employeeId"]').val(),
            address: $('[name="address"]').val(),
            dateOfBirth: $('[data-field="dateOfBirth"]').val(),
            gender: $('[name="gender"]').val(),
            maritalStatus: $('[name="maritalStatus"]').val(),
            phone: $('[name="phone"]').val(),
            state: $('[name="state"]').val(),
            photo: upload(),
            guarantor: guarantor(),
            employment: employment(),
            emergencyContact: emergencyContact(),
            payment: payment()

        };
        function guarantor() {
            return {
                fullName: $('[name="guarantor.fullName"]').val(),
                email: $('[name="guarantor.email"]').val(),
                phone: $('[name="guarantor.phone"]').val(),
                address: $('[name="guarantor.address"]').val(),
                city: $('[name="guarantor.city"]').val(),
                state: $('[name="guarantor.state"]').val()
            }

        };
        function employment(){
            return{
            position: $('[name="position"]').val(),
                paygrade: $('[name="paygrade"]').val(),
                paytypes: getPaytypes(),
                hireDate: $('[name="hireDate"]').val(),
                confirmationDate: $('[name="confirmationDate"]').val(),
                status: $('[name="status"]').val(),
                terminationDate: $('[name="terminationDate"]').val()
            }
        };
        function payment() {
            return {
            paymentMethod: $('[name="paymentMethod"]').val(),
            bank: $('[name="bank"]').val(),
            accountNumber: $('[name="accountNumber"]').val(),
            accountName: $('[name="accountName"]').val(),
            pensionmanager: $('[name="pensionmanager"]').val(),
            RSAPin: $('[name="RSAPin"]').val()
            }

        };
        function upload(){
            if ($('#uploadBtn')[0].files[0])
                return UserImages.insert($('#uploadBtn')[0].files[0]);
        }
        const employee = {
            firstName: $('[name="firstName"]').val(),
            lastName: $('[name="lastName"]').val(),
            otherNames: $('[name="otherNames"]').val(),
            email: $('[name="email"]').val(),
            employeeProfile: employeeProfile,
            businessId: BusinessUnits.findOne()._id
        };
        function emergencyContact(){
            return [{
                name: $('[name="contact.fullName"]').val(),
                email: $('[name="contact.email"]').val(),
                phone: $('[name="contact.phone"]').val(),
                address: $('[name="contact.address"]').val(),
                city: $('[name="contact.city"]').val(),
                state: $('[name="contact.state"]').val()

            }];
        }
        function returnBool(val){
            if(val === "Yes") return true;
            return false;
        };
        function getPaytypes(){
            let assigned = tmpl.assignedTypes.get();
            if(assigned){
              return assigned;
            }
        };

        Meteor.call('account/create', employee, true, (err, res) => {
            l.stop();
            if (res){
                swal({
                    title: "Success",
                    text: `Employee Created`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Router.go('employees', {_id: Session.get('context')});
            } else {
                console.log(err);
                //err = JSON.parse(err.details);
                //// add necessary handler on error
                ////use details from schema.key to locate html tag and error handler
                //_.each(err, (obj) => {
                //    $('[name=' + obj.name +']').addClass('errorValidation');
                //    $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);
                //
                //})
            }
        });
    },
    'click add': () => {

    },
    'change [name="position"]': (e,tmpl) => {
        //set selectedPosition reactive var
        let position = $(e.target).val();
        tmpl.selectedPosition.set(position);
    },
    'change [name="paygrade"]': (e,tmpl) => {
        let paygrade = $(e.target).val();
        tmpl.selectedGrade.set(paygrade);

    },
    'blur .payAmount': (e,tmpl) => {
        let entered = $(e.target).val();
        let id = $(e.target).attr('id');
        let assigned = tmpl.assignedTypes.get();
        if(assigned){
            let index = _.findIndex(assigned, {_id: id});
            if(index !== -1){
                assigned[index].inputed = entered;
                tmpl.assignedTypes.set(assigned);
            }
        }

        //if(entered){
        //    if(isNaN(entered)){
        //        $(e.target).addClass('errorValidation');
        //    } else {
        //        $(e.target).removeClass('errorValidation');
        //    }
        //}
    }
});

/*****************************************************************************/
/* EmployeeCreate: Helpers */
/*****************************************************************************/
Template.EmployeeCreate.helpers({
    positions: () => {
        return EntityObjects.find();
    },
    'states': () => {
        return Core.states();
    },
    'countries': () => {
        return Core.IsoCountries();
    },
    'defaultCountry': (ccode) => {
        return ccode === Core.country ? selected="selected":"";
    },
    'selectedPosition': () => {
        return Template.instance().selectedPosition.get();
    },
    'grades': () => {
        return PayGrades.find();
    },
    'assignable': () => {
       return Template.instance().assignedTypes.get();
    },
    'increment': (index) => {
        return index += 1;
    },
    'disabled': (id) => {
        let paytype = PayTypes.findOne({_id: id});
        if(paytype){
            return paytype.editablePerEmployee? '':'disabled';
        }
    }


});

/*****************************************************************************/
/* EmployeeCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeCreate.onCreated(function () {
    //subscribe to all positions
    var self = this;
    self.selectedPosition = new ReactiveVar();
    self.selectedGrade = new ReactiveVar();
    self.assignedTypes = new ReactiveVar();
    self.subscribe("getPositions", Session.get('context'));
    self.autorun(function(){
        let position = Template.instance().selectedPosition.get();
        if(position)
            self.subscribe("assignedGrades", position);
    });
    self.autorun(function(){
        let selectedGrade = Template.instance().selectedGrade.get();
        if(selectedGrade){
            let grade = PayGrades.findOne({_id: selectedGrade});
            if (grade){
                let paytypes = grade.payTypes.map(x => {
                    return x.paytype;
                });
                self.subscribe("getpositionGrades", paytypes);
            }
            //
            let pgObj = PayGrades.findOne({_id: selectedGrade});
            let paytypes = pgObj.payTypes;
            paytypes.forEach(x => {
                pt = PayTypes.findOne({_id: x.paytype});
                if (pt)
                    _.extend(x, pt);
                return x
            });
            Template.instance().assignedTypes.set(paytypes);

        }
    });

});

Template.EmployeeCreate.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this;
    let rules = new ruleJS('calc');
    rules.init();
    self.autorun(function(){
        //rerun computation if assigned value changes
        let assigned = self.assignedTypes.get();
        let input = $('input[type=text]');
        if(assigned){
            assigned.forEach((x,index) => {
                let formula = x.inputed || x.value;
                if(formula){
                    //replace all wagetypes with values
                    for (var i = 0; i < index; i++) {
                        if(assigned[i].code){
                            var regex = new RegExp(assigned[i].code.toUpperCase(), "g");
                            formula = formula.replace(regex, assigned[i].inputed);
                        }
                    }
                    var parsed = rules.parse(formula, input);
                    if (!isNaN(parsed.result)) {
                        x.parsedValue = parsed.result.toFixed(2);
                        x.monthly = (parsed.result / 12).toFixed(2);
                        //set default inputed as parsed value if not editable per employee
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
        }

    });

});

Template.EmployeeCreate.onDestroyed(function () {
});
