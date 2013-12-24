angular.module('pdxTree').service(
    'pdxTreeChildManagerService',
    [
        function() {
            "use strict";

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

            var hasChildren = function(node) {
                return (node && node.childList && angular.isArray(node.childList) && node.childList.length > 0);
            };

            return {
                "hasChildren": hasChildren,
                "areChildrenLoading": areChildrenLoading
            };
        }
    ]
);
