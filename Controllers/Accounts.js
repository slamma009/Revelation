const electron = require('electron');
const { ipcRenderer } = electron;

angular.module('revelation')
.directive('accountSettings', function() {
  return {
    templateUrl: 'Controllers/Accounts.html',
    controller: accountsController,
    scope: {
      accounts: '='
    }
  };
});

function accountsController($scope){
  $scope.changed = false;
  $scope.bittrexChanged = false;

  // Watch for the manual wallets to change from main to get the wallet list
  $scope.$watch('accounts.manualWallets', function(d){
    $scope.manualWallets = $scope.accounts.manualWallets;
    $scope.bittrexAccounts = $scope.accounts.bittrexAccounts;
    
  });

  // Manual Walets \\
  // Add a new row to the manual wallets
  $scope.addManualWallet = function(){
    $scope.manualWallets.push({Ticker: '', Quantity: 0, Description: ''})
  };
  
  // Set the changed property to true, for the manual tables save button display
  $scope.change = function(section){
    if(section === 'bittrex'){
      $scope.bittrexChanged = true;
    } else {
      $scope.changed=true;
    }
  };

  // Delete a wallet from the manual wallet list
  $scope.deleteManualWallet = function(index){
    $scope.manualWallets.splice(index, 1);
    $scope.change();
  };

  // Bittrex Accounts \\

  $scope.addBittrexAccount = function(){
    if($scope.bittrexAccounts === undefined){
      $scope.bittrexAccounts = [];
    }
    $scope.bittrexAccounts.push(angular.copy($scope.newBittrex));
    $scope.newBittrex = {};
    $scope.change('bittrex');
  };

  $scope.deleteBittrex = function (index){
    $scope.bittrexAccounts.splice(index, 1);
    $scope.change('bittrex');
  };

  // Save all the wallets
  $scope.saveSettings = function(){
    var saveItem = {};
    saveItem.bittrexAccounts = $scope.bittrexAccounts;
    saveItem.manualWallets = $scope.manualWallets;
    localStorage.setItem('accountInfo', JSON.stringify(saveItem));
    $scope.changed = false;
    $scope.bittrexChanged = false;
    $scope.accounts = saveItem;
  };

}