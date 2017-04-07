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
    this.connectedClients = []; //store all connected clients here 
    this.onClientConnected = (client) => {} //this will be triggered when a client websocket is connected 
    this.onMessage = (message, client) => {} //this will be triggered when a client websocket sent a message
  }

  getName()
  {
    return this.channelName;
  }

  addConnectedClient(client)
  {
    this.connectedClients.push(client);
    //hook up the client's message event 
    client.on('message', (message) => {
      this.onMessage(message, client);
    }); 
  }

  broadcast(message)
  {
    for (var i = 0; i < this.connectedClients.length; i ++) {
      var client = this.connectedClients.pop();
      if (client.readyState == client.OPEN) { //this is still an active client, send the news data and then put it back
        this.connectedClients.unshift(client); //add this client in the beginning of the array
        client.send(message);
      } 
      //otherwise, the client will just be pop out and garbage collected
    }
  }
}
