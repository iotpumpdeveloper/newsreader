import Vue from 'vue';
import App from './App.vue';
import WebSocketFactoryPlugin from './plugins/WebSocketFactoryPlugin.js'

Vue.use(WebSocketFactoryPlugin);

new Vue({
  el: '#app',
  render : function(h) {
    return h(App)
  }
})
