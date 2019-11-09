
const SAMPLE_PERIOD_SECONDS = 0.01;
let allPropertyPoints = {};
const sensorConfig = require('../../config/sensorConfig.json');

const realtimeData = {};

export const setupRealtimeData = () => {
  Object.keys(sensorConfig).forEach((sensor) => {
    realtimeData[sensor] = {
      x: [0],
      y: [0],
      min: sensorConfig[sensor].min,
      max: sensorConfig[sensor].max,
    };
  });
};

export const getDataLength = () => realtimeData[Object.keys(realtimeData)[0]].y.length;


export const addToRealtimeData = (sensor, xVal, yVal) => {
  realtimeData[sensor].x.push(xVal);
  realtimeData[sensor].y.push(yVal);
};

export const getRealtimeData = () => (realtimeData);

export const getLatestYValue = (key) => realtimeData[key].y[realtimeData[key].y.length - 1];


const createFakeRawData = (nonTimeProperties, numDataPoints) => {
  const timeArray = [];
  const allRawData = {};
  const rawData = {};
  let k = 1;
  const createFakeData = nonTimeProperties.forEach((property) => {
    const yValues = [];
    for (let i = 0; i < numDataPoints; i += 1) {
      timeArray[i] = ((SAMPLE_PERIOD_SECONDS * i));
      k = timeArray[i];
      yValues[i] = (-0.5 * Math.sin(k * 20)) / Math.exp(k * 4) + 0.005 * Math.sin(i);
    }
    rawData[property] = yValues;
  });
  allRawData.yValues = rawData;
  allRawData.timeValues = timeArray;
  return allRawData;
};

const convertDataToPointPairs = (allRawData) => {
  Object.keys(allRawData.yValues).forEach((key) => {
    allPropertyPoints[key] = [];
    for (let i = 0; i < allRawData.yValues[key].length; i += 1) {
      allPropertyPoints[key].push([allRawData.timeValues[i], allRawData.yValues[key][i]]);
    }
  });
  return allPropertyPoints;
};

export const getDataMinsAndMaxes = (data) => {
  const minsAndMaxes = {};

  Object.keys(data).forEach((key) => {
    const [xValues, yValues] = data[key];
    minsAndMaxes[key] = { min: Math.min(...yValues), max: Math.max(...yValues) };
    minsAndMaxes.time = { min: Math.min(...xValues), max: Math.max(...xValues) };
  });
  return minsAndMaxes;
};

export const convertToSparseData = (allPropertyPoints, numPoints) => {
  const reducedPoints = {};
  Object.keys(allPropertyPoints).forEach((key) => {
    reducedPoints[key] = [];
    const includeEveryNth = Math.round(allPropertyPoints[key].length / numPoints);
    if (includeEveryNth > 1) {
      for (let i = 0; i < allPropertyPoints[key].length / (includeEveryNth); i += 1) {
        reducedPoints[key][i] = allPropertyPoints[key][i * includeEveryNth];
      }
    } else {
      reducedPoints[key] = allPropertyPoints[key];
    }
  });
  return reducedPoints;
};


export const createFakeData = (propertyNames, NUM_FAKE_DATA_POINTS) => {
  const allRawData = createFakeRawData(propertyNames, NUM_FAKE_DATA_POINTS);
  allPropertyPoints = convertDataToPointPairs(allRawData);
  return allPropertyPoints;
};
