var template = "<div>Item template. Node name: {{ node.name }}</div>";

angular
    .module('pdxTree', [])
    .controller(
        'TestTreeCtrl',
        [
            '$scope', '$resource',
            function ($scope, $resource) {
                var NodeSource = $resource('tree-data/:id');

                $scope.tree = { nodeList: null };

                $scope.tree.nodeList = NodeSource.query({ id: 'Nodes.json' });
            }
        ]
    )
    .directive(
        'testTree',
        [
            '$compile', 'pdxTreeDomService',
            function($compile, pdxTreeDomService) {
                var buildNodes = function(treeElement, scope) {
                    var i;
                    var templateFunction;
                    var nodeElement;
                    var nodeScope;

                    if (!scope.tree || !scope.tree.nodeList) {
                        return;
                    }

                    templateFunction = $compile(template);
                    for(i = 0; i < scope.tree.nodeList.length; i++) {
                        nodeScope = scope.$new();
                        nodeScope.node = scope.tree.nodeList[i];

                        nodeElement = templateFunction(nodeScope, function() {});
                        treeElement.append(nodeElement);
                    }
                };

                return {
                    replace: true,
                    restrict: "EA",
                    scope: {
                        tree: "="
                    },
                    controller: function($scope) {

                    },
                    link: function(scope, element) {
                        var templateElement;
                        templateElement = pdxTreeDomService.findChildWithAttribute(element, 'pdx-tree-item', true);
                        templateElement = angular.element(templateElement);
                        template = templateElement.html().trim();

                        scope.$watchCollection(
                            'tree.nodeList',
                            function() { buildNodes(element, scope); }
                        );
                    }
                };
            }
        ]
    )
;

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
                    itemScope.childStrategy = nestedImplementation;
                    itemScope.containerElement = containerElement;
                    itemScope.itemElement = itemElement;
                    itemScope._pdxTreeNodeDepth = scope._pdxTreeNodeDepth + 1;

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

            var renderChildren = function(itemScope) {
                var childElementList;

                itemScope.childStrategy.removeChildren(itemScope);

                // If we are not expanded, or we are an empty node, we have nothing more to do
                if (!itemScope.node.expanded || !itemScope.node.childList) {
                    return;
                }

                // If our children are still loading, we need to call renderChildren again when
                // the promise related to loading the children resolves, but until then, we have
                // nothing to do
                if (itemScope.node.childList.$promise && !itemScope.node.childList.$resolved) {
                    itemScope.node.childList.$promise.then(angular.bind(this, renderChildren, itemScope));
                    return;
                }

                angular.forEach(
                    itemScope.node.childList,
                    function(child) {
                        childElementList = itemScope.childStrategy.createItem(itemScope, child);
                        itemScope.childStrategy.addChildren(itemScope, childElementList);
                    }
                );

            };

            return {
                "hasChildren": hasChildren,
                "areChildrenLoading": areChildrenLoading,
                "renderChildren": renderChildren
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
                    this.loadChildren(this, this.node);
                }
            };

            var buildTree = function(scope, targetElement) {
                var childElementList = targetElement.children();

                if (childElementList && childElementList.length) {
                    angular.forEach(childElementList, function(childElement) {
                        var childScope = angular.element(childElement).scope();

                        if (childScope) {
                            childScope.childStrategy.removeChildren(childScope);
                            childScope.$destroy();
                        }

                        childElement.remove();
                    });
                }

                if (!scope.pdxTreeController) {
                    return;
                }

                angular.forEach(scope.pdxTreeNodeList, function(node) {
                    pdxTreeDomService.appendAllElements(targetElement, scope.childStrategy.createItem(scope, node));
                });
            };

            return {
                restrict: "EA",
                scope: {
                    "pdxTreeNodeList": "=",
                    "pdxTreeController": "="
                },
                controller: function($scope)
                {
                    $scope.tableMode = false;
                    $scope.itemContainer = null;

                    this.setItemTemplate = function(itemTemplateElement) {
                        $scope.itemTemplate = itemTemplateElement;
                    };

                    this.setChildStrategy = function(strategy) {
                        $scope.childStrategy = strategy;
                    };

                    this.setChildTemplate = function(childTemplate) {
                        $scope.childTemplate = childTemplate;
                    };

                    this.setTableMode = function(tableMode) {
                        $scope.tableMode = tableMode;
                    };

                    this.setItemContainer = function(itemContainer) {
                        $scope.itemContainer = itemContainer;
                    };
                },
                link: function(scope) {
                    var targetElement = scope.itemContainer.parent();

                    scope._pdxTreeController = {
                        toggleChildren: toggleChildren,
                        loadChildren: function() { return false; }
                    };
                    scope._pdxTreeNodeDepth = 0;

                    scope.pdxTreeController(scope);

                    scope.toggleChildren = scope.toggleChildren || scope._pdxTreeController.toggleChildren;
                    scope.loadChildren = scope.loadChildren || scope._pdxTreeController.loadChildren;

                    targetElement.html('');

                    scope.$watchCollection(
                        'pdxTreeNodeList',
                        function() {
                            buildTree(scope, targetElement);
                        }
                    );
                }
            };
        }
    ]
);
angular.module('pdxTree').directive(
    'pdxTreeItem',
    [
        function() {
            return {
                restrict: "EA",
                require: "?^pdxTree",
                controller: function($scope) {
                    this.getElement = function() {
                        return $scope.element;
                    };
                },
                link: function(scope, element, attributes, pdxTree) {
                    var templateHtml = angular.element(element).clone();

                    scope.element = element;

                    if (element[0].tagName == 'TBODY') {
                        templateHtml = angular.element(element).clone();
                        if (pdxTree) {
                            pdxTree.setTableMode(false);
                        }
                    }

                    if (pdxTree) {
                        pdxTree.setItemTemplate(templateHtml);
                        pdxTree.setItemContainer(element);
                    }
                }
            };
        }
    ]
);

angular.module('pdxTree').directive(
    'pdxTreeChildren',
    [
        'pdxTreeNestedImplementation', 'pdxTreeSiblingImplementation',
        function(pdxTreeNestedImplementation, pdxTreeSiblingImplementation) {
            return {
                restrict: "EA",
                require: ["?^pdxTree", "?^pdxTreeItem"],
                link: function(scope, element, attributes, treeControllers)
                {
                    var pdxTree = treeControllers[0];
                    var pdxTreeItem = treeControllers[1];

                    if (!pdxTree || !pdxTreeItem) {
                        return;
                    }

                    pdxTree.setChildTemplate(element);
                    pdxTree.setChildStrategy(pdxTreeItem.getElement() === element ? pdxTreeSiblingImplementation : pdxTreeNestedImplementation);
                }
            };
        }
    ]
);