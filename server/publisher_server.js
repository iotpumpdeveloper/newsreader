const axios = require('axios');
const WebSocket = require('ws');
const EncryptionUtil = require('./libs/encryption_util');

var fs = require('fs');
var content = fs.readFileSync('./config.json').toString();
var config = JSON.parse(content);

//enhance websocket functionality
var p = WebSocket.prototype;

p.setHost = function(host) {
  this.host = host;
}

p.getHost = function() {
  return this.host;
}

p.setPort = function(port) {
  this.port = port;
}

p.getPort = function() {
  return this.port;
}

function connectBroadcastingServers()
{
  var webSockets = [];
  var i = 0;
  for (var serverName in config.broadcastingServers) {
    var incomingDataChannel = EncryptionUtil.get_sha512(config.publisherServer.secretKey + config.broadcastingServers[serverName].secretKey);
    var wsUrl = 'ws://' + config.broadcastingServers[serverName].host + ':' + config.broadcastingServers[serverName].port + '/' + incomingDataChannel;
    if (webSockets[i] == null || webSockets[i].readyState == 3) { //when the websocket connection is closed, we try to create a new one again
      webSockets[i] = new WebSocket(wsUrl, {
        perMessageDeflate: false
      }); 
      webSockets[i].setHost(config.broadcastingServers[serverName].host);
      webSockets[i].setPort(config.broadcastingServers[serverName].port);
    }
    //catch connection error
    webSockets[i].on('error', function(error){
      if (error.code == 'ECONNREFUSED') { //connection refused, this means we lost the connection to the broadcasting server
        console.log('can not connect to the news publish channel at ' + this.getHost() + ':' + this.getPort()); //use this
        //caution: do not try to create the web web socket again in here!!!
      }
    });
    i++;
  }
  return webSockets;
}

function getLatestNews(source, successCallback) {
  var newsApiUrl = config.newsSource.apiEndPoint + '?source=' + source + '&apiKey=' + config.newsSource.apiKey;
  axios.get(newsApiUrl)
    .then( (response) => {
      var response_checkers = [
        () => {
          if (response.data == undefined) {
            throw new Error("no data in response!");
          }
        },
        () => {
          if (response.data.status != 'ok') {
            throw new Error("data status is not ok!");
          }
        },
        () => {
          if (response.data.articles == undefined) {
            throw new Error ("no articles found in response data!");
          }
        },
        () => {
          if (! (response.data.articles instanceof Array) ) {
            throw new Error("invalid articles field in data!");
          }
        }
      ];

      for (var k in response_checkers) {
        if (response_checkers[k]() === false) {
          return;
        }
      }
      successCallback(response.data.articles);
    }).catch( (error) => { //catch errors in the promise
      console.log("News Fetching Error: " + error);
    });
}

//start publishing to the broadcasting server 
setInterval( () => {
  var webSockets = connectBroadcastingServers();
  getLatestNews('hacker-news', function(articles){
    for (var i = 0; i < webSockets.length; i++) {
      var ws = webSockets[i];
      var message = {
        data : articles
      }
      ws.send( JSON.stringify(message) , (error) => {
        if (error) {
        }
      }); 
    }
  });
}, 1000);
