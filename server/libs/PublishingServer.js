const WebSocketServer = require('./WebSocketServer');

module.exports=
class PublishingServer extends WebSocketServer
{
  constructor(serverName)
  {
    super(serverName);
  }

  async getLatestNews(successCallback) {
    var config = this.config;
    var newsSources = config.newsSource.sources;
    try { 
      for (var i = 0; i < newsSources.length; i ++) {
        var source = newsSources[i];
        var newsApiUrl = config.newsSource.apiEndPoint + '?source=' + source + '&apiKey=' + config.newsSource.apiKey;
        var response = await axios.get(newsApiUrl);
        //once we have some good data from a specific source, we just send it
        var message = {
          source : source,
          articles : response.data.articles
        }
        successCallback(message);
      }
    } catch (error) {
      console.log("News Fetching Error: " + error);
    }
  }

  start() 
  {
    //first, start as a websocket server
    super.start();

    var config = this.config;
    //start publishing to the broadcasting server 
    var channel = "latestnews";
    setInterval( () => {
      console.log('good');
    }, config.newsSource.updateInterval);
  }
}

//test
require('./Config').init('../config.json');
var server = new module.exports('s0');
server.addChannel('abc');
server.getChannel('abc').handleIncomingClient = (client) => {
  client.send('hey, thank you for connecting to channel abc');
};
server.addChannel('efg');
server.start();
