const WebSocketServer = require('./WebSocketServer');
const WebSocketClient = require('./WebSocketClient');
const Path = require('./Path');
const Config = require('./Config');
const InternalDataPathName = require('./InternalDataPathName');

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
    super.start(); //start the web server

    this.addPath('/livenews');
    var liveNewsPath = this.getPath('/livenews');

    for (var i in this.config.newsSource.sources){
      liveNewsPath.addChannel(this.config.newsSource.sources[i]); 
    }

    var idpName = InternalDataPathName.onServer('s0'); 

    var webSocket = new WebSocketClient(this.config.servers['s0'], idpName).connect();
    webSocket.on('message', (message) => {
      var messageObj = JSON.parse(message);
      liveNewsPath.getChannel(messageObj.source).broadcast(JSON.stringify(messageObj.data));
    });

    liveNewsPath.getDefaultChannel().onMessage = (message, client) => {
      if (liveNewsPath.getChannel(message) != undefined) {
        client.switchToChannel(message);
      } else { 
        client.close();
      }
    }

  }
}
