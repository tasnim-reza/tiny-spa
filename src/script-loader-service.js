function scriptLoaderService(path, callback) {
    var el = doc.createElement('script'), loaded
    el.onload = el.onerror = el[onreadystatechange] = function () {
        if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
        el.onload = el[onreadystatechange] = null
        loaded = 1
        scripts[path] = 2
        callback()
    }
    el.async = 1
    el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
    head.insertBefore(el, head.lastChild)
}

setTimeout(function () {
    each(paths, function loading(path, force) {
        if (path === null) return callback()
        
        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
            path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
        }
        
        if (scripts[path]) {
            if (id) ids[id] = 1
            return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
        }

        scripts[path] = 1
        if (id) ids[id] = 1
        create(path, callback)
    })
}, 0)
return $script
}
