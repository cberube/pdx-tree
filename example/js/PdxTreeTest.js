angular
    .module('PdxTreeTestApp', [ 'ngResource', 'pdxTree'])
    .controller(
        'PdxTreeTestCtrl',
        [
            '$scope', '$resource',
            function($scope, $resource) {
                var Children = $resource('tree-data/:nodeId.json');

                $scope.treeConfiguration = {
                    loadChildren: function(node, defaultLoadChildren) {
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

                        return defaultLoadChildren(node);
                    },

                    hasChildren: function(node, defaultHasChildren) {
                        if (node.id === 'Foo' || node.id === 'Flob') {
                            return true;
                        }

                        return defaultHasChildren(node);
                    }
                };

                $scope.nodes = [
                    { id: "Foo", name: "Foo" },
                    { id: "Bar", name: "Bar" },
                    {
                        id: "Baz",
                        name: "Baz",
                        childList: [
                            { id: "Baz1", name: "Baz child 1" },
                            {
                                id: "Baz2",
                                name: "Baz child 2",
                                childList: [
                                    { id: "Qux1", name: "Qux 1" }
                                ]
                            }
                        ]
                    },
                    { id: "Flob", name: "Flob" }
                ];
            }
        ]
    )
;