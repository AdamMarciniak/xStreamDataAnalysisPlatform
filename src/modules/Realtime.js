
import * as DataManager from './DataManager';

let realtimeFlag = 0;

export const getRealtimeFlag = () => realtimeFlag;

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
    if (message[0] === 'x') {
      const xAngle = parseFloat(message.substring(1));
      DataManager.addToRealtimeData('Body Sway', timeIndex, xAngle);
      DataManager.addToRealtimeData('Body Sway2', timeIndex, 2 * xAngle);
      DataManager.addToRealtimeData('Body Sway3', timeIndex, 3 * xAngle);
      DataManager.addToRealtimeData('Body Sway4', timeIndex, 4 * Math.sin(xAngle));

      timeIndex += 0.1;
    }
  };
};

const startRealtimeGathering = () => {
  DataManager.setupRealtimeData();
  establishWebsockets();
};

export default startRealtimeGathering;
