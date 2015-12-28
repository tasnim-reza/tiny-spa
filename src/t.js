(function bootstrap(window, document) {

    var dResolver = createDepedencyResolver();

    loadViewBasedOnHash();

    window.onhashchange = function (url) {
        loadViewBasedOnHash();
    };

    //di
    function createDepedencyResolver() {
        var container = new Map();
        var staticInstance = new Map();
        var viewParentCache = []; // this should be clear after route change

        function getInstance(funcName) {
            if (staticInstance.has(funcName)) return staticInstance.get(funcName);

            // ToDo: have to think for lazy loaded controllers
            if (!container.has(funcName)) throw (funcName + ' Not found in container, please register first.');

            if (viewParentCache[funcName])
                return viewParentCache[funcName];

            var referenedFunc = container.get(funcName);

            if (referenedFunc.parent) {
                var parentInstance = getInstance(referenedFunc.parent);
                referenedFunc.service.prototype = parentInstance;
            }

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

        function getAsync(name) {
            return {
                then: function then(callback) {
                    setTimeout(function () {
                        callback(getInstance(name));
                    });
                }
            };
        }

        //get registered item not necessary item is already instantiated
        function getItem(name) {
            return container.get(name);
        }

        function hasRegistered(name) {
            return container.has(name);
        }

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

            return register;
        }

        function exec(filesToBeLaded, fn) {
            //handle files to be load

            var service = fn && fn.splice(fn.length - 1, 1)[0],
                dependencies = fn,
                arg = [];

            dependencies.forEach(function (fnName) {
                arg.push(getInstance(fnName));
            });
            var instance = Object.create(service.prototype);
            service.apply(instance, arg);
        }

        //public api
        var di = {
            namespace: namespace,
            register: register,
            exec: exec,
            getAsync: getAsync,
            get: getInstance,
            getItem: getItem,
            hasRegistered: hasRegistered
        };

        //registerStaticAndNativeServices
        staticInstance.set('rootElement', document.body);
        staticInstance.set('di', di);
        staticInstance.set('container', container);

        return di;
    }

    //compile
    dResolver.exec([], ['rootElement', 'di', compile]);

    function compile(elementNeedToBeCompile, di) {

        //template load based on anchor/other element click t-route
        tRoute();

        //template load in line ng-include
        tLoad();

        tController();

        function tController() {
            var controllers = elementNeedToBeCompile.querySelectorAll('[t-controller]');
            for (var key in controllers) {
                if (controllers.hasOwnProperty(key)) {
                    var element = controllers[key];

                    buildParentalRelation(di, controllers, 0, 0);

                    var ctrlName = element.getAttribute('t-controller');
                    bindEvents(di, ctrlName);
                }
            }

            function buildParentalRelation(di, controllers, currentIdx, nextIdx) {
                //todo - need to handle circular dependency
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

                    if (!di.hasRegistered(parentCtrlName))
                        di.register(parentCtrlName);

                    if (!di.hasRegistered(childCtrlName))
                        di.register(childCtrlName);

                    var registeredChild = di.getItem(childCtrlName),
                    registeredParent = di.getItem(parentCtrlName);

                    registeredParent.viewParent = parentCtrlName;
                    registeredChild.parent = parentCtrlName;
                }

                buildParentalRelation(di, controllers, currentIdx, nextIdx);
            }

            function getControllerName(elm) {
                return elm.getAttribute('t-controller');
            }

            function bindEvents(di, ctrlName) {
                //var button = element.querySelector('[t-click]');
                var tBind = element.querySelector('[t-bind]');

                (function (localCtrlName, localTbind) {
                    var lCtrlName = localCtrlName, lbtn = localTbind;
                    var ctrlObj = di.getAsync(lCtrlName).then(function (obj) {

                        var bounded = obj['onclick'].bind(obj);

                        lbtn.addEventListener('click', bounded, false);
                        console.log(obj);
                    });
                })(ctrlName, tBind);
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
    }

    function loadViewBasedOnHash() {
        if (location.hash) {
            var templateUrl = location.hash.split('/')[1];
            loadView(templateUrl);
        } else {
            window.location.hash = '#/dashboard';
        }
    }

    function loadView(templateUrl) {
        var view = document.body.querySelector('[t-view]');
        loadTemplate(view, 'views/' + templateUrl);
    }

    function loadTemplate(element, templateUrl) {
        new templateLoaderService(templateUrl, function (evt) {
            element.innerHTML = evt;
            //compile(element,);
            //element.addEventListener('onload', function () {
            //    console.log('onload');
            //    element.removeEventListener('onload');
            //});
        }, function (evt) {
            console.log('error', evt);
        });
    }

    //public api
    window.ts = dResolver;
})(window, document);
