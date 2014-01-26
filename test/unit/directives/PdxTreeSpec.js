describe('PdxTree Directive', function() {
   "use strict";

    var element,
        scope;

    beforeEach(function() {
        module('pdxTree');

        inject(function($compile, $rootScope) {
            scope = $rootScope;
            scope.treeConfiguration = {};
            scope.nodes = [{id: 'bagel', name: 'creamcheese'}];
            element = angular.element(
                '<div pdx-tree pdx-tree-config="treeConfiguration" pdx-tree-node-list="nodes"><div pdx-tree-item></div></div>'
            );

            var result = $compile(element)(scope);
        });
    });
});