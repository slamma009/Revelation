
angular.module('revelation')
.directive('statisticsCard', function() {
  return {
    templateUrl: 'Controllers/StatisticsCard.html',
    controller: statisticsCardController,
    scope: {
        cardTitle: '=',
        displayObjects: '=',
        cardType: '='
    }
  };
});

function statisticsCardController($scope){
    $scope.pageNumber = 0;

    $scope.changePage = function(value){
        $scope.pageNumber+= value;
    }
}