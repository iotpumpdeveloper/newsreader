const WebSocketServer = require('./WebSocketServer');
const WebSocketServerChannel = require('./WebSocketServerChannel');
const Config = require('./Config');
const InternalDataChannelName = require('./InternalDataChannelName');

module.exports = 
class BroadCastingServer extends WebSocketServer
{
  constructor(serverName)
  {
    var config = Config.get();
   
    super(config.servers[serverName]);

    this.config = config;
  }

  start()
  {
    this.addChannel('livenews');

    var idcName = InternalDataChannelName.onServer('s0'); 
    var webSocket = new WebSocketServerChannel(this.config.servers['s0'], idcName).connect();
    webSocket.on('message', (message) => {
      var messageObj = JSON.parse(message);
      this.getChannel('livenews').broadcast(message);
    });

    //we should not allow any client send message to this channel
    this.getChannel('livenews').onMessage = (message, client) => {
      client.close(); 
    };

    super.start(); //start the web server
  }
}
