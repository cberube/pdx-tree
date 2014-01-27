angular.module('pdxTree').service(
    'pdxTreeSiblingImplementation',
    [
        '$compile', 'pdxTreeChildManagerService',
        function($compile, pdxTreeChildManagerService) {
            var removeChildren = function(itemScope) {
                angular.forEach(itemScope.childElementList, function(childElement) {
                    childElement = angular.element(childElement);
                    var childScope = childElement.scope();

                    if (childScope) {
                        removeChildren(childScope);
                        childScope.$destroy();
                    }

                    childElement.remove();
                });


                itemScope.childElementList = [];
                itemScope.lastChildElement = itemScope.itemElement;
            };

            var siblingImplementation = {
                name: "sibling",

                /**
                 * Remove the children from the child container on the item scope
                 * @param itemScope
                 */
                removeChildren: removeChildren,

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
                    var itemTemplate = $compile(scope.itemTemplate);
                    var itemScope = scope.$new();
                    var itemElement;
                    var elementList = [];

                    itemScope.node = node;
                    itemScope.itemTemplate = scope.itemTemplate;
                    itemScope.childElementList = [];
                    itemScope.childStrategy = siblingImplementation;
                    itemScope._pdxTreeNodeDepth = scope._pdxTreeNodeDepth + 1;

                    itemElement = itemTemplate(
                        itemScope,
                        function(element, scope) {
                            scope.childStrategy = siblingImplementation;
                            scope.lastChildElement = element;
                        }
                    );

                    // In table mode, we need to peel off a layer of table tags to get to the TR tags
                    if (scope.tableMode) {
                        itemElement = itemElement.find('tr');
                    }

                    elementList.push(itemElement);

                    itemScope.itemElement = itemElement;
                    //itemScope.lastChildElement = itemElement;

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