_.extend(Core, {
    // customize publish to ensure logged in user before publishing
    publish: function(name, callback) {
        Meteor.publish(name, function() {
            if (!this.userId) {
                return this.ready();
            }
            var bound = _.bind(callback, this);
            return bound.apply(this, arguments);
        });
    },
    publishComposite: function(name, callback) {
        Meteor.publishComposite(name, function() {
            if (!this.userId) {
                return this.ready();
            }
            var bound = _.bind(callback, this);
            return bound.apply(this, arguments);
        });
    }
});