const Channel = require('./Channel');

/**
 * a path represent a websock server path
 */
module.exports = 
class Path 
{
  constructor(path, options)
  {
    this.path = path;
    this.options = options;

    //add the default channel 
    this.defaultChannelName = 'default_channle_' + Date.now();
    this.defaultChannel = new Channel(this.defaultChannelName); 
  }

  addConnectedClient(client)
  {
    //add the client to the default channel 
    this.getChannel(this.defaultChannelName).addClient(client);
  }

  addChannel(name)
  {
    this.channels[name] = new Channel(name);
  }

  addChannels(channels)
  {
    for (var i in channels)
    {
      this.addChannel(channels[i]);
    }
  }

  getChannel(name)
  {
    return this.channels[name];
  }

  broadcast(message)
  {
    this.defaultChannel.broadcast(message);
  }
}
