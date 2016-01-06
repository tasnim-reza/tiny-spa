function scriptLoaderService(paths, callback) {
    paths.forEach(function (path) {
        var el = document.createElement('script'), loaded;
        var head = document.querySelector('head');

        el.onload = el.onerror = function (e) {
            el.onload = null;
            if (callback)
                callback();
            console.log(e);
        }
        el.async = 0;
        el.src = path;
        head.insertBefore(el, head.lastChild);
    });
}

//setTimeout(function () {
//    each(paths, function loading(path, force) {
//        if (path === null) return callback()

//        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
//            path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
//        }

//        if (scripts[path]) {
//            if (id) ids[id] = 1
//            return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
//        }

//        scripts[path] = 1
//        if (id) ids[id] = 1
//        create(path, callback)
//    })
//}, 0)
//return $script
//}
