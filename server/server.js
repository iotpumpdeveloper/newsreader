var args = process.argv;

if (args.length < 3) {
  console.log("Missing server type");
  console.log("example: node server.js publishing");
  console.log("example: node server.js broadcasting s1");
  process.exit();
}

var Config = require('./libs/Config');
var fs = require('fs');
var json = fs.readFileSync('./config.json').toString();
Config.init(json);

var serverType = args[2].trim();
if (serverType == 'publishing') {
  var PublishingServer = require('./libs/PublishingServer');
  var pub = new PublishingServer();
  pub.start();
} else if (serverType == 'broadcasting') {
  if (args[3] == undefined) {
    console.log('Missing broadcasting server name');
    console.log('Example: node server.js broading s1');
    console.log('Example: node server.js broading s2');
  }

  var broadcastingServerName = args[3].trim();
  var BroadCastingServer = require('./libs/BroadCastingServer');

  var broadcast = new BroadCastingServer(broadcastingServerName);
  broadcast.start();
}
