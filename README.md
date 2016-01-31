# tiny-spa
tiny-spa is a client side full stack application framework. #Not ready for production :(

(Did not integrated with build system. So to run, simply download and host on any webserver like IIS, Apache etc. We are working to create a demo page)

### Functionality
1. Bootstrap
2. Routing, template loading
3. One way, Two way data binding
4. Dependency Injection
	1. Inheritance from JavaScript.
	2. Inheritance from view.
5. Event broadcast and emit
6. Most simple event binding.
7. 

### Services
1. HTTP service
2. template loader
3. script loader
4. initialization

### Examples
## How to bootstrap your project ?
In `html` load the library file
```html
<script src="src/t.js"></script>
```
In `javascript` define your application's name space.
```javascript
var ns = ts.namespace('myApp');
```

## Define Controller

```html
<div t-controller="controllerA">
    <h3>Controller A</h3>
    <label t-bind="msg"></label>
</div>
```

```javascript
ns('controllerA', [/*file dependencies*/], [function controllerA() {
    var self = this;
    console.log('controller a loaded');

    this.msg = "Hello Tiny SPA !";    
}]);
```

## Inheritance from `View`

```html
<div t-controller="controllerA">
    <h2>controller A</h2>

    <div t-controller="controllerB">
        <h2>controller B child of A</h2>

        <div t-controller="controllerC">
            <h2>controller C child of B</h2>
        </div>

    </div>

    <div t-controller="controllerD">
        <h2>controller D child of A</h2>
    </div>
</div>

<div t-controller="controllerE">
    <h2>controller E</h2>
</div>
```

```javascript
ns('controllerA', [], [function controllerA() {
    console.log('controller a loaded');
    var name = 'controller a !';

    this.sayCtrlA = function () {
        console.log('say: ', name);
    }
}]);

ns('controllerB', [], [function controllerB() {
    console.log('controller b loaded');
    var name = 'controller b !';

    this.sayCtrlB = function () {
        this.sayCtrlA();
        console.log('say: ', name);
    }
}]);

ns('controllerC', [], [function controllerC() {
    console.log('controller c loaded');
    var name = 'controller c !';

    this.sayCtrlC = function () {
        this.sayCtrlA();
        this.sayCtrlB();
        console.log('say: ', name);
    }

    this.sayCtrlC();
}]);

ns('controllerD', [], [function controllerD() {
    console.log('controller d loaded');
    var name = 'controller d !';

    this.sayCtrlD = function () {
        this.sayCtrlA();
        //this.sayCtrlB() //error !! can't inherit
        console.log('say: ', name);
    }

    this.sayCtrlD();
}]);

ns('controllerE', [], [function controllerE() {
    console.log('controller e loaded');
    var name = 'controller e !';

    this.sayCtrlE = function () {
        //this.sayCtrlA(); //error !! can't inherit
        //this.sayCtrlB() //error !! can't inherit
        console.log('say: ', name);
    }

    this.sayCtrlE();

}]);
```

## Inheritance from `javascript`

```html
<div t-controller="controllerA">
    <h2>controller A</h2>
</div>
```

```javascript
ns('parentControllerB', [], [function parentControllerB() {
    console.log('parentControllerB loaded');

    this.baseB = function () {
        console.log('parent controller B base method called');
    }
}]);

ns('parentControllerA : parentControllerB', [], [function parentControllerA() {
    console.log('parentControllerA loaded');

    this.baseA = function () {
        console.log('parent controller A base method called');
        this.baseB();
    }
}]);

ns('controllerA : parentControllerA', [], [function controllerA() {
    console.log('controller a loaded');

    this.baseA();
}]);
```



### Authors
Javascript developer: Tasnim Reza @tasnim-reza

### Contact
Have any query ? Want to create next generation client side web framework ? Any suggestion ? feel free to contact me reza5619@gmail.com
