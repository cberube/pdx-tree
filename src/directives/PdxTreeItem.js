/**
 * Created by nackjicholson on 11/29/13.
 */

angular.module('pdxTree').directive(
    'pdxTreeItem',
    [
        '$compile', 'pdxTreeChildManagerService',
        function($compile, childManagerService) {
            return {
                restrict: "EA",
                scope: {
                    item: "=",
                    pdxTreeConfig: "="
                },
                controller: function($scope) {
                    $scope.expand = function(item) {
                        if (!childManagerService.hasChildren(item, $scope.pdxTreeConfig)) {
                            return;
                        }

                        item.expanded = !item.expanded;

                        if (item.expanded) {
                            childManagerService.loadChildren(item, $scope.pdxTreeConfig);
                        }
                    };

                    $scope.getIcon = function(item) {
                        if (!childManagerService.hasChildren(item, $scope.pdxTreeConfig)) {
                            return 'glyphicon-unchecked';
                        }

                        return (item.expanded ? 'glyphicon-collapse-down' : 'glyphicon-expand');
                    }
                },
                link: function(scope, element) {
                    var containerElement = angular.element(scope.pdxTreeConfig.itemContainerTemplate);
                    var itemNameElement = angular.element(scope.pdxTreeConfig.itemNameTemplate);
                    var childListElement = angular.element(scope.pdxTreeConfig.childListTemplate);
                    var branchElement = angular.element('<pdx-tree-branch pdx-tree-config="pdxTreeConfig" item-list="item.childList"></pdx-tree-branch>');

                    childListElement.append(branchElement);
                    containerElement.append(itemNameElement);
                    containerElement.append(childListElement);

                    $compile(containerElement)(scope, function(compiledElement) {
                        element.replaceWith(compiledElement);
                    });
                }
            };
        }
    ]
);
