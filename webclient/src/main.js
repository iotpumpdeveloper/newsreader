import Vue from 'vue';
import App from './App.vue';

class WebSocketFactoryPlugin
{
  static install(Vue) {
    Vue.prototype.$wsFactory = WebSocketFactoryPlugin;
  }

  /**
   * open a websocket connection to path, and try it keep it alive
   */
  static get(path, options = {
    keep_alive : true,
    keep_alive_retry_interval : 3 //try to reconnect websocket every 5 seconds if it is closed
  }) {
    if (this._wsMap == undefined) {
      this._wsMap = {};
    }

    if (this._wsMap[path] == undefined) {
      var wsUrl = "ws://" + location.host + path;
      if (location.protocol == "https:") {
        wsUrl = "wss://" + location.host + path;
      }

      this._wsMap[path] = {};
      this._wsMap[path]._interval = () => {
        if (this._wsMap[path]._ws == undefined || this._wsMap[path]._ws.readyState == 3) {
          this._wsMap[path]._ws = new WebSocket(wsUrl);
          this._wsMap[path]._ws.onopen = () => {
            this._wsMap[path]._ws.send(this._wsMap[path]._message);
          }
          this._wsMap[path]._ws.onmessage = this._wsMap[path]._messageHandler;
          if (this._wsMap[path]._ws.readyState == 1) {
            this._wsMap[path]._ws.send(this._wsMap[path]._message);
          }

          this._wsMap[path].routeMessage = (message, _messageHandler) => {
            this._wsMap[path]._message = message;
            this._wsMap[path]._messageHandler = _messageHandler;
            this._wsMap[path]._ws.onmessage = this._wsMap[path]._messageHandler;
          }
        }

        if (options['keep_alive']) {
          setInterval(this._wsMap[path]._interval, options['keep_alive_retry_interval'] * 1000);
        }
      }

      this._wsMap[path]._interval();
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
