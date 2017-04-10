const ws = require('ws');

//add new methods to ws prototype 
ws.prototype.switchToChannel = function(channelName){
  this.path.getChannel(channelName).addClient(this);
}

module.exports = 
class WebSocketClient
{
  constructor(serverInfo, path)
  {
    this.serverInfo = serverInfo;
    this.path = path;
  }

  connect()
  {
    var wsUrl = 'ws://' + this.serverInfo.host 
      + ':' 
      + this.serverInfo.port 
      + this.path;
    
    var webSocket = new ws(wsUrl, {
      perMessageDeflate: false
    });

    return webSocket;
  }
}
