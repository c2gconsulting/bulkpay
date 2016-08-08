Template.DistributorOrdersSection.helpers({
    textStyle: function() {
        if (this.status === 'open') return 'text-warning';
        if (this.status === 'accepted') return 'text-info';
        if (this.status === 'shipped') return 'text-success';
        if (this.status === 'cancelled') return 'text-danger';
    }
});
