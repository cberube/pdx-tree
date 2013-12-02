/**
 * Created by nackjicholson on 11/29/13.
 */

angular.module('pdxTree').directive(
    'pdxTree',
    [
        '$compile',
        function($compile) {
            var defaultConfig = {
                loadingTemplate: "<div>Loading...</div>",
                listContainerTemplate: "<ul></ul>",
                itemContainerTemplate: "<li></li>",
                itemNameTemplate: "<div ng-click='expand(item)'><span class='glyphicon' ng-class='getIcon(item)'></span>{{ item.name }}</div>",
                childListTemplate: "<div ng-if='item.expanded'></div>"
            };

            return {
                restrict: "EA",
                scope: {
                    "itemList": "=",
                    "config": "=",
                    "class": '@',
                    'id': '@',
                    'pdxTreeConfig': '='
                },
                link: function(scope, element) {
                    scope.pdxTreeConfig = angular.extend(defaultConfig, scope.pdxTreeConfig);

                    var template = "<div class='{{class}}' id='{{id}}'><pdx-tree-branch pdx-tree-config='pdxTreeConfig' item-list='itemList'></pdx-tree-branch></div>";
                    var newElement = angular.element(template);

                    $compile(newElement)(scope);
                    element.replaceWith(newElement);
                }
            };
        }
    ]
);
