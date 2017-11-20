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

function portfolioController($scope){
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
            legend: {
                display: false
            }
        }
    });
    $scope.$watch('walletHolder', function (walletHolder){
        // create a copy of the holder to order wallets by USD value
        var holder = angular.copy(walletHolder);
        holder.allTickers = holder.allTickers.sort(function(a,b) {
            return holder[b].usdValue - holder[a].usdValue;
        });
        
        // Set the labels to the wallet tickers
        $scope.chart.data.labels = holder.allTickers;

        // Create the data set object and put in the usdValues
        var dataset = {label:'', backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"], data: []}
        for(var i=0; i<holder.allTickers.length; ++i){
            dataset.data.push(holder[holder.allTickers[i]].usdValue);
        }

        // Generate a color rainbow for the pie chart
        $scope.rainbow = new Array(holder.allTickers.length);
        for (var i=0; i<holder.allTickers.length; i++) {
          var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
          var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
          var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg
        
          $scope.rainbow[i] = "#"+ red + green + blue;
        }
        
        function sin_to_hex(i, phase) {
          var sin = Math.sin(Math.PI / holder.allTickers.length * 2 * i + phase);
          var int = Math.floor(sin * 127) + 128;
          var hex = int.toString(16);
        
          return hex.length === 1 ? "0"+hex : hex;
        }

        // Set the color rainbow to the background colors, and add the dataset to the chart
        dataset.backgroundColor = $scope.rainbow; 
        $scope.chart.data.datasets = [dataset];

        //update the chart
        $scope.chart.update();
    });
}