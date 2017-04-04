/**
 * The cross server channel represents a web socket channel established from server A to server B
 * sample usage: CrossServerChannel.name('latestnews').from({
 *   'host' : '***',
 *   'port' : '***',
 *   'secretKey' : '***'
 * }).to({
 *   'host' : '***',
 *   'port' : '***',
 *   'secretKey' : '***'
 * }).getName()
 */

const EncryptionUtil = require('./EncryptionUtil');

module.exports = 
class CrossServerChannel
{
  static name(channelName)
  {
    var config = require('./Config').get();
    this.channelName = channelName;
    return this;
  }

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
    var result = EncryptionUtil.get_sha512(this.fromServerInfo.secretKey + this.toServerInfo.secretKey + this.channelName);
    return result;
  }
}
