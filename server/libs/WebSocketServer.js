/**
 * This is a general websocket server
 */
const ws = require('ws');
const WebSocketServerChannel = require('./WebSocketServerChannel');

module.exports=
class WebSocketServer
{
  /**
   * create a WebSocketServer
   */
  constructor(serverInfo)
  {
    this.host = serverInfo.host;
    this.port = serverInfo.port;

    //all the channels are here
    this.channels = {};

    //all clients here
    this.clients = {};
  }

  addChannel(channelName)
  {
    var channel = new WebSocketServerChannel(this.serverName, channelName);
    this.channels[channelName] = channel;
  }

  getChannel(name)
  {
    return this.channels[name];
  }

  /**
   * start the server
   */
  start()
  {
    this._serverInstance = new ws.Server({
      perMessageDeflate: false,
      host: this.host,
      port: this.port
    });

    this._serverInstance.on('connection', (ws) => {
      this._serverInstance.clients.forEach((client) => {
        var clientChannelName = client.upgradeReq.url.slice(1);
        if (clientChannelName in this.channels && client.readyState == ws.OPEN) {
          this.channels[clientChannelName].addConnectedClient(client);
          this.channels[clientChannelName].onClientConnected(client);
        } else { //all other clients are considered invalid, we just close them
          client.close(); 
        }
      });
    });
  }

  /**
   * @TODO: stop the server
   */
  stop()
  {
    //this._serverInstance.close();
  }
}
