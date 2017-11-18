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
  $scope.$watch('accounts.manualWallets', function(d){
    $scope.manualWallets = $scope.accounts.manualWallets;
  });
  $scope.addManualWallet = function(){
    $scope.manualWallets.push({Ticker: '', Quantity: 0, Description: ''})
  };
  
  $scope.change = function(){
    $scope.changed=true;
  };

  $scope.deleteManualWallet = function(index){
    $scope.manualWallets.splice(index, 1);
    $scope.change();
  };

  $scope.saveManualWallets = function(){
    var saveItem = {};
    saveItem.bittrexAccounts =[];
    saveItem.manualWallets = $scope.manualWallets;
    localStorage.setItem('accountInfo', JSON.stringify(saveItem));
    $scope.changed = false;
    $scope.accounts = saveItem;
  };

}