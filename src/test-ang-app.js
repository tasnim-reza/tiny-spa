var app = angular.module('myApp', []);
var injector = null;

app.run([
    '$injector', function ($injector) {
        injector = $injector;

        initializeParent();
    }
]);

app.controller('myCtrl', [
    '$scope',
    '$injector',
    'myService1',
    '$rootScope',
    myCtrl
]);

function myCtrl(
        $scope,
        $injector,
        myService1,
        $rootScope
        ) {

    $scope.msg = 'my msg';

    $scope.onclick = function () {
        var myService2Obj = $injector.invoke(['myService', myService2]);
        console.log(app);
    }

    //var parentObj = Object.create(this.prototype);

    //parentCtrl.apply(parentObj, []);

    this.say();
}

function parentCtrl(a, b, c) {
    console.log('execute parent ctrl body');

    //$rootScope.parentValue = 'this is parent';

    this.say = function () {
        console.log('say from parent ctrl');
    }
}

function initializeParent() {
    //var parentObj = Object.create(null);

    //injector.invoke([parentCtrl], parentObj);

var parentObj = Object.create(parentCtrl);
parentCtrl.apply(parentObj, []);

myCtrl.prototype = parentObj;

}



function myService2(myService) {
    this.say = function () {
        console.log('my service called');
    }
}

app.service('myService', function myService() {
    this.say = function () {
        console.log('my service called');
    }
});

app.service('myService1', ['myService', function myService1(myService) {
    this.say = function () {
        console.log('my service called');
    }
}]);


