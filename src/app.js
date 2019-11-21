import * as Slider from './modules/Slider';
import * as DataManager from './modules/DataManager';
import * as Model from './modules/Model';
import * as Simulation from './modules/Simulation';
import * as DataVisualizer from './modules/DataVisualizer';
import { scaleValues } from './modules/Utils';
import startRealtimeGathering from './modules/Realtime';
import * as MapController from './modules/MapController';

const sensorConfig = require('../config/sensorConfig.json');

const PADDING = 10;
const PADDING_LEFT = 40;
const NUM_OVERVIEW_POINTS = 1000;
const OVERVIEW_ROW_HEIGHT = 4;

let pausedDataLength = null;

let pausedFlag = false;
let startRatio = 0;
let endRatio = 1;
let seekerPosition = 0;
let seekerRatio = 0;
let timeIndex = 0;
let seekerPositionRatio = 0;
let pausedIndex = 0;
let seekerSpeed = 1;
let playState = 0;
let timePassedSincePlay = 0;
let requestId;
let oldTimestamp = 0;

MapController.initializeMap();

const overviewCanvas = document.getElementById('graphOverview');
const overviewCanvasCtx = overviewCanvas.getContext('2d');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const timeDisplay = document.getElementById('timeButton');
timeDisplay.innerText = '00:00:00';
const speedButton = document.getElementById('speedButton');
const overviewSliderStart = document.getElementById('overviewSliderStart');
const overviewSeeker = document.getElementById('overviewSeeker');




const getElementWidth = (element) => {
  const elementRect = element.getBoundingClientRect();
  return elementRect.right - elementRect.left;
};

const getDataUnderSeeker = (seekerIndex, data) => {
  const dataUnderSeeker = {};
  Object.keys(data).forEach((property) => {
    dataUnderSeeker[property] = data[property].y[seekerIndex];
  });
  return dataUnderSeeker;
};

const setOverviewDimensions = () => {
  const [sWidth, sHeight] = DataVisualizer.getCanvasStyleRect();
  overviewCanvas.style.width = sWidth;
  overviewCanvas.style.height = sHeight * 2;

  const [width, height] = DataVisualizer.getCanvasRect();
  overviewCanvas.width = width;
  overviewCanvas.height = height * 2;
};

DataVisualizer.createDataVisualizers(sensorConfig);
Model.loadAllGeometry();
Model.resizeCanvasToDisplaySize();
setOverviewDimensions();
startRealtimeGathering();

const setDefaultCanvasStyles = (ctx) => {
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
};

setDefaultCanvasStyles(overviewCanvasCtx);

const drawOverviewCanvasRealtime = (data) => {
  const canvasMaxX = overviewCanvas.width;
  const canvasMinX = 0;
  overviewCanvasCtx.beginPath();
  let propertyIndex = 0;
  const keys = Object.keys(data);
  const overViewCanvasYChunkSize = (overviewCanvas.height
     - (keys.length + 1) * OVERVIEW_ROW_HEIGHT) / (keys.length);

  overviewCanvasCtx.clearRect(0, 0, overviewCanvas.width, overviewCanvas.height);
  const reducedData = {};

  Object.keys(data).forEach((key) => {
    const sparseRatio = Math.max(1, Math.round(data[key].x.length / NUM_OVERVIEW_POINTS));
    reducedData[key] = { x: [0], y: [0] };
    for (let i = 0; i < data[key].x.length / sparseRatio; i += 1) {
      reducedData[key].x[i] = data[key].x[i * sparseRatio];
      reducedData[key].y[i] = data[key].y[i * sparseRatio];
    }

    const overviewCanvasSliceMinY = overViewCanvasYChunkSize
      * propertyIndex + OVERVIEW_ROW_HEIGHT * (propertyIndex + 1);
    const overviewCanvasSliceMaxY = overViewCanvasYChunkSize
      * (propertyIndex + 1) + OVERVIEW_ROW_HEIGHT * (propertyIndex + 1);

    const xLength = reducedData[key].x.length;

    overviewCanvasCtx.moveTo(scaleValues(reducedData[key].x[0],
      0,
      reducedData[key].x[xLength - 1],
      canvasMinX,
      canvasMaxX),

    overviewCanvas.height - scaleValues(reducedData[key].y[0],
      data[key].min,
      data[key].max,
      overviewCanvasSliceMinY,
      overviewCanvasSliceMaxY));

    for (let i = 0; i < xLength; i += 1) {
      overviewCanvasCtx.lineTo(
        Math.floor(scaleValues(reducedData[key].x[i],
          0,
          reducedData[key].x[xLength - 1],
          canvasMinX,
          canvasMaxX)) + 0.5,

        overviewCanvas.height - Math.floor(scaleValues(reducedData[key].y[i],
          data[key].min,
          data[key].max,
          overviewCanvasSliceMinY,
          overviewCanvasSliceMaxY)) + 0.5,
      );
    }
    propertyIndex += 1;
  });
  overviewCanvasCtx.stroke();
};

DataVisualizer.updatedataVisualizers(0.1, 1, 0, DataManager.getRealtimeData(), DataManager.getDataLength());

const convertSecToTime = (secs) => {
  const ms = (secs * 1000).toFixed(0);
  const min = Math.floor(ms / 60000);
  const remainder = ms % 60000;
  const sec = Math.floor(remainder / 1000);
  const millis = remainder % 1000;
  return `${(min < 10 ? '0' : '')}${min}:${(sec < 10 ? '0' : '')}${sec}:${(millis < 10 ? '00' : millis < 100 ? '0' : '')}${millis}`;
};

let i = 0;
const simulate = (timestamp) => {
  i += 1;
  timeDisplay.innerText = convertSecToTime(DataManager.getLiveTime());
  pausedFlag = false;
  if (oldTimestamp === 0) oldTimestamp = timestamp;
  const delta = (timestamp - oldTimestamp) * seekerSpeed;
  const overviewWidth = getElementWidth(overviewCanvas);
  timePassedSincePlay += delta;
  const timeArray = DataManager.getRealtimeData()['0'].x;
  timeIndex = Simulation.getClosestIndex((timePassedSincePlay / 1000), timeArray) + pausedIndex;
  seekerPositionRatio = Math.min(0.99, timeIndex / timeArray.length);
  const frontLeftSuspensionAngle = DataManager.getLatestYValue(1);
  const frontRightSuspensionAngle = DataManager.getLatestYValue('1');
  seekerPosition = seekerPositionRatio * (overviewWidth - 1);
  seekerPosition = 0;
  overviewSeeker.style.left = seekerPosition;
  if (frontLeftSuspensionAngle === 0) {
    Model.animate(Math.sin(i / 5), Math.sin(i / 5));
  } else {
    Model.animate(frontLeftSuspensionAngle, frontRightSuspensionAngle);
  }
  seekerPositionRatio = 0;

  DataVisualizer.updatedataVisualizers(startRatio,
    endRatio,
    seekerPositionRatio,
    DataManager.getRealtimeData(),
    DataManager.getDataLength());

  drawOverviewCanvasRealtime(DataManager.getRealtimeData());
  oldTimestamp = timestamp;
  const longitude = -122.255090 + i * 0.0001;
  const latitude = 45.632770 + frontRightSuspensionAngle * 0.001;

  if (i % 20 === 0) {
    MapController.addLineCoordinates(longitude, latitude);
  }

  requestId = requestAnimationFrame(simulate);
};

const pauseSimulation = () => {
  pausedIndex = timeIndex;
  pausedDataLength = DataManager.getDataLength();
  pausedFlag = true;
  cancelAnimationFrame(requestId);
};

const stopSimulation = () => {
  const seekerData = getDataUnderSeeker(0, DataManager.getRealtimeData());
  cancelAnimationFrame(requestId);
  overviewSeeker.style.left = 0;
  overviewSeeker.style.left = 0;

  DataVisualizer.updatedataVisualizers(startRatio,
    endRatio,
    seekerPositionRatio,
    DataManager.getRealtimeData(),
    DataManager.getDataLength());

  pausedIndex = 0;
};

const setupButtons = () => {
  playState = 0;
  const speedOptions = [1, 0.5, 0.25, 0.1];
  let speedState = 1;
  seekerSpeed = speedOptions[speedState - 1];
  pauseButton.addEventListener('click', () => {
    if (playState === 1) {
      pauseButton.className = 'activeButton';
      playButton.classList.remove('activeButton');
      pauseSimulation();
      playState = 0;
      timePassedSincePlay = 0;
      oldTimestamp = 0;
    }
  });
  speedButton.addEventListener('click', () => {
    if (speedState < speedOptions.length) {
      seekerSpeed = speedOptions[speedState];
      speedButton.innerText = `${seekerSpeed} X`;
      speedState += 1;
    } else {
      speedState = 1;
      seekerSpeed = speedOptions[speedState - 1];
      speedButton.innerText = `${seekerSpeed} X`;
    }
  });

  playButton.addEventListener('click', () => {
    if (playState === 0) {
      playButton.className = 'activeButton';
      playState = 1;
      pauseButton.classList.remove('activeButton');
      requestAnimationFrame(simulate);
    }
  });

  stopButton.addEventListener('click', () => {
    pauseButton.classList.remove('activeButton');
    playButton.classList.remove('activeButton');
    playState = 0;
    seekerPosition = 0;
    seekerPositionRatio = 0;
    overviewSeeker.style.left = seekerPosition;
    timePassedSincePlay = 0;
    oldTimestamp = 0;
    stopSimulation();
  });
};
setupButtons();

