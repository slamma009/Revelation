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
  
    $scope.allCoins = [];
    $scope.MostValuableCoins = [];
    $scope.WeeklyGains = [];
    $scope.DailyGains = [];
    $scope.MonthlyGains = [];
    $scope.day = {};
    $scope.week = {};
    $scope.month = {};
    $scope.$watch('walletHolder', function(walletHolder){

        if(walletHolder !== undefined && walletHolder.allTickers !== undefined){
            $scope.allCoins = [];
            var monthTimestamp = getTimestamp(30);
            var weekTimestamp = getTimestamp(7);
            var dayTimestamp = getTimestamp(1);
            for(var i=0; i<walletHolder.allTickers.length; ++i){
                $scope.allCoins.push({ticker: walletHolder.allTickers[i], wallet: walletHolder[walletHolder.allTickers[i]]});
                
                getGains(monthTimestamp, walletHolder.allTickers[i], 30);
                getGains(weekTimestamp, walletHolder.allTickers[i], 7);
                getGains(dayTimestamp, walletHolder.allTickers[i], 1);
            }

            calculateValuable();
        }
    });

    function calculateValuable(){
        $scope.MostValuableCoins = angular.copy($scope.allCoins).sort(function(a, b){
            return b.wallet.usdMarketValue - a.wallet.usdMarketValue;
        });
        
        if($scope.MostValuableCoins.length > 5){
            $scope.MostValuableCoins = $scope.MostValuableCoins.splice(0, 5);
        }
    }

    function getGains(timestamp, ticker, days) {
        if((days === 30 && ($scope.month.timestamp !== timestamp || $scope.month[ticker] === undefined))  ||
        (days === 7 && ($scope.week.timestamp !== timestamp|| $scope.week[ticker] === undefined)) || 
        (days === 1 && ($scope.day.timestamp !== timestamp|| $scope.day[ticker] === undefined))) {
            cryptoCompareCall('pricehistorical?fsym=' + ticker + '&tsyms=BTC,USD&ts=' + timestamp + '&extraParams=Revelation').then(function(response){
                var properties = [];
                for(var key in response) {
                    if(response.hasOwnProperty(key) && typeof response[key] !== 'function') {
                        properties.push(key);
                    }
                } 
                for(var i=0; i<$scope.allCoins.length; ++i){
                    if($scope.allCoins[i].ticker === properties[0])
                    {
                        var gain = $scope.walletHolder[properties[0]].usdMarketValue - response[properties[0]].USD;
                        gain = (gain / response[properties[0]].USD) * 100;
                        if(days === 30){
                            $scope.month.timestamp = timestamp;
                            $scope.month[ticker] = response[properties[0]].USD;
                            $scope.allCoins[i].monthlyGain = Math.round(gain * 100 ) / 100;
                        } else if(days === 7) {
                            $scope.week.timestamp = timestamp;
                            $scope.week[ticker] = response[properties[0]].USD;
                            $scope.allCoins[i].weeklyGain = Math.round(gain * 100 ) / 100;
                        } else if(days === 1){
                            $scope.day.timestamp = timestamp;
                            $scope.day[ticker] = response[properties[0]].USD;
                            $scope.allCoins[i].dailyGain = Math.round(gain * 100 ) / 100;
                        }
                        break;
                    }
                }
                if(days === 30) {
                    calculateMonthlyGains();
                } else if(days === 7) {
                    calculateWeeklyGains();
                } else if(days === 1){
                    calculateDailyGains();
                }
            });
        } else {
            if(days === 30) { 
                var gain = $scope.walletHolder[ticker].usdMarketValue - $scope.month[ticker];
                gain = (gain / $scope.month[ticker]) * 100;
                for(var i=0; i<$scope.allCoins.length; ++i){
                    if($scope.allCoins[i].ticker === ticker)
                    {
                        $scope.allCoins[i].monthlyGain = Math.round(gain * 100)/100;
                        break;
                    }
                }
                calculateMonthlyGains();
            } else if(days === 7) {
                var gain = $scope.walletHolder[ticker].usdMarketValue - $scope.week[ticker];
                gain = (gain / $scope.week[ticker]) * 100;
                for(var i=0; i<$scope.allCoins.length; ++i){
                    if($scope.allCoins[i].ticker === ticker)
                    {
                        $scope.allCoins[i].weeklyGain = Math.round(gain * 100)/100;
                        break;
                    }
                }
                calculateWeeklyGains();
            } else if(days === 1){
                var gain = $scope.walletHolder[ticker].usdMarketValue - $scope.day[ticker];
                gain = (gain / $scope.day[ticker]) * 100;
                for(var i=0; i<$scope.allCoins.length; ++i){
                    if($scope.allCoins[i].ticker === ticker)
                    {
                        $scope.allCoins[i].dailyGain = Math.round(gain * 100)/100;
                        break;
                    }
                }
                calculateDailyGains();
            }
        }
    }
    function calculateMonthlyGains() {
        var MonthlyGains = angular.copy($scope.allCoins).sort(function(a, b){
            return b.monthlyGain - a.monthlyGain;
        });
        
        if(MonthlyGains.length > 5){
            MonthlyGains = MonthlyGains.splice(0, 5);
        }

        $scope.MonthlyGains = MonthlyGains;

    }
    function calculateWeeklyGains() {
        var WeeklyGains = angular.copy($scope.allCoins).sort(function(a, b){
            return b.weeklyGain - a.weeklyGain;
        });
        
        if(WeeklyGains.length > 5){
            WeeklyGains = WeeklyGains.splice(0, 5);
        }

        $scope.WeeklyGains = WeeklyGains;

    }
    function calculateDailyGains() {
        var DailyGains = angular.copy($scope.allCoins).sort(function(a, b){
            return b.dailyGain - a.dailyGain;
        });
        
        if(DailyGains.length > 5){
            DailyGains = DailyGains.splice(0, 5);
        }

        $scope.DailyGains = DailyGains;


    }

    function getTimestamp(days){
        var today = new Date();
        var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
        return dateToTimestamp(lastWeek);
    }

  
}