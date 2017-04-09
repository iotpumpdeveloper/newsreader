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
    super.start(); //start the web server

    this.news = {};
    
    this.addChannel('livenews');

    for (var i =0; i < this.config.newsSource.sources.length; i ++){
      this.addMessageChannel(this.config.newsSource.sources[i]); 
    }

    var idcName = InternalDataChannelName.onServer('s0'); 

    var webSocket = new WebSocketServerChannel(this.config.servers['s0'], idcName).connect();
    webSocket.on('message', (message) => {
      var messageObj = JSON.parse(message);
      this.messageChannels[messageObj.source].broadcast(JSON.stringify(messageObj.data));
    });

    this.getChannel('livenews').onMessage = (message, client) => {
      //now group message in message channel 
      if (message in this.messageChannels) {
        this.messageChannels[message].addClient(client);
      }
    }

  }
}
