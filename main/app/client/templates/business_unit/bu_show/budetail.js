import { Tracker } from 'meteor/tracker';
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
    'click .addnode': (e, tmpl) => {
        e.preventDefault();
        let selectedNode = $(e.target).closest('.node')[0].id;
        Modal.show('EntityCreate', {node: selectedNode, action: "create"});
    },
    'click .deletenode': (e, tmpl) => {
        e.preventDefault();
        var selectedNode = $(e.target).closest('.node')[0].id;
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
                if(!err){
                    console.log(res);
                    Tracker.flush();
                    swal("Deleted!", "Node deleted" , "success");
                } else {
                    console.log(err);
                    swal("Deleted!", err , "Error");
                }
            })

        });
    },
    'click .editnode': (e, tmpl) => {
        e.preventDefault();
        let selectedNode = $(e.target).closest('.node')[0].id;
        console.log(selectedNode);
        Modal.show('EntityCreate', {node: selectedNode, action: "edit"});
    },
    'click .node': (e, tmpl) => {
        let selectedNode = $(e.target).closest('.node')[0].id;
        Session.set('node', selectedNode);
    }
});

Template.BuDetail.onCreated(function(){
    //reactively subscribe to all children of parents
    var self = this;
    //self.dict = new ReactiveDict();
    //set session to root node company
    Session.set('node', "root");
});

Template.BuDetail.onRendered(function(){
    let self = this;
    let root = self.data;

        let businessId = Session.get('context');
        console.log("From autorun:", EntityObjects.find().count()) ;//--->Line1
        Meteor.call('entityObject/getBaseCompany', businessId, function(err, res){
            if(!err){
                //clear all content of orgchart
                $('#chart-container').html('');
                initOrgchart(root._id,res);
            } else {
                console.log(err);
            }
        });

    /* rootClass Object data obj*/
    function initOrgchart(rootClass, data) {
        $('#chart-container').orgchart({
            'chartClass': rootClass,

            //get data from session or reactive variable
            'data' : data,
            'nodeContent': 'otype',
            'draggable': true,
            'depth': 2,
            'dropCriteria': function($draggedNode, $dragZone, $dropZone) {
                if($draggedNode.find('.content').text().indexOf('Company') > -1 && $dropZone.find('.content').text().indexOf('Unit') > -1) {
                    return false;
                }
                return true;
            },
            'createNode': function($node, data) {
                //var infoMenuIcon = $('<i>', {
                //    'class': 'fa fa-info-circle drill-icon info',
                //    click: function() {
                //        $(this).siblings('.info-menu').toggle();
                //    }
                //});
                //var infoMenu = '<div class="info-menu"><img class="avatar" src="/img/avatar/1.jpg"></div>';

                var infoMenu = '<div class="acMenu drill-icon info"><a class="btn btn-default dropdown-toggle" data-toggle="dropdown">'
                    + '<i class="fa fa-cog"></i></a><ul class="dropdown-menu pull-right" role="menu"><li><a href="#" data-toggle="tooltip" title="Create Menu" class="addnode">Create Object</a></li><li><a href="#" class="editnode">Edit Object</a></li>'
                    + '<li><a href="#" class="deletenode">Delete</a></li></ul></div>';
                $node.append(infoMenu);

            }
        })
            .children('.orgchart').on('nodedropped.orgchart', function(event) {
                console.log(event.draggedNode.children('.title').text() + 'moved to ' + event.dropZone.children('.title').text() + ' under ' + event.dragZone.children('.title').text());
            });
    };

});