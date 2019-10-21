
import * as Simulation from './Simulation.js';

const SAMPLE_PERIOD_SECONDS = 0.1;
const createFakeRawData = (nonTimeProperties, numDataPoints) => {
  const timeArray = [];
  const allRawData = {};
  let rawData = {};
  let k = 1;
  const createFakeData = nonTimeProperties.forEach((property) => {
    k += 10;
    let yValues = [];
    for (let i = 0; i < numDataPoints; i++) {
      timeArray[i] = ((SAMPLE_PERIOD_SECONDS * i));
      yValues[i] = (0.5 * Math.sin(i / 10 - Math.PI / 2 * k));
    };
    rawData[property] = yValues;
  });
  allRawData['yValues'] = rawData;
  allRawData['timeValues'] = timeArray;
  return allRawData;
};

const convertDataToPointPairs = (allRawData) => {
  const keys = Object.keys(allRawData['yValues']);
  const allPropertyPoints = {}
  for (const key of keys) {
    allPropertyPoints[key] = [];
    for (let i = 0; i < allRawData['yValues'][key].length; i++) {
      allPropertyPoints[key].push([allRawData['timeValues'][i], allRawData['yValues'][key][i]]);
    }
  }
  return allPropertyPoints;
};

function getMax(arr) {
  let len = arr.length;
  let max = -Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
  }
  return max;
}

function getMin(arr) {
  let len = arr.length;
  let min = Infinity;

  while (len--) {
    min = arr[len] < min ? arr[len] : min;
  }
  return min;
}

const getDataMinsAndMaxes = (allPropertyPoints) => {

  const keys = Object.keys(allPropertyPoints);
  const minsAndMaxes = {};

  for (const key of keys) {
    let yValues = [];
    let xValues = [];
    for (let i = 0; i < allPropertyPoints[key].length; i++) {
      yValues.push(allPropertyPoints[key][i][1]);
      xValues.push(allPropertyPoints[key][i][0]);
    }
    minsAndMaxes[key] = { 'min': getMin(yValues), 'max': getMax(yValues) };
    minsAndMaxes['time'] = { 'min': getMin(xValues), 'max': getMax(xValues) };
  }
  return minsAndMaxes;
};

const convertToSparseData = (allPropertyPoints, numPoints) => {
  const reducedPoints = {};
  const keys = Object.keys(allPropertyPoints);
  for (const key of keys) {
    reducedPoints[key] = [];
    let includeEveryNth = Math.round(allPropertyPoints[key].length / numPoints);
    if (includeEveryNth > 1) {
      for (let i = 0; i < allPropertyPoints[key].length / (includeEveryNth); i++) {

        reducedPoints[key][i] = allPropertyPoints[key][i * includeEveryNth];
      }
    }
    else {
      reducedPoints[key] = allPropertyPoints[key];
    }
  }
  return reducedPoints;
};

const createFakeData = (propertyNames, NUM_FAKE_DATA_POINTS ) => {
  const allRawData = createFakeRawData(propertyNames, NUM_FAKE_DATA_POINTS);
  const allPropertyPoints = convertDataToPointPairs(allRawData);

  return allPropertyPoints;
}


export const getTimeArrayFromData = (data) => {

  const keys = Object.keys(data);
  const timeArray = [];
  for (let i = 0; i < data[keys[0]].length; i++){
    timeArray[i] = data[keys[0]][i][0];
  }
  return timeArray;

}



export {createFakeData, getDataMinsAndMaxes, convertToSparseData}