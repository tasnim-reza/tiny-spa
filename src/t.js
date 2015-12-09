(function bootstrap(window) {

    var container = new Map();

    var di = new IoC(container);
    //register namespace to global
    window.namespace = namespace;

    loadViewBasedOnHash();

    window.onhashchange = function (url) {
        loadViewBasedOnHash();
    };

    //template load based on anchor/other element click t-route
    tRoute();

    //template load in line ng-include
    tLoad();

    //compile
    tControllerCompile(di);

    function namespace(name) {
        var self = this,
            ns = name;


        //var register = {
        //    controller: function () {

        //    },
        //    parentController: function () {

        //    },
        //    viewParentController: function () {

        //    },

        //    service: function () {

        //    },
        //    parentService: function () {

        //    },
        //    staticService: function () {

        //    },
        //    callBack: function () {

        //    }
        //};

        return function register(serviceName, filesToBeLoaded, fn) {
            var names = serviceName.split(':');
            var key = names[0];
            var parent = names.length > 1 ? names[1] : null;

            if (Array.isArray(fn)) {
                var service = fn.splice(fn.length - 1, 1)[0],
                    dependencies = fn;

                if (!container.has(key)) {
                    container.set(key, {
                        service: service,
                        parent: parent,
                        dependencies: dependencies
                    });
                }
            }
        };
    }

})(window);

//di
function IoC(container) {
    this.get = function (name) {
        return {
            then: function then(callback) {
                setTimeout(function () {
                    callback(getInstance(container, name));
                });
            }
        };
    }
}

function doRegister(container, constructor) {
    if (!container.has(constructor.name))
        container.set(constructor.name, constructor);
}

function getInstance(container, funcName) {
    if (!container.has(funcName)) throw (funcName + ' Not found in container, please register first.');
    var referenedFunc = container.get(funcName);

    if (referenedFunc.parent) {
        var parentInstance = getInstance(container, referenedFunc.parent);
        referenedFunc.service.prototype = parentInstance;
    }

    var instance = Object.create(referenedFunc.service.prototype);

    return createInstance(container, referenedFunc.service, instance, referenedFunc.dependencies);
}

function createInstance(container, fn, instance, dependencies) {
    var args = [];

    for (var i = 0; i < dependencies.length; i++) {
        var fnName = dependencies[i];
        args.push(getInstance(container, fnName));
    };

    fn.apply(instance, args);

    return instance;
}

//directives

function tControllerCompile(di) {
    var controllers = document.body.querySelectorAll('[t-controller]');
    for (var key in controllers) {
        if (controllers.hasOwnProperty(key)) {
            var element = controllers[key];
            var ctrlName = element.getAttribute('t-controller');
            var button = element.querySelector('[t-click]');
            bindEvents(di, ctrlName, button);
        }
    }
}
function bindEvents(di, ctrlName, button) {
    (function (localCtrlName, localButton) {
        var lCtrlName = localCtrlName, lbtn = localButton;
        var ctrlObj = di.get(lCtrlName).then(function (obj) {
            lbtn.onclick = obj['onclick'];
            console.log(obj);
        });
    })(ctrlName, button);
}

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
