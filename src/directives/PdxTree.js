/**
 *
 */
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