const WebSocketServer = require('./WebSocketServer');

module.exports = 
class BroadCastingServer extends WebSocketServer
{
  constructor(serverName)
  {
    super(serverName);
  }

  start()
  {
    this.addChannel('latestnews');

    var webSocket = this.connectToIDCOnServer('s0');
    webSocket.on('message', (message) => {
      this.getChannel('latestnews').broadcast(message);
    });

    super.start(); //start the web server
  }
}
