angular.module('pdxTree', []);;/**
 * Created by nackjicholson on 11/29/13.
 */

angular.module('pdxTree').provider(
    'pdxTreeChildManagerService',
    function() {
        "use strict";

        var defaultHasChildren = function(node) {
            return (angular.isArray(node.childList) && node.childList.length > 0);
        };

        var loadChildren = function(node, config) {
            if (config && angular.isFunction(config.loadChildren)) {
                config.loadChildren(node, angular.noop);
            }
        };

        var hasChildren = function(node, config) {
            if (config && angular.isFunction(config.hasChildren)) {
                return config.hasChildren(node, defaultHasChildren);
            }

            return defaultHasChildren(node);
        };

        var areChildrenLoading = function(itemList) {
            //  If the child list is set to false explicitly, there will never
            //  be any children
            if (itemList === false) {
                return false;
            }

            //  If the item list exposes the `$resolved` member, we assume it
            //  is a promise and return the inverse of `$resolved`
            if (typeof itemList.$resolved !== 'undefined') {
                return !itemList.$resolved;
            }

            //  In all other cases, we assume the children are still loading
            //  if the item list is not already an array
            return (!angular.isArray(itemList));
        };

        function PdxTreeChildLoader() {
            this.loadChildren = loadChildren;
            this.hasChildren = hasChildren;
            this.areChildrenLoading = areChildrenLoading;
        }

        this.$get = function() {
            return new PdxTreeChildLoader();
        };
    }
);
;/**
 * Created by nackjicholson on 11/29/13.
 */

angular.module('pdxTree').directive(
    'pdxTree',
    [
        '$compile',
        function($compile) {
            var defaultConfig = {
                loadingTemplate: "<div>Loading...</div>",
                listContainerTemplate: "<ul></ul>",
                itemContainerTemplate: "<li></li>",
                itemNameTemplate: "<div ng-click='expand(item)'><span class='glyphicon' ng-class='getIcon(item)'></span>{{ item.name }}</div>",
                childListTemplate: "<div ng-if='item.expanded'></div>"
            };

            return {
                restrict: "EA",
                scope: {
                    "itemList": "=",
                    "config": "=",
                    "class": '@',
                    'id': '@',
                    'pdxTreeConfig': '='
                },
                link: function(scope, element) {
                    scope.pdxTreeConfig = angular.extend(defaultConfig, scope.pdxTreeConfig);

                    var template = "<div class='{{class}}' id='{{id}}'><pdx-tree-branch pdx-tree-config='pdxTreeConfig' item-list='itemList'></pdx-tree-branch></div>";
                    var newElement = angular.element(template);

                    $compile(newElement)(scope);
                    element.replaceWith(newElement);
                }
            };
        }
    ]
);
;/**
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
);;/**
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
