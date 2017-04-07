/**
 * This represents a web socket server channel
 */
module.exports=
class WebSocketServerChannel
{
  constructor(serverName, channelName)
  {
    this.serverName = serverName;
    this.channelName = channelName;
  }

  getName()
  {
    return this.channelName;
  }

  handleIncomingClient(client) 
  {
  }
}
