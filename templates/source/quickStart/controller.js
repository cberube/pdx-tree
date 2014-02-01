function($scope) {
    $scope.tree = { };

    $scope.tree.controller = function(scope) { };

    $scope.tree.nodeList = [
        {
            'name': 'Node A',
            'childList': [
                { 'name': 'Child A1', 'childList': false },
                { 'name': 'Child A2', 'childList': false }
            ]
        },
        {
            'name': 'Node B',
            'childList': [
                { 'name': 'Child B1', 'childList': false },
                { 'name': 'Child B2', 'childList': false }
            ]
        },
        {
            'name': 'Node C',
            'childList': [
                { 'name': 'Child C1', 'childList': false },
                { 'name': 'Child C2', 'childList': false }
            ]
        }
    ];
};
