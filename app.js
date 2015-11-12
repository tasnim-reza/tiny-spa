(function appService() {
    new httpService('GET', 'templates/header.html', null, function successCallback(evt) {
        console.log('success', evt);
    }, function errorCallback(evt) {
        console.log('error', evt);
    });

})()