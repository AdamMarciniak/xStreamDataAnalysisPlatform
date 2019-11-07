// Config

const PADDING = 7;
const PADDING_LEFT = 40;
const NUM_OVERVIEW_POINTS = 1000;
const OVERVIEW_ROW_HEIGHT = 40;

const overviewCanvas = document.getElementById('graphOverview');
const overviewCanvasCtx = overviewCanvas.getContext('2d');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const speedButton = document.getElementById('speedButton');
const overviewSliderStart = document.getElementById('overviewSliderStart');
const overviewSeeker = document.getElementById('overviewSeeker');


// Functions that probably don't need to be refactored

const getElementWidth = (element) => {
  const elementRect = element.getBoundingClientRect();
  return elementRect.right - elementRect.left;
};

const scaleValues = (input, inMin, inMax, outMin, outMax) => outMin
  + ((input - inMin) / (inMax - inMin)) * (outMax - outMin);


// Functions that need to be refactored

const getDataUnderSeeker = (seekerIndex, data) => {
  const dataUnderSeeker = {};
  Object.keys(data).forEach((property) => {
    dataUnderSeeker[property] = data[property].y[seekerIndex];
  });
  return dataUnderSeeker;
};

const createCanvasesFromConfig = (config) => {
  const canvases = {};
  Object.keys(config).forEach((property) => {
    const template = document.querySelector('#sensorInfo');
    const sensorList = document.querySelector('#sensorList');
    const clone = document.importNode(template.content, true);
    const h3 = clone.querySelector('h3');
    const h4 = clone.querySelector('h4');
    const canvas = clone.querySelector('canvas');
    h3.textContent = property;
    h4.id = `${property}valueReadout`;
    canvas.id = property;
    sensorList.appendChild(clone);
    canvas.width = canvas.parentNode.getBoundingClientRect().width * 4;
    canvas.height = canvas.parentNode.getBoundingClientRect().height * 4;
    canvases[property] = canvas;
  });
  return canvases;
};

// dataVisualizers.js
const templateContent = document.querySelector('#sensorInfo').content;

export const createDataVisualizer = (title, renderScaling = 1) => {
  const template = document.importNode(templateContent, true);
  const canvas = clone.querySelector('canvas');
  const rect = canvas.parentNode.getBoundingClientRect();
  dataVisualizer.querySelector('h3').innerText = title;
  canvas.width = rect.width * renderScaling;
  canvas.height = rect.height * renderScaling;
  return clone;
}

export const getValueReadoutElement = (dataVisualizer) => dataVisualizer.querySelector('h4');
export const getTitleElement = (dataVisualizer) => dataVisualizer.querySelector('h3');
export const getRenderingContext = (dataVisualizer) => dataVisualizer.querySelector('canvas').getContext('2d');


// config.js

const sensorConfigFile = fs.readFileSync('../config/sensorConfig.json');

export default JSON.parse(sensorConfigFile);


// animate.js

const animate = (functionToCall) => {
  functionToCall();
  requestAnimationFrame(animate);
}

export default animate;




// rendering.js


const renderOneVisualizer = (
  context,
  normalizedData, // [[simulationTime1, value1], [simluationTime2, value2]]
  minSimulationTime,
  maxSimulationTime,
) => {
  const step = (maxSimulationTime - minSimulationTime) / context.canvas.width;
  for (let idealIndex = minIndex; idealIndex <= maxIndex; idealIndex += step) {
    const [time, normalizedValue] = normalizedData[Math.round(idealPoint)];
    // do lineTo.
  }
}





// app.js

import config from 'config';

import {
  createDataVisualizer,
  getRenderingContext,
  getValueReadoutElement,
} from './dataVisualizers'

import animate from './animate';

import {
  getSimulationTime,
  play,
  seek,
  stop,
} from './simulation';

import { renderOneVisualizer } from './rendering';

const visualizerElementsByProperty = {};
const visualizerListElement = document.getElementById('sensorList');

Object.keys(config).forEach((property) => {
  const newVisualizer = createDataVisualizer(
    property,
    window.devicePixelRatio,
  );
  visualizerListElement.append(newVisualizer);
  visualizerElementsByProperty[property] = newVisualizer;
});

document.getElementById('play').addEventListener('click', play);
document.getElementById('stop').addEventListener('click', stop);

animate(() => {
  const now = Date.now();
  const [minSimulationTime, maxSimulationTime] = getZoomBounds();
  Object.keys(config).forEach((property) => {
    const value = DataManager.getTrueValueAtTime(property, getSimulationTime(now));
    getValueReadoutElement(property).innerText = value.toFixed(5);
  });
});

dataReceiver.onNewData((data) => {
  if (document.querySelector('#useRealtimeData').checked) {
    DataManager.saveData(data);
    Object.keys(config).forEach((property) => {
      const [minSimulationTime, maxSimulationTime] = getZoomBounds();
      renderData(
        getRenderingContext(property),
        DataManager.getNormalizedData(property),
        minSimulationTime,
        maxSimulationTime,
      );
    });
  }
});






// dataReceiver.js

const callbacks = [];

const socket = socketIO.connect('ws://myserver:3000');
socket.on('newData', (dataReceived) => {
  callbacks.forEach((callback) => {
    callback(dataReceived);
  });
});

export const onNewData = (callback) => {
  callbacks.push(callback);
}



const createCanvas = (property) => {

  const h3 = clone.querySelector('h3');
  const h4 = clone.querySelector('h4');
  const canvas = clone.querySelector('canvas');
  h3.textContent = property;
  sensorList.appendChild(clone);
  canvas.width = canvas.parentNode.getBoundingClientRect().width * 4;
  canvas.height = canvas.parentNode.getBoundingClientRect().height * 4;
  canvases[property] = canvas;
}

// Functions that do one extremely specific thing and aren't reusable

const setOverviewDimensions = () => {
  const liElement = document.querySelector('.sensorItem');
  overviewCanvas.width = liElement.getBoundingClientRect().width * 4 - 4 * PADDING_LEFT;
  overviewCanvas.height = liElement.getBoundingClientRect().height * 4;
};