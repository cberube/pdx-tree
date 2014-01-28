angular.module('pdxTree').directive(
    'pdxTreeChildren',
    [
        'pdxTreeNestedImplementation', 'pdxTreeSiblingImplementation',
        function(pdxTreeNestedImplementation, pdxTreeSiblingImplementation) {
            return {
                restrict: "EA",
                require: ["?^pdxTree", "?^pdxTreeItem"],
                link: function(scope, element, attributes, treeControllers)
                {
                    var pdxTree = treeControllers[0];
                    var pdxTreeItem = treeControllers[1];

                    if (!pdxTree || !pdxTreeItem) {
                        return;
                    }

                    pdxTree.setChildTemplate(element);
                    pdxTree.setChildStrategy(pdxTreeItem.getElement() === element ? pdxTreeSiblingImplementation : pdxTreeNestedImplementation);
                }
            };
        }
    ]
);