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
        return this.news[client.newsSource]; 
      }
    }

    var webSocket = new WebSocketServerChannel(this.config.servers['s0'], idcName).connect();
    webSocket.on('message', (message) => {
      var incomingNews = JSON.parse(message);
     
      var shouldBroadcast = false;
      for (var source in incomingNews) {
        if ( this.news[source] == undefined || this.news[source] != incomingNews[source] ) {
          this.news[source] = incomingNews[source];
          shouldBroadcast = true;
          console.log('updated source: ' + source);
        } 
      }

      if (shouldBroadcast) {
        this.getChannel('livenews').broadcast(messageFilter);
      }
    });

    this.getChannel('livenews').onMessage = (message, client) => {
      if (this.config.newsSource.sources.includes(message)) {
        client.newsSource = message;
        if (this.news[message] != undefined) {
          client.send(this.news[message]);
        }
      } else { //invalid news source, just close the client 
        client.close();
      }
    };

  }
}
