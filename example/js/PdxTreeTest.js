angular
    .module('PdxTreeTestApp', [ 'ngResource', 'pdxTree'])
    .controller(
        'PdxTreeTestCtrl',
        [
            '$scope', '$resource', '$sce', 'pdxTreeChildManagerService',
            function($scope, $resource, $sce, pdxTreeChildManagerService) {
                var Children = $resource('tree-data/:nodeId.json');

                var stateIconMap = {
                    'open': 'glyphicon-chevron-down',
                    'closed': 'glyphicon-chevron-right',
                    'leaf': 'glyphicon-record'
                };

                var alternateStateIconMap = {
                    'open': 'glyphicon-folder-open',
                    'closed': 'glyphicon-folder-close',
                    'leaf': 'glyphicon-record'
                };

                var describeNode = function(node) {
                    return node.name;
                };

                var loadChildren = function(node) {
                    if (node.id === 'Foo' && !angular.isArray(node.childList)) {
                        node.childList = [
                            { id: "Foo1", name: "Foo-child-1" },
                            { id: "Foo2", name: "Foo-child-2" },
                            { id: "Foo3", name: "Foo-child-3" }
                        ];

                        return true;
                    }

                    if (node.id === 'Flob' && node.childList == null) {
                        node.childList = Children.query({ nodeId: node.id });

                        return node.childList.$promise;
                    }

                    node.childList = false;
                    return false;
                };

                var getNodeState = function(node) {
                    if (!node) {
                        return 'leaf';
                    }

                    if (node.id === 'Foo' || node.id === 'Flob') {
                        return node.expanded ? 'open' : 'closed';
                    }

                    if (!pdxTreeChildManagerService.hasChildren(node)) {
                        return 'leaf';
                    }

                    return node.expanded ? 'open' : 'closed';
                };

                var getNodeIcon = function(stateIconMap, node) {
                    var state = getNodeState(node);

                    if (stateIconMap[state]) {
                        return stateIconMap[state];
                    }

                    return '';
                };

                var getNodePadding = function(depth) {
                    return { "padding-left": ((depth - 1) * 18) + "px" };
                };

                var getChildCount = function(node) {
                    if (node && node.childList && node.childList.length) {
                        return node.childList.length.toString();
                    }

                    return node.childList === false ? '0' : '+';
                };

                $scope.treeOptions = {
                    "loadChildren": loadChildren,
                    "getNodeState": getNodeState,
                    "getNodeIcon": angular.bind(this, getNodeIcon, stateIconMap),
                    "getAlternateNodeIcon": angular.bind(this, getNodeIcon, alternateStateIconMap),
                    "getNodePadding": getNodePadding,
                    "getChildCount": getChildCount,
                    "describeNode": describeNode
                };

                /*
                $scope.nodeContainer = { nodeList: [
                    { id: "Foo", name: "Foo" },
                    { id: "Bar", name: "Bar", childList: false },
                    {
                        id: "Baz",
                        name: "Baz",
                        childList: [
                            { id: "Baz1", name: "Baz child 1", childList: false },
                            {
                                id: "Baz2",
                                name: "Baz child 2",
                                childList: [
                                    { id: "Qux1", name: "Qux 1", childList: false }
                                ]
                            }
                        ]
                    },
                    { id: "Flob", name: "Flob" }
                ] };
                */

                $scope.nodeContainer = {};

                $scope.nodeContainer.nodeList = Children.query({ nodeId: 'Nodes'});

                $scope.addNode = function() {
                    var now = new Date();

                    $scope.nodeContainer.nodeList.push({ name: now.toISOString() });
                };
            }
        ]
    )
;