/**
 * This is a general websocket server
 */
const ws = require('ws');
const WebSocketServerChannel = require('./WebSocketServerChannel');
const Channel = require('./Channel');

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
  }

  addChannel(name)
  {
    this.channels[name] = new Channel(name);
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
      //initialize messageChannel property 
      client.messageChannel = ''; //default is an empty channel
      var clientChannelName = client.upgradeReq.url.slice(1);
      if (clientChannelName in this.channels && client.readyState == client.OPEN) {
        this.channels[clientChannelName].addConnectedClient(client);
        this.channels[clientChannelName].onClientConnected(client);
      } else { //all other clients are considered invalid, we just close them
        client.close(); 
      }
    });

    this._serverInstance.on('message', (message) => {
      this.onMessage(message);
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
