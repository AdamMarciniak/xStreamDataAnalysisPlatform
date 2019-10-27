
import * as DataManager from './DataManager.js';

export const startRealtimeGathering = () => {
  DataManager.setupRealtimeData();
  establishWebsockets();
}



let timeIndex = 0;
const establishWebsockets = () => {

  const ws = new WebSocket('ws://192.99.54.136:1024');

  ws.onopen = function (event) {
    ws.send('Web Client Connected');
  };

  ws.onmessage = function (event) {
    const message = event.data;
    if (message[0] == 'x') {
      const xAngle = message.substring(1);
      
      DataManager.addToRealtimeData('Body Sway', timeIndex, xAngle);
      timeIndex += 0.1;

    }
    if (message[0] == 'y') {
      
      const yAngle = message.substring(1);
    }

  };

}