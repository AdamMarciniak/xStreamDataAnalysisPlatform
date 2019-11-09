const Websocket = require('ws');

const wss = new Websocket.Server({ port: 1024 });
console.log('Running WSS server');

let i = 0;
const outputValues = (() => {
  i += 0.0005;
  wss.clients.forEach((client) => {
    client.send(`0${i}`);
    client.send(`1${i}`);
    client.send(`2${i}`);
    client.send(`3${i}`);
    client.send(`4${i}`);
    client.send(`5${i}`);
    client.send(`6${i}`);
    client.send(`7${i}`);
  });
});

wss.on('connection', (ws) => {

  ws.on('message', (message) => {
    console.log(message);
  });

  setInterval(outputValues, 16);
});
