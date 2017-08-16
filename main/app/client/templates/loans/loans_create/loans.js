/*****************************************************************************/
/* Loans: Event Handlers */
/*****************************************************************************/
Template.LoansNew.events({
  'click #cancel': function(e, tmpl) {
    window.history.back();
  },
  'click #apply': function(e, tmpl) {
    e.preventDefault();
    console.log(`apply button clicked.`)

    let loanType = $('#loanType').val()
    let loanAmount = $('#loan-amount').val()
    let interestRate = $('#loan-rate').val()
    let durationInMonths = $('#loan-term').val()

    if(!loanType || loanType.length === 0) {
        tmpl.inputErrorMsg.set("Please select a Loan Type")
        return
    }
    if(!loanAmount || loanAmount.length === 0) {
        tmpl.inputErrorMsg.set("Please enter the amount of this loan")
        return
    } else {
      if(isNaN(loanAmount)) {
        tmpl.inputErrorMsg.set("Loan amount should be a number")
        return
      }      
    }
    if(!interestRate || interestRate.length === 0) {
        tmpl.inputErrorMsg.set("Please enter the interest rate")
        return
    } else {
      if(isNaN(interestRate)) {
        tmpl.inputErrorMsg.set("Interest rate should be a number")
        return
      }
    }
    if(!durationInMonths || durationInMonths.length === 0) {
      tmpl.inputErrorMsg.set("Please enter the term")
      return
    } else {
      if(isNaN(durationInMonths)) {
        tmpl.inputErrorMsg.set("Loan term should be a number")
        return
      }
    }

    let loanDoc = {
        employeeId: Meteor.userId(),
        loanType: loanType, 
        amount: parseFloat(loanAmount), 
        interestRate: parseFloat(interestRate),
        durationInMonths: parseFloat(durationInMonths),
        businessId: Session.get('context')
    }
    // let currentLoanRequest = Template.instance().data
    // if(currentLoanRequest) {
    //     loanDoc._id = currentLoanRequest._id
    // }

    Meteor.call('Loans/create', loanDoc, function(err, res) {
        if(!err) {
            // if(currentLoanRequest) {
                swal('Successful', "Your Loan request was successful", 'success')
            // } else {
            //     swal('Successful', "Your Loan request change was successful", 'success')
            // }
            window.history.back();
        } else {
            swal('Error', err.reason, 'error')
        }
    })
  }
});

/*****************************************************************************/
/* Loans: Helpers */
/*****************************************************************************/
Template.LoansNew.helpers({
    inputErrorMsg: function() {
        return Template.instance().inputErrorMsg.get()
    },
});

/*****************************************************************************/
/* Loans: Lifecycle Hooks */
/*****************************************************************************/
Template.LoansNew.onCreated(function () {
  let self = this

  self.inputErrorMsg = new ReactiveVar()
});

Template.LoansNew.onRendered(function () {
});

Template.LoansNew.onDestroyed(function () {
});
