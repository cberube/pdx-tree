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

                var loadChildren = function(scope, node) {
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

                $scope.tree = {
                    controller: function(scope) {
                        scope.getNodeState = getNodeState;
                        scope.getNodeIcon = angular.bind(this, getNodeIcon, stateIconMap);
                        scope.getAlternateNodeIcon = angular.bind(this, getNodeIcon, alternateStateIconMap);
                        scope.getNodePadding = getNodePadding;
                        scope.getChildCount = getChildCount;
                        scope.describeNode = describeNode;
                        scope.loadChildren = loadChildren;
                    },
                    nodeList: Children.query({ nodeId: 'Nodes'})
                };

                $scope.addNode = function() {
                    var now = new Date();

                    $scope.tree.nodeList.push({ name: now.toISOString() });
                };
            }
        ]
    )
;