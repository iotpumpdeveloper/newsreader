var args = process.argv;

if (args.length < 3) {
  console.log("Missing server type");
  console.log("example: node server.js s0");
  console.log("example: node server.js s1");
  process.exit();
}

var Config = require('./libs/Config');
Config.init('./config.json');

var serverName = args[2].trim();

//@TODO: maybe later on we can start the servers in the background... 

var config = Config.get();

if (serverName in config.servers) {
  if (serverName == 's0') {
    var PublishingServer = require('./libs/PublishingServer');
    new PublishingServer(serverName).start();
  } else{
    var BroadCastingServer = require('./libs/BroadCastingServer');
    new BroadCastingServer(serverName).start();
  }
}
