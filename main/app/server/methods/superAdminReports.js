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
      //--
      let returnedDaarUsersWithRealPassword = []
      let returnedDaarUsersWithDefaultPassword = []

      let daarUsersWithRealPassword = Meteor.users.find({
        businessIds: businessId,
        isUsingDefaultPassword: false
      }).fetch()
      let daarUsersWithDefaultPassword = Meteor.users.find({
        businessIds: businessId,
        isUsingDefaultPassword: true
      }).fetch()
    
      let payGrades = PayGrades.find({businessId}).fetch()
      let entityObjects = EntityObjects.find({businessId}).fetch()
  
      for(let i = 0; i < daarUsersWithRealPassword.length; i++) {
        let aDaarUser = daarUsersWithRealPassword[i]
        let empId = aDaarUser.employeeProfile.employeeId || ""

        let firstName = aDaarUser.profile.firstname
        let lastName = aDaarUser.profile.lastname
        let email = aDaarUser.emails[0] ? aDaarUser.emails[0].address : ''
        let paygradeId = aDaarUser.employeeProfile.employment.paygrade || ""

        let address = aDaarUser.employeeProfile.address
        
        let nextOfKinName = aDaarUser.employeeProfile.guarantor.fullName
        let nextOfKinAddress = aDaarUser.employeeProfile.guarantor.email
        let nextOfKinPhone = aDaarUser.employeeProfile.guarantor.phone

        let emergencyContactName = aDaarUser.employeeProfile.emergencyContact[0].name ? aDaarUser.employeeProfile.emergencyContact[0].name : ''
        let emergencyContactPhone = aDaarUser.employeeProfile.emergencyContact[0].phone ? aDaarUser.employeeProfile.emergencyContact[0].phone : ''
        let emergencyContactEmail = aDaarUser.employeeProfile.emergencyContact[0].email ? aDaarUser.employeeProfile.emergencyContact[0].email : ''
        let emergencyContactAddress = aDaarUser.employeeProfile.emergencyContact[0].address ? aDaarUser.employeeProfile.emergencyContact[0].address : ''

        // let paygrade = payGrades[paygradeId]
        let paygrade =  _.findWhere(payGrades, {_id: paygradeId})

        let parentsText = ''
        let employeePositionId = aDaarUser.employeeProfile.employment.position
        if(employeePositionId) {
            // let employeePosition = EntityObjects.findOne({_id: employeePositionId}) 
            let employeePosition =  _.findWhere(entityObjects, {_id: employeePositionId})
            if(employeePosition) {
                parentsText = getPositionParentsText(employeePosition)
            }
        } else {
            console.log('Employee with id: ' + aDaarUser._id + ", has no position id")
        }
        //--
        let employeeData = {
          empId: empId,
          firstName : firstName,
          lastName: lastName,
          email: email,
          address: address,
          parents: parentsText,
          payGrade: paygrade ? paygrade.code : '',
          nextOfKinName: nextOfKinName,
          nextOfKinPhone: nextOfKinPhone,
          nextOfKinAddress: nextOfKinAddress,
          emergencyContactName: emergencyContactName,
          emergencyContactPhone: emergencyContactPhone,
          emergencyContactEmail: emergencyContactEmail,
          emergencyContactAddress: emergencyContactAddress
        }
        returnedDaarUsersWithRealPassword.push(employeeData)
      }
      //--
      for(let i = 0; i < daarUsersWithDefaultPassword.length; i++) {
        let aDaarUser = daarUsersWithDefaultPassword[i]
        let empId = aDaarUser.employeeProfile.employeeId || ""

        let firstName = aDaarUser.profile.firstname
        let lastName = aDaarUser.profile.lastname
        let email = aDaarUser.emails[0] ? aDaarUser.emails[0].address : ''
        let paygradeId = aDaarUser.employeeProfile.employment.paygrade || ""

        let address = aDaarUser.employeeProfile.address
        
        let nextOfKinName = aDaarUser.employeeProfile.guarantor.fullName
        let nextOfKinAddress = aDaarUser.employeeProfile.guarantor.email
        let nextOfKinPhone = aDaarUser.employeeProfile.guarantor.phone

        let emergencyContactName = aDaarUser.employeeProfile.emergencyContact[0].name ? aDaarUser.employeeProfile.emergencyContact[0].name : ''
        let emergencyContactPhone = aDaarUser.employeeProfile.emergencyContact[0].phone ? aDaarUser.employeeProfile.emergencyContact[0].phone : ''
        let emergencyContactEmail = aDaarUser.employeeProfile.emergencyContact[0].email ? aDaarUser.employeeProfile.emergencyContact[0].email : ''
        let emergencyContactAddress = aDaarUser.employeeProfile.emergencyContact[0].address ? aDaarUser.employeeProfile.emergencyContact[0].address : ''

        // let paygrade = payGrades[paygradeId]
        let paygrade =  _.findWhere(payGrades, {_id: paygradeId})        

        let parentsText = ''
        let employeePositionId = aDaarUser.employeeProfile.employment.position
        if(employeePositionId) {
            let employeePosition =  _.findWhere(entityObjects, {_id: employeePositionId})
            if(employeePosition) {
                parentsText = getPositionParentsText(employeePosition)
            }
        } else {
            console.log('Employee with id: ' + aDaarUser._id + ", has no position id")
        }
        //--
        let employeeData = {
            empId: empId,
            firstName : firstName,
            lastName: lastName,
            email: email,
            address: address,
            parents: parentsText,
            payGrade: paygrade ? paygrade.code : '',
            nextOfKinName: nextOfKinName,
            nextOfKinPhone: nextOfKinPhone,
            nextOfKinAddress: nextOfKinAddress,
            emergencyContactName: emergencyContactName,
            emergencyContactPhone: emergencyContactPhone,
            emergencyContactEmail: emergencyContactEmail,
            emergencyContactAddress: emergencyContactAddress
        }
        returnedDaarUsersWithDefaultPassword.push(employeeData)
      }
      
      return {
        daarUsersWithRealPassword: returnedDaarUsersWithRealPassword, 
        daarUsersWithDefaultPassword: returnedDaarUsersWithDefaultPassword,

        numDaarUsersWithRealPassword: returnedDaarUsersWithRealPassword.length, 
        numDaarUsersWithDefaultPassword: returnedDaarUsersWithDefaultPassword.length
      }
    }
  })