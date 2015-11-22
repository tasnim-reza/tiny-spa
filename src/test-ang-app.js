var app = angular.module('myApp', []);
app.controller('myCtrl', [
    '$scope', '$injector', function ($scope, $injector) {
        $scope.msg = 'my msg';

        app.provider('service').service('myService', function myService() {
            this.say = function () {
                console.log('my service called');
            }
        });

        app.provider('service').service('myService1', ['myService', function myService1(myService) {
            this.say = function () {
                console.log('my service called');
            }
        }]);
        

        var myService2Obj = $injector.invoke(['myService', 'myService1', myService2]);
        //myService1.say();
    }
]);

function myService2(myService, myService1) {
    this.say = function () {
        console.log('my service called');
    }
}

