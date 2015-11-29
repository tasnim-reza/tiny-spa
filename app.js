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

function func1() {
    console.log('func1');
    this.say = function () {
        console.log('say func1');
    }
}

function func2(func1) {

    func1.say();

    console.log('func2');
    this.say = function () {
        console.log('say func2');
    }
}

var obj1 = Object.create(func1.prototype);
func1.apply(obj1, []);

var obj2 = Object.create(func2.prototype);
func2.apply(obj2, [obj1]);

console.log(obj2);
