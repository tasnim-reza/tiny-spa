'use strict';

var ARROW_ARG = /^([^\(]+?)=>/;
var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var $injectorMinErr = minErr('$injector');

function extractArgs(fn) {
    var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
        args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
    return args;
}

function anonFn(fn) {
    // For anonymous functions, showing at the very least the function signature can help in
    // debugging.
    var args = extractArgs(fn);
    if (args) {
        return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
    }
    return 'fn';
}

function annotate(fn, strictDi, name) {
    var $inject,
        argDecl,
        last;

    if (typeof fn === 'function') {
        if (!($inject = fn.$inject)) {
            $inject = [];
            if (fn.length) {
                if (strictDi) {
                    if (!isString(name) || !name) {
                        name = fn.name || anonFn(fn);
                    }
                    throw $injectorMinErr('strictdi',
                      '{0} is not using explicit annotation and cannot be invoked in strict mode', name);
                }
                argDecl = extractArgs(fn);
                forEach(argDecl[1].split(FN_ARG_SPLIT), function (arg) {
                    arg.replace(FN_ARG, function (all, underscore, name) {
                        $inject.push(name);
                    });
                });
            }
            fn.$inject = $inject;
        }
    } else if (isArray(fn)) {
        last = fn.length - 1;
        assertArgFn(fn[last], 'fn');
        $inject = fn.slice(0, last);
    } else {
        assertArgFn(fn, 'fn', true);
    }
    return $inject;
}



function createInjector(modulesToLoad, strictDi) {
    strictDi = (strictDi === true);
    var INSTANTIATING = {},
        providerSuffix = 'Provider',
        path = [],
        loadedModules = new HashMap([], true),
        providerCache = {
            $provide: {
                provider: supportObject(provider),
                factory: supportObject(factory),
                service: supportObject(service),
                value: supportObject(value),
                constant: supportObject(constant),
                decorator: decorator
            }
        },
        providerInjector = (providerCache.$injector =
            createInternalInjector(providerCache, function (serviceName, caller) {
                if (angular.isString(caller)) {
                    path.push(caller);
                }
                throw $injectorMinErr('unpr', "Unknown provider: {0}", path.join(' <- '));
            })),
        instanceCache = {},
        protoInstanceInjector =
            createInternalInjector(instanceCache, function (serviceName, caller) {
                var provider = providerInjector.get(serviceName + providerSuffix, caller);
                return instanceInjector.invoke(
                    provider.$get, provider, undefined, serviceName);
            }),
        instanceInjector = protoInstanceInjector;

    providerCache['$injector' + providerSuffix] = { $get: valueFn(protoInstanceInjector) };
    var runBlocks = loadModules(modulesToLoad);
    instanceInjector = protoInstanceInjector.get('$injector');
    instanceInjector.strictDi = strictDi;
    forEach(runBlocks, function (fn) { if (fn) instanceInjector.invoke(fn); });

    return instanceInjector;

    ////////////////////////////////////
    // $provider
    ////////////////////////////////////

    function supportObject(delegate) {
        return function (key, value) {
            if (isObject(key)) {
                forEach(key, reverseParams(delegate));
            } else {
                return delegate(key, value);
            }
        };
    }

    function provider(name, provider_) {
        assertNotHasOwnProperty(name, 'service');
        if (isFunction(provider_) || isArray(provider_)) {
            provider_ = providerInjector.instantiate(provider_);
        }
        if (!provider_.$get) {
            throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
        }
        return providerCache[name + providerSuffix] = provider_;
    }

    function enforceReturnValue(name, factory) {
        return function enforcedReturnValue() {
            var result = instanceInjector.invoke(factory, this);
            if (isUndefined(result)) {
                throw $injectorMinErr('undef', "Provider '{0}' must return a value from $get factory method.", name);
            }
            return result;
        };
    }

    function factory(name, factoryFn, enforce) {
        return provider(name, {
            $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
        });
    }

    function service(name, constructor) {
        return factory(name, [
            '$injector', function ($injector) {
                return $injector.instantiate(constructor);
            }
        ]);
    }

    function value(name, val) { return factory(name, valueFn(val), false); }

    function constant(name, value) {
        assertNotHasOwnProperty(name, 'constant');
        providerCache[name] = value;
        instanceCache[name] = value;
    }

    function decorator(serviceName, decorFn) {
        var origProvider = providerInjector.get(serviceName + providerSuffix),
            orig$get = origProvider.$get;

        origProvider.$get = function () {
            var origInstance = instanceInjector.invoke(orig$get, origProvider);
            return instanceInjector.invoke(decorFn, null, { $delegate: origInstance });
        };
    }

    ////////////////////////////////////
    // Module Loading
    ////////////////////////////////////
    function loadModules(modulesToLoad) {
        assertArg(isUndefined(modulesToLoad) || isArray(modulesToLoad), 'modulesToLoad', 'not an array');
        var runBlocks = [], moduleFn;
        forEach(modulesToLoad, function (module) {
            if (loadedModules.get(module)) return;
            loadedModules.put(module, true);

            function runInvokeQueue(queue) {
                var i, ii;
                for (i = 0, ii = queue.length; i < ii; i++) {
                    var invokeArgs = queue[i],
                        provider = providerInjector.get(invokeArgs[0]);

                    provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                }
            }

            try {
                if (isString(module)) {
                    moduleFn = angularModule(module);
                    runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
                    runInvokeQueue(moduleFn._invokeQueue);
                    runInvokeQueue(moduleFn._configBlocks);
                } else if (isFunction(module)) {
                    runBlocks.push(providerInjector.invoke(module));
                } else if (isArray(module)) {
                    runBlocks.push(providerInjector.invoke(module));
                } else {
                    assertArgFn(module, 'module');
                }
            } catch (e) {
                if (isArray(module)) {
                    module = module[module.length - 1];
                }
                if (e.message && e.stack && e.stack.indexOf(e.message) == -1) {
                    // Safari & FF's stack traces don't contain error.message content
                    // unlike those of Chrome and IE
                    // So if stack doesn't contain message, we create a new string that contains both.
                    // Since error.stack is read-only in Safari, I'm overriding e and not e.stack here.
                    /* jshint -W022 */
                    e = e.message + '\n' + e.stack;
                }
                throw $injectorMinErr('modulerr', "Failed to instantiate module {0} due to:\n{1}",
                    module, e.stack || e.message || e);
            }
        });
        return runBlocks;
    }

    ////////////////////////////////////
    // internal Injector
    ////////////////////////////////////

    function createInternalInjector(cache, factory) {

        function getService(serviceName, caller) {
            if (cache.hasOwnProperty(serviceName)) {
                if (cache[serviceName] === INSTANTIATING) {
                    throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
                        serviceName + ' <- ' + path.join(' <- '));
                }
                return cache[serviceName];
            } else {
                try {
                    path.unshift(serviceName);
                    cache[serviceName] = INSTANTIATING;
                    return cache[serviceName] = factory(serviceName, caller);
                } catch (err) {
                    if (cache[serviceName] === INSTANTIATING) {
                        delete cache[serviceName];
                    }
                    throw err;
                } finally {
                    path.shift();
                }
            }
        }

        function invoke(fn, self, locals, serviceName) {
            if (typeof locals === 'string') {
                serviceName = locals;
                locals = null;
            }

            var args = [],
                $inject = createInjector.$$annotate(fn, strictDi, serviceName),
                length,
                i,
                key;

            for (i = 0, length = $inject.length; i < length; i++) {
                key = $inject[i];
                if (typeof key !== 'string') {
                    throw $injectorMinErr('itkn',
                        'Incorrect injection token! Expected service name as string, got {0}', key);
                }
                args.push(
                    locals && locals.hasOwnProperty(key)
                    ? locals[key]
                    : getService(key, serviceName)
                );
            }
            if (isArray(fn)) {
                fn = fn[length];
            }

            // http://jsperf.com/angularjs-invoke-apply-vs-switch
            // #5388
            return fn.apply(self, args);
        }

        function instantiate(Type, locals, serviceName) {
            // Check if Type is annotated and use just the given function at n-1 as parameter
            // e.g. someModule.factory('greeter', ['$window', function(renamed$window) {}]);
            // Object creation: http://jsperf.com/create-constructor/2
            var instance = Object.create((isArray(Type) ? Type[Type.length - 1] : Type).prototype || null);
            var returnedValue = invoke(Type, instance, locals, serviceName);

            return isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance;
        }

        return {
            invoke: invoke,
            instantiate: instantiate,
            get: getService,
            annotate: createInjector.$$annotate,
            has: function (name) {
                return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
            }
        };
    }
}

createInjector.$$annotate = annotate;