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

        return function register(fn) {
            if (Array.isArray(fn)) {
                var constructor = fn.splice(fn.length - 1, 1)[0],
                    dependencies = fn;

                var key = constructor.name;

                if (!container.has(key)) {
                    container.set(key, {
                        constructor: constructor,
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
                    callback(createInstance(container, name));
                });
            }
        };
    }
}

function doRegister(container, constructor) {
    if (!container.has(constructor.name))
        container.set(constructor.name, constructor);
}

function createInstance(container, name) {
    if (!container.has(name)) throw (name + ' Not found in container, please register first.');
    var cachedInstance = container.get(name);
    var dependencyIns = createDependentInstance(container, cachedInstance, []);

    var instance = Object.create(cachedInstance.constructor.prototype);
    cachedInstance.constructor.apply(instance, dependencyIns);
    return cachedInstance;
}

function createDependentInstance(container, cachedInstance, args) {
    console.log(cachedInstance.constructor.name);

    for (var i = 0; i < cachedInstance.dependencies.length; i++) {
        var name = cachedInstance.dependencies[i];
        var cachedInstance1 = container.get(name);

        if (cachedInstance1.dependencies.length > 0) {
            //var cachedInstance1 = container.get(cachedInstance.dependencies.shift());
            createDependentInstance(container, cachedInstance1, args);
        }
        var instance = Object.create(cachedInstance1.constructor.prototype);
        cachedInstance1.constructor.apply(instance, []);
        args.push(instance);

    };

    var instance1 = Object.create(cachedInstance.constructor.prototype);
    cachedInstance.constructor.apply(instance1, args);

    return instance1;
}

//directives

function tControllerCompile(di) {
    var controllers = document.body.querySelectorAll('[t-controller]');
    for (var key in controllers) {
        if (controllers.hasOwnProperty(key)) {
            var element = controllers[key];
            var ctrlName = element.getAttribute('t-controller');
            var ctrlObj = di.get(ctrlName).then(function (obj) {
                console.log(obj);
            });

        }
    }
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
