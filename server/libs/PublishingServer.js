const WebSocketServer = require('./WebSocketServer');

module.exports=
class PublishingServer extends WebSocketServer
{
  constructor(serverName)
  {
    super(serverName);
  }

  async fetchLatestNews(successCallback) {
    var config = this.config;
    var newsSources = config.newsSource.sources;
    var axios = require('axios');
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

  getLatestNews()
  {
    return this.latestNews;
  }

  start() 
  {
    var config = this.config;
    //start publishing to the broadcasting server 
    var channel = "latestnews";
    setInterval( () => {
      this.fetchLatestNews((news) => {
        this.idc.broadcast(JSON.stringify(news));
      });
    }, config.newsSource.updateInterval);

    //now start as a websocket server
    super.start();
  }
}
