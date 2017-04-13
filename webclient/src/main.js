import Vue from 'vue';
import App from './App.vue';

class WebSocketFactoryPlugin
{
  static install(Vue) {
    Vue.prototype.$_wsFactory = WebSocketFactoryPlugin;
  }

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

Vue.use(WebSocketFactoryPlugin);

new Vue({
  el: '#app',
  render : function(h) {
    return h(App)
  }
})
