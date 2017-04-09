/**
 * This is a general websocket server
 */
const ws = require('ws');
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

    //all the paths are here 
    this.paths = {};

    //all the channels are here
    this.channels = {};
  }

  addPath(path, handler, options)
  {
    this.paths[path] = new Path(path, handler, options);
  }

  getPath(path)
  {
    return this.paths[path];
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
      var path = client.upgradeReq.url;
      if (path in this.paths && client.readyState == client.OPEN) {
        this.paths[path].addConnectedClient(client);
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
