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

    this.incomingNewsSource = '';

    this.addChannel('livenews');

    var idcName = InternalDataChannelName.onServer('s0'); 

    var messageFilter = (client) => {
      if (
        this.config.newsSource.sources.includes(client.newsSource)
        && client.newsSource != undefined 
        && client.newsSource in this.news
        && client.newsSource == this.incomingNewsSource
      ) {
        return JSON.stringify(this.news[client.newsSource]); 
      } 
    }

    var webSocket = new WebSocketServerChannel(this.config.servers['s0'], idcName).connect();
    webSocket.on('message', (message) => {
      var messageObj = JSON.parse(message);
      this.incomingNewsSource = messageObj.source;
      this.news[messageObj.source] = messageObj.articles;
      this.getChannel('livenews').broadcast(messageFilter);
    });

    this.getChannel('livenews').onMessage = (message, client) => {
      client.newsSource = message;
      if (this.config.newsSource.sources.includes(client.newsSource)) {
        var m = messageFilter(client);
        if (typeof m == 'string') {
          client.send(m);
        } 
      } else { //invalid news source, just close the client 
        client.close();
      }
    };

  }
}
