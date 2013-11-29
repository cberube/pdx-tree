/**
 * Created by nackjicholson on 11/29/13.
 */

angular.module('pdxTree').directive(
    'pdxTreeBranch',
    [
        '$compile', 'pdxTreeChildManagerService',
        function($compile, childManagerService) {
            return {
                restrict: "EA",
                scope: {
                    "itemList": "=",
                    "pdxTreeConfig": "="
                },
                controller: function($scope) {
                    $scope.areChildrenLoading = childManagerService.areChildrenLoading;
                },
                link: function(scope, element) {
                    var templateElement = angular.element(scope.pdxTreeConfig.listContainerTemplate);
                    var loadingElement = angular.element(scope.pdxTreeConfig.loadingTemplate);
                    var itemElement = angular.element("<pdx-tree-item pdx-tree-config='pdxTreeConfig' ng-repeat='item in itemList' item='item'></pdx-tree-item>");

                    loadingElement.attr('ng-show', 'areChildrenLoading(itemList)');
                    templateElement.append(loadingElement);
                    templateElement.append(itemElement);

                    $compile(templateElement)(scope);
                    element.replaceWith(templateElement);
                }
            };
        }
    ]
);