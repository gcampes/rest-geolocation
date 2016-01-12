var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var data = JSON.stringify(JSON.parse(fs.readFileSync('coords.json', 'utf8')));
console.log('Data read');

var options = {
  host: 'localhost',
  port: 3000,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Request sent');
var req = http.request(options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('Received response');
    // console.log("body: " + chunk);
  });
});

req.write(data);
req.end();
