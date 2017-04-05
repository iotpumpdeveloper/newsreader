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
    var incomingDataChannel = CrossServerChannel
      .name('latestnews')
      .from(config.publishingServer)
      .to(config.broadcastingServers[this.serverName])
      .getName();

    //start exposing public channel to all clients
    var channel = 'latestnews';
    var publicWebSocketServer = new WebSocket.Server({
      perMessageDeflate: false,
      port: config.broadcastingServers[this.serverName]['port.external'],
      path: '/' + channel 
    });

    //listen to incoming message
    var incomingDataListener = new WebSocket.Server({
      perMessageDeflate: false,
      port: config.broadcastingServers[this.serverName]['port.internal'],
      path: '/' + incomingDataChannel 
    });

    incomingDataListener.on('connection', (ws) => {
      ws.on('message', (latestNews) => {
        //now we have the latest news, broadcast to all public clients
        publicWebSocketServer.clients.forEach(function(client) {
          if (client.readyState == WebSocket.OPEN) {
            client.send(JSON.stringify(latestNews));
          }
        });
      });
    });

    console.log("Broadcasting server started at port " + config.broadcastingServers[this.serverName]['port.internal']);
  }
}
