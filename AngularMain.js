var app = angular.module('revelation', []);

app.controller('mainController', function ($scope){
    var loadedAccounts = 0;
    $scope.selected = 'statistics';
    $scope.usdValue = 0;
    $scope.walletHolder = {};
    
    function loadAccounts() {
        var item = JSON.parse(localStorage.getItem('accountInfo'));
        if(item !== undefined && item !== null){
            $scope.accounts = item;
        }
    }
    
    function checkForWalletKey(ticker){
        if(!hasKey($scope.walletHolder, ticker)){
            $scope.walletHolder.allTickers.push(ticker);
            $scope.walletHolder[ticker] = {quantity: 0, usdValue: 0, btcValue: 0};
        }
    }

    function getWallets(){ 
        getMarketSummariesFromAPI().then(function(response){
            loadedAccounts = 0;
            $scope.marketSummaries = response.result;
            $scope.walletHolder = {};
            $scope.walletHolder.allTickers = [];
            getBittrexWallets();
            for(var i=0; i<$scope.accounts.manualWallets.length; ++i){
                checkForWalletKey($scope.accounts.manualWallets[i].Ticker)
                
                $scope.walletHolder[$scope.accounts.manualWallets[i].Ticker].quantity += parseFloat($scope.accounts.manualWallets[i].Quantity);
            }
            if($scope.accounts.bittrexAccounts.length === 0){
                getMarketValues();
            }
        });
    }

    function getBittrexWallets() {
        for(var i=0; i<$scope.accounts.bittrexAccounts.length; ++i){
            getWalletsFromAPI($scope.accounts.bittrexAccounts[i]).then(function(response){
                if(response.success){
                    for(var j=0; j<response.result.length; ++j){
                        checkForWalletKey(response.result[j].Currency);
                        $scope.walletHolder[response.result[j].Currency].quantity += parseFloat(response.result[j].Balance);
                    }
                    accountLoaded();
                } else {
                    alert(response.message);
                }
            });
        }
    }

    function accountLoaded(){
        loadedAccounts++;
        if(loadedAccounts === $scope.accounts.bittrexAccounts.length)
            getMarketValues();
    }

    function getMarketValues(){
        var usdValue = 0;
        var tickersToRemove = [];
        for(var i=0; i<$scope.marketSummaries.length; ++i){
            var baseTicker = $scope.marketSummaries[i].MarketName.split('-')[0];
            var marketTicker = $scope.marketSummaries[i].MarketName.split('-')[1];
            if(baseTicker === 'BTC'){
                if($scope.walletHolder[marketTicker] !== undefined){
                    $scope.walletHolder[marketTicker].btcValue = $scope.marketSummaries[i].Last * $scope.walletHolder[marketTicker].quantity;
                }
            } else if(baseTicker === 'USDT' && marketTicker === 'BTC'){
                btcValue = $scope.marketSummaries[i].Last;
                for(var j=0; j<$scope.walletHolder.allTickers.length; ++j){
                    if($scope.walletHolder.allTickers[j] !== 'BTC'){
                        $scope.walletHolder[$scope.walletHolder.allTickers[j]].usdValue = $scope.walletHolder[$scope.walletHolder.allTickers[j]].btcValue * btcValue;
                        if($scope.walletHolder[$scope.walletHolder.allTickers[j]].usdValue < 5)
                        {
                            $scope.walletHolder[$scope.walletHolder.allTickers[j]] = undefined;
                            tickersToRemove.push(j);
                        } else {
                            usdValue += $scope.walletHolder[$scope.walletHolder.allTickers[j]].usdValue;
                        }
                    } else {
                        $scope.walletHolder['BTC'].btcValue =  $scope.walletHolder['BTC'].quantity;
                        $scope.walletHolder['BTC'].usdValue =  $scope.walletHolder['BTC'].btcValue * btcValue;
                        usdValue += $scope.walletHolder['BTC'].usdValue;
                    }
                }
            }
        }
        for(var i=tickersToRemove.length - 1; i >= 0; --i){
            $scope.walletHolder.allTickers.splice(tickersToRemove[i], 1);
        }
        $scope.usdValue = Math.round(usdValue * 100) / 100;
        $scope.$apply();
    }
    $scope.$watch('accounts', function(){
        getWallets();
    });
    loadAccounts();

    setInterval(function(){
        getWallets()}, 30000)
});