angular.module('revelation')
.controller('accountsController', ['$scope', function($scope) {
  $scope.customer = {
    name: 'Naomi',
    address: '1600 Amphitheatre'
  };
}])
.directive('accountSettings', function() {
  return {
    templateUrl: 'Controllers/Accounts.html'
  };
});