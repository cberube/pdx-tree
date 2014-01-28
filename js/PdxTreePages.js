angular
    .module('PdxTreePages', [ 'pdxTree', 'ngSanitize' ])
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
                        element.html('');

                        scope.element = angular.element(element);

                        $http
                            .get(scope.includeSource)
                            .success(
                            function(content) {
                                scope.element.append('<code data-language="JavaScript">' + content + '</code>');
                                $timeout(Rainbow.color());
                            }
                        )
                        ;
                    }
                };
            }
        ]
    );
