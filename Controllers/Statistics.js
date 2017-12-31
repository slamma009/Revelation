angular.module('revelation')
.directive('statistics', function() {
    return {
        templateUrl: 'Controllers/Statistics.html',
        controller: statisticsController,
        scope: {
            walletHolder: '=',
            marketSummaries: '='
        }
    };
});

function statisticsController($scope, Settings){
  
    $scope.coinsHolder = {};
    $scope.coinsHolder.allCoins = [];
    $scope.coinsHolder.heldCoins = [];
    $scope.allCoins = {gainsHolder: {}, MostValuableCoins: []};
    $scope.heldCoins = {gainsHolder: {}, MostValuableCoins: []};
    $scope.$watch('walletHolder', function(walletHolder){

        if(walletHolder !== undefined && walletHolder.allTickers !== undefined){
            $scope.coinsHolder.heldCoins = [];
            for(var i=0; i<walletHolder.allTickers.length; ++i){
                $scope.coinsHolder.heldCoins.push({ticker: walletHolder.allTickers[i], wallet: walletHolder[walletHolder.allTickers[i]]});
            }
            calculateGains('heldCoins', 'percent_change_1h');
            calculateGains('heldCoins', 'percent_change_24h');
            calculateGains('heldCoins', 'percent_change_7d');

            calculateValuable('heldCoins');
            
        }
    });
    $scope.$watch('marketSummaries', function(marketSummaries){
        if(marketSummaries !== undefined && marketSummaries.length > 0){
            $scope.coinsHolder.allCoins = [];
            for(var i=0; i<marketSummaries.length; ++i){
                $scope.coinsHolder.allCoins.push({ticker: marketSummaries[i].symbol, wallet: marketSummaries[i]});
            }
            calculateGains('allCoins', 'percent_change_1h');
            calculateGains('allCoins', 'percent_change_24h');
            calculateGains('allCoins', 'percent_change_7d');

            calculateValuable('allCoins');
        }
    });

    function calculateValuable(coins){
        $scope[coins].MostValuableCoins = angular.copy($scope.coinsHolder[coins]).sort(function(a, b){
            return b.wallet['price_' + $scope.tickerToShow] - a.wallet['price_' + $scope.tickerToShow];
        });
    }

    
    function calculateGains(coins, propertyName) {
        if($scope.coinsHolder[coins].length > 0 && $scope.coinsHolder[coins][0].wallet[propertyName] !== undefined)
        {
            var GainsTemp = angular.copy($scope.coinsHolder[coins]).sort(function(a, b){
                return b.wallet[propertyName] - a.wallet[propertyName];
            });
            
            var Gains = [];
            for(var i=0; i<GainsTemp.length; ++i){
                var coin = {ticker: GainsTemp[i].ticker, gains: GainsTemp[i].wallet[propertyName]}
                Gains.push(coin);
            }

            $scope[coins].gainsHolder[propertyName] = Gains.slice(0,20);
        }

    }

  
    $scope.$watch(function(){
        return Settings.tickerToShow;
    }, function(newValue, oldValue){
        $scope.tickerToShow = newValue.toLowerCase();
    });
}