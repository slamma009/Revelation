angular.module('revelation')
.directive('portfolio', function() {
    return {
        templateUrl: 'Controllers/Portfolio.html',
        controller: portfolioController,
        scope: {
            walletHolder: '='
        }
    };
});

function portfolioController($scope, Settings){
    $scope.chart = new Chart(document.getElementById("pie-chart"), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                label: "",
                backgroundColor: [],
                data: []
            }]
        },
        options: {
            cutoutPercentage: 80,
            elements: {
                arc: {
                    borderWidth: 1
                }
            },
            animation : false,  
            legend: {
                display: false
            }
        }
    });
    
    $scope.$watch(function(){
        return Settings.tickerToShow;
    }, function(newValue, oldValue){
        $scope.tickerToShow = newValue;
    });

    $scope.$watch('walletHolder', function (walletHolder){
        if(walletHolder !== undefined && walletHolder.allTickers !== undefined){
            // create a copy of the holder to order wallets by USD value
            var holder = angular.copy(walletHolder);
            holder.allTickers = holder.allTickers.sort(function(a,b) {
                return holder[b].usdValue - holder[a].usdValue;
            });
            
            // Set the labels to the wallet tickers
            $scope.chart.data.labels = holder.allTickers;

            // Create the data set object and put in the usdValues
            var dataset = {label:'', backgroundColor: [], data: []}
            for(var i=0; i<holder.allTickers.length; ++i){
                dataset.data.push(holder[holder.allTickers[i]].usdValue);
            }

            // Generate a color rainbow for the pie chart
            $scope.rainbow = new Array(holder.allTickers.length);
            $scope.rainbowInner = new Array(holder.allTickers.length);
            for (var i=0; i<holder.allTickers.length; i++) {
            var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
            var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
            var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg
            
            $scope.rainbow[i] = "#"+ red[0] + green[0] + blue[0];
            $scope.rainbowInner[i] = "#"+ red[1] + green[1] + blue[1];
            }

            function sin_to_hex(i, phase) {
            var sin = Math.sin(Math.PI / holder.allTickers.length * 2 * i + phase);
            var int = Math.floor((Math.floor(sin * 127) + 128) * 1);
            var darkerInt = Math.floor((Math.floor(sin * 127) + 128) * 0.75); // Multiply by 0.7 to make the colors darker.
            var hex = int.toString(16);
            var darkerHex = darkerInt.toString(16);
            var returnItem = [];
            returnItem.push(hex.length === 1 ? "0"+hex : hex);
            returnItem.push(darkerHex.length === 1 ? "0"+darkerHex : darkerHex);
            return returnItem;
            }

            // Set the color rainbow to the background colors, and add the dataset to the chart
            var datasetDarker = angular.copy(dataset);
            datasetDarker.backgroundColor = $scope.rainbowInner;
            datasetDarker.borderColor = $scope.rainbowInner; 
            dataset.backgroundColor = $scope.rainbow; 
            dataset.borderColor = $scope.rainbow;
            $scope.chart.data.datasets = [angular.copy(dataset), dataset, datasetDarker];

            //update the chart
            $scope.chart.update();
        }
    });
}