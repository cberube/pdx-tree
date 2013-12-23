/**
 *
 */
angular.module('pdxTree').directive(
    'pdxTree',
    [
        '$rootScope', '$compile', 'pdxTreeChildManagerService',
        function($rootScope, $compile, childManagerService) {
            var toggleChildren = function() {
                this.node.expanded = !this.node.expanded;

                if (this.node.expanded && this.node.childList == null) {
                    this.loadChildren(this.node);
                }
            };

            var loadChildren = function(node) {
                return childManagerService.loadChildren(node, this.pdxTreeConfig);
            };

            var destroyChildren = function(parentElement) {
                var scope;

                angular.forEach(parentElement.children(), function(element) {
                    element = angular.element(element);

                    scope = element.scope();

                    if (scope && !scope.$$destroyed) {
                        scope.$destroy();
                    }

                    destroyChildren(element);

                    element.remove();
                });
            };

            var renderChildren = function(itemScope) {
                destroyChildren(itemScope.containerElement);

                if (!itemScope.node.expanded || !itemScope.node.childList) {
                    return;
                }

                if (itemScope.node.childList.$promise && !itemScope.node.childList.$resolved) {
                    itemScope.node.childList.$promise.then(angular.bind(this, renderChildren, itemScope));
                    return;
                }

                angular.forEach(
                    itemScope.node.childList,
                    function(child) {
                        appendAllElements(itemScope.containerElement, createItemElement(itemScope, child));
                    }
                );
            };

            var appendAllElements = function(parent, elementList) {
                angular.forEach(elementList, function(element) {
                    parent.append(element);
                });
            };

            var createItemElement = function(scope, node) {
                var itemTemplate = $compile(scope.itemTemplate.clone());
                var itemScope = scope.$new();
                var itemElement;
                var containerElement;
                var childContainerTemplate;
                var childContainerElement;
                var elementList = [];

                itemScope.node = node;
                itemScope.itemTemplate = scope.itemTemplate.clone();

                itemElement = itemTemplate(itemScope);
                elementList.push(itemElement);

                // If the child container is a sibling of the item, we handle that by appending a compiled
                // version of a clone of the child container template to the item node; if the node is
                if (itemScope.siblingChildContainerTemplate) {
                    childContainerTemplate = $compile(angular.element(itemScope.siblingChildContainerTemplate).clone());
                    containerElement = childContainerTemplate(itemScope);

                    elementList.push(containerElement);
                } else {
                    // Find the element that should contain the children
                    childContainerElement = findChildWithAttribute(itemElement, 'pdx-tree-children');
                    childContainerTemplate = $compile(angular.element(childContainerElement));

                    containerElement = childContainerTemplate(itemScope);
                    angular.element(childContainerElement).replaceWith(containerElement);
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

                return elementList;
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
                link: function(scope, element) {
                    var siblingChildContainer;

                    scope.itemTemplate = angular.element(findChildWithAttribute(element, 'pdx-tree-item'));
                    scope.toggleChildren = toggleChildren;
                    scope.loadChildren = angular.bind(scope, loadChildren);
                    scope.siblingChildContainerTemplate = null;

                    // Search through the child elements recursively until we find the pdx-tree-children element
                    siblingChildContainer = findChildWithAttribute(element, 'pdx-tree-children');

                    if (siblingChildContainer !== null) {
                        scope.siblingChildContainerTemplate = angular.element(siblingChildContainer);
                    }

                    element.html('');
                    angular.forEach(scope.itemList, function(node) {
                        appendAllElements(element, createItemElement(scope, node));
                    });
                }
            };
        }
    ]
);