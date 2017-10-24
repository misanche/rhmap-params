var express = require('express');
var cors = require('cors');
var request = require('request-promise');

function paramsRoute(apiKey) {
  var params = new express.Router();
  params.use(cors());

  // GET REST endpoint - query params may or may not be populated
  params.get('/', function(req, res) {
    getConnections(apiKey).then(function(connection) {
      res.json(connection);
    }).catch(function(error) {
      res.json(error);
    });
  });

  return params;
}

var getConnections = function(apiKey) {
  return new Promise(function (resolve, reject) {
    var options = {
      uri: 'https://'+ process.env.FH_MILLICORE + '/box/api/projects/' + process.env.FH_WIDGET + '/connections',
      headers: {
          'X-FH-AUTH-USER': apiKey
      },
      json: true // Automatically parses the JSON string in the response
    };
  
    rp(options)
      .then(function (arrayConnections) {
          console.log('connections:', arrayConnections);
          for (var i = 0, len = arrayConnections.length; i < len; i++) {
            var connection = arr[i];
            if (connection.environment == process.env.FH_ENV) {
              return resolve(connection);
            }
          }
          reject({"msg":"No environment connection found"});
      })
      .catch(function (err) {
          reject({"msg": "Error calling to connections endpoint"});
      });
  });
} 

module.exports = paramsRoute;