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
                    var templateHtml = angular.element(element).clone();

                    scope.element = element;

                    if (element[0].tagName == 'TBODY') {
                        templateHtml = angular.element(element).clone();
                        if (pdxTree) {
                            pdxTree.setTableMode(false);
                        }
                    }

                    if (pdxTree) {
                        pdxTree.setItemTemplate(templateHtml);
                        pdxTree.setItemContainer(element);
                    }
                }
            };
        }
    ]
);
