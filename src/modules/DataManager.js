const sensorConfig = require('../../config/sensorConfig.json');

const realtimeData = {};

(function setupRealtimeData() {
  Object.keys(sensorConfig).forEach((sensor) => {
    realtimeData[sensor] = {
      x: [0],
      y: [0],
      min: sensorConfig[sensor].min,
      max: sensorConfig[sensor].max,
    };
  });
}());

export const addToRealtimeData = (sensor, xVal, yVal) => {
  realtimeData[sensor].x.push(xVal);
  realtimeData[sensor].y.push(yVal);
};

export const getCurrentValue = (sensor, xVal) => {
  const index = realtimeData[sensor].x.indexOf(xVal);
  if (index) {
    return realtimeData[sensor].y[index];
  }
  return null;
};

export const getDataLength = () => realtimeData[Object.keys(realtimeData)[0]].x.length;

export const getLiveTime = () => realtimeData[Object.keys(realtimeData)[0]].x[getDataLength() - 1];

export const getRealtimeData = () => realtimeData;

export const getLatestYValue = (key) => realtimeData[key].y[realtimeData[key].y.length - 1];
