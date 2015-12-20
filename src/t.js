(function bootstrap(window) {

    var container = new Map();

    var di = new IoC(container, register);
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
    tControllerCompile(di, container);

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

        return di.register;
    }

    function register(serviceName, filesToBeLoaded, fn) {
        var names = serviceName.split(':');
        var funcName = names[0].trim();
        var parent = null;

        if (names.length > 1) {
            parent = names[1].trim();
        }

        var service = fn && fn.splice(fn.length - 1, 1)[0],
            dependencies = fn;

        if (!container.has(funcName)) {
            container.set(funcName, {
                service: service,
                parent: parent,
                viewParent: null,
                dependencies: dependencies
            });
        } else {
            //comes here to override or register the callbak
            var registeredItem = container.get(funcName);
            if (service)
                registeredItem.service = service;
            if (parent)
                registeredItem.parent = parent;
            if (dependencies)
                registeredItem.dependencies = dependencies;
        }

    };

})(window);

//di
function IoC(container, register) {
    var viewParentCache = []; // this should be clear after route change

    function getInstance(funcName) {
        // ToDo: have to think for lazy loaded controllers
        if (!container.has(funcName)) throw (funcName + ' Not found in container, please register first.');
        var referenedFunc = container.get(funcName);

        if (referenedFunc.parent) {
            var parentInstance = getInstance(referenedFunc.parent);
            referenedFunc.service.prototype = parentInstance;
        }

        if (viewParentCache[funcName])
            return viewParentCache[funcName];

        var instance = Object.create(referenedFunc.service.prototype);
        var actualInstance = createInstance(referenedFunc.service, instance, referenedFunc.dependencies);

        if (referenedFunc.viewParent && !viewParentCache[referenedFunc.viewParent]) {
            viewParentCache[referenedFunc.viewParent] = actualInstance;
        }

        return actualInstance;
    }

    function createInstance(fn, instance, dependencies) {
        var args = [];

        for (var i = 0; i < dependencies.length; i++) {
            var fnName = dependencies[i];
            args.push(getInstance(fnName));
        };

        fn.apply(instance, args);

        return instance;
    }

    this.register = register;

    this.get = function (name) {
        return {
            then: function then(callback) {
                setTimeout(function () {
                    callback(getInstance(name));
                });
            }
        };
    }
}


//directives

function tControllerCompile(di, container) {
    var controllers = document.body.querySelectorAll('[t-controller]');
    for (var key in controllers) {
        if (controllers.hasOwnProperty(key)) {
            var element = controllers[key];

            buildParentalRelation(di, container, controllers, 0, 0);

            var ctrlName = element.getAttribute('t-controller');
            var button = element.querySelector('[t-click]');
            bindEvents(di, ctrlName, button);
        }
    }
}

function buildParentalRelation(di, container, controllers, currentIdx, nextIdx) {
    nextIdx++;
    if (nextIdx > controllers.length) {
        currentIdx++;
        nextIdx = currentIdx + 1;
    }

    if (controllers.length === currentIdx) {
        return;
    }

    var parent = controllers[currentIdx],
        child = controllers[nextIdx];

    if (parent.contains(child)) {
        var parentCtrlName = getControllerName(parent),
            childCtrlName = getControllerName(child);

        if (!container.has(parentCtrlName))
            di.register(parentCtrlName);

        if (!container.has(childCtrlName))
            di.register(childCtrlName);

        var registeredChild = container.get(childCtrlName),
        registeredParent = container.get(parentCtrlName);

        registeredParent.viewParent = parentCtrlName;
        registeredChild.parent = parentCtrlName;
    }

    buildParentalRelation(di, container, controllers, currentIdx, nextIdx);
}

function getControllerName(elm) {
    return elm.getAttribute('t-controller');
}

function bindEvents(di, ctrlName, button) {
    (function (localCtrlName, localButton) {
        var lCtrlName = localCtrlName, lbtn = localButton;
        var ctrlObj = di.get(lCtrlName).then(function (obj) {
            lbtn.addEventListener('click', obj['onclick'].bind(obj), false);
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
