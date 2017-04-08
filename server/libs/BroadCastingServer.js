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

    var idcName = InternalDataChannelName.onServer('s0'); 

    var messageFilter = (client) => {
      if (
        client.newsSource != undefined
        && client.newsSource in this.news
      ) {
        return JSON.stringify(this.news[client.newsSource]); 
      }
    }

    var webSocket = new WebSocketServerChannel(this.config.servers['s0'], idcName).connect();
    webSocket.on('message', (message) => {
      this.news = JSON.parse(message);
      this.getChannel('livenews').broadcast(messageFilter);
    });

    this.getChannel('livenews').onMessage = (message, client) => {
      if (this.config.newsSource.sources.includes(message)) {
        client.newsSource = message;
      } else { //invalid news source, just close the client 
        client.close();
      }
    };

  }
}
