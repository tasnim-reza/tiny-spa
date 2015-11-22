function t(func) {

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