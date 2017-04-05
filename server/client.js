const WebSocket = require('ws');

var client =  new WebSocket('ws://127.0.0.1:4001/latestnews', {
  perMessageDeflate: false
}); 

client.on('open', function(){
  client.send('something');
})

client.on('message', function(message){
  console.log(message);
})
