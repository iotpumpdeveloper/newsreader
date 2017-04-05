const axios = require('axios');
const WebSocket = require('ws');
const Config = require('./Config');
const CrossServerChannel = require('./CrossServerChannel');

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


module.exports = 
class PublishingServer
{
  constructor()
  {
    this.config = Config.get();
  }

  connectToBroadcastingServersOnChannel(channelName)
  {
    var config = this.config;
    var webSockets = [];
    var i = 0;
    for (var serverName in config.broadcastingServers) {
      var publishingDataChannel = CrossServerChannel
        .name(channelName)
        .from(config.publishingServer)
        .to(config.broadcastingServers[serverName])
        .getName();
      var wsUrl = 'ws://' + config.broadcastingServers[serverName].host + ':' + config.broadcastingServers[serverName].port + '/' + publishingDataChannel;
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

  getLatestNews(source, successCallback) {
    var config = this.config;
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

  start() 
  {
    var config = this.config;
    //start publishing to the broadcasting server 
    var newsSources = config.newsSource.sources;
    for (var channel in newsSources) {
      setInterval( () => {
        var webSockets = this.connectToBroadcastingServersOnChannel(channel);
        this.getLatestNews(channel, function(articles){
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
      }, newsSources[channel].updateInterval + Math.ceil(Math.random() * 10));
    }
  }
}
