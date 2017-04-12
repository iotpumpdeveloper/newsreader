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
      <li><button @click="switchToNewsSource('cnn')">CNN</button></li>
      <li><button @click="switchToNewsSource('hacker-news')">Hacker News</button></li>
      <li><button @click="switchToNewsSource('techcrunch')">Tech Crunch</button></li>
      <li><button @click="switchToNewsSource('google-news')">Google News</button></li>
      <li><button @click="switchToNewsSource('new-scientist')">News Scientist</button></li>
      <li><button @click="switchToNewsSource('time')">Times</button></li>
      <li><button @click="switchToNewsSource('newsweek')">News Week</button></li>
      <li><button @click="switchToNewsSource('usa-today')">USA Today</button></li>
    </ul>
    <ul id="news-list">
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
      'currentNewsSource' : 'cnn',
      'news' : {}
    }
  },

  methods: {
    switchToNewsSource : (source) => {
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
        }
        setCurrentWebSocket(ws);
      }
    };

    getWebSocket();
    //try to keep the websocket alive
    setInterval( getWebSocket, 1000); 

    console.log(this.currentNewsSource);
  }
}
  </script>
