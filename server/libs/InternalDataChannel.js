/**
 * An Internal Data Channel is a unique channel for an internal server to send and receive data from another internal server
 * Usage: InternalDataChannel.forServer('s1').getName()
 */
const EncryptionUtil = require('./EncryptionUtil');

module.exports = 
class InternalDataChannel
{
  static forServer(serverName)
  {
    this.serverName = serverName;
    return this;
  }

  static getName()
  {
    var config = require('./Config').get();
    var serverInfo = config.servers[this.serverName];
    serverInfo.name = this.serverName;

    var name = EncryptionUtil.get_sha512(
      JSON.stringify(serverInfo)
    );
    return name;
  }
}

//test
require('./Config').init('../config.json');
console.log(module.exports.forServer('s0').getName());
