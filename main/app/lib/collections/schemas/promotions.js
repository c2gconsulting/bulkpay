/**
 * Promotion History Schema
 */
Core.Schemas.PromotionHistory = new SimpleSchema({
  event: {
    type: String
  },
  newValue: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  }
});

/**
 * Promotion Approval Schema
 */
Core.Schemas.PromotionApproval = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  approvedBy: {
    type: String,
    optional: true
  },
  approvedAt: {
    type: Date,
    optional: true,
    autoValue: function() {
      if (this.isInsert && !this.isSet) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  }
});

/**
 * Promotion Parameter Schema
 */
Core.Schemas.PromotionParameter = new SimpleSchema({
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  parameterNameInParentSchema: {
    type: String
  },
  dataType: {
    type: String
  },
  isLookUp: {
    type: Boolean
  },
  lookUpObject: {
    type: String,
    optional: true,
    trim: true
  },
  lookUpField: {
    type: String,
    optional: true,
    trim: true
  },
  friendlyName: {
    type: String,
    optional: true
  },
  friendlyName2: {
    type: String,
    optional: true
  }
});

/**
 * Promotion Rule Schema
 */
Core.Schemas.PromotionRule = new SimpleSchema({
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  name: {
    optional: true,
    type: String
  },
  promotionParameterId: {
    type: String,
    optional: true,
    index: 1
  },
  parameterNameInParentSchema: {
    type: String,
    autoValue: function() {
      let promotionParameterId = this.siblingField('promotionParameterId').value;
      if (promotionParameterId) {
        let promotionParamater = PromotionParameters.findOne(promotionParameterId);
        if (promotionParamater) {
          return promotionParamater.parameterNameInParentSchema;
        }
      }
    },
    optional: true,
  },
  subParamValue: {
    type: String | Number,
    optional: true
  },
  subParamPreview: {
    type: String | Number,
    optional: true
  },
  operator: {
    type: String,
    optional: true
  },
  value: {
    type: String | Number | Date,
    optional: true
  },
  previewVal: {
    type: String | Number | Date,
    optional: true
  },
  from: {
    type: Date,
    optional: true
  },
  to: {
    type: Date,
    optional: true
  }
});

/**
 * Promotion Reward Schema
 */
Core.Schemas.PromotionReward = new SimpleSchema({
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  type: {
    type: String,
    optional: true
  },
  subType: {
    type: String,
    optional: true
  },
  previewSubType: {
    type: String,
    optional: true
  },
  subTypeValue: {
    type: String,
    optional: true
  },
  previewSubTypeValue: {
    type: String,
    optional: true
  },
  uom: {
    type: String,
    optional: true
  },
  previewUom: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  },
  applied: {
    type: Boolean,
    optional: true
  }
});

/*
 * Promotion Reward SubType
 */
Core.Schemas.PromotionRewardSubType = new SimpleSchema({
  name: {
    type: String
  },
  code: {
    type: String
  },
  lookUpObject: {
    type: String,
    optional: true
  }
});

/*
 * Promotion Reward Measure
 */
Core.Schemas.PromotionRewardMeasure = new SimpleSchema({
  name: {
    type: String
  },
  code: {
    type: String
  }
});

/*
 * Promotion Reward Parameter
 */
Core.Schemas.PromotionRewardParameter = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
  },
  type: {
    type: String
  },
  subType: {
    type: [Core.Schemas.PromotionRewardSubType],
    optional: true
  },
  uom: {
    type: [Core.Schemas.PromotionRewardMeasure],
    optional: true
  }
});

/**
 * Promotion Rebate
 */
