
angular.module('revelation')
.directive('globalSettings', function() {
  return {
    templateUrl: 'Controllers/Settings.html',
    controller: globalSettingsController,
    scope: {
    }
  };
});

function globalSettingsController($scope, $css, Settings){
  $scope.tickerOptions = ["USD", "BTC"];
  $scope.themeOptions = ["Light", "Dark", "Space", 'Geometry'];
  $scope.settingsChanged = false;

  // Called when a field is changed, to update the global settings and turn on the save button
  $scope.changeSettings = function(){
    $scope.settingsChanged = true;
    setGlobalSettings();
  };

  // Save the current settings
  $scope.saveSettings = function(){
    $scope.settingsChanged = false;
    
    localStorage.setItem('globalSettings', JSON.stringify($scope.settings));
  }
  // Load the existing settings
  function loadSettings() {
    $scope.settings = JSON.parse(localStorage.getItem('globalSettings'));
    

    var hasSettings = !($scope.settings === undefined || $scope.settings === null);

    if(!hasSettings) {  
      $scope.settings = {};
    }
    
    if(!hasSettings || $scope.settings.tickerToShow === undefined)
      $scope.settings.tickerToShow = 'USD';
      
    if(!hasSettings || $scope.settings.theme === undefined)
      $scope.settings.theme = 'Light';
    setGlobalSettings();
  }

  // Set the Settings Service properties to our settings object properties
  function setGlobalSettings(){
    Settings.tickerToShow = $scope.settings.tickerToShow;

    //if(Settings.theme !== $scope.settings.theme){
      $css.remove('Themes/' + Settings.theme + '.css');
      Settings.theme = $scope.settings.theme;
      $css.add('Themes/' + Settings.theme + '.css');
    //}
  }

  loadSettings();
}