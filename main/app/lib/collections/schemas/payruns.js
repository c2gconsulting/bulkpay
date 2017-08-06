

Core.Schemas.ProjectPay = new SimpleSchema({
    projectId: {
        type: String
    },
    durationInHours: {
        type: Number,
        decimal: true
    },
    payAmount: {
        type: Number,
        decimal: true
    }
})

/**
 * Payrun Types Schema
 */
Core.Schemas.Payrun = new SimpleSchema({
      _id: {
        type: String,
        optional: true
      },
        businessId: {
            type: String
        },
       employeeId: {
          type: String,
       },
        payment: {
          type: [Object]
        },
        'payment.$': {
          type: Object
        },
        'payment.$.id': {
          type: String,
          regEx: SimpleSchema.RegEx.Id,
          optional: true
        },
        'payment.$.reference': {
          type: String,
          allowedValues: ['Tax', 'Pension', 'Standard', 'Paytype', 'Standard-1'],
          defaultValue: 'Paytype'
        },
        'payment.$.amountLC': { // amount in Local Currency
          type: Number,
            decimal: true
        },
        'payment.$.type': {
            type: String,
            optional: true
        },
        'payment.$.amountPC': { // amount in paytype Currency
            type: Number,
            decimal: true
        },
        'payment.$.projectPayAmount': { // amount in Local Currency
          type: Number,
          decimal: true,
          optional: true
        },
        'payment.$.projectsPay': { // amount in Local Currency
          type: [Core.Schemas.ProjectPay],
          optional: true
        },
        'payment.$.costCenterPayAmount': { // amount in Local Currency
          type: Number,
            decimal: true,
            optional: true
        },
        'payment.$.code': { // Will be used if paytype is deleted from the system... keeps a reference to the payment code as as payroll run
          type: String
        },
        'payment.$.description': { // Will be used if paytype is deleted from the system... keeps a reference to the payment description as as payroll run
          type: String
        },
        period: {
          type: String
        },
        isPostedToSAP: {
            type: Boolean,
            optional: true
        },
        payrunDoneBy: {
          type: String, 
          optional: true
        },
        requirePayrollApproval: {
            type: Boolean,
            optional: true
        },
        approvals: {
          type: [Object],
          optional: true
        },
        'approvals.$.approvedBy': {
          type: String
        },
        'approvals.$.isApproved': {
          type: Boolean
        },
      createdAt: {
        type: Date,
        autoValue: function () {
          if (this.isInsert) {
            return new Date;
          } else if (this.isUpsert) {
            return {
              $setOnInsert: new Date
            };
          }
        },
        denyUpdate: true
      }
    });
