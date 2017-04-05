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
      .name('hacker-news')
      .from(config.publishingServer)
      .to(config.broadcastingServers[this.serverName])
      .getName();

    //liste to incoming message
    var incomingDataListener = new WebSocket.Server({
      perMessageDeflate: false,
      port: config.broadcastingServers[this.serverName].port,
      path: '/' + incomingDataChannel 
    });

    incomingDataListener.on('connection', function connection(ws) {
      ws.on('message', function(message) {
        console.log('received: %s', message);
      });
    });

    console.log("Broadcasting server started at port " + config.broadcastingServers[this.serverName].port);
  }
}
