Template.navigator.onRendered(function () {
    Deps.autorun(function () {
        initAll();
    });
});