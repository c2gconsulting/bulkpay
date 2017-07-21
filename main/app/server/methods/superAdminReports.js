import _ from 'underscore';


let getPositionParentsText = function(position) {
    var parentsText = ''
    if(position.parentId) {
    	let possibleParent = EntityObjects.findOne({_id: position.parentId})

        if(possibleParent) {
            parentsText += possibleParent.name

            if(possibleParent.parentId) {
		    	let possibleParent2 = EntityObjects.findOne({_id: possibleParent.parentId})

                if(possibleParent2) {
                    parentsText += ' >> ' + possibleParent2.name
                    return parentsText
                } return ''
            } else return parentsText
        } else return ''
    } else return ''
};

Meteor.methods({
  'superAdminReports/getUsersWithDefaultPassword': function(businessId) {
    let allDaarUsers = Meteor.users.find({businessIds: businessId}).fetch()
    console.log(`Num allDaarUsers: `, allDaarUsers.length)
    this.unblock()

    let payrunResults = processEmployeePay(Meteor.userId(), allDaarUsers, [], businessId, {
        year: '2017',
        month: '12'
    })
    console.log(`payrun processing done!`)
    //--
    let efficientPayrunResults = {}
    if(payrunResults.result) {
        payrunResults.result.forEach(aPayrunData => {
            let paySlip = aPayrunData.payslip
            if(paySlip && paySlip.employee && paySlip.employee.employeeUserId) {
                efficientPayrunResults[paySlip.employee.employeeUserId] = aPayrunData
            }
        })
    }
    //--
    
    let numDaarUsersWithRealPassword = 0
    let numDaarUsersWithDefaultPassword = 0
    let daarUsersWithRealPassword = []
    let daarUsersWithDefaultPassword = []

    let hashedDefaultPassword = Package.sha.SHA256("123456") 
    let defaultPassword = {digest: hashedDefaultPassword, algorithm: 'sha-256'};

    let payGrades = {}

    allDaarUsers.forEach((aDaarUser, userIndex) => {
        try {
            let defaultLoginResult = Accounts._checkPassword(aDaarUser, defaultPassword);  
            let empId = aDaarUser.employeeProfile.employeeId || ""

            let firstName = aDaarUser.profile.firstname
            let lastName = aDaarUser.profile.lastname
            let email = aDaarUser.emails[0] ? aDaarUser.emails[0].address : ''
            let paygradeId = aDaarUser.employeeProfile.employment.paygrade || ""
            let paygrade = payGrades[paygradeId]
            if(!paygrade) {
                let paygradeData = PayGrades.findOne(paygradeId)
                if(paygradeData) {
                    payGrades[paygradeId] = paygradeData
                    paygrade = paygradeData
                }
            }

            let parentsText = ''
            let employeePositionId = aDaarUser.employeeProfile.employment.position
            if(employeePositionId) {
                let employeePosition = EntityObjects.findOne({_id: employeePositionId}) 
                if(employeePosition) {
                    parentsText = getPositionParentsText(employeePosition)
                }
            } else {
                console.log('Employee with id: ' + aDaarUser._id + ", has no position id")
            }
            //--
            let employeeNetPay = ''
            let employeePayrunResults = efficientPayrunResults[aDaarUser._id]

            if(employeePayrunResults) {
                let paySlip = employeePayrunResults.payslip
                employeeNetPay = paySlip.netPayment
                if(employeeNetPay) {
                    employeeNetPay = parseFloat(employeeNetPay).toFixed(2);
                }
            }
            let employeeData = {
                empId: empId,
                firstName : firstName,
                lastName: lastName,
                email: email,
                parents: parentsText,
                payGrade: paygrade ? paygrade.code : '',
                netPay: employeeNetPay
            }

            if(defaultLoginResult.error) {
                daarUsersWithRealPassword.push(employeeData)
                numDaarUsersWithRealPassword += 1
            } else {
                daarUsersWithDefaultPassword.push(employeeData)
                numDaarUsersWithDefaultPassword += 1
            }
        } catch(e) {
            console.log("Exception: ", e.message)
        }
    })
    
    return {
      daarUsersWithRealPassword, daarUsersWithDefaultPassword, 
      numDaarUsersWithRealPassword, numDaarUsersWithDefaultPassword
    }
  }
})
