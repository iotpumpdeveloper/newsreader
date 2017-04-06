/**
 * The cross server channel represents a web socket channel established from server A to server B
 * sample usage: CrossServerChannel.from({
 *   'host' : '***',
 *   'port' : '***',
 * }).to({
 *   'host' : '***',
 *   'port' : '***',
 * }).getName()
 */

const EncryptionUtil = require('./EncryptionUtil');

module.exports = 
class CrossServerChannel
{
  static from(serverInfo) 
  {
    this.fromServerInfo = serverInfo;
    return this;
  }

  static to(serverInfo) 
  {
    this.toServerInfo = serverInfo;
    return this;
  }
  
  static getName()
  {
    var config = require('./Config').get();
    var result = EncryptionUtil.get_sha512(
      JSON.stringify(this.fromServerInfo) 
      + config.crossServerChannelSecureKey
      + JSON.stringify(this.toServerInfo)
    )
    return result;
  }
}
