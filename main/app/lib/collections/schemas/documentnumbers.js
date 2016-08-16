Core.Schemas.DocumentNumber = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    documentType: {
        type: String,
        denyUpdate: true
    },
    nextSeqNumber: {
        type: Number,
        index: 1,
        autoValue: function () {
            // initialise document number range with seed or with current next number if numbering already active
            if (this.isInsert || this.isUpsert) {
                let documentType = this.field('documentType').value;
                let collection, numberField, seed, typeset, nextSeqNumber;
                switch(documentType) {
                    case 'employee':
                        collection = Employees;
                        numberField = 'employeeNumber';
                        seed = 1000000001;
                        typeset = true;
                        break;
                    case 'job':
                        collection = Jobs;
                        numberField = 'jobNumber';
                        seed = 5000000001;
                        typeset = true;
                        break;
                    case 'businessunit':
                        collection = BusinessUnits;
                        numberField = 'businessUnitNumber';
                        seed = 6000000001;
                        typeset = true;
                        break;
                    case 'division':
                        collection = Divisions;
                        numberField = 'divisionNumber';
                        seed = 4000000001;
                        typeset = true;
                        break;
                    case 'position':
                        collection = Positions;
                        numberField = 'positionNumber';
                        seed = 2000000001;
                        typeset = true;
                        break;
                    case 'department':
                        collection = Departments;
                        numberField = 'departmentNumber';
                        seed = 3000000001;
                        typeset = true;
                }
                let options = { sort: {}};
                if (typeset) {
                    options.sort[numberField] = -1;
                    let currentDoc = collection.findOne({}, options);
                    nextSeqNumber = currentDoc && !_.isNaN(Number(currentDoc[numberField])) ? Number(currentDoc[numberField]) + 1 : seed;
                    if (this.isInsert) {
                        return nextSeqNumber;
                    } else if (this.isUpsert) {
                        return {
                            $setOnInsert: nextSeqNumber
                        };
                    }
                }
            }
        }
    },
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            return new Date
        }
    }
});
