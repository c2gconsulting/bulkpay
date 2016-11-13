Template.BuDetail.events({
    'click #delete-bu': function(event, tmpl){
        event.preventDefault();
        //Check user is authorized to delete business unit
        let bu = this._id;
        //swal("are you sure", "do you want to delete ")
        swal({
                title: "Are you sure?",
                text: "All Objects Under this Business will be deleted!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                Meteor.call('businessunit/delete', bu, function(err, res){
                    if(err){
                        swal("Error!", "Cannot delete company", "error");
                    } else {
                        //swal("Good job!", "You clicked the button!", "success");
                        //Router.go('businessunits');
                        swal("Deleted!", "Company Deleted", "success");
                    }

                });


            });
    },
    'click .node': (e, tmpl) => {
        //set context to the id of the closest node
        //simulate get decendants
        Meteor.call('entityObject/getDecendants', $(e.target).parent('.node')[0].id, function(err, res){
            if(!err){
                console.log(res);
            } else {
                console.log(err);
            }
        });

    },
    'click .down': (e, tmpl) => {
        var selectedNode = $(e.target).parent('.node')[0].id;
        if(selectedNode){
            tmpl.dict.set('selectedEntity', selectedNode);
        }
    },
    'click .up': (e, tmpl) => {
        var selectedNode = $(e.target).parent('.node')[0].id;
        var entity = EntityObjects.findOne({_id: selectedNode});
        if(entity){
            tmpl.dict.set('selectedEntity', entity.parentId);
        }
    },
    'click .addnode': (e, tmpl) => {
        let selectedNode = $(e.target).parent('.node')[0].id;
        let data = EntityObjects.findOne({_id: selectedNode});
        Modal.show('EntityCreate', data);
    },
    'click .deletenode': (e, tmpl) => {
        var selectedNode = $(e.target).parent('.node')[0].id;
        swal({
            title: "Are you sure?",
            text: "This node will only be deleted if there are no active children",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function(){
            Meteor.call("entityObject/delete", selectedNode, function(err,res){
                if(err){
                    console.log(err);
                    swal("Deleted!", "Node deleted" , "success");
                } else
                    console.log(res);
            })

        });
    },
    'click .editnode': (e, tmpl) => {
        Modal.show('PositionCreate');
    },
    'hover .node': (e, tmpl) => {
        $(e.target).closest('.add').toggleClass('hidden');
    }
});

Template.BuDetail.onCreated(function(){
    //reactively subscribe to all children of parents
    var self = this;
    self.dict = new ReactiveDict();
});

Template.BuDetail.onRendered(function(){
    var self = this;
    self.autorun(function(){
        var entity = self.dict.get('selectedEntity');
        if(entity){
            //subscribe to only selected entity when node is clicked or selected Always return parent and children
            Meteor.subscribe('getChildrenEntityObject', entity, getEntity);
        } else {
            //only subscibe to all root objects without parentId
            Meteor.subscribe('getRootEntities', self.data._id, getEntity);
        }
    });
    function getEntity(){
        var entity = self.dict.get('selectedEntity');
        var root, cname;
        //get selected entity if it exists or set root as selected business unit
        if(entity){
            var cursor = EntityObjects.find({_id: entity}).fetch();
            root = cursor[0]; assoClass = "asso-" + entity;
            cname =  assoClass + ' drill-up';

        } else {
            root = self.data;
            assoClass = 'root-node';
            cname =  assoClass;
        };
        $('#chart-container').find('.orgchart:visible').addClass('hidden');
        rootObject = {
            'id': root._id,
            'className': cname + ' top-level',
            'name': root.name,
            'otype': root.otype || "Company",
            'children': getChildren(root._id)

        };
        //check if association already initialized and hidden to false only instantiate none existing orgchart
        if($('#chart-container').find('.' + assoClass).closest('.orgchart').length > 0){
            $('#chart-container').find('.' + assoClass).closest('.orgchart').removeClass('hidden');
            console.log('Rerrendering org chart');
        } else {
            //do not instantiate org chart
            initOrgchart(cname);
            console.log('Initializing and lazyloading orgchart');
        };
        $("[data-toggle=popover]")
            .popover({html:true});
        $('[data-toggle="tooltip"]').tooltip();

    }

    function getChildren(parent){
        var object = EntityObjects.findOne({_id: parent});
        var children = [], all;
        if(object){
            //get all direct children ** no recursive query to avoid server overload
            all = EntityObjects.find({parentId: parent}).fetch(); // no need to specify object type and any hierachy can be defined
        } else {
            //means the object is a company
            all = EntityObjects.find().fetch();
        }
        all.forEach((x) => {
            var child = {};
            child.name = x.name; child.id = x._id; child.className = "middle-level drill-down asso-" + parent; child.otype = x.otype;
            children.push(child);
            //
        });
        return children;
    };

    function initOrgchart(rootClass) {
        $('#chart-container').orgchart({
            'chartClass': rootClass,

            //get data from session or reactive variable
            'data' : rootObject,
            'nodeContent': 'otype',
            'draggable': true,
            'dropCriteria': function($draggedNode, $dragZone, $dropZone) {
                if($draggedNode.find('.content').text().indexOf('Company') > -1 && $dropZone.find('.content').text().indexOf('Unit') > -1) {
                    return false;
                }
                return true;
            },
            'createNode': function($node, data) {
                if ($node.is('.drill-down')) {
                    //var assoClass = data.className.match(/asso-\w+/)[0];
                    var drillDownIcon = $('<i>', {
                        'class': 'fa fa-arrow-circle-down drill-icon down'
                    });
                    $node.append(drillDownIcon);
                } else if ($node.is('.drill-up')) {
                    //var assoClass = data.className.match(/asso-\w+/)[0];
                    var drillUpIcon = $('<i>', {
                        'class': 'fa fa-arrow-circle-up drill-icon up'
                        //can define other properties
                    });
                    $node.append(drillUpIcon);
                }
                var infoMenuIcon = $('<i>', {
                    'class': 'fa fa-info-circle menu-icon info',
                    click: function() {
                        $(this).siblings('.info-menu').toggle();
                    }
                });
                var addMenuIcon = $('<i>', {
                    'class': 'fa fa-plus menu-icon addnode',
                    'data-toggle': "tooltip",
                    'title': "Add Siblings/Children"
                });
                var deleteMenuIcon = $('<i>', {
                    'class': 'fa fa-times menu-icon deletenode',
                    'data-toggle': "tooltip",
                    'title': "Delete this object"
                });
                var editMenuIcon = $('<i>', {
                    'class': 'fa fa-pencil menu-icon editnode',
                    'data-toggle': "tooltip",
                    'title': "Edit Properties"
                });
                var infoMenu = '<div class="info-menu"><img class="avatar" src="/img/avatar/1.jpg"></div>';
                $node.append(infoMenuIcon).append(infoMenu).append(addMenuIcon).append(deleteMenuIcon).append(editMenuIcon);

            }
        })
            .children('.orgchart').on('nodedropped.orgchart', function(event) {
                swal({
                    title: "Are you sure?",
                    text: "You will not be able to recover this imaginary file!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                }, function(){
                    swal("Org Reassignment!", event.draggedNode.children('.title').text() + 'moved to ' + event.dropZone.children('.title').text() + ' under ' + event.dragZone.children('.title').text(), "success");
                });
            });
    };

});