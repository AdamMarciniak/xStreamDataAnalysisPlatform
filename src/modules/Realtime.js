
import * as DataManager from './DataManager';

const sensorConfig = require('../../config/sensorConfig.json');

let realtimeFlag = 0;

export const getRealtimeFlag = () => realtimeFlag;

const addChangedData = (index, timeIndex, data) => {
  DataManager.addToRealtimeData(index, timeIndex, Math.sin(data * 10)
    + 0.9 * Math.sin(3.14159 * Math.random()));
};

let timeIndex = 0;
const establishWebsockets = () => {
  const ws = new WebSocket('ws://192.99.54.136:1024');

  ws.onopen = function onOpen(event) {
    ws.send('Web Client Connected');
  };

  ws.onclose = function onClose(event) {
    realtimeFlag = 0;
  };
  ws.onmessage = function onMessage(event) {
    realtimeFlag = 1;
    const message = event.data;
    const xAngle = parseFloat(message.substring(1));
    addChangedData(message[0], timeIndex, xAngle);
    timeIndex += 0.016;
  };
};

const startRealtimeGathering = () => {
  DataManager.setupRealtimeData();
  establishWebsockets();
};

export default startRealtimeGathering;
