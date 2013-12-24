angular.module('pdxTree').directive(
    'pdxTree',
    [
        '$rootScope', '$compile', 'pdxTreeChildManagerService', 'pdxTreeDomService',
        function($rootScope, $compile, childManagerService, pdxTreeDomService) {
            var toggleChildren = function() {
                this.node.expanded = !this.node.expanded;

                if (this.node.expanded && this.node.childList == null) {
                    this.loadChildren(this.node);
                }
            };

            return {
                restrict: "EA",
                replace: true,
                scope: {
                    "pdxTreeNodeList": "=",
                    "pdxTreeOptions": "="
                },
                controller: function($scope)
                {
                    this.setItemTemplate = function(itemTemplateElement) {
                        $scope.itemTemplate = itemTemplateElement;
                    };

                    this.setChildStrategy = function(strategy) {
                        $scope.childStrategy = strategy;
                    };

                    this.setChildTemplate = function(childTemplate) {
                        $scope.childTemplate = childTemplate;
                    };
                },
                link: function(scope) {
                    var targetElement = scope.itemTemplate.parent();

                    scope.toggleChildren = toggleChildren;
                    scope.loadChildren = scope.pdxTreeOptions.loadChildren || function() { return false; };
                    scope.pdxTreeNodeDepth = 0;

                    targetElement.html('');

                    angular.forEach(scope.pdxTreeNodeList, function(node) {
                        pdxTreeDomService.appendAllElements(targetElement, scope.childStrategy.createItem(scope, node));
                    });
                }
            };
        }
    ]
);