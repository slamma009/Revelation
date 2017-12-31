angular.module('revelation')
.directive('statistics', function() {
    return {
        templateUrl: 'Controllers/Statistics.html',
        controller: statisticsController,
        scope: {
            walletHolder: '='
        }
    };
});

function statisticsController($scope, Settings){
  
    $scope.allCoins = [];
    $scope.MostValuableCoins = [];
    $scope.gainsHolder = {};
    $scope.$watch('walletHolder', function(walletHolder){

        if(walletHolder !== undefined && walletHolder.allTickers !== undefined){
            $scope.allCoins = [];
            for(var i=0; i<walletHolder.allTickers.length; ++i){
                $scope.allCoins.push({ticker: walletHolder.allTickers[i], wallet: walletHolder[walletHolder.allTickers[i]]});
            }
            calculateGains('percent_change_1h');
            calculateGains('percent_change_24h');
            calculateGains('percent_change_7d');

            calculateValuable();
            
        }
    });

    function calculateValuable(){
        $scope.MostValuableCoins = angular.copy($scope.allCoins).sort(function(a, b){
            return b.wallet['price_' + $scope.tickerToShow] - a.wallet['price_' + $scope.tickerToShow];
        });
    }

    
    function calculateGains(propertyName) {
        if($scope.allCoins.length > 0 && $scope.allCoins[0].wallet[propertyName] !== undefined)
        {
            var GainsTemp = angular.copy($scope.allCoins).sort(function(a, b){
                return b.wallet[propertyName] - a.wallet[propertyName];
            });
            
            var Gains = [];
            for(var i=0; i<GainsTemp.length; ++i){
                var coin = {ticker: GainsTemp[i].ticker, gains: GainsTemp[i].wallet[propertyName]}
                Gains.push(coin);
            }

            $scope.gainsHolder[propertyName] = Gains;
        }

    }

  
    $scope.$watch(function(){
        return Settings.tickerToShow;
    }, function(newValue, oldValue){
        $scope.tickerToShow = newValue.toLowerCase();
    });
}