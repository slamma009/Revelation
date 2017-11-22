
angular.module('revelation')
.directive('globalSettings', function() {
  return {
    templateUrl: 'Controllers/Settings.html',
    controller: globalSettingsController,
    scope: {
    }
  };
});

function globalSettingsController($scope, Settings){
  $scope.tickerOptions = ["USD", "BTC"]
  $scope.settingsChanged = false;

  // Called when a field is changed, to update the global settings and turn on the save button
  $scope.changeSettings = function(){
    $scope.settingsChanged = true;
    setGlobalSettings();
  };

  // Save the current settings
  $scope.saveSettings = function(){
    $scope.settingsChanged = false;
    console.log($scope.settings);
    localStorage.setItem('globalSettings', JSON.stringify($scope.settings));
  }
  // Load the existing settings
  function loadSettings() {
    $scope.settings = JSON.parse(localStorage.getItem('globalSettings'));
    console.log($scope.settings);

    // If there aren't any settings, load the default ones
    if($scope.settings === undefined || $scope.settings === null) {  
      $scope.settings = {};
      $scope.settings.tickerToShow = 'USD';
    }
    setGlobalSettings();
  }

  // Set the Settings Service properties to our settings object properties
  function setGlobalSettings(){
    Settings.tickerToShow = $scope.settings.tickerToShow;
  }

  loadSettings();
}