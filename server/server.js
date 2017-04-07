var args = process.argv;

if (args.length < 3) {
  console.log("Missing server type");
  console.log("example: node server.js s0");
  console.log("example: node server.js s1");
  process.exit();
}

require('./libs/Config').init('./config.json');
var PublishingServer = require('./libs/PublishingServer');
var BroadCastingServer = require('./libs/BroadCastingServer');

var serverName = args[2].trim();

//@TODO: maybe later on we can start the servers in the background... 
if (serverName == 's0') {
  new PublishingServer(serverName).start();
} else {
  new BroadCastingServer(serverName).start();
}
