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

            var renderChildren = function(itemScope) {
                var childElementList;

                itemScope.childStrategy.removeChildren(itemScope);

                // If we are not expanded, or we are an empty node, we have nothing more to do
                if (!itemScope.node.expanded || !itemScope.node.childList) {
                    return;
                }

                // If our children are still loading, we need to call renderChildren again when
                // the promise related to loading the children resolves, but until then, we have
                // nothing to do
                if (itemScope.node.childList.$promise && !itemScope.node.childList.$resolved) {
                    itemScope.node.childList.$promise.then(angular.bind(this, renderChildren, itemScope));
                    return;
                }

                angular.forEach(
                    itemScope.node.childList,
                    function(child) {
                        childElementList = itemScope.childStrategy.createItem(itemScope, child);
                        itemScope.childStrategy.addChildren(itemScope, childElementList);
                    }
                );

            };

            return {
                "hasChildren": hasChildren,
                "areChildrenLoading": areChildrenLoading,
                "renderChildren": renderChildren
            };
        }
    ]
);
