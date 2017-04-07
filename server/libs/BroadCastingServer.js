const WebSocketServer = require('./WebSocketServer');

module.exports = 
class BroadCastingServer extends WebSocketServer
{
  constructor(serverName)
  {
    super(serverName);
  }

  start()
  {
    //store news from all sources in memory 
    this.news = {};

    this.addChannel('latestnews');

    var thisServer = this;

    var webSocket = this.connectToIDCOnServer('s0');
    webSocket.on('message', (message) => {
      var messageObj = JSON.parse(message);
      //instead of broadcasting the news to all clients, we just store them in memory
      //this.getChannel('latestnews').broadcast(message);
      thisServer.news[messageObj.source] = messageObj.articles;
    });

    this.getChannel('latestnews').onMessage = (message, client) => {
     if (client.readyState == client.OPEN) {
      if (thisServer.news[message] != undefined) {
          client.send(JSON.stringify(thisServer.news[message])); 
        }
      }
    }

    super.start(); //start the web server
  }
}
