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
    var marketsToLoad = 2;
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
            $scope.walletHolder[ticker] = {quantity: 0, usdValue: 0, btcValue: 0};
        }
    }

    // Loads all the market data from all included exchanges
    function getAllMarkets(){
        // Reset the loaded markets and the raw market data
        loadedMarkets = 0;
        rawMarkets = [];
        getPoloniexMarkets().then(function(response){
            // We need to make the Poloniex data match the Bittrex data
            loadedMarkets++;

            // Poloniex has all the ticker data stored under the market name, so we need to get all the properties
            var properties = [];
            for(var key in response) {
                if(response.hasOwnProperty(key) && typeof response[key] !== 'function') {
                    properties.push(key);
                }
            }
            
            // Now loop thorugh all the properties to create the modified market data
            var marketObj = [];
            for(var i=0; i<properties.length; ++i){
                var newObj = {};
                // Market names look like BTC_ETH on polonies, we need it to be BTC-ETH
                var tickerObj = properties[i].replace('_','-'); 
                newObj.MarketName = tickerObj;
                newObj.Ask = response[properties[i]].lowestAsk;
                newObj.Bid = response[properties[i]].highestBid;
                newObj.Last = response[properties[i]].last;
                newObj.BaseVolume = response[properties[i]].baseVolume;

                marketObj.push(newObj);
            }
            rawMarkets.push(marketObj);
            combineMarkets();
        });
        
        getBittrexMarkets().then(function(response){
            if(response.success) {
                loadedMarkets++;
                rawMarkets.push(response.result);
                combineMarkets();
            } else {
                alert(response.message);
            }
        });
    }

    // Combines any and all market data into 1 usable market summarie
    function combineMarkets(){
        // Make sure we have all the data before continuing
        if(loadedMarkets === marketsToLoad){
            var marketSummary = [];
            // Loop through each markets response
            for(var i=0; i<rawMarkets.length; ++i){
                // Loop through all the coins for tha tmarket
                for(var j=0; j<rawMarkets[i].length; ++j){
                    // Only currently using BTC and USDT markets.
                    // Note: Any exchange that uses USD will be modified to match USDT for simplicity
                    if(rawMarkets[i][j].MarketName.split('-')[0] === 'BTC' 
                    || rawMarkets[i][j].MarketName.split('-')[0] === 'USDT')
                    {

                        var found = false;
                        // Loop through all market summaries to make sure it's not already added
                        for(var k = 0; k<marketSummary.length; ++k){
                            if(marketSummary[k].MarketName === rawMarkets[i][j].MarketName){
                                found = true;
                                // TODO: Maybe average market data in future?
                                break;
                            }
                        }
                        if(!found){
                            // If it wasn't found then push the market data to the list
                            marketSummary.push(rawMarkets[i][j]);
                        }
                    }
                }
            }
            $scope.marketSummaries = angular.copy(marketSummary);
            // Now that all market data has been loaded, load all account info
            getWallets();
        }
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
        usdValue = usdValue.toFixed(2);
        btcValueRounded = btcValueRounded.toFixed(numOfDecimalsToShow);
        
        var $target = $("#usdDisplay");
        
        if(($scope.tickerToShow === 'USD' && usdValue > $scope.usdValue) || ($scope.tickerToShow === 'BTC' && btcValueRounded > $scope.btcValueRounded)) {
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
        $scope.btcValueRounded = btcValueRounded;
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
    }, 30000)
});