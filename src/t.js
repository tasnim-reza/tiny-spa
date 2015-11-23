var container = new Map();

function t(fn) {
    if (isArray(fn)) {
        var constructor = fn[fn.length - 1],
            dependencies = fn.splice(fn.length - 1, 1);

        if (!container.has(constructor.name))
            doRegister(container, constructor);
    }


}

function doRegister(container, constructor) {
    if (!container.has(constructor.name))
        container.set(constructor.name, constructor);
}

function getInstance(container, fnName) {
    if (!container[fnName]) throw (fnName + 'Not found in container, please register first.');

    return Object.create(container.get(fnName));
}

t(['serviceA', 'serviceB', function serviceC(serviceA, serviceB) {
    this.say = function () {
        console.log('service c');
    };

    serviceA.say();
    serviceB.say();
}]);

t([function serviceA() {
    this.say = function () {
        console.log('service a');
    }
}]);

t([function serviceB() {
    this.say = function () {
        console.log('service b');
    }
}]);

t(['serviceC', function controllerA(serviceC) {
    
}])