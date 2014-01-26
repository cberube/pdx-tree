angular.module('pdxTree').service(
    'pdxTreeNestedImplementation',
    [
        '$compile', 'pdxTreeDomService', 'pdxTreeChildManagerService',
        function($compile, pdxTreeDomService, pdxTreeChildManagerService) {
            var nestedImplementation = {
                name: "nested",

                /**
                 * Remove the children from the child container on the item scope
                 * @param itemScope
                 */
                removeChildren: function(itemScope) {
                    itemScope.containerElement.html('');
                },

                /**
                 * Add the list of child elements to the child container for the given
                 * item scope
                 */
                addChildren: function(itemScope, childList) {
                    angular.forEach(childList, function(childElement) {
                        itemScope.containerElement.append(childElement);
                    });
                },

                /**
                 * Create one or more elements to represent the given tree item
                 */
                createItem: function(scope, node) {
                    var itemTemplate = $compile(scope.itemTemplate);
                    var itemScope = scope.$new();
                    var itemElement;
                    var containerElement;
                    var childContainerTemplate;
                    var childContainerElement;

                    itemElement = itemTemplate(itemScope, function() {});

                    childContainerElement = pdxTreeDomService.findChildWithAttribute(itemElement, 'pdx-tree-children', true);
                    childContainerTemplate = $compile(scope.childTemplate.clone());

                    containerElement = childContainerTemplate(itemScope);
                    angular.element(childContainerElement).replaceWith(containerElement);

                    itemScope.node = node;
                    itemScope.itemTemplate = scope.itemTemplate;
                    itemScope.pdxTreeNodeDepth = scope.pdxTreeNodeDepth + 1;
                    itemScope.childStrategy = nestedImplementation;
                    itemScope.containerElement = containerElement;
                    itemScope.itemElement = itemElement;

                    // Whenever the node is expanded or collapsed, we need to re-render the child list
                    itemScope.$watch(
                        'node.expanded',
                        angular.bind(itemScope, pdxTreeChildManagerService.renderChildren, itemScope)
                    );

                    // Whenever the child list changes, we need to re-render the child list
                    itemScope.$watch(
                        'node.childList',
                        angular.bind(itemScope, pdxTreeChildManagerService.renderChildren, itemScope)
                    );

                    return [itemElement];
                }
            };

            return nestedImplementation;
        }
    ]
);