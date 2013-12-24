angular.module('pdxTree', []);
angular.module('pdxTree').service(
    'pdxTreeChildManagerService',
    [
        function() {
            "use strict";

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

            var hasChildren = function(node) {
                return (node && node.childList && angular.isArray(node.childList) && node.childList.length > 0);
            };

            return {
                "hasChildren": hasChildren,
                "areChildrenLoading": areChildrenLoading
            };
        }
    ]
);

angular.module('pdxTree').service(
    'pdxTreeDomService',
    [
        function() {
            /**
             * Recursively destroy all the scopes attached to children of the given element, and
             * remove the child elements from the DOM.
             *
             * @param {Object} parentElement The parent element (which should be an angular.element)
             */
            var destroyChildren = function(parentElement) {
                angular.forEach(parentElement.children(), function(element) {
                    var scope;

                    element = angular.element(element);
                    scope = element.scope();

                    if (scope && !scope.$$destroyed) {
                        scope.$destroy();
                    }

                    destroyChildren(element);

                    element.remove();
                });
            };

            /**
             * Appends all the elements in the elementList argument to the parentElement.
             *
             * @param {Object} parentElement The element to append children to
             * @param {Array} elementList The list of child elements to append
             */
            var appendAllElements = function(parentElement, elementList) {
                angular.forEach(elementList, function(element) {
                    parentElement.append(element);
                });
            };

            /**
             * Searches the children of the parent element (optionally recursively) until a child is found with
             * the given attribute attached to it. If no such element is found, null is returned.
             *
             * @param {Object} parent The parent element to search through
             * @param {String} attribute The attribute to search for
             * @param {Boolean} recursive True for a recursive search, false for a flat search
             * @returns {Object|Null} The element containing the given attribute, or null if no such element exists
             */
            var findChildWithAttribute = function(parent, attribute, recursive) {
                var children = parent.children();
                var childrenSearchResult = null;
                var attributeValue;
                var i;

                for (i = 0; i < children.length; i++) {
                    attributeValue = children[i].getAttribute(attribute);

                    if (typeof attributeValue != 'undefined' && attributeValue !== null) {
                        return children[i];
                    }

                    if (recursive) {
                        childrenSearchResult = findChildWithAttribute(angular.element(children[i]), attribute, true);

                        if (childrenSearchResult !== null) {
                            return childrenSearchResult;
                        }
                    }
                }

                return null;
            };

            // Return the service object
            return {
                "appendAllElements": appendAllElements,
                "destroyChildren": destroyChildren,
                "findChildWithAttribute": findChildWithAttribute
            };
        }
    ]
);
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

            var renderChildren = function(itemScope) {
                pdxTreeDomService.destroyChildren(itemScope.containerElement);

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
                        pdxTreeDomService.appendAllElements(itemScope.containerElement, createItemElement(itemScope, child));
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
                var elementList = [];

                itemScope.node = node;
                itemScope.itemTemplate = scope.itemTemplate.clone();
                itemScope.pdxTreeNodeDepth = scope.pdxTreeNodeDepth + 1;

                itemElement = itemTemplate(itemScope);
                elementList.push(itemElement);

                // If the child container is a sibling of the item, we handle that by appending a compiled
                // version of a clone of the child container template to the item node; if the node is a child
                // of the item, we replace the placeholder node with the compiled container node.
                if (itemScope.siblingChildContainerTemplate) {
                    childContainerTemplate = $compile(angular.element(itemScope.siblingChildContainerTemplate).clone());
                    containerElement = childContainerTemplate(itemScope);

                    elementList.push(containerElement);
                } else {
                    childContainerElement = pdxTreeDomService.findChildWithAttribute(itemElement, 'pdx-tree-children', true);
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

            return {
                restrict: "EA",
                replace: true,
                scope: {
                    "pdxTreeNodeList": "=",
                    "pdxTreeOptions": "="
                },
                link: function(scope, element) {
                    var siblingChildContainer;

                    scope.itemTemplate = angular.element(pdxTreeDomService.findChildWithAttribute(element, 'pdx-tree-item', false));
                    scope.siblingChildContainerTemplate = null;
                    scope.toggleChildren = toggleChildren;
                    scope.loadChildren = scope.pdxTreeOptions.loadChildren || function() { return false; };
                    scope.pdxTreeNodeDepth = 0;

                    // Search through the child elements recursively until we find the pdx-tree-children element
                    siblingChildContainer = pdxTreeDomService.findChildWithAttribute(element, 'pdx-tree-children', false);

                    if (siblingChildContainer !== null) {
                        scope.siblingChildContainerTemplate = angular.element(siblingChildContainer);
                    }

                    element.html('');
                    angular.forEach(scope.pdxTreeNodeList, function(node) {
                        pdxTreeDomService.appendAllElements(element, createItemElement(scope, node));
                    });
                }
            };
        }
    ]
);