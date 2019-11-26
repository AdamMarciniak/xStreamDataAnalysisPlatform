
import * as DataManager from './DataManager';

const sensorConfig = require('../../config/sensorConfig.json');

let realtimeFlag = 0;

export const getRealtimeFlag = () => realtimeFlag;

const addChangedData = (sensorIndex, timeIndex, data) => {
  DataManager.addToRealtimeData(sensorIndex, timeIndex, 3.9 * Math.sin(data * 100));
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
    const dataValues = message.split(',');
    timeIndex += 0.064;
    dataValues.forEach((value) => {
      const cleanValue = parseFloat(value.substring(1));
      addChangedData(value[0], timeIndex, cleanValue);
      // Work to do. Add fake coordinates data to be piped into datamanager . markers are ready to receive,.
      -122.255090, 45.632500
    });
  };
};

const startRealtimeGathering = () => {
  DataManager.setupRealtimeData();
  establishWebsockets();
};

export default startRealtimeGathering;
