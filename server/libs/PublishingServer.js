const WebSocketServer = require('./WebSocketServer');
const WebSocketClient = require('./WebSocketClient');
const InternalDataPathName = require('./InternalDataPathName');
const Path = require('./Path');
const Config = require('./Config');

module.exports=
class PublishingServer extends WebSocketServer
{
  constructor(serverName)
  {
    var config = Config.get();

    super(config.servers[serverName]);

    this.config = config;
    this.serverName = serverName;
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
        var messageObj = {
          source : source,
          data : response.data.articles
        }
        successCallback(messageObj);
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

    var broadcastingPath = new Path('broadcastingPath');

    for (var serverName in config.servers) {
      if (serverName != this.serverName) { //broadcasting servers
        console.log(serverName);
        var webSocket = new WebSocketClient(serverName, InternalDataPathName.onServer(serverName) ).connect();
        webSocket.on('error', ()=> {});
        broadcastingPath.addConnectedClient(webSocket);
      }
    }

    //start publishing to the broadcasting servers
    setInterval( () => {
      this.fetchLatestNews((news) => {
        broadcastingPath.getDefaultChannel().broadcast(JSON.stringify(news)); 
      });
    }, config.newsSource.updateInterval);


    //start the server
    super.start();
  }
}
