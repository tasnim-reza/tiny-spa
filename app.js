var ns = window.namespace('myApp');
//ns
//    .name() //controller, service, asStaticService, 
//    .parent() //.asViewParent()
//    .filesTobeLoaded()
//    .dependencies()
//    .callbacks();

ns('parentControllerB', [], ['serviceA', function parentControllerB(serviceA) {
    console.log('parentControllerB loaded');

    this.baseB = function () {
        serviceA.sayA();
        console.log('parent controller B base method called');
    }

}]);

ns('parentControllerA : parentControllerB', [], ['serviceA', function parentControllerA(serviceA) {
    console.log('parentControllerA loaded');

    this.baseA = function () {
        serviceA.sayA();
        console.log('parent controller A base method called');
        this.baseB();
    }

}]);

ns('controllerA : parentControllerA', [], ['serviceC', function controllerA(serviceC) {
    var self = this;
    console.log('controller a loaded');

    serviceC.sayC();

    this.baseA();

    this.onclick = function () {
        console.log('fired, on click from controller A');
        self.baseA();
    }
}]);

ns('controllerB', [], ['serviceC', function controllerB(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller B');
    }
    serviceC.sayC();
}]);

ns('parentController', [], ['serviceC', function parentControllerView(serviceC) {
    console.log('parentControllerView loaded');
}]);

ns('controllerC', [], ['serviceC', function controllerB(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller C');
    }
    serviceC.sayC();
}]);


ns('controllerD', [], ['serviceC', function controllerD(serviceC) {
    var counter = 0;
    this.onclick = function () {
        console.log('fired, on click  from controller D');
    }

    this.base = function () {
        counter++;
        console.log('from base D ');
    }

    this.getCounter = function () {
        return counter;
    }

    serviceC.sayC();
}]);

ns('controllerE', [], ['serviceC', function controllerE(serviceC) {
    var self = this;
    this.onclick = function () {
        console.log('fired, on click  from controller E');
        self.base();
    }
    serviceC.sayC();
}]);

ns('controllerF', [], ['serviceC', function controllerF(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller F : ' + this.getCounter());
    }
    serviceC.sayC();
}]);


ns('controllerG', [], ['serviceC', function controllerG(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller G');
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


