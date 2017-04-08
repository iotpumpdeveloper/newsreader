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

    this.addChannel('livenews');

    var idcName = InternalDataChannelName.onServer('s0'); 

    var messageFilter = (client) => {
      if (client.newsSource != undefined && client.newsSource == this.incomingNews.source) {
        return JSON.stringify(this.incomingNews.articles); 
      } 
    }

    var webSocket = new WebSocketServerChannel(this.config.servers['s0'], idcName).connect();
    webSocket.on('message', (message) => {
      this.incomingNews = JSON.parse(message);
      this.getChannel('livenews').broadcast(messageFilter);
    });

    this.getChannel('livenews').onMessage = (message, client) => {
      if (this.config.newsSource.sources.includes(message)) {
        client.newsSource = message;
      }
    };

  }
}
