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

            var loadChildren = function(node) {
                return childManagerService.loadChildren(node, this.pdxTreeConfig);
            };

            var renderChildren = function(itemScope) {
                if (!itemScope.node.expanded) {
                    return;
                }

                angular.forEach(
                    itemScope.node.childList,
                    function(child) {
                        itemScope.containerElement.append(createItemElement(itemScope, child));
                    }
                );
            };

            var createItemElement = function(scope, node) {
                var itemTemplate = $compile(scope.itemTemplate.clone());
                var itemScope = scope.$new();
                var itemElement;
                var containerElement;
                var childContainerTemplate;
                var childContainerElement;

                itemScope.node = node;
                itemScope.itemTemplate = scope.itemTemplate.clone();

                itemElement = itemTemplate(itemScope);

                // If the child container is a sibling of the item, we handle that by appending a compiled
                // version of a clone of the child container template to the item node; if the node is
                if (itemScope.siblingChildContainerTemplate) {
                    childContainerTemplate = $compile(angular.element(itemScope.siblingChildContainerTemplate).clone());
                    containerElement = childContainerTemplate(itemScope);

                    //itemElement.append(containerElement);
                    itemElement.append('<div>YYYY</div>');
                } else {
                    // Find the element that should contain the children
                    childContainerElement = findChildWithAttribute(itemElement, 'pdx-tree-children');
                    childContainerTemplate = $compile(angular.element(childContainerElement));

                    containerElement = childContainerTemplate(itemScope);
                    //angular.element(childContainerElement).replaceWith(containerElement);
                    angular.element(childContainerElement).replaceWith('<div>XXXX</div>');
                }

                itemScope.containerElement = containerElement;

                // Whenever the node is expanded or collapsed, we need to re-render the child list
                itemScope.$watch(
                    'node.expanded',
                    angular.bind(itemScope, renderChildren, itemScope)
                );

                // Whenever the child list changes, we need to re-render the child list
                itemScope.$watch(
                    'node.childList',
                    angular.bind(itemScope, renderChildren, itemScope)
                );

                return itemElement;
            };

            var findChildWithAttribute = function(parent, attribute, recursive) {
                var children = parent.children();
                var attributeValue;
                var childrenSearchResult = null;
                var i;

                for (i = 0; i < children.length; i++) {
                    attributeValue = children[i].getAttribute(attribute);

                    if (typeof attributeValue != 'undefined' && attributeValue !== null) {
                        return children[i];
                    }

                    if (recursive) {
                        childrenSearchResult = findChildWithAttribute(angular.element(children[i]), attribute, false);

                        if (childrenSearchResult !== null) {
                            return childrenSearchResult;
                        }
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
                    scope.toggleChildren = toggleChildren;
                    scope.loadChildren = angular.bind(scope, loadChildren);

                    // Search through the child elements recursively until we find the pdx-tree-children element
                    siblingChildContainer = findChildWithAttribute(element, 'pdx-tree-children');

                    if (siblingChildContainer !== null) {
                        scope.siblingChildContainerTemplate = angular.element(siblingChildContainer);
                    }

                    element.html('');
                    angular.forEach(scope.itemList, function(node) {
                        element.append(createItemElement(scope, node));
                        //buildBranch(scope, scope.pdxTreeConfig, element, node);
                    });
                }
            };
        }
    ]
);