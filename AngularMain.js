var app = angular.module('revelation', []);

app.service('Settings', function() {
	var tickerToShow = 'USD';

	return {
		tickerToShow: tickerToShow
	};
});
app.controller('mainController', function ($scope, Settings){
    var loadedAccounts = 0;
    $scope.selected = 'portfolio';
    $scope.usdValue = 0;
    $scope.walletHolder = {};
    Settings.tickerToShow = 'USD';
    
    function loadAccounts() {
        var item = JSON.parse(localStorage.getItem('accountInfo'));
        if(item !== undefined && item !== null){
            $scope.accounts = item;
        } else {
        	item = {};
        	item.manualWallets = [];
        	item.bittrexAccounts = [];
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

    // Get's the market value of each coin
    function getMarketValues(){
        var usdValue = 0;
        var btcValueRounded = 0;
        var btcValue = 0;
        var tickersToRemove = []; // Keep a list of tickers that are practically worthless, so we can remove them
        for(var i=0; i<$scope.marketSummaries.length; ++i){
            // Get the base and market ticker
            var baseTicker = $scope.marketSummaries[i].MarketName.split('-')[0];
            var marketTicker = $scope.marketSummaries[i].MarketName.split('-')[1];
            
            // If this is a BTC market, get the BTC value 
            if(baseTicker === 'BTC'){
                if($scope.walletHolder[marketTicker] !== undefined){
                    $scope.walletHolder[marketTicker].btcValue = $scope.marketSummaries[i].Last * $scope.walletHolder[marketTicker].quantity;
                    $scope.walletHolder[marketTicker].btcValueRounded = $scope.walletHolder[marketTicker].btcValue.toFixed(numOfDecimalsToShow);
                    $scope.walletHolder[marketTicker].btcMarketValue = $scope.marketSummaries[i].Last;
                }
            } else if(baseTicker === 'USDT' && marketTicker === 'BTC'){
                btcValue = $scope.marketSummaries[i].Last;
            }
        }

        // Now that we have the market prices for all coins, lets calculat ethe USD value for all coins
        for(var j=0; j<$scope.walletHolder.allTickers.length; ++j){
            // If the coin is not BTC we have to convert to BTC, then to USD
            if($scope.walletHolder.allTickers[j] !== 'BTC'){
                $scope.walletHolder[$scope.walletHolder.allTickers[j]].usdValue = Math.round($scope.walletHolder[$scope.walletHolder.allTickers[j]].btcValue * btcValue * 100) / 100;
                $scope.walletHolder[$scope.walletHolder.allTickers[j]].usdMarketValue = Math.round($scope.walletHolder[$scope.walletHolder.allTickers[j]].btcMarketValue * btcValue * 100) / 100;
                if($scope.walletHolder[$scope.walletHolder.allTickers[j]].usdValue < 0.5)
                {
                    $scope.walletHolder[$scope.walletHolder.allTickers[j]] = undefined;
                    tickersToRemove.push(j);
                } else {
                    usdValue += $scope.walletHolder[$scope.walletHolder.allTickers[j]].usdValue;
                    btcValueRounded += $scope.walletHolder[$scope.walletHolder.allTickers[j]].btcValue;
                }
            } else {
                $scope.walletHolder['BTC'].btcValue =  $scope.walletHolder['BTC'].quantity;
                $scope.walletHolder['BTC'].btcValueRounded = $scope.walletHolder['BTC'].quantity.toFixed(numOfDecimalsToShow);
                $scope.walletHolder['BTC'].usdValue =  Math.round($scope.walletHolder['BTC'].btcValue * btcValue * 100) / 100;
                $scope.walletHolder['BTC'].usdMarketValue = Math.round(btcValue * 100) / 100;
                usdValue += $scope.walletHolder['BTC'].usdValue;
                btcValueRounded+= $scope.walletHolder['BTC'].btcValue;
            }
        }

        //remove any coins that are worth little to nothing.
        for(var i=tickersToRemove.length - 1; i >= 0; --i){
            $scope.walletHolder.allTickers.splice(tickersToRemove[i], 1);
        }
        usdValue = Math.round(usdValue * 100) / 100;
        btcValueRounded = btcValueRounded.toFixed(numOfDecimalsToShow);
        
        var $target = $("#usdDisplay");
        
        if(usdValue > $scope.usdValue){
            $target.css("color", '#50c35a');
        } else {
            $target.css("color", "#c35252");
        }
        
        $target.animate({color:'#fff'}, 15000, 'linear');
        $scope.usdValue = usdValue
        $scope.btcValueRounded = btcValueRounded;
        $scope.$apply();
    }

    $scope.$watch('accounts', function(){
        getWallets();
    });

    $scope.$watch(function(){
        return Settings.tickerToShow;
    }, function(newValue, oldValue){
        $scope.tickerToShow = newValue;
    });

    loadAccounts();

    setInterval(function(){
        getWallets()}, 30000)
});