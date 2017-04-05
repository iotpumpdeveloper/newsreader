const WebSocket = require('ws');
const Config = require('./Config');
const CrossServerChannel = require('./CrossServerChannel');

module.exports = 
class BroadCastingServer 
{
  constructor(serverName)
  {
    this.serverName = serverName;
    this.config = Config.get();
  }

  start()
  {
    var config = this.config;
    var incomingDataChannel = CrossServerChannel
      .name('latestnews')
      .from(config.publishingServer)
      .to(config.broadcastingServers[this.serverName])
      .getName();

    //liste to incoming message
    var incomingDataListener = new WebSocket.Server({
      perMessageDeflate: false,
      port: config.broadcastingServers[this.serverName].port,
      path: '/' + incomingDataChannel 
    });

    incomingDataListener.on('connection', function connection(ws) {
      ws.on('message', function(latestNews) {
        var articles = JSON.parse(latestNews);
        articles['hacker-news'].forEach((article) => {
          console.log(article.url);
        });
      });
    });

    console.log("Broadcasting server started at port " + config.broadcastingServers[this.serverName].port);
  }
}
