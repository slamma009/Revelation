const CryptoJS = require("crypto-js");

var Currencies = {USD: "$"};

function hasKey(arr, key){
    return arr[key] !== undefined;
}

function bittrexCall(url, account){
    url = 'https://bittrex.com/api/v1.1/' + url;
    var startChar = '?';
    if(url.includes('?'))
        startChar = '&';
    var secret = ''
    if(account !== undefined){
        var nonce = Math.round(dateToTimestamp(new Date()));
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

function cryptoCompareCall(url){
    url = 'https://min-api.cryptocompare.com/data/' + url;
    
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

function checkLogin(successFunction, account){
    getWalletsFromAPI(account).then(function(d){
        successFunction(d.success);
    });
}

function getWalletsFromAPI(account) {
    return bittrexCall('account/getbalances', account);
}

function getBittrexMarkets(account) {
    return bittrexCall('public/getmarketsummaries ', undefined);
}

function dateToTimestamp(date){
    return Math.round(date.getTime() / 1000);
}