var ns = ts.namespace('myApp');
//ns
//    .name() //controller, service, asStaticService, 
//    .parent() //.asViewParent()
//    .filesTobeLoaded()
//    .dependencies()
//    .callbacks();


//basic inheritance example
ns('parentControllerB', [], ['serviceA', function parentControllerB(serviceA) {
    console.log('parentControllerB loaded');

    this.baseB = function () {
        serviceA.sayA();
        console.log('parent controller B base method called');


    }

    //
}]);

ns('parentControllerA : parentControllerB', [], ['serviceA', function parentControllerA(serviceA) {
    console.log('parentControllerA loaded');

    this.baseA = function () {
        serviceA.sayA();
        console.log('parent controller A base method called');
        this.baseB();

        //this.invokeChild('methodName', params);
    }

    //this.childListener('methodName', handler);

    function handler(params) {

    }

    //this.invokeParent('parentMethodName', params);

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

ns('controllerC', [], ['serviceC', function controllerB(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller C');
    }
    serviceC.sayC();
}]);
//end inheritance example



//view parent example
ns('parentController', [], [function parentControllerView(serviceC) {
    console.log('parentControllerView loaded');
    this.baseCounter = 0;
}]);

ns('controllerD : parentController', [], [function controllerD(serviceC) {
    var counter = 0;
    this.onclick = function () {
        console.log('fired, on click  from controller D');
    }

    this.base = function () {
        counter++;
        this.baseCounter++;
        console.log('from base D ');
    }

    this.getCounter = function () {
        return counter + '-' + this.baseCounter;
    }

    //serviceC.sayC();
}]);

ns('controllerE', [], ['serviceC', function controllerE(serviceC) {

    this.name = 'controller e';

    this.onclick = function () {
        console.log('fired, on click  from controller E');
        this.base();
    }
    //serviceC.sayC();

    this.saye = function () {
        console.log('said say e');
    }
}]);

ns('controllerF', [], ['serviceC', function controllerF(serviceC) {
    this.name = 'controller f';

    this.onclick = function () {
        console.log('fired, on click  from controller F : ' + this.getCounter());

        this.saye();
    }
    //serviceC.sayC();
}]);

ns('controllerG', [], ['serviceC', function controllerG(serviceC) {
    this.onclick = function () {
        console.log('fired, on click  from controller G');
    }
    serviceC.sayC();
}]);
//end view parent example

ns('controllerH', [], ['serviceC', function controllerG(serviceC) {
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


function base() {
    this.invokeParent = function (funcName, arg) {
        invoke.call(this, funcName, arg);
    }

    this.invokeChild = function (funcName, arg) {
        invoke.call(this, funcName, arg);
    }

    this.invokeShibling = function () {

    }

    this.parentListener = function () {

    }

    this.childtListener = function () {

    }

    this.shiblingListener = function () {

    }

    function invoke(funcName, arg) {
        this[funcName].apply(this, arg);
    }
}

function parent() {
    this.name = 'func b';

    this.counter = {
        value: 0
    };

    this.say1 = function () {
        console.log('function b parent ', this.counter.value);

        this.invokeChild('childMethod', []);
    }

    this.parentMethod = function (arg) {
        console.log('called parent');
    }
}

function parent1() {
    
}

function child() {
    this.name = 'func a';
    this.say = function () {
        this.say1();

        this.invokeParent('parentMethod', []);
    }

    this.childMethod = function () {
        console.log('called child');
    }
}

var objbase = Object.create(base.prototype);
base.apply(objbase, []);

parent.prototype = objbase;

var objparent = Object.create(parent.prototype);

parent.apply(objparent, []);

child.prototype = objparent;

var objchild = Object.create(child.prototype);

child.apply(objchild, []);

objchild.say1();
objchild.say();
objchild.say1();





