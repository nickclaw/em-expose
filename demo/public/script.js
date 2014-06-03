angular.module('app', ['ngResource'])
    .controller('Controller', [
        '$scope',
        'Item',
        function($scope, Item) {
            $scope.items = Item.browse();
            $scope.new = new Item();
            $scope.submit = function() {
                $scope.new.$create({}, function() {
                    $scope.items.push($scope.new);
                    $scope.new = new Item();
                });
            }
            $scope.remove = function(item) {
                item.$delete({}, function() {
                    $scope.items.splice($scope.items.indexOf(item), 1);
                });
            }
        }
    ])
    .factory('Item', [
        '$resource',
        function($resource) {
            return $resource(
                '/api/item/:_id',
                {
                    _id: '@_id'
                },
                {
                    browse: {method: 'GET', isArray: true},
                    create: {method: 'POST'},
                    save: {method: 'PUT'},
                    delete: {method: 'DELETE'}
                }
            );
        }
    ])
    .directive('item', [
        function() {
            return {
                restrict: 'E',
                templateUrl: '/static/item.html'
            }
        }
    ])
