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
    var channel = new WebSocketServerChannel({
      'host' : this.host,
      'port' : this.port
    }, channelName);
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

    this._serverInstance.on('connection', (client) => {
      var clientChannelName = client.upgradeReq.url.slice(1);
      if (clientChannelName in this.channels && client.readyState == client.OPEN) {
        //generate the client id
        this.channels[clientChannelName].addConnectedClient(client);
        this.channels[clientChannelName].onClientConnected(client);
      } else { //all other clients are considered invalid, we just close them
        client.close(); 
      }
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
