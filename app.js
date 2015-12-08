var ns = window.namespace('myApp');

ns('parentControllerB', [], ['serviceA', function parentController(serviceA) {
    console.log('parentControllerB loaded');

    this.base = function () {
        serviceA.sayA();
        console.log('parent controller base method called');
    }

}]);

ns('parentControllerA:parentControllerB', [], ['serviceA', function parentController(serviceA) {
    console.log('parentControllerA loaded');

    this.base = function () {
        serviceA.sayA();
        console.log('parent controller base method called');
    }

}]);

ns('controllerA:parentControllerA', [], ['serviceC', function controllerA(serviceC) {
    console.log('controller a loaded');

    serviceC.sayC();

    this.base();

    this.onclick = function () {
        console.log('fired, on click from controller A');
    }
}]);

ns('controllerB', [], ['serviceC', function controllerB(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller B');
    }
    serviceC.sayC();
}]);

ns('serviceC', [], ['serviceA', 'serviceB', function serviceC(serviceA, serviceB) {
    this.sayC = function () {
        console.log('service c');
    };

    serviceA.sayA();
    serviceB.sayB();
}]);

ns('serviceA', [], [function serviceA() {
    this.sayA = function () {
        console.log('service a');
    }
}]);

ns('serviceB', [], [function serviceB() {
    this.sayB = function () {
        console.log('service b');
    }
}]);

function funcA() {
    this.say = function () {
        console.log('function a');
    }
}

function funcB() {
    this.say1 = function () {
        console.log('function b');
    }
}

var objB = Object.create(funcB.prototype);

funcB.apply(objB, []);

var objA = Object.create(funcA.prototype);

funcA.prototype = objB;



funcA.apply(objA, []);
console.log(objA);


