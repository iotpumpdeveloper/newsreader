<style>
ul#news-list {
  clear: left;
  display: block;
  margin-bottom: 20px;
}

ul#news-sources li {
  list-style-type: none;
  float: left;
  margin-bottom: 20px;
}

ul#news-list{
  display: block;
  clear: left;
  margin-top: 20px;
}

ul#news-list li {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>

<template>
  <div id="news-portal">
    <ul id="news-sources">
      <li v-for='value, key in newsSources'><button @click="switchToNewsSource(key)">{{ value }}</button></li>
    </ul>
    <p style = "clear:left" v-if = "news_loading == 1">Loading {{ currentNewsSource }} ...</p>
    <ul id="news-list" v-if="news_loading == 0">
      <li v-for = "article, i in news">
        <a :href="article.url" target= '_blank'>{{ article.title }}</a>
      </li>
    </ul>
  </div>
</template>

  <script>
  var wsUrl = "ws://" + location.host + "/livenews";
if (location.protocol == "https:") {
  wsUrl = "wss://" + location.host + "/livenews";
}

var curWebSocket;
function setCurrentWebSocket(ws)
{
  curWebSocket = ws;
}

function getCurrentWebSocket()
{
  return curWebSocket;
}

export default {

  data () {
    return {
      'currentNewsSource' : '',
      'news' : {},
      'news_loading' : 0, //see if the news is loading
      'newsSources' : {
        'cnn' : 'CNN',
        'hacker-news' : 'Hacker News',
        'techcrunch' : 'Tech Crunch',
        'time' : 'Times',
        'fortune' : 'Fortune',
        'new-scientist' : 'New Scientist',
        'espn' : 'ESPN',
      }
    }
  },

  methods: {
    switchToNewsSource (source) {
      this.news_loading = 1;
      this.currentNewsSource = this.newsSources[source];
      getCurrentWebSocket().send(source); 
    }
  },

  mounted () {
    var ws;

    var getWebSocket = () => {
      if (ws == undefined || ws.readyState == 3) {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (evt) => {
          this.news = JSON.parse(evt.data); 
          this.news_loading = 0;
        }
        setCurrentWebSocket(ws);
      }
    };

    getWebSocket();
    //try to keep the websocket alive
    setInterval( getWebSocket, 1000); 

    ws.onopen = () => {
      ws.send(Object.keys(this.newsSources)[0]);
    }
  }
}
  </script>
