const Websocket = require('ws');

const wss = new Websocket.Server({ port: 1024 });
console.log('Running WSS server');

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(message);

    if (message[0] === 'y' || message[0] === 'x') {
      wss.clients.forEach((client) => {
        client.send(message);
      });
    }
  });
  ws.send('GREETINGS FRIEND');
});
