
$('#t').data('foo', 'reza');

console.log($('#t').data('foo'));

var div = document.getElementById('t');
div.myName = ['lemons', 3];

console.log(div.myName);


(function appService() {


    loadViewBasedOnHash();

    window.onhashchange = function (url) {
        loadViewBasedOnHash();
    };

    //template load based on anchor/other element click t-route
    tRoute();

    //template load in line ng-include
    tLoad();


})();

function tRoute() {
    var routers = document.body.querySelectorAll('[t-route]');
    for (var key in routers) {
        if (routers.hasOwnProperty(key)) {
            var element = routers[key];
            var url = element.getAttribute('t-route'),
                templateUrl = element.getAttribute('template-url'),
                controllerUrl = element.getAttribute('controller-url');
            element.setAttribute('href', '#' + url);

            element.addEventListener('onclick', function () {
                //setTimeout((loadTemplate)(element, templateUrl));
            });
        }
    }
}

function tLoad() {
    var loaders = document.body.querySelectorAll('[t-load]');

    for (var key in loaders) {
        if (loaders.hasOwnProperty(key)) {
            var element = loaders[key];
            var templateUrl = element.getAttribute('t-load');
            setTimeout((loadTemplate)(element, templateUrl));
        }
    };
}

function loadViewBasedOnHash() {
    if (location.hash) {
        var templateUrl = location.hash.split('/')[1];
        viewLoad(templateUrl);
    } else {
        window.location.hash = '#/dashboard';
    }
}

function viewLoad(templateUrl) {
    var view = document.body.querySelector('[t-view]');
    loadTemplate(view, 'views/' + templateUrl);
}

function loadTemplate(element, templateUrl) {
    new templateLoaderService(templateUrl, function (evt) {
        element.innerHTML = evt;

        //element.addEventListener('onload', function () {
        //    console.log('onload');
        //    element.removeEventListener('onload');
        //});
    }, function (evt) {
        console.log('error', evt);
    });
}