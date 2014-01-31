angular.module('PdxTreePages').controller(
    'ExampleOneCtrl',
    [
        '$scope',
        function($scope) {
            "use strict";

            var createNode = function(name, childList, properties) {
                return angular.extend(
                    {
                        "name": name,
                        "childList": childList || false
                    },
                    properties || {}
                );
            };

            $scope.tree = {};

            $scope.tree.controller = function(scope) {
                scope.getNodePadding = function(depth) {
                    return {
                        "padding-left": ((depth - 1) * 20) + "px"
                    };
                };
            };

            $scope.tree.nodeList = [
                createNode(
                    "Fermions",
                    [
                        createNode(
                            'Quarks',
                            [
                                createNode('Up', [], { "mass": "1.7 to 3.1", "charge": "+&#8532;" }),
                                createNode('Down', [], { "mass": "4.1 to 5.7", "charge": "-&#8531;" }),
                                createNode('Charm', [], { "mass": "1290 +50/-110", "charge": "+&#8532;" }),
                                createNode('Strange', [], { "mass": "100 +30/-20", "charge": "-&#8531;" }),
                                createNode('Top', [], { "mass": "172900 +/-600", "charge": "+&#8532;" }),
                                createNode('Bottom', [], { "mass": "4190 +180/-60", "charge": "-&#8531;" })
                            ]
                        ),
                        createNode(
                            'Leptons',
                            [
                                createNode('Electron', [], { "mass": "0.511", "charge": "-1" }),
                                createNode('Electron Neutrino', [], { "mass": "< 0.0000022", "charge": "0" }),
                                createNode('Muon', [], { "mass": "105.658", "charge": "-1" }),
                                createNode('Muon Neutrino', [], { "mass": "< 0.17", "charge": "0" }),
                                createNode('Tau', [], { "mass": "1776.84", "charge": "-1" }),
                                createNode('Tau Neutrino', [], { "mass": "< 15.5", "charge": "0" })
                            ]
                        )
                    ]
                ),
                createNode(
                    "Bosons",
                    [
                        createNode('Photon', [], { "charge": "0" }),
                        createNode('Gluon', [], { "charge": "0" }),
                        createNode('W boson', [], { "charge": "-1" }),
                        createNode('Z boson', [], { "charge": "0" }),
                        createNode('Higgs boson', [], { "charge": "0" }),
                        createNode('Graviton', [], { "charge": "0" })
                    ]
                )
            ];
        }
    ]
);
