/*****************************************************************************/
/* Paygrades: Event Handlers */
/*****************************************************************************/
Template.Paygrades.events({
    'click #createPaygrade': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PaygradeCreate');
    }
});

/*****************************************************************************/
/* Paygrades: Helpers */
/*****************************************************************************/
Template.Paygrades.helpers({
    fixed: (paytype) => {
        return paytype.derivative == "Fixed"
    }
});

/*****************************************************************************/
/* Paygrades: Lifecycle Hooks */
/*****************************************************************************/
Template.Paygrades.onCreated(function () {
    let self = this;
});

Template.Paygrades.onRendered(function () {
    (function () {

        var rules = new ruleJS('demo1');
        rules.init();

        var button = document.querySelector('button'),
            input = document.querySelector('input[type=text]'),
            result = document.querySelector('#result'),
            error = document.querySelector('#error');

        button.addEventListener('click', function () {
            result.parentNode.style.display = 'none';
            error.parentNode.style.display = 'none';

            var formula = input.value;
            var parsed = rules.parse(formula, input);

            if (parsed.result !== null) {
                result.parentNode.style.display = '';
                result.innerText = parsed.result;
            }

            if (parsed.error) {
                error.parentNode.style.display = '';
                error.innerText = parsed.error;
            }
        });

    })();
});

Template.Paygrades.onDestroyed(function () {
});
