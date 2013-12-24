angular.module('pdxTree').service(
    'pdxTreeSiblingImplementation',
    [
        '$compile', 'pdxTreeChildManagerService',
        function($compile, pdxTreeChildManagerService) {
            var siblingImplementation = {
                name: "sibling",

                /**
                 * Remove the children from the child container on the item scope
                 * @param itemScope
                 */
                removeChildren: function(itemScope) {
                    angular.forEach(itemScope.childElementList, function(childElement) {
                        childElement = angular.element(childElement);
                        var childScope = childElement.scope();

                        if (childScope) {
                            childScope.childStrategy.removeChildren(childScope);
                        }

                        childElement.remove();
                    });


                    itemScope.childElementList = [];
                    itemScope.lastChildElement = itemScope.itemElement;
                },

                /**
                 * Add the list of child elements to the child container for the given
                 * item scope
                 */
                addChildren: function(itemScope, childList) {
                    angular.forEach(childList, function(childElement) {
                        itemScope.lastChildElement.after(childElement);
                        itemScope.lastChildElement = childElement;
                        itemScope.childElementList.push(childElement);
                    });
                },

                createItem: function(scope, node) {
                    var itemTemplate = $compile(scope.itemTemplate.clone());
                    var itemScope = scope.$new();
                    var itemElement;
                    var containerElement;
                    var childContainerTemplate;
                    var elementList = [];

                    itemScope.node = node;
                    itemScope.itemTemplate = scope.itemTemplate.clone();
                    itemScope.pdxTreeNodeDepth = scope.pdxTreeNodeDepth + 1;
                    itemScope.childElementList = [];

                    itemElement = itemTemplate(itemScope);
                    elementList.push(itemElement);

                    // If the child container is a sibling of the item, we handle that by appending a compiled
                    // version of a clone of the child container template to the item node; if the node is a child
                    // of the item, we replace the placeholder node with the compiled container node.
                    childContainerTemplate = $compile(angular.element(itemScope.childTemplate).clone());
                    containerElement = childContainerTemplate(itemScope);

                    itemScope.containerElement = containerElement;
                    itemScope.itemElement = itemElement;
                    itemScope.lastChildElement = itemElement;
                    itemScope.childStrategy = siblingImplementation;

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

                    return elementList;
                }
            };

            return siblingImplementation;
        }
    ]
);