export default class NewsStoragePlugin 
{
  static install(Vue) {
    Vue.prototype.$newsStorage = NewsStoragePlugin;
    this.storage = new Map();
  }
  
  static set(source, data) {
    this.storage.set(source, data);
  }

  static get(source) {
    return this.storage.get(source); 
  }
}
