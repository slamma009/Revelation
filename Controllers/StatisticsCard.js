
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

function statisticsCardController($scope, $window, Settings){
    $scope.Currencies = $window.Currencies;
    $scope.pageNumber = 0;

    $scope.changePage = function(value){
        $scope.pageNumber+= value;
    }

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };
    $scope.$watch(function(){
        return Settings.tickerToShow;
    }, function(newValue, oldValue){
        $scope.tickerToShow = newValue;
    });
}