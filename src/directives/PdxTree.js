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

            var buildTree = function(scope, targetElement) {
                var childElementList = targetElement.children();

                if (childElementList && childElementList.length) {
                    angular.forEach(childElementList, function(childElement) {
                        var childScope = angular.element(childElement).scope();

                        if (childScope) {
                            childScope.childStrategy.removeChildren(childScope);
                            childScope.$destroy();
                        }

                        childElement.remove();
                    });
                }

                if (!scope.pdxTreeNodeList) {
                    return;
                }

                angular.forEach(scope.pdxTreeNodeList.nodeList, function(node) {
                    pdxTreeDomService.appendAllElements(targetElement, scope.childStrategy.createItem(scope, node));
                });
            };

            return {
                restrict: "EA",
                scope: {
                    "pdxTreeNodeList": "=",
                    "pdxTreeOptions": "="
                },
                controller: function($scope)
                {
                    $scope.tableMode = false;
                    $scope.itemContainer = null;

                    this.setItemTemplate = function(itemTemplateElement) {
                        $scope.itemTemplate = itemTemplateElement;
                    };

                    this.setChildStrategy = function(strategy) {
                        $scope.childStrategy = strategy;
                    };

                    this.setChildTemplate = function(childTemplate) {
                        $scope.childTemplate = childTemplate;
                    };

                    this.setTableMode = function(tableMode) {
                        $scope.tableMode = tableMode;
                    };

                    this.setItemContainer = function(itemContainer) {
                        $scope.itemContainer = itemContainer;
                    };
                },
                link: function(scope) {
                    var targetElement = scope.itemContainer.parent();

                    scope.toggleChildren = toggleChildren;
                    scope.loadChildren = scope.pdxTreeOptions.loadChildren || function() { return false; };
                    scope.pdxTreeNodeDepth = 0;

                    targetElement.html('');

                    scope.$watchCollection(
                        'pdxTreeNodeList.nodeList',
                        function() {
                            buildTree(scope, targetElement);
                        }
                    );
                }
            };
        }
    ]
);