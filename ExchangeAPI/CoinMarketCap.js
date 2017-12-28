function getCoinMarketCap() {
    var url = 'https://api.coinmarketcap.com/v1/ticker/?limit=0';
    
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