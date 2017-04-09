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

    this.addPath('livenews');

    for (var i =0; i < this.config.newsSource.sources.length; i ++){
      this.addMessageChannel(this.config.newsSource.sources[i]); 
    }

    var idpName = InternalDataPathName.onServer('s0'); 

    var webSocket = new WebSocketClient(this.config.servers['s0'], idpName).connect();
    webSocket.on('message', (message) => {
      var messageObj = JSON.parse(message);
      this.messageChannels[messageObj.source].broadcast(JSON.stringify(messageObj.data));
    });

    this.getPath('livenews').getDefaultChannel().onMessage = (message, client) => {
      //now group message in message channel 
      if (message in this.messageChannels) {
        this.messageChannels[message].addClient(client);
      } else { 
        client.close();
      }
    }

  }
}
