var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '50mb'}));


app.post('/', function(request, response){
  var Point = require('./model/point');
  var Geolib = require('geolib');
  var Mongoose = require('mongoose');
  var Promise = require('promise');

  Mongoose.disconnect();
  var db = Mongoose.connect('mongodb://127.0.0.1:27017/rest-geolocation');
  Mongoose.connection.once('connected', function() {
    console.time('Time');
  	console.log("Database connected successfully");
  });

  var compare = function(a,b) {
    if (a.distance < b.distance)
      return -1;
    else if (a.distance > b.distance)
      return 1;
    else
      return 0;
  }

  var searchCoords = [];

  bodyArray = [].concat(request.body);
  bodyArray.forEach(function(requestLocation, key){
    searchCoords.push({
      cd_estabelecimento: requestLocation.cd_estabelecimento,
      longitude: requestLocation.longitude,
      latitude: requestLocation.latitude,
      distancia: requestLocation.distancia,
      proximos: []
    });
  });

  var result = [];

  var fetchCoordinates = new Promise(function(resolve, reject){
    var count = 0;
    searchCoords.forEach(function(searchCoord, searchCoordKey){
      var coordinates = [searchCoord.longitude, searchCoord.latitude];
      Point.find({
        geo: {
          $nearSphere: coordinates,
          $maxDistance: searchCoord.distancia / 6371
        }
      }).exec(function(err, coords){
        if(err){
          console.log(err);
        }
        if(coords){
          coords.forEach(function(coord, coordsKey){

            if(searchCoord.cd_estabelecimento != coord.cd_estabelecimento){
              result[coordsKey] = {
                cd_estabelecimento: coord.cd_estabelecimento,
                ds_cidade: coord.name,
                nr_latitude: coord.geo[1],
                nr_longitude: coord.geo[0],
                distancia: Geolib.getDistance(coordinates, coord.geo)
              };
            }
            if(coordsKey == coords.length - 1){
              searchCoord.proximos = result.sort(compare);
              if(count == searchCoords.length - 1){
                resolve([searchCoord]);
              }
              count++;
            }
          })
          if(coords.length == 0){
            if(count == searchCoords.length - 1){
              resolve();
            }
            count++;
          }
        }
      });
    })
  });

  fetchCoordinates.then(function(result){
    Mongoose.disconnect(function(){
      console.timeEnd('Time');
      response.end(JSON.stringify(searchCoords).toString());
    })
  }, function(){
    console.log('Error');
  });

});

app.listen(3000);
