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

    this.msg = "test message";

    serviceC.sayC();

    this.baseA();

    this.onclick = function (msg, c) {
        console.log('fired, on click from controller A');
        self.baseA();
    }

    this.say = function (a, b) {
        console.log('called from ui');
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