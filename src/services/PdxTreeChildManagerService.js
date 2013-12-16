/**
 * Created by nackjicholson on 11/29/13.
 */

angular.module('pdxTree').provider(
    'pdxTreeChildManagerService',
    [
        function() {
            "use strict";

            var defaultHasChildren = function(node) {
                return (angular.isArray(node.childList) && node.childList.length > 0);
            };

            var loadChildren = function(node, config) {
                if (config && angular.isFunction(config.loadChildren)) {
                    return config.loadChildren(node, angular.noop);
                }

                return null;
            };

            var hasChildren = function(node, config) {
                if (config && angular.isFunction(config.hasChildren)) {
                    return config.hasChildren(node, defaultHasChildren);
                }

                return defaultHasChildren(node);
            };

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

            function PdxTreeChildLoader() {
                this.loadChildren = loadChildren;
                this.hasChildren = hasChildren;
                this.areChildrenLoading = areChildrenLoading;
            }

            this.$get = function() {
                return new PdxTreeChildLoader();
            };
        }
    ]
);