window.addEventListener('resize', () => {
  DataVisualizer.scaleCanvases();
  Model.resizeCanvasToDisplaySize();
  setOverviewDimensions();
  overviewCanvas.width = overviewCanvas.parentNode.getBoundingClientRect().width * 4;
  drawOverviewCanvasRealtime(DataManager.getRealtimeData());
  let dataLength;

  if (pausedFlag === true) {
    dataLength = pausedDataLength;
  } else {
    dataLength = DataManager.getDataLength();
  }

  DataVisualizer.updatedataVisualizers(startRatio,
    endRatio,
    seekerPositionRatio,
    DataManager.getRealtimeData(),
    dataLength);

  Model.resizeCanvasToDisplaySize();
  Model.renderOnce();
  const overviewRect = overviewCanvas.getBoundingClientRect();
  const overviewWidth = overviewRect.right - overviewRect.left;
  overviewSeeker.style.left = seekerRatio * (overviewWidth - 1);
});

const makeEdgePositioner = ((elementToMove, originalY, originalZoom) => (event) => {
  event.preventDefault();
  event.stopPropagation();
  const overviewRect = overviewCanvas.getBoundingClientRect();
  let sliderRect = elementToMove.getBoundingClientRect();
  const zoomRatio = Slider.mouseYToZoomLevel(event.clientY, originalY, originalZoom);
  elementToMove.style.width = `${zoomRatio * 100}%`;
  const canvasWidth = overviewRect.right - overviewRect.left;
  const sliderWidth = sliderRect.right - sliderRect.left;
  const sliderMidX = sliderWidth / 2;
  const ratio = Math.min(
    1,
    Math.max(
      0,
      (event.clientX - sliderMidX - overviewRect.left) / (canvasWidth),
    ),
  );
  elementToMove.style.left = `${Math.min(((canvasWidth - sliderWidth)
  / canvasWidth) * 100, ratio * 100)}%`;

  sliderRect = elementToMove.getBoundingClientRect();

  startRatio = Math.max(0, (sliderRect.left - overviewRect.left)
  / (overviewRect.right - overviewRect.left));

  endRatio = Math.min(1, 1 - (overviewRect.right - sliderRect.right)
  / (overviewRect.right - overviewRect.left));

  let dataLength;

  if (pausedFlag === true) {
    dataLength = pausedDataLength;
  } else {
    dataLength = DataManager.getDataLength();
  }

  DataVisualizer.updatedataVisualizers(startRatio,
    endRatio,
    seekerPositionRatio,
    DataManager.getRealtimeData(),
    dataLength);
});


const getDistance = ([x1, y1], [x2, y2]) => Math.sqrt(
  (x1 - x2) ** 2
  + (y1 - y2) ** 2,
);

const getMidpoint = (element) => {
  const rect = element.getBoundingClientRect();
  return [
    (rect.left + rect.right) / 2,
    (rect.top + rect.bottom) / 2,
  ];
};

const getDistanceToElement = (inputPoint, element) => getDistance(
  inputPoint,
  getMidpoint(element),
);

const getNearestElement = ([x, y], elements) => {
  let nearestElement;
  let nearestElementDistance = Infinity;

  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i];
    const distance = getDistanceToElement([x, y], element);
    if (distance < nearestElementDistance) {
      nearestElementDistance = distance;
      nearestElement = element;
    }
  }
  return nearestElement;
};

overviewCanvas.addEventListener('mousedown', (event) => {
  const nearestEdge = getNearestElement(
    [event.clientX, event.clientY],
    [overviewSliderStart],
  );
  const sliderWindowRect = overviewSliderStart.getBoundingClientRect();
  const overviewRect = overviewCanvas.getBoundingClientRect();
  const sliderWindowWidth = sliderWindowRect.right - sliderWindowRect.left;
  const overviewWidth = overviewRect.right - overviewRect.left;
  const originalMouseY = event.clientY;
  const originalZoomLevel = sliderWindowWidth / overviewWidth;
  const positionNearestEdge = makeEdgePositioner(
    overviewSliderStart,
    originalMouseY,
    originalZoomLevel,
  );
  positionNearestEdge(event);
  Slider.makeDragHandler(positionNearestEdge);
});