Core.Schemas.PromotionRebate = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  rebateNumber: {
    type: Number,
    index: 1,
    autoValue: function() {
      let currentPromo = PromotionRebates.findOne({}, { sort: { rebateNumber: -1 } });
      let newNumber = currentPromo && !_.isNaN(Number(currentPromo.rebateNumber)) ? Number(currentPromo.rebateNumber) + 1 : 9100000001;
      if (this.isInsert) {
        return newNumber
      } else if (this.isUpsert) {
        return {
          $setOnInsert: newNumber
        };
      }
    },
    denyUpdate: true
  },
  type: {
    type: String,
    optional: true
  },
  promotionId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  promotionName: {
    type: String,
    optional: true,
    autoValue: function() {
      let promotionId = this.field('promotionId').value;
      if (promotionId) {
        let promo = Promotions.findOne(promotionId);
        if (promo) {
          return promo.name;
        }
      }
    }
  },
  customerId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  customerNumber: {
    type: String,
    optional: true,
    autoValue: function() {
      let customerId = this.field('customerId').value;
      if (customerId) {
        let customer = Customers.findOne(customerId);
        if (customer) {
          return customer.customerNumber;
        }
      }
    }
  },
  userId: {
    type: String,
    index: 1,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  orderId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  orderNumber: {
    type: Number,
    optional: true,
    autoValue: function() {
      let orderId = this.field('orderId').value;
      if (orderId) {
        let order = Orders.findOne(orderId);
        if (order) {
          return order.orderNumber;
        }
      }
    }
  },
  customerName: {
    type: String,
    optional: true,
    autoValue: function() {
      let customerId = this.field('customerId').value;
      if (customerId) {
        let customer = Customers.findOne(customerId);
        if (customer) {
          return customer.name;
        }
      }
    }
  },
  value: {
    type: String,
    optional: true
  },
  currency: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    allowedValues: ["applied", "pending"],
    defaultValue: "pending",
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: function() {
      let userId = this.value || this.userId;
      if (this.isInsert) {
        return userId;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: userId
        };
      }
    },
    denyUpdate: true
  },
  history: {
    type: [Core.Schemas.PromotionHistory],
    optional: true,
    autoValue: function() {
      // check for new promotion event
      if (this.isInsert) {
        return [{
          event: "CREATE",
          userId: this.userId,
          createdAt: new Date
        }];
      } else {
        if (this.field("status").isSet) {
          let rebates = PromotionRebates.findOne(this.docId);
          let status = this.field("status").value;
          if (rebates.status !== status) {
            return {
              $push: {
                event: "STATUS_CHANGE",
                newValue: this.field("status").value,
                userId: this.userId,
                createdAt: new Date
              }
            };
          }
        }
      }
    }
  }
});

/**
 * Promotion Schema
 */
Core.Schemas.Promotion = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  exclusive: {
    type: Boolean,
    optional: true
  },
  priority: {
    type: String,
    allowedValues: ["high", "normal", "low"],
    optional: true,
    defaultValue: "low"
  },
  name: {
    type: String,
    optional: true
  },
  currency: {
    type: String,
    optional: true
  },
  startDate: {
    type: Date,
    optional: true
  },
  endDate: {
    type: Date,
    optional: true
  },
  status: {
    type: String,
    allowedValues: ["active", "pending", "suspended", "ended"],
    index: 1,
    defaultValue: "pending",
    optional: true
  },
  rules: {
    type: [Core.Schemas.PromotionRule],
    optional: true
  },
  rewards: {
    type: [Core.Schemas.PromotionReward],
    optional: true
  },
  userId: {
    type: String,
    index: 1,
    autoValue: function() {
      if (this.isInsert) {
        if (this.isSet && Meteor.isServer) {
          return this.value;
        } else {
          return this.userId;
        }
      }
    },
    optional: true,
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return {
          $set: new Date
        };
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: function() {
      if (this.isInsert) {
        return this.userId;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: this.userId
        };
      }
    },
    denyUpdate: true,
    optional: true
  },
  approvals: {
    type: [Core.Schemas.PromotionApproval],
    optional: true
  },
  history: {
    type: [Core.Schemas.PromotionHistory],
    optional: true,
    autoValue: function() {
      // check for new promotion event
      if (this.isInsert) {
        return [{
          event: "CREATE",
          userId: this.userId,
          createdAt: new Date
        }];
      } else {
        if (this.field("status").isSet) {
          let promotion = Promotions.findOne(this.docId);
          let status = this.field("status").value;
          if (promotion.status !== status) {
            return {
              $push: {
                event: "STATUS_CHANGE",
                newValue: this.field("status").value,
                userId: this.userId,
                createdAt: new Date
              }
            };
          }
        }
      }
    }
  }
});
