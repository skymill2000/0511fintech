const request = require('request');
var parseString = require('xml2js').parseString;


request('https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json', function (error, response, body) {
//   console.log('body:', body); // Print the HTML for the Google homepage.
  //#work3 xml2js example
  var object = JSON.parse(body);
  console.dir(object)
});
