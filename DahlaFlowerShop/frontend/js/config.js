(function (global) {
    var defaultLocalApiUrl = 'http://localhost:5075';
    var metaConfig = document.querySelector('meta[name="api-base-url"]');
    var configuredBaseUrl = global.APP_API_BASE_URL || (metaConfig ? metaConfig.content : '');
    var hostname = global.location && global.location.hostname ? global.location.hostname : '';
    var isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    var resolvedBaseUrl = configuredBaseUrl
        || (isLocalhost ? defaultLocalApiUrl : (global.location ? global.location.origin : defaultLocalApiUrl));

    global.current_url = resolvedBaseUrl.replace(/\/+$/, '');
    global.buildApiUrl = function (path) {
        if (!path) {
            return global.current_url;
        }

        return global.current_url + (path.charAt(0) === '/' ? path : '/' + path);
    };
})(window);
