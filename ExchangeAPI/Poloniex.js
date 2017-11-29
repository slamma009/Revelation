function getPoloniexMarkets() {
    var url = 'https://poloniex.com/public?command=returnTicker';
    
    return $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(response) {
            return response;
        },
        error: function(error) {
            console.log(error);
        }
    });
}