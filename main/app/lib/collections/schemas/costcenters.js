
/**
 * CostCenters Schema
 */
 Core.Schemas.CostCenter = new SimpleSchema({
    _id: {
        type: String,
        optional: true,
    },
    controlling_area: {
        type: Number,
        optional: true
    },
    cost_center: {
        type: String,
        optional: true
    },
    cost_center_general_name: {
        type: String,
        optional: true
    },
    cost_center_description: {
        type: String,
        optional: true
    },
    company_code: {
        type: Number,
        optional: true
    },
    person_responsible: {
        type: String,
        optional: true
    },
    person_responsible_user: {
        type: String,
        optional: true
    },
    person_responsible_employee_number: {
        type: String,
        optional: true
    },
    department: {
        type: String,
        optional: true
    },
    functional_area: {
        type: String,
        optional: true
    },
    valid_from: {
        type: String,
        optional: true
    },
    valid_to: {
        type: String,
        optional: true
    },
    name: {
        type: String,
        optional: true
    },
    description: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    }
});
