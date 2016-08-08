/*****************************************************************************/
/* Spinbox: Event Handlers */
/*****************************************************************************/
Template.spinbox.events({
	'click .spinbox-down': function(e, tmpl) {
                let v = tmpl.$('input.spinbox-input').val();
                let min = tmpl.data && tmpl.data.min ? tmpl.data.min : 0;

                if (v > min) {
                    tmpl.$('input.spinbox-input').val(--v);
                    tmpl.$('input.spinbox-input').trigger('change');
                }
        },
        'click .spinbox-up': function(e, tmpl) {
                let v = tmpl.$('input.spinbox-input').val();
                let max;
                if (tmpl.data && tmpl.data.max) max = tmpl.data.max;

                if (!max || v < max) {
                        tmpl.$('input.spinbox-input').val(++v);
                        tmpl.$('input.spinbox-input').trigger('change');
                }
        }
});

/*****************************************************************************/
/* Spinbox: Helpers */
/*****************************************************************************/
Template.spinbox.helpers({
});

/*****************************************************************************/
/* Spinbox: Lifecycle Hooks */
/*****************************************************************************/
Template.spinbox.onCreated(function () {
});

Template.spinbox.onRendered(function () {
});

Template.spinbox.onDestroyed(function () {
});
