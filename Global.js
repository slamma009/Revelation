const CryptoJS = require("crypto-js");

function hasKey(arr, key){
    return arr[key] !== undefined;
}

function webCall(url, account){
    var startChar = '?';
    if(url.includes('?'))
        startChar = '&';
    var secret = ''
    if(account !== undefined){
        var nonce = Math.round((new Date()).getTime() / 1000);
        url += startChar + 'apikey=' + account.API + '&nonce=' + nonce;
        secret = CryptoJS.HmacSHA512(url, account.Secret).toString(CryptoJS.enc.Hex);
    }
    return $.ajax({
        type: 'GET',
        headers: { 
            'apisign': secret
        },
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

function checkLogin(successFunction, account){
    webCall('https://bittrex.com/api/v1.1/account/getbalances', account).then(function(d){
        successFunction(d.success);
    });
}