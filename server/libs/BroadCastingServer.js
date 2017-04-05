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
    this.latestNews = {};
  }

  start()
  {
    var config = this.config;
    var channel = 'latestnews'; //the public channel
    var incomingDataChannel = CrossServerChannel
      .name(channel)
      .from(config.publishingServer)
      .to(config.broadcastingServers[this.serverName])
      .getName();

    var webSocketServer = new WebSocket.Server({
      perMessageDeflate: false,
      port: config.broadcastingServers[this.serverName].port,
    });

    webSocketServer.on('connection', (ws) => {
      ws.on('message', (message) => {
        if (ws.upgradeReq.url == '/' + incomingDataChannel) { //this is coming from the publishing server
          var latestNews = message;
          //now we have the latest news, broadcast to all public clients who subscribe to the public channel
          webSocketServer.clients.forEach(function(client) {
            if (client.readyState == WebSocket.OPEN && client.upgradeReq.url == '/' + channel) { //now this client really subscribe to the public channel
                client.send(JSON.stringify(latestNews));
            } else { //this client should not allow any data to send, we will simply close it 
                client.close();
            }
          }); 
        } 
      });
    });

    console.log("Broadcasting server started at port " + config.broadcastingServers[this.serverName].port);
  }
}
