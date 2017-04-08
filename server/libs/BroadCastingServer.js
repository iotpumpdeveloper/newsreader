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
    //store news from all sources in memory 
    this.news = {};

    this.addChannel('latestnews');

    var idcName = InternalDataChannelName.onServer('s0'); 
    var webSocket = new WebSocketServerChannel(this.config.servers['s0'], idcName).connect();
    webSocket.on('message', (message) => {
      var messageObj = JSON.parse(message);
      //instead of broadcasting the news to all clients, we just store them in memory
      //this.getChannel('latestnews').broadcast(message);
      this.news[messageObj.source] = messageObj.articles;
    });

    this.getChannel('latestnews').onMessage = (message, client) => {
     if (client.readyState == client.OPEN) {
      if (this.news[message] != undefined) {
          client.send(JSON.stringify(this.news[message])); 
        }
      }
    }

    super.start(); //start the web server
  }
}
