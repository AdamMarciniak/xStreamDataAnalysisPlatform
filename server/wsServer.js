const Websocket = require('ws');
const data = require('./fakeData.js');

const wss = new Websocket.Server({ port: 1024 });
console.log('Running WSS server');

let clientNum = 0;

let i = 0;
const outputValues = () => {
  if (i > 900) {
    i = 0;
  }
  i += 1;
  wss.clients.forEach(client => {
    client.send(
      `0${data.data1[i].y},
      1${data.data2[i].y},
      2${data.data3[i].y},
      3${data.data6[i].y},
      4${data.data5[i].y},
      5${data.data6[i].y},
      6${data.data7[i].y},
      7${data.data4[i].y},
      8${data.mapData[i].y}`
    );
  });
};

setInterval(outputValues, 32);

wss.on('connection', ws => {
  clientNum = wss.clients.size;
  console.log(`Connected Clients: ${clientNum}`);
  ws.on('message', message => {
    console.log(message);
  });
});
