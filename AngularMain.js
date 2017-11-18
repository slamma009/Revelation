var app = angular.module('revelation', []);

app.controller('mainController', function ($scope){
    $scope.selected = 'portfolio';
    $scope.usdValue = 900;
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
        $scope.walletHolder = {};
        $scope.walletHolder.allTickers = [];
        for(var i=0; i<$scope.accounts.manualWallets.length; ++i){
            checkForWalletKey($scope.accounts.manualWallets[i].Ticker)
            
            $scope.walletHolder[$scope.accounts.manualWallets[i].Ticker].quantity += parseFloat($scope.accounts.manualWallets[i].Quantity);
        }
    }
    $scope.$watch('accounts', function(){
        getWallets();
    });
    loadAccounts();
});