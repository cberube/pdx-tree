/**
 * Created by nackjicholson on 11/28/13.
 */

describe('PdxTreeChildManagerService', function() {
    "use strict";

    var mockNode,
        mockConfig;

    beforeEach(function() {
        module('pdxTree');
        mockNode = {foo: 'bar'};
        mockConfig = {};
    });

    afterEach(function() {
        mockNode = undefined;
        mockConfig = undefined;
    });

    describe('.loadChildren()', function() {
        it('calls config.loadChildren with node and noop', inject(function(pdxTreeChildManagerService) {
            // set to a function, and spy it.
            mockConfig.loadChildren = angular.noop;
            spyOn(mockConfig, 'loadChildren');

            pdxTreeChildManagerService.loadChildren(mockNode, mockConfig);

            expect(mockConfig.loadChildren).toHaveBeenCalledWith(mockNode, angular.noop);
        }));
    });

    describe('.hasChildren()', function() {
        describe('defaultHasChildren called when config.hasChildren is not a function', function() {
            it('returns false if node.childList is not a populated array', inject(function(pdxTreeChildManagerService) {
                expect(pdxTreeChildManagerService.hasChildren(mockNode, mockConfig)).toBe(false);
            }));

            it('calls defaultHasChildren() and returns true, if config.childList is a populated array', inject(function(pdxTreeChildManagerService) {
                // populate childList.
                mockNode.childList = [1, 2, 3];
                expect(pdxTreeChildManagerService.hasChildren(mockNode, mockConfig)).toBe(true);
            }));
        });

        it('calls config.hasChildren and passes along the node passed in', inject(function(pdxTreeChildManagerService) {
            // set to a function, and spy it.
            mockConfig.hasChildren = angular.noop;
            spyOn(mockConfig, 'hasChildren');

            pdxTreeChildManagerService.hasChildren(mockNode, mockConfig);

            expect(mockConfig.hasChildren).toHaveBeenCalled();

            var call = mockConfig.hasChildren.mostRecentCall;
            expect(call.args[0]).toBe(mockNode);
            expect(typeof call.args[1]).toBe('function');
        }));
    });

    describe('.areChildrenLoaading()', function() {
        it('returns false if itemList is an array, assuming children are loaded', inject(function(pdxTreeChildManagerService) {
            var itemList = [];
            expect(pdxTreeChildManagerService.areChildrenLoading(itemList)).toBe(false);
        }));

        it('returns true if itemList in not an array, assuming children therefore need to be loaded', inject(function(pdxTreeChildManagerService) {
            var itemList = 'notarray';
            expect(pdxTreeChildManagerService.areChildrenLoading(itemList)).toBe(true);
        }));

        it('returns false if itemList is false', inject(function(pdxTreeChildManagerService) {
            var itemList = false;
            expect(pdxTreeChildManagerService.areChildrenLoading(itemList)).toBe(false);
        }));

        it('handles a promise returned by $resource, by returning the inverse of $resolved', inject(function(pdxTreeChildManagerService) {
            var itemList = {$resolved: true};
            expect(pdxTreeChildManagerService.areChildrenLoading(itemList)).toBe(false);
        }));
    });
});