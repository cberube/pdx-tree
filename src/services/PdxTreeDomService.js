/**
 * The PdxTreeDomService provides helper methods which locate and manipulate DOM elements in ways
 * that are useful during tree construction.
 */
angular.module('pdxTree').service(
    'pdxTreeDomService',
    [
        function() {
            /**
             * Recursively destroy all the scopes attached to children of the given element, and
             * remove the child elements from the DOM.
             *
             * @param {Object} parentElement The parent element (which should be an angular.element)
             */
            var destroyChildren = function(parentElement) {
                angular.forEach(parentElement.children(), function(element) {
                    var scope;

                    element = angular.element(element);
                    scope = element.scope();

                    if (scope && !scope.$$destroyed) {
                        scope.$destroy();
                    }

                    destroyChildren(element);

                    element.remove();
                });
            };

            /**
             * Appends all the elements in the elementList argument to the parentElement.
             *
             * @param {Object} parentElement The element to append children to
             * @param {Array} elementList The list of child elements to append
             */
            var appendAllElements = function(parentElement, elementList) {
                angular.forEach(elementList, function(element) {
                    parentElement.append(element);
                });
            };

            /**
             * Searches the children of the parent element (optionally recursively) until a child is found with
             * the given attribute attached to it. If no such element is found, null is returned.
             *
             * @param {Object} parent The parent element to search through
             * @param {String} attribute The attribute to search for
             * @param {Boolean} recursive True for a recursive search, false for a flat search
             * @returns {Object|Null} The element containing the given attribute, or null if no such element exists
             */
            var findChildWithAttribute = function(parent, attribute, recursive) {
                var children = parent.children();
                var childrenSearchResult = null;
                var attributeValue;
                var i;

                for (i = 0; i < children.length; i++) {
                    attributeValue = children[i].getAttribute(attribute);

                    if (typeof attributeValue != 'undefined' && attributeValue !== null) {
                        return children[i];
                    }

                    if (recursive) {
                        childrenSearchResult = findChildWithAttribute(angular.element(children[i]), attribute, true);

                        if (childrenSearchResult !== null) {
                            return childrenSearchResult;
                        }
                    }
                }

                return null;
            };

            // Return the service object
            return {
                "appendAllElements": appendAllElements,
                "destroyChildren": destroyChildren,
                "findChildWithAttribute": findChildWithAttribute
            };
        }
    ]
);