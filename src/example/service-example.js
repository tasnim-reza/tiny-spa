
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