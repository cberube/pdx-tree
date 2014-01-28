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
