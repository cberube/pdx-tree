/**
 * Created by nackjicholson on 11/29/13.
 */

describe('PdxTree Directive', function() {
   "use strict";

    var element,
        scope;

    beforeEach(function() {
        module('pdxTree');

        inject(function($compile, $rootScope) {
            scope = $rootScope;
            scope.treeConfiguration = {foo: 'bar'};
            scope.nodes = [{id: 'bagel', name: 'creamcheese'}];
            element = angular.element('<div pdx-tree pdx-tree-config="treeConfiguration" class="pdx-tree" item-list="nodes"></div>');
            $compile(element)(scope);
        });
    });


    it('has class pdx-tree', function() {
        expect(element.hasClass('pdx-tree')).toBe(true);
    });
});