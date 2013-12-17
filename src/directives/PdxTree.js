angular.module('pdxTree').directive(
    'pdxTree',
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
                        buildBranch(scope, treeConfig, scope.childContainer, node);
                    });
                }
            };

            var buildBranch = function(scope, treeConfig, container, node) {
                var itemTemplate = scope.itemTemplate;
                var childContainerTemplate;
                var itemScope;

                itemTemplate = $compile(itemTemplate);

                itemScope = $rootScope.$new();

                itemScope.toggleChildren = toggleChildren;
                itemScope.treeConfig = treeConfig;
                itemScope.itemTemplate = angular.element(scope.itemTemplate).clone();
                itemScope.siblingChildContainerTemplate = angular.element(scope.siblingChildContainerTemplate).clone();

                itemScope.loadChildren = function(node) {
                    return childManagerService.loadChildren(node, treeConfig);
                };

                itemScope.node = node;

                itemTemplate(
                    itemScope,
                    function(clone, cloneScope) {
                        var containerElement;
                        var childContainerElement;

                        container.append(clone);

                        // If the child container is a sibling of the item, we handle that by appending a compiled
                        // version of a clone of the child container template to the item node; if the node is
                        if (cloneScope.siblingChildContainerTemplate) {
                            childContainerTemplate = $compile(angular.element(cloneScope.siblingChildContainerTemplate).clone());
                            containerElement = childContainerTemplate(cloneScope);

                            container.append(containerElement);
                        } else {
                            // Find the element that should contain the children
                            childContainerElement = findChildWithAttribute(clone, 'pdx-tree-children');
                            childContainerTemplate = $compile(angular.element(childContainerElement));

                            containerElement = childContainerTemplate(cloneScope);
                            angular.element(childContainerElement).replaceWith(containerElement);
                        }

                        // Store the child container element for later use
                        itemScope.childContainer = containerElement;

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

            var findChildWithAttribute = function(parent, attribute) {
                var children = parent.children();
                var attributeValue;
                var childrenSearchResult = null;
                var i;

                for (i = 0; i < children.length; i++) {
                    attributeValue = children[i].getAttribute(attribute);

                    if (typeof attributeValue != 'undefined' && attributeValue !== null) {
                        return children[i];
                    }

                    childrenSearchResult = findChildWithAttribute(angular.element(children[i]), attribute);

                    if (childrenSearchResult !== null) {
                        return childrenSearchResult;
                    }
                }

                return null;
            };

            return {
                restrict: "EA",
                replace: true,
                scope: {
                    "itemList": "=",
                    "pdxTreeConfig": "="
                },
                controller: function($scope) {
                    $scope.areChildrenLoading = childManagerService.areChildrenLoading;
                },
                link: function(scope, element) {
                    var siblingChildContainer;

                    scope.itemTemplate = angular.element(findChildWithAttribute(element, 'pdx-tree-item'));
                    scope.siblingChildContainerTemplate = null;

                    // Search through the child elements recursively until we find the pdx-tree-children element
                    siblingChildContainer = findChildWithAttribute(element, 'pdx-tree-children');

                    if (siblingChildContainer !== null) {
                        scope.siblingChildContainerTemplate = angular.element(siblingChildContainer);
                    }

                    element.html('');
                    angular.forEach(scope.itemList, function(node) {
                        buildBranch(scope, scope.pdxTreeConfig, element, node);
                    });
                }
            };
        }
    ]
);