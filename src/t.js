
function di(container) {
    
}


function t(fn, con) {
    if (fn === null && con)
        var container = con;

    if (Array.isArray(fn)) {
        var constructor = fn[fn.length - 1],
            dependencies = fn.splice(fn.length - 1, 1);

        if (!container.has(constructor.name))
            doRegister(container, constructor);
    }

    this.get = function (name) {
        return {
            then: function then(callback) {
                setTimeout(function () {
                    callback(getInstance(container, name));
                });
            }
        };
    }

}

function doRegister(container, constructor) {
    if (!container.has(constructor.name))
        container.set(constructor.name, constructor);
}

function getInstance(container, fnName) {
    if (!container[fnName]) throw (fnName + ' Not found in container, please register first.');

    return Object.create(container.get(fnName));
}

