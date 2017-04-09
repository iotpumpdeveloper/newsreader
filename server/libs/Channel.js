/**
 * channel is a light-weight group for clients
 */
module.exports=
class Channel 
{
  constructor(name)
  {
    this.name = name;
    this.clients = [];
  }

  addClient(client)
  {
    client.channel = this.name; //very important
    this.clients.push(client);
  }

  broadcast(message)
  {
    for (var i = 0; i < this.clients.length; i ++) {
      var client = this.clients.pop();
      if (
      client.readyState == client.OPEN  //this client is still open
      && client.channel != undefined 
      && client.channel == this.name //this client is still under this channel
      ) { 
        this.clients.unshift(client); //add this client back to this channel 
        //now the message can either be a string or a function that return custom message!
        if (typeof message == 'string') {
          client.send(message);
        } else if (typeof message == 'function') {
          var message = message(client);
          if (typeof message == 'string') {
            client.send(message);
          } 
        }
      } 
      //otherwise, the client will just be pop out and does not belong to this channel 
    }

  }
}
