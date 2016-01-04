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