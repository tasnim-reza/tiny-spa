var app = angular.module('myApp', []);
var injector = null;

app.run([
    '$injector', function ($injector) {
        injector = $injector;

        //initializeParent();
    }
]);

app.controller('myParentCtrl', [
    '$scope',
    '$injector',
    'myService1',
    '$rootScope',
    myParentCtrl
]);

function myParentCtrl(
        $scope,
        $injector,
        myService1,
        $rootScope
        ) {

    $scope.msg = 'my msg';
    $scope.$broadcast('fromParent');
    $scope.onclick = function () {
        //var myService2Obj = $injector.invoke(['myService']);
        console.log(app);
        $scope.$broadcast('fromParent', 1);
    }

    //var parentObj = Object.create(this.prototype);

    //parentCtrl.apply(parentObj, []);

    //this.say();


}

app.controller('myChildCtrl', [
    '$scope',
    '$injector',
    'myService1',
    '$rootScope',
    function myChildCtrl($scope) {
        console.log('child loaded');

        $scope.$on('fromParent', function (evt, d) {
            console.log('from parent');
        });
    }
]);

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


