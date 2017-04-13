<style>
ul#news-sources li {
  list-style-type: none;
  float: left;
  margin-bottom: 20px;
}

ul#news-sources li button {
  font-family: courier;
  font-size: 10px;
}

ul#news-sources li button.active {
  font-weight: bold;
  border: 2px silver solid;
  background: lightYellow;
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

ul#news-list li a {
  font-family: courier;
  font-size: 10px;
}

iframe#article-viewer {
  width: 1000px;
  height: 600px;
  overflow-x: hidden; 
  overflow-y: scroll;
}

</style>

<template>
  <div id="news-portal">
    <ul id="news-sources">
      <li v-for="value, key in newsSources">
        <button @click="switchToNewsSource(key)" v-bind:class="classForKey(key)">{{ value }}</button>
      </li>
    </ul>
    <p style = "clear:left" v-if = "news_loading == 1">Loading {{ newsSources[currentNewsSource] }} ...</p>
    <ul id="news-list" v-if="news_loading == 0">
      <li v-for = "article, i in news">
        <a :href="article.url" target= '_blank' @click.prevent ='viewArticle(article.url)'>{{ article.title }}</a>
      </li>
    </ul>
    <iframe id = "article-viewer" 
      v-bind:src="currentArticleUrl" 
      v-if = "currentArticleUrl.length > 0">
    </iframe>
  </div>
</template>

  <script>

class WebSocketFactory
{
  /**
   * open a websocket connection to path, and try it keep it alive
   */
  static connect(path, incomingMessageHandler) {
    if (this._wsMap == undefined) {
      this._wsMap = {};
      this._intervalMap = {};
      this._incomingMessageHandlerMap = {};
    }

    if (this._wsMap[path] == undefined) {
      var wsUrl = "ws://" + location.host + path;
      if (location.protocol == "https:") {
        wsUrl = "wss://" + location.host + path;
      }

      this._incomingMessageHandlerMap[path] = incomingMessageHandler;
      this._intervalMap[path] = () => {
        if (this._wsMap[path] == undefined || this._wsMap[path].readyState == 3) {
          this._wsMap[path] = new WebSocket(wsUrl);
          this._wsMap[path].onmessage = this._incomingMessageHandlerMap[path];
          this._wsMap[path].sendMessage = (message) => {
            this._message = message;
            if (this._wsMap[path].readyState == 1) {
              this._wsMap[path].send(this._message);
            }
          }
          this._wsMap[path].onopen = () => {
            this._wsMap[path].send(this._message);
          }
        }
        setInterval(this._intervalMap[path], 5000);
      }
      this._intervalMap[path]();
    }
    return this._wsMap[path];
  }
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
        'business-insider' : 'Business Insider',
        'financial-times' : 'Financial Times',
        'ign' : 'IGN',
      },
      'currentArticleUrl' : '',
    }
  },

  methods: {
    switchToNewsSource (source) {
      this.news_loading = 1;
      this.currentNewsSource = source;
      this.currentArticleUrl = '';
      WebSocketFactory.connect('/livenews', (evt) => {
        this.news = JSON.parse(evt.data);
        this.news_loading = 0;
      }).sendMessage(source);
    },
    classForKey (key) {
      if (this.currentNewsSource == key) {
        return 'active';
      } else {
        return 'inactive';
      }
    },
    viewArticle (url) {
      this.currentArticleUrl = url;
    }
  },

  mounted () {
    this.currentNewsSource = Object.keys(this.newsSources)[0];
    this.switchToNewsSource(this.currentNewsSource);
  }
}
  </script>
