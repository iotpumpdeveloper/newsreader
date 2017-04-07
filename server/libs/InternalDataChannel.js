/**
 * An Internal Data Channel is a unique channel for an internal server to send and receive data from another internal server
 * Usage: InternalDataChannel.forServer('s1').getName()
 */
const EncryptionUtil = require('./EncryptionUtil');
const WebSocketServerChannel = require('./WebSocketServerChannel');

module.exports = 
class InternalDataChannel extends WebSocketServerChannel
{

  constructor(serverName)
  {
    var config = require('./Config').get();
    var serverInfo = config.servers[serverName];
    serverInfo.name = serverName;

    var channelName = EncryptionUtil.get_sha512(
      JSON.stringify(serverInfo)
    );

    super(serverName, channelName);
  }
}
