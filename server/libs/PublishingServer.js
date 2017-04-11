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

    //maintain a list of web sockets connecting to each broadcasting server's idp
    //and keep them alived
    var broadcastors = [];
    var noop = () => {};
    setInterval( ()=> {
      for (var serverName in config.servers) {
        if (serverName != this.serverName) { //broadcasting servers 
          if (broadcastors[serverName] == undefined 
            || broadcastors[serverName].readyState == 3) {
            broadcastors[serverName] = new WebSocketClient(
              config.servers[serverName], 
              InternalDataPathName.onServer(serverName)
            ).connect();
            broadcastors[serverName].on('error', noop);
          }
        }
      }
    }, 5000);

    //start publishing to the broadcasting servers
    setInterval( () => {
      this.fetchLatestNews((news) => {
        for (var name in broadcastors) {
          if (broadcastors[name] != undefined 
            && broadcastors[name].readyState == 1) {
            broadcastors[name].send(JSON.stringify(news));
          }
        }
      });
    }, config.newsSource.updateInterval);


    //start the server
    super.start();
  }
}
