var app = angular.module('myApp', []);
app.controller('myCtrl', [
    '$scope', '$injector', function ($scope, $injector) {
        $scope.msg = 'my msg';

        $scope.onclick = function () {
            var myService2Obj = $injector.invoke(['myService', myService2]);
        }
        //myService1.say();
    }
]);

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


