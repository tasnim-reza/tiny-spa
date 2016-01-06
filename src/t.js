(function bootstrap(window, document) {

    var dResolver = createDepedencyResolver();

    loadViewBasedOnHash(window.location.hash, document.body, null, dResolver);

    window.onhashchange = function (url) {
        loadViewBasedOnHash(window.location.hash, document.body, null, dResolver);
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

                    bindEvents(di, element);
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

            function bindEvents(di, ctrlEl) {
                var ctrlName = ctrlEl.getAttribute('t-controller');
                var tBind = ctrlEl.querySelectorAll('[t-bind]');
                for (var key in tBind) {
                    var elm = tBind[key];
                    var attrs = elm.attributes;
                    console.log(attrs);

                    (function (localCtrlName, localAttrs, localTbind) {
                        var lCtrlName = localCtrlName,
                            lbtn = localTbind,
                            lattrs = localAttrs;

                        if (lattrs && lattrs['onclick']) {
                            var onclick = lattrs['onclick'];
                            var controll = onclick.ownerElement;
                            var fn = controll.getAttribute('onclick');

                            var ctrlObj = di.getAsync(lCtrlName).then(function (obj) {

                                var bounded = obj['onclick'].bind(obj);

                                controll.addEventListener('click', bounded, false);
                                console.log(obj);
                            });
                        }
                    })(ctrlName, attrs, tBind);
                };
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

    function loadViewBasedOnHash(hash, element, parentName, dResolver) {
        if (hash) {
            var token = hash.split('/');
            var templateUrl = null;

            if (token[0] === '#')
                token.shift();

            if (token[0]) {
                templateUrl = token[0];
                //loadView(element, templateUrl, parentName);
                (function name(lelement, ltemplateUrl, lparentName) {
                    var selector = lparentName ? '[t-view="' + lparentName + '"]' : '[t-view]';
                    ltemplateUrl = 'views/' + ltemplateUrl;
                    lelement = lelement.querySelector(selector);
                    //check if already loaded

                    new templateLoaderService(ltemplateUrl, function (evt) {
                        lelement.innerHTML = evt;

                        var scriptTags = lelement.querySelectorAll('script');

                        if (scriptTags.length > 0) {
                            var srcs = [];
                            for (var idx in scriptTags) {
                                if (scriptTags.hasOwnProperty(idx)) {
                                    var src = scriptTags[idx].getAttribute('src');
                                    srcs.push(src);
                                }
                            }

                            //ToDo: need to check duplicate load
                            new scriptLoaderService(srcs, function () {
                                compile(lelement, dResolver);
                            });
                        } else {
                            compile(lelement, dResolver);
                        }




                        //ToDo: need to handle complex view loading
                        var hasParent = token.length > 1;

                        if (hasParent) {
                            parentName = token[0];
                            token.shift();
                            loadViewBasedOnHash(token.toString(), element, parentName, dResolver);
                        }

                    }, function (evt) {
                        console.log('error', evt);
                    });

                })(element, templateUrl, parentName);
            }
        }
        else {
            window.location.hash = '#/dashboard';
        }
    }

    function loadView(element, templateUrl, parentName) {


    }

    function loadTemplate(element, templateUrl) {
        new templateLoaderService(templateUrl, function (evt) {
            element.innerHTML = evt;
            var scriptTags = element.querySelectorAll('script');

            if (scriptTags.length > 0) {
                var srcs = [];
                for (var idx in scriptTags) {
                    if (scriptTags.hasOwnProperty(idx)) {
                        var src = scriptTags[idx].getAttribute('src');
                        srcs.push(src);
                    }
                }
                //new scriptLoaderService(srcs, compile(element.innerHTML, di));
            }
            //compile(element,);
            //element.addEventListener('onload', function () {
            //    console.log('onload');
            //    element.removeEventListener('onload');
            //});

            return element.innerHTML;
        }, function (evt) {
            console.log('error', evt);
        });
    }

    //public api
    window.ts = dResolver;
})(window, document);
