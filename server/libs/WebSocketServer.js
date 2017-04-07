/**
 * This is a general websocket server
 */
const ws = require('ws');
const InternalDataChannel = require('./InternalDataChannel');
const WebSocketServerChannel = require('./WebSocketServerChannel');
const Config = require('./Config');

module.exports=
class WebSocketServer
{
  /**
   * create a WebSocketServer
   */
  constructor(serverName)
  {
    var config = Config.get();
    this.config = config;
    this.host = config.servers[serverName].host;
    this.port = config.servers[serverName].port;
    this.secretKey = config.servers[serverName].secretKey;

    //we will first have the internal data channel (idc)
    this.idc = new InternalDataChannel(serverName);
    //all other channels here
    this.channels = {};

    //all clients here
    this.clients = {};
  }

  addChannel(channelName)
  {
    var channel = new WebSocketServerChannel(this.serverName, channelName);
    this.channels[channelName] = channel;
  }

  getIDCChannel()
  {
    return this.idc;
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
      if (typeof this.onConnection === "function") {
        this.onConnection(ws); 
      } else { //the custom onConnection method is not defined, now we do our channel message routing 
        this._serverInstance.clients.forEach((client) => {
          var clientChannelName = client.upgradeReq.url.slice(1);
          if (clientChannelName == this.idc.getName() && client.readyState == ws.OPEN) {
            this.idc.handleIncomingClient(client);
          } else if (clientChannelName in this.channels && client.readyState == ws.OPEN) {
            this.channels[clientChannelName].handleIncomingClient(client);
          } else { //all other clients are considered invalid, we just close them
            client.close(); 
          }
        });
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
