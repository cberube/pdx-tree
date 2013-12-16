angular.module('pdxTree').directive(
    'pdxTreeBranch',
    [
        '$rootScope', '$compile', 'pdxTreeChildManagerService',
        function($rootScope, $compile, childManagerService) {
            var toggleChildren = function() {
                var node = this.node;
                var promise;

                node.expanded = !node.expanded;

                if (node.expanded) {
                    promise = this.loadChildren(node);

                    if (promise && promise.then) {
                        promise.then(
                            angular.bind(this, renderNodeList, this.treeConfig, this)
                        );
                    }
                }
            };

            var childListIsValid = function(childList) {
                if (angular.isArray(childList)) {
                    return true;
                }

                return (childList && typeof childList.$resolved != 'undefined' && childList.$resolved);
            };

            var renderNodeList = function(treeConfig, scope) {
                // Clear the node
                scope.childContainer.html('');

                // If the node is not expanded or the list of children for the node is not valid, we're done
                if (!scope.node.expanded || !childListIsValid(scope.node.childList)) {
                    return;
                }

                if (childManagerService.hasChildren(scope.node, treeConfig)) {
                    angular.forEach(scope.node.childList, function(node) {
                        buildBranch(treeConfig, scope.childContainer, node);
                    });
                }
            };

            var buildBranch = function(treeConfig, container, node) {
                var itemTemplate = "<li><span ng-click='toggleChildren(node)'>{{ node.name }} {{ !!node.expanded }}</span></li>";
                var childContainerTemplate = $compile("<ul></ul>");
                var itemScope;

                itemTemplate = $compile(itemTemplate);
                itemScope = $rootScope.$new();

                itemScope.toggleChildren = toggleChildren;
                itemScope.treeConfig = treeConfig;

                itemScope.loadChildren = function(node) {
                    return childManagerService.loadChildren(node, treeConfig);
                };

                itemScope.node = node;

                itemTemplate(
                    itemScope,
                    function(clone, cloneScope) {
                        var containerElement = childContainerTemplate(cloneScope);

                        // Store the child container element for later use
                        itemScope.childContainer = containerElement;
                        clone.append(containerElement);
                        container.append(clone);

                        // When we first create the child container we need to render the child nodes,
                        // if the list is valid and the node is expanded
                        renderNodeList(treeConfig, itemScope);

                        // Whenever the child list changes, we need to re-render the child list
                        cloneScope.$watch(
                            'node.childList',
                            angular.bind(this, renderNodeList, treeConfig, itemScope)
                        );

                        // Whenever the node is expanded or collapsed, we need to re-render the child list
                        cloneScope.$watch(
                            'node.expanded',
                            angular.bind(this, renderNodeList, treeConfig, itemScope)
                        );

                    }
                );
            };

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
                    var containerElement = angular.element('<ul></ul>');

                    angular.forEach(scope.itemList, function(node) {
                        buildBranch(scope.pdxTreeConfig, containerElement, node);
                    });

                    element.replaceWith(containerElement);
                }
            };
        }
    ]
);