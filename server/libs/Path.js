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
    this.defaultChannelName = 'default_channel_' + Date.now();
    this.channels[this.defaultChannelName] = new Channel(this.defaultChannelName); 
  }

  addConnectedClient(client)
  {
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
