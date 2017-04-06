const WebSocket = require('ws');
const Config = require('./Config');
const CrossServerChannel = require('./CrossServerChannel');

module.exports = 
class BroadCastingServer 
{
  constructor(serverName)
  {
    this.serverName = serverName;
    this.config = Config.get();
  }

  start()
  {
    var config = this.config;
    var incomingDataChannel = CrossServerChannel
      .name('latestnews')
      .from(config.publishingServer)
      .to(config.broadcastingServers[this.serverName])
      .getName();

    var incomingDataChannelUrl = '/' + incomingDataChannel;

    //now define a list of public channels that mapped to different news source
    var newsSources = config.newsSource.sources;
   
    var publicChannelUrls = {};
    for (var i = 0; i < newsSources.length; i ++) {
      var url = '/' + newsSources[i];
      publicChannelUrls[url] = 1;
    }

    var webSocketServer = new WebSocket.Server({
      perMessageDeflate: false,
      port: config.broadcastingServers[this.serverName].port,
    });

    webSocketServer.on('connection', (ws) => {
      ws.on('message', (message) => {
        if (ws.upgradeReq.url == incomingDataChannelUrl) { //this is coming from the publishing server 
          //now we have the latest news, broadcast to all public clients who subscribe to the public channel
          webSocketServer.clients.forEach(function(client) {
            if (client.readyState == WebSocket.OPEN && publicChannelUrls[client.upgradeReq.url] == 1) { //now this client really subscribe to the public channel
              //now make sure we just send the correct message depends on the channel url 
              var messageObj = JSON.parse(message);
              if (client.upgradeReq.url == '/' + messageObj.source) {
                client.send(message);
              }
            } else if (client.upgradeReq.url != incomingDataChannelUrl) { //this client not subscribe to any public channel, and it is not the publisher server itself, so it should not allow any data to send, we will simply close it 
              client.close();
            }
          }); 
        } 
      });
    });

    console.log("Broadcasting server started at port " + config.broadcastingServers[this.serverName].port);
  }
}
