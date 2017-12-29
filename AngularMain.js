var app = angular.module('revelation', ['angularCSS']);

app.service('Settings', function() {
	var tickerToShow = 'USD';
    var theme = 'Dark';

	return {
        tickerToShow: tickerToShow,
        theme: theme
	};
});
app.controller('mainController', function ($scope, Settings){
    var loadedAccounts = 0;
    var loadedMarkets = 0;
    var marketsToLoad = 1;
    var rawMarkets = [];
    $scope.selected = 'portfolio';
    $scope.usdValue = 0;
    $scope.walletHolder = {};
    Settings.tickerToShow = 'USD';
    // Loads any saved account info from the local storage
    function loadAccounts() {
        var item = JSON.parse(localStorage.getItem('accountInfo'));
        if(item !== undefined && item !== null){
            $scope.accounts = item;
        } else {
            // If the item doesn't exist, then makea  default one
        	item = {};
        	item.manualWallets = [];
        	item.bittrexAccounts = [];
        	$scope.accounts = item;
        }
    }
    
    function checkForWalletKey(ticker){
        // If the ticker is not in the wallet holder, then add it and assign it the default values
        if(!hasKey($scope.walletHolder, ticker)){
            $scope.walletHolder.allTickers.push(ticker);
            $scope.walletHolder[ticker] = {quantity: 0, total_usd: 0, total_btc: 0};
        }
    }

    // Loads all the market data from all included exchanges
    function getAllMarkets(){
        rawMarkets = [];
        getCoinMarketCap().then(function(response){
            $scope.marketSummaries = angular.copy(response);
            getWallets();
        });
    }

    // Creates all the wallets for the wallet holder, as well as the current market values
    function getWallets(){ 
        loadedAccounts = 0;
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
        var totalBtcValue = 0;
        var tickersToRemove = []; // Keep a list of tickers that are practically worthless, so we can remove them
        for(var i=0; i<$scope.marketSummaries.length; ++i){
            var marketTicker = $scope.marketSummaries[i].symbol;
            
            if($scope.walletHolder[marketTicker] !== undefined){
                $scope.walletHolder[marketTicker].total_usd = $scope.marketSummaries[i].price_usd * $scope.walletHolder[marketTicker].quantity;
                $scope.walletHolder[marketTicker].price_usd = $scope.marketSummaries[i].price_usd;
                $scope.walletHolder[marketTicker].total_btc = $scope.marketSummaries[i].price_btc * $scope.walletHolder[marketTicker].quantity;
                $scope.walletHolder[marketTicker].price_btc = $scope.marketSummaries[i].price_btc;
                if($scope.walletHolder[marketTicker].total_usd > 0.5){
                    totalBtcValue += $scope.walletHolder[marketTicker].total_btc;
                    usdValue += $scope.walletHolder[marketTicker].total_usd;
                } else {
                    $scope.walletHolder[$scope.walletHolder.allTickers[j]] = undefined;
                    tickersToRemove.push(j);
                }
            }
            
        }

        //remove any coins that are worth little to nothing.
        for(var i=tickersToRemove.length - 1; i >= 0; --i){
            $scope.walletHolder.allTickers.splice(tickersToRemove[i], 1);
        }
        
        var $target = $("#usdDisplay");
        
        if(($scope.tickerToShow === 'USD' && usdValue > $scope.usdValue) || ($scope.tickerToShow === 'BTC' && totalBtcValue > $scope.totalBtcValue)) {
            if($scope.theme === 'Dark')
                $target.css("color", '#50c35a');
            else
                $target.css("color", "#00ff00"); 
        } else {
            if($scope.theme === 'Dark')
                $target.css("color", "#c35252"); 
            else
                $target.css("color", "#ff0000"); 
        }
        
        $target.animate({color:'#fff'}, 15000, 'linear');
        $scope.usdValue = usdValue
        $scope.totalBtcValue = totalBtcValue;
        $scope.$apply();
    }

    $scope.$watch('accounts', function(){
        getAllMarkets();
    });

    $scope.$watch(function(){
        return Settings.tickerToShow;
    }, function(newValue, oldValue){
        $scope.tickerToShow = newValue;
    });

    $scope.$watch(function(){
        return Settings.theme;
    }, function(newValue, oldValue){
        $scope.theme = newValue;
        console.log('light');
    });

    loadAccounts();

    setInterval(function(){
        getAllMarkets()
    }, 300000)
});