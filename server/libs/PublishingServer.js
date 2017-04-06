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

  async getLatestNews(successCallback) {
    var config = this.config;
    var newsSources = config.newsSource.sources;
    try { 
      for (var i = 0; i < newsSources.length; i ++) {
        var source = newsSources[i];
        var newsApiUrl = config.newsSource.apiEndPoint + '?source=' + source + '&apiKey=' + config.newsSource.apiKey;
        var response = await axios.get(newsApiUrl);
        //once we have some good data from a specific source, we just send it
        var message = {
          source : source,
          articles : response.data.articles
        }
        successCallback(message);
      }
    } catch (error) {
      console.log("News Fetching Error: " + error);
    }
  }

  start() 
  {
    var config = this.config;
    //start publishing to the broadcasting server 
    var channel = "latestnews";
    setInterval( () => {
      var webSockets = this.connectToBroadcastingServersOnChannel(channel);
      this.getLatestNews((message) => {
        for (var i = 0; i < webSockets.length; i++) {
          var ws = webSockets[i];
          ws.send( JSON.stringify(message) , (error) => {
            if (error) {
            }
          }); 
        }
      });
    }, config.newsSource.updateInterval);
  }
}
