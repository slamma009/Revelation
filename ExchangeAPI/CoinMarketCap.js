function getCoinMarketCap(currency, limit) {
    
    if(currency === undefined) {
        currency = 'USD';
    } 
    if(limit === undefined){ 
        limit = 0;
    }
    var url = 'https://api.coinmarketcap.com/v1/ticker/?convert=' + currency + '&limit=' + limit;
    
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