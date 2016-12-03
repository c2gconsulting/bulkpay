import { Tracker } from 'meteor/tracker';
Template.BuDetail.events({
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
            'depth': 3,
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