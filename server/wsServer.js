const Websocket = require('ws');

const wss = new Websocket.Server({ port: 1024 });
console.log('Running WSS server');

let clientNum = 0;

let i = 0;
const outputValues = (() => {
  i += 0.0005;
  wss.clients.forEach((client) => {
    client.send(`0${i},1${i},2${i},3${i},4${i},5${i},6${i},7${i}`);
  });
});

setInterval(outputValues, 64);

wss.on('connection', (ws) => {
  clientNum = wss.clients.size;
  console.log(`Connected Clients: ${clientNum}`);
  ws.on('message', (message) => {
    console.log(message);
  });
});
