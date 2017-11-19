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

function statisticsController($scope){
  
  // Watch for the manual wallets to change from main to get the wallet list
    $scope.$watch('walletHolder', function(d){
        for(var i=0; i<$scope.walletHolder.allTickers.length; ++i){
            cryptoCompareCall('pricehistorical?fsym=' + $scope.walletHolder.allTickers[i] + '&tsyms=BTC,USD&ts=' + '1452680400' + '&extraParams=Revelation').then(function(response){
                console.log(response);
            });
        }
    });

  
}