const WebSocketServer = require('./WebSocketServer');
const Config = require('./Config');
const InternalDataChannelName = require('./InternalDataChannelName');

module.exports=
class PublishingServer extends WebSocketServer
{
  constructor(serverName)
  {
    var config = Config.get();

    super(config.servers[serverName]);

    this.config = config;

    //we will first have the internal data channel (idc)
    this.idcName = InternalDataChannelName.onServer(serverName); 

    //now add the idc to the channels 
    this.addChannel(this.idcName);
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
        this.getChannel(this.idcName).broadcast(JSON.stringify(news));
      });
    }, config.newsSource.updateInterval);

    //now start as a websocket server
    super.start();
  }
}
