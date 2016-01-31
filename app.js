var ns = ts.namespace('myApp');
/*
    Chainable bootstrap
*/
//ns
//    .name() //controller, service, asStaticService, 
//    .parent() //.asViewParent()
//    .filesTobeLoaded()
//    .dependencies()
//    .callbacks();

function say(a, b) {
    console.log(a, b);
}

say.apply(say, ['1', '2']);
