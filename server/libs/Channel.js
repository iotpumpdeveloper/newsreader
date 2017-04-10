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
  }

  addClient(client)
  {
    client.channel = this.name; //very important
    this.clients[client.id]  = client;
    //hook up the client's message event 
    client.on('message', (message) => {
      this.onMessage(message, client);
    }); 
    client.on('close', () => {
      if (this.clients[client.id] != undefined) {
        delete this.clients[client.id];
      }
    });
  }

  broadcast(message)
  {
    for (var clientId in this.clients) {
      var client = this.clients[clientId];
      if (
        client.readyState == client.OPEN  //this client is still open
        && client.channel != undefined 
        && client.channel == this.name //this client is still under this channel
      ) { 
        //now the message can either be a string or a function that return custom message!
        if (typeof message == 'string') {
          client.send(message);
        } else if (typeof message == 'function') {
          var message = message(client);
          if (typeof message == 'string') {
            client.send(message);
          } 
        }
      } else { //this client no longer belong to this channel, delete it
        delete this.clients[clientId];
      }
    }

  }
}
