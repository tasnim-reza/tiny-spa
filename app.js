var ns = new namespace('myApp');

ns(['serviceA', 'serviceB', function serviceC(serviceA, serviceB) {
    this.say = function () {
        console.log('service c');
    };

    serviceA.say();
    serviceB.say();
}]);

ns([function serviceA() {
    this.say = function () {
        console.log('service a');
    }
}]);

ns([function serviceB() {
    this.say = function () {
        console.log('service b');
    }
}]);

ns(['serviceC', function controllerA(serviceC) {

}])