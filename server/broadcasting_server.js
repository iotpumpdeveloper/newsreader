var args = process.argv;

if (args.length !== 3) {
  console.log("Missing broadcasting server name, example: node broadcasting_server.js s1");
  process.exit();
}

var serverName = args[2].trim();
var fs = require('fs');
const WebSocket = require('ws');

const EncryptionUtil = require('./libs/encryption_util');

var content = fs.readFileSync('./config.json').toString();
var config = JSON.parse(content);

var incomingDataChannel = "/" + EncryptionUtil.get_sha512(config.publisherServer.secretKey + config.broadcastingServers[serverName].secretKey);

//liste to incoming message
var incomingDataListener = new WebSocket.Server({
  perMessageDeflate: false,
  port: config.broadcastingServers[serverName].port,
  path: incomingDataChannel 
});

incomingDataListener.on('connection', function connection(ws) {
  ws.on('message', function(message) {
    console.log('received: %s', message);
  });
});

console.log("Broadcasting server started at port " + config.broadcastingServers[serverName].port);
