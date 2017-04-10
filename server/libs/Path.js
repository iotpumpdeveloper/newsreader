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

    //all channels
    this.channels = {};

    //add the default channel 
    this.defaultChannelName = this.path + '_default_channel';
    this.channels[this.defaultChannelName] = new Channel(this.defaultChannelName); 

    //the client id couter for this path 
    this.clientIdCounter = 0;
  }

  addConnectedClient(client)
  {
    this.clientIdCounter ++;
    client.id = this.clientIdCounter;
    client.path = this.path;
    //add the client to the default channel 
    this.getDefaultChannel().addClient(client);
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

  getDefaultChannel()
  {
    return this.channels[this.defaultChannelName];
  }

  getChannel(name)
  {
    return this.channels[name];
  }
}
