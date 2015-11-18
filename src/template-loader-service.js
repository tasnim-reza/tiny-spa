function templateLoaderService(url, successCallback, errorCallBack) {

    new httpService('GET', url + '.html', null, successCallback, errorCallBack);
}

