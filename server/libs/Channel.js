/**
 * channel is a light-weight group for clients
 */
module.exports=
class Channel 
{
  constructor(name)
  {
    this.name = name;
    this.clients = {};
    this.onMessage = (message, client) => {};
  }

  addClient(client)
  {
    client.channel = this.name; //very important
    this.clients[client.id]  = client;
    //hook up the client's message event 
    client.on('message', (message) => {
      this.onMessage(message, client);
    }); 
  }

  broadcast(message)
  {
    for (var clientId in this.clients) {
      var client = this.clients[clientId];
      console.log(client);
      if (
        client != undefined
        && client.readyState == client.OPEN  //this client is still open
        && client.channel != undefined 
        && client.channel == this.name //this client is still under this channel
      ) {
        client.send(message);
      } else { //this client no longer belong to this channel, delete it
        delete this.clients[clientId];
      }
    }

  }
}
