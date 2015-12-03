var ns = window.namespace('myApp');

ns('parentController', [], ['serviceA', function parentController(serviceA) {
    console.log('parent controller');
}]);


ns('controllerA:parentController', [], ['serviceC', function controllerA(serviceC) {
    console.log('this is controller a');

    serviceC.say();

    this.onclick = function () {
        console.log('fired, on click from controller A');
    }
}]);

ns('controllerB', [], ['serviceC', function controllerB(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller B');
    }
}]);

ns('serviceC', [], ['serviceA', 'serviceB', function serviceC(serviceA, serviceB) {
    this.say = function () {
        console.log('service c');
    };

    serviceA.say();
    serviceB.say();
}]);

ns('serviceA', [], [function serviceA() {
    this.say = function () {
        console.log('service a');
    }
}]);

ns('serviceB', [], [function serviceB() {
    this.say = function () {
        console.log('service b');
    }
}]);


