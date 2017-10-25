var express = require('express');
var cors = require('cors');
var request = require('request-promise');
var xmlJs = require('xml-js');
var uuid = require('uuid');

function paramsRoute(apiKey) {
  var params = new express.Router();
  params.use(cors());

  // GET REST endpoint - query params may or may not be populated
  params.get('/', function(req, res) {
    getConnections(apiKey)
    .then(getFhConfig)
    .then(function(fhParams) {
      res.json(fhParams);
    })
    .catch(function(error) {
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
  
    request(options)
      .then(function (arrayConnections) {
          console.log('connections:', arrayConnections);
          for (var i = 0, len = arrayConnections.length; i < len; i++) {
            var connection = arrayConnections[i];
            if (connection.environment == process.env.FH_ENV && connection.destination == "android") {
              return resolve({"apiKey": apiKey, "connection": connection});
            }
          }
          reject({"msg":"No environment connection found"});
      })
      .catch(function (err) {
          reject({"msg": "Error calling to connections endpoint"});
      });
  });
};

var getFhConfig = function(object) {
  return new Promise(function (resolve, reject) {
    var options = {
      uri: 'https://'+ process.env.FH_MILLICORE + '/box/api/connections/' + object.connection.guid + '/sdk_config',
      headers: {
          'X-FH-AUTH-USER': object.apiKey
      },
      json: true // Automatically parses the JSON string in the response
    };
  
    request(options)
      .then(function (fhConfig) {
        resolve(convertToFhParams(fhConfig));
      })
      .catch(function (err) {
          reject({"msg": "Error calling to sdk_config endpoint"});
      });
  });
};

var convertToFhParams = function(fhConfig) {

  var config = {
    "host" : "",
    "appid" : "",
    "projectid" : "",
    "appkey" : "",
    "connectiontag" : "",
  }

  if (fhConfig.filename == "fhconfig.plist") {
    var jsonConfig = xmlJs.xml2js(fhConfig.config, {compact:true, spaces:2});
    var plist = jsonConfig.plist.dict;
    for (var index = 0; index < plist.key.length; index++) {
      var key = plist.key[index];
      var text = plist.string[index];
      config[key._text] = text._text;
    }
  } else if (fhConfig.filename == "fhconfig.json") {
    config = JSON.parse(fhConfig.config);
  } else if (fhConfig.filename == "fhconfig.properties") {
    var properties = fhConfig.config.split("\n").slice(0,-1);
    for (var index = 0; index < properties.length; index++) {
      var property = properties[index].split(" = ");
      config[property[0]] = property[1];
    }
  }

  var response = {
    "body": "",
    "header": ""
  }
  var body = {
    "cuid": uuid.v1().replace(new RegExp("-","g"),"").toUpperCase(),
    "cuidMap": null,
    "destination": "web",
    "sdk_version": "FH_PHONEGAP_SDK",
    "appid": config.appid,
    "appkey": config.appkey,
    "projectid": config.projectid,
    "connectiontag": config.connectiontag
  }
  var header = {
    "X-FH-cuid": body.cuid,
    "X-FH-cuidMap": null,
    "X-FH-destination": body.destination,
    "X-FH-sdk_version": body.sdk_version,
    "X-FH-appid": body.appid,
    "X-FH-appkey": body.appkey,
    "X-FH-projectid": body.projectid,
    "X-FH-connectiontag": body.connectiontag
  }
  response.body = body;
  response.header = header;
  
  return response;
} 

module.exports = paramsRoute;