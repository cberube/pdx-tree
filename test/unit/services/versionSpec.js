"use strict";
/**
 * Created by nackjicholson on 11/28/13.
 */

describe('version', function() {
    beforeEach(module('pdxTree.version'));

    it('should return current version', inject(function(version) {
        expect(version).toEqual('0.0.2');
    }));
});