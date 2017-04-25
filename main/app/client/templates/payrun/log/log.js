/*****************************************************************************/
/* Log: Event Handlers */
/*****************************************************************************/
Template.Log.events({
    'click #createPaygrade': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PaygradeCreate');
    }
});

/*****************************************************************************/
/* Log: Helpers */
/*****************************************************************************/
Template.Log.helpers({
    fixed: (paytype) => {
        return paytype.derivative == "Fixed"
    },
    'Log': () => {
        return Log.find();
    }
});

/*****************************************************************************/
/* Log: Lifecycle Hooks */
/*****************************************************************************/
Template.Log.onCreated(function () {
    let self = this;

});

Template.Log.onRendered(function () {
    console.log("template data for payroll log is ", Template.instance().data);
    const data = Template.instance().data;

    const tree = [
        // {
        //     name: 'node1',
        //     children: [
        //         { name: 'child1' },
        //         { name: 'child2' }
        //     ]
        // },
        // {
        //     name: 'node2',
        //     children: [
        //         { name: 'child3' }
        //     ]
        // }
    ];

    data.forEach(x => {
        const node = {
            name: `Computing Value for paytype \"${x.paytype}\"`,
            children: [
                {name: 'Input', children: Core.getInput(x.input)},
                {name: 'Processing', children: Core.getProc(x.processing)}
            ]
        };
        tree.push(node);
        //build log data into tree structure.
    });

    $('#log').tree({
        data: tree
    });
});

Template.Log.onDestroyed(function () {

});
Core.getInput = function(arr){
    const newArr = [...arr];
    const children = newArr.map(x => {
        return {name: `${x.code} = ${x.value}`}

    });
    return children;
};

Core.getProc = function(arr){
    const newArr = [...arr];
    const children = newArr.map(x => {
        if(x.taxBucket){
            return {name: `taxBucket = ${x.taxBucket}`}
        } else if(x.pensionBucket){
            return {name: `pensionBucket = ${x.pensionBucket}`}
        } else {
            const obj = {name: `${x.code} ` };
            if(x.previous){
                obj.name += ` previous = ${x.previous}`;
            }
            if(x.derived){
                obj.name += ` derived = ${x.derived}`;
            }
            return obj;
        }
    });
    return children;
}
