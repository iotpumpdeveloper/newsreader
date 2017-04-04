/**
 * a wrapper around the config file
 */
module.exports = 
class Config 
{
  static init(configJSON)
  {
    this.config = JSON.parse(configJSON);
  }

  static get()
  {
    return this.config;
  }
}
