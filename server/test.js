const WebSocket = require('ws');
 const Ultron = require('ultron');
var wss1 = new WebSocket.Server({
  perMessageDeflate: false,
  port: 3001
});

var client = new WebSocket('ws://127.0.0.1:3001/abc');
client.on('open', function() {
  client.send('hello');
});
