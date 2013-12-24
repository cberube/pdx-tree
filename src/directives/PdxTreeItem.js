angular.module('pdxTree').directive(
    'pdxTreeItem',
    [
        function() {
            return {
                restrict: "EA",
                require: "?^pdxTree",
                controller: function($scope) {
                    this.getElement = function() {
                        return $scope.element;
                    };
                },
                link: function(scope, element, attributes, pdxTree) {
                    scope.element = element;

                    if (pdxTree) {
                        pdxTree.setItemTemplate(angular.element(element));
                    }
                }
            };
        }
    ]
);
