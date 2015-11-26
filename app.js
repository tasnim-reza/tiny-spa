var ns = window.namespace('myApp');

ns(['serviceC', function controllerA(serviceC) {
    console.log('this is controller a');

    serviceC.say();

    this.onclick = function () {
        console.log('fired, on click');
    }
}]);

ns(['serviceC', function controllerB(serviceC) {

}]);

ns(['serviceA', 'serviceB', function serviceC(serviceA, serviceB) {
    this.say = function () {
        console.log('service c');
    };

    //serviceA.say();
    //serviceB.say();
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