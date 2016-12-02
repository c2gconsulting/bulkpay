/*****************************************************************************/
/* Paygrades: Event Handlers */
/*****************************************************************************/
Template.Paygrades.events({
    'click #createPaygrade': (e, tmpl) => {
        e.preventDefault();
        Modal.show('PaygradeCreate');
    },
    'click input': function(e,tmpl) {
        var x = $(e.target).is(":checked").val();
        console.log(x);
    }
});

/*****************************************************************************/
/* Paygrades: Helpers */
/*****************************************************************************/
Template.Paygrades.helpers({
    fixed: (paytype) => {
        return paytype.derivative == "Fixed"
    },
    paytypes: () => {
        return Template.instance().get('assigned');
    }
});

/*****************************************************************************/
/* Paygrades: Lifecycle Hooks */
/*****************************************************************************/
Template.Paygrades.onCreated(function () {
    let self = this;
    var dict = new ReactiveDict('myDict');
    dict.set("assigned", {})
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

        var listFormulas = (function() {
            var container = document.querySelector('#suportedList'),
                ul = document.createElement('ul');

            container.appendChild(ul);

            //var methods = [];
            //for (var method in rules.helper.SUPPORTED_FORMULAS) {
            //  methods.push(method);
            //}
            //methods.sort();

            var methods = rules.helper.SUPPORTED_FORMULAS.sort();

            methods.forEach(function (item) {
                var li = document.createElement('li'),
                    a = document.createElement('a');

                a.href = 'http://www.stoic.com/pages/formula/function?function=' + item;
                a.target = '_blank';
                a.innerHTML = item;

                li.appendChild(a);
                ul.appendChild(li);
            });

        })();

    })();
});

Template.Paygrades.onDestroyed(function () {
});
