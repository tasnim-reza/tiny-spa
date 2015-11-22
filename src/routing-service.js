function routingService() {
    var defaultRoutingConfig = {
        defaultRouteKey: 'defaultRoute',
        defaultRouteValue: "/{template}"
    };

    var routeMap = new Map(),
        self = this;
    routeMap.set(defaultRoutingConfig.defaultRouteKey, defaultRoutingConfig.defaultRouteValue);

    self.getRouteValue = function (routeKey) {
        return routeMap.get(routeKey);
    }

    self.loadDefaultRoute = function () {

    }
}