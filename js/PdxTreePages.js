angular
    .module(
        'PdxTreePages',
        [ 'pdxTree', 'ngSanitize', 'ngRoute', 'ngAnimate' ],
        [
            '$routeProvider',
            function($routeProvider) {
                $routeProvider.when('/features', { templateUrl: "templates/features.html" });
                $routeProvider.when('/examples', { templateUrl: "templates/examples.html" });
                $routeProvider.when('/installation', { templateUrl: "templates/installation.html" });
                $routeProvider.when('/quickStart', { templateUrl: "templates/quickStart.html" });
                $routeProvider.when('/usage', { templateUrl: "templates/usage.html" });
                $routeProvider.when('/github', { templateUrl: "templates/github.html" });
                $routeProvider.otherwise({ templateUrl: "templates/features.html" });
            }
        ]
    )
    .run(
        [
            '$rootScope',
            function($rootScope) {
                $rootScope.$on('$locationChangeSuccess', function() {
                    ga('send', 'pageview', {
                        'page': location.pathname + location.search  + location.hash
                    });
                });
            }
        ]
    )
    .directive(
        'includeSource',
        [
            '$http', '$timeout',
            function($http, $timeout) {
                "use strict";

                return {
                    "replace": false,
                    "restrict": "A",
                    "scope": {
                        "includeSource": "@",
                    },
                    link: function(scope, element) {
                        var language = scope.includeSource.match(/\.html/) ? 'html' : 'javascript'

                        element.html('');

                        scope.element = angular.element(element);

                        $http
                            .get(scope.includeSource)
                            .success(
                            function(content) {
                                content = content
                                    .replace(/\</g, '&lt;')
                                    .replace(/\>/g, '&gt;')
                                ;

                                Rainbow.color(
                                    content,
                                    language,
                                    function(content) {
                                        scope.element.append('<code>' + content + '</code>')
                                    }
                                );
                            }
                        );
                    }
                };
            }
        ]
    );
