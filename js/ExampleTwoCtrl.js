angular.module('PdxTreePages').controller(
    'ExampleTwoCtrl',
    [
        '$scope',
        function($scope) {
            "use strict";

            var createNode = function(name, childList, properties) {
                return angular.extend(
                    {
                        "name": name,
                        "selected": false,
                        "childList": childList || false
                    },
                    properties || {}
                );
            };

            $scope.selectedItems = {};

            $scope.tree = {};

            $scope.tree.getNodePadding = function(depth) {
                return {
                    "padding-left": ((depth - 1) * 20) + "px"
                };
            };

            $scope.tree.nodeSelectionChanged = function(node) {
                if (node.selected) {
                    $scope.selectedItems[node.name] = true;
                } else {
                    delete $scope.selectedItems[node.name];
                }

                console.log($scope);
            };

            $scope.tree.nodeList = [
                createNode(
                    "Colors",
                    [
                        createNode('Red'),
                        createNode('Green'),
                        createNode('Blue')
                    ]
                ),
                createNode(
                    "Sizes",
                    [
                        createNode('Small'),
                        createNode('Medium'),
                        createNode('Large')
                    ]
                )
            ];
        }
    ]
);