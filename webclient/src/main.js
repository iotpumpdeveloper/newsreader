import Vue from 'vue';
import App from './App.vue';
import WebSocketFactoryPlugin from './plugins/WebSocketFactoryPlugin.js'
import NewsStoragePlugin from './plugins/NewsStoragePlugin.js'

Vue.use(WebSocketFactoryPlugin);
Vue.use(NewsStoragePlugin);

new Vue({
  el: '#app',
  render : function(h) {
    return h(App)
  }
})
