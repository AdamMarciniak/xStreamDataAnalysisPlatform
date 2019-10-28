
import * as Slider from './modules/Slider.js';
import * as DataManager from './modules/DataManager.js';
import * as Model from './modules/Model.js';
import * as Simulation from './modules/Simulation.js';
import * as Realtime from './modules/Realtime.js';
const sensorConfig = require('../config/sensorConfig.json');


DataManager.setupRealtimeData();


const PADDING = 7;
const PADDING_LEFT = 40;
const NUM_OVERVIEW_POINTS = 1000;
const NUM_FAKE_DATA_POINTS = 5000;
const OVERVIEW_ROW_HEIGHT = 40;
let startRatio = 0;
let endRatio = 1;
let sensorVal = 0;
let xAngle = 0;
let yAngle = 0;


const nonTimeProperties = ['Right Arm Angle', 'Left Arm Angle', 'Body Sway'];

const stackElement = document.getElementById('stack');
const ulElement = document.createElement('ul');
stackElement.appendChild(ulElement);
const sliderCanvas = document.createElement('canvas');
sliderCanvas.setAttribute('id','sliderCanvas');
const overviewCanvas = document.getElementById('graphOverview');
const overviewCanvasCtx = overviewCanvas.getContext('2d');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const speedButton = document.getElementById('speedButton');
const overviewSliderStart = document.getElementById('overviewSliderStart');
const overviewSeeker = document.getElementById('overviewSeeker');

const getElementWidth = (element) => {
  const elementRect = element.getBoundingClientRect();
  return elementRect.right - elementRect.left;
}

let overviewWidthOld = getElementWidth(overviewCanvas);

let playRequest;
let seekerSpeed = 1;
let animateState = 0;
let playState = 0;

const getDataUnderSeeker = (seekerIndex, data) => {
  const dataUnderSeeker = {};
  Object.keys(data).forEach((property) => {
    dataUnderSeeker[property] = data[property].y[seekerIndex];
  });
  return dataUnderSeeker;
}

let seekerPosition = 0;
let seekerRatio = 0;
let timeIndex = 0;
let seekerPositionRatio = 0;
let pausedIndex = 0;

const scaleValues = (input, inMin, inMax, outMin, outMax) => {
  return outMin + ((input - inMin) / (inMax - inMin)) * (outMax - outMin);
};

let pressedPlayTime = 0;
let timePassedSincePlay = 0;
let start = null;
const setupButtons = () => {
  playState = 0;
  const speedOptions = [1, 0.5, 0.25, 0.1];
  let speedState = 1;
  seekerSpeed = speedOptions[speedState-1];
  pauseButton.addEventListener('click', function () {
    if (playState == 1) {
      pauseButton.className = 'activeButton';
      playButton.classList.remove('activeButton');
      pauseSimulation();
      playState = 0;
      timePassedSincePlay = 0;
      oldTimestamp = 0;
    }
  });
  speedButton.addEventListener('click', function () {
    if (speedState < speedOptions.length) {
      seekerSpeed = speedOptions[speedState];
      speedButton.innerText = seekerSpeed + ' X';
      speedState += 1;

    }
    else {
      speedState = 1;
      seekerSpeed = speedOptions[speedState-1];
      speedButton.innerText = seekerSpeed + ' X';
    }
  });
  playButton.addEventListener('click', function () {
    if (playState == 0) {
      playButton.className = 'activeButton';
      playState = 1;
      pauseButton.classList.remove('activeButton');
      animateState = 1;
      requestAnimationFrame(simulate);
    }
  });
  stopButton.addEventListener('click', function () {
    animateState = 0;
    pauseButton.classList.remove('activeButton');
    playButton.classList.remove('activeButton');
    playState = 0;
    seekerPosition = 0;
    seekerPositionRatio = 0;
    stopSimulation();
    overviewSeeker.style.left = seekerPosition
    timePassedSincePlay = 0;
    oldTimestamp = 0;
  });
};

const createCanvases = (sensorConfig) => {
  const canvases = {};
  const properties = Object.keys(sensorConfig);
  properties.forEach((property) => {
    let liElement = document.createElement('li');
    const newCanvas = document.createElement('canvas');
    const graphInfo = document.createElement('div');
    const graphTitle = document.createElement('h3');
    const valueReadout = document.createElement('h4');
    valueReadout.setAttribute('class', 'valueReadout')
    valueReadout.setAttribute('id', property + 'valueReadout')
    graphInfo.setAttribute('class', 'graphInfo');
    newCanvas.setAttribute('id', property);
    graphTitle.innerText = property.toUpperCase();
    valueReadout.innerText = '0';
    canvases[property] = newCanvas;
    graphInfo.appendChild(graphTitle);
    graphInfo.appendChild(valueReadout);
    liElement.appendChild(graphInfo);
    liElement.appendChild(canvases[property]);
    ulElement.appendChild(liElement);
    overviewCanvas.width = liElement.getBoundingClientRect().width * 4 - 4 * PADDING_LEFT;
    overviewCanvas.height = liElement.getBoundingClientRect().height * 4;
    canvases[property].width = canvases[property].parentNode.getBoundingClientRect().width * 4
    canvases[property].height = canvases[property].parentNode.getBoundingClientRect().height * 4;
  });

  return canvases;
}

const updateValueReadout = (seekerData) => {
  Object.keys(seekerData).forEach(function (property) {
    let valueReadout = document.getElementById(property + 'valueReadout');
    valueReadout.innerText = (-seekerData[property] * 45).toFixed(5);
  });

}

const drawOverviewCanvas = () => {
  const canvasMaxX = overviewCanvas.width;
  const canvasMinX = 0
  overviewCanvasCtx.strokeStyle = '#ff0000';
  overviewCanvasCtx.lineWidth = 2;
  overviewCanvasCtx.beginPath();
  let propertyIndex = 0;
  const keys = Object.keys(overviewPoints);
  const overViewCanvasYChunkSize = (overviewCanvas.height - 
    (keys.length + 1) * OVERVIEW_ROW_HEIGHT) / (keys.length);
  let strokeS = 0;

  for (const key of keys) {
    overviewCanvasCtx.strokeStyle = '#ff00' + strokeS + '0';
    const overviewCanvasSliceMinY = overViewCanvasYChunkSize *
     propertyIndex + OVERVIEW_ROW_HEIGHT * (propertyIndex + 1) ;
    const overviewCanvasSliceMaxY = overViewCanvasYChunkSize *
     (propertyIndex + 1) + OVERVIEW_ROW_HEIGHT * (propertyIndex + 1) ;

    const overviewScaledData = overviewPoints[key].map(([x, y]) => [
      scaleValues(x,
                   minsAndMaxes['time']['min'],
                   minsAndMaxes['time']['max'],
                   canvasMinX,
                   canvasMaxX),
      scaleValues(y,
                   minsAndMaxes[key]['min'],
                   minsAndMaxes[key]['max'],
                   overviewCanvasSliceMinY,
                   overviewCanvasSliceMaxY)
    ]);
    overviewCanvasCtx.moveTo(...overviewScaledData[0]);
    overviewScaledData.slice(1).forEach((point) => {
       overviewCanvasCtx.lineTo(Math.floor(point[0]) + 0.5, Math.floor(point[1]) + 0.5);
    });
    propertyIndex += 1;

  };
  overviewCanvasCtx.stroke();
};


const drawOverviewCanvasRealtime = (data) => {
  const canvasMaxX = overviewCanvas.width;
  const canvasMinX = 0
  overviewCanvasCtx.strokeStyle = '#ff0000';
  overviewCanvasCtx.lineWidth = 2;
  overviewCanvasCtx.beginPath();
  let propertyIndex = 0;
  const keys = Object.keys(data);
  const overViewCanvasYChunkSize = (overviewCanvas.height -
    (keys.length + 1) * OVERVIEW_ROW_HEIGHT) / (keys.length);
  let strokeS = 0;

  overviewCanvasCtx.clearRect(0, 0, overviewCanvas.width, overviewCanvas.height);


  const overviewScaledData = {};
  
  const reducedData = {};

  

  for (const key of keys) {

    const sparseRatio = Math.max(1,Math.round(data[key].x.length/NUM_OVERVIEW_POINTS));
    reducedData[key] = {'x': [0],'y':[0]};
    for (let i = 0; i < data[key].x.length/sparseRatio; i++){
      reducedData[key].x[i] = data[key].x[i * sparseRatio];
      reducedData[key].y[i] = data[key].y[i * sparseRatio];
    };

    overviewCanvasCtx.strokeStyle = '#ff00' + strokeS + '0';
    const overviewCanvasSliceMinY = overViewCanvasYChunkSize *
      propertyIndex + OVERVIEW_ROW_HEIGHT * (propertyIndex + 1);
    const overviewCanvasSliceMaxY = overViewCanvasYChunkSize *
      (propertyIndex + 1) + OVERVIEW_ROW_HEIGHT * (propertyIndex + 1);

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
                                          overviewCanvasSliceMaxY) );
    for (let i = 0; i < xLength; i++){
      overviewCanvasCtx.lineTo(Math.floor(scaleValues(reducedData[key].x[i],
                                          0,
                                          reducedData[key].x[xLength - 1],
                                          canvasMinX,
                                          canvasMaxX)) + 0.5,

                                          overviewCanvas.height - Math.floor(scaleValues(reducedData[key].y[i],
                                          data[key].min,
                                          data[key].max,
                                          overviewCanvasSliceMinY,
                                          overviewCanvasSliceMaxY)) + 0.5);
    }

    propertyIndex += 1;

  };
  overviewCanvasCtx.stroke();
};

const updateCanvases = (startRatio, endRatio, seekerPositionRatio) => {


  let seekerToWindowRatio = 0;
  if (seekerPositionRatio > startRatio && seekerPositionRatio < endRatio){
    seekerToWindowRatio = (seekerPositionRatio - startRatio) / (endRatio - startRatio);
  }

    const data = DataManager.getRealtimeData();
    Object.keys(data).forEach((key) => {
      const canvas  = canvases[key];
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const canvasMaxX = canvas.width;
      const canvasMaxY = canvas.height - PADDING;
      const canvasMinX = 4 * PADDING_LEFT;
      const canvasMinY = PADDING;
      const start = Math.floor(data[key].x.length * startRatio);
      const end = Math.floor(data[key].x.length * endRatio);
    
    
      const seekerXPosition = seekerToWindowRatio * (canvasMaxX - canvasMinX) + PADDING_LEFT * 4;
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ff8484';
      ctx.beginPath();

      ctx.moveTo(scaleValues(data[key].x[start],
                  data[key].x[start],
                  data[key].x[end - 1],
                  canvasMinX,
                  canvasMaxX),
        
                  canvas.height - scaleValues(data[key].y[start],
                  data[key].min,
                  data[key].max,
                  canvasMinY,
                  canvasMaxY));


      for (let i = start; i < end; i++){
        ctx.lineTo(scaleValues(data[key].x[i],
                    data[key].x[start],
                    data[key].x[end-1],
                    canvasMinX,
                    canvasMaxX),
           
                    canvas.height - scaleValues(data[key].y[i],
                    data[key].min,
                    data[key].max,
                    canvasMinY,
                    canvasMaxY));
      }
      ctx.stroke();

      ctx.lineWidth = 5;
      ctx.strokeStyle = '#000000';
      if (seekerToWindowRatio != 0){
        ctx.beginPath();
        ctx.moveTo(seekerXPosition, canvasMaxY);
        ctx.lineTo(seekerXPosition, canvasMinY);
        ctx.stroke();
      }
    });
};

window.addEventListener('resize', () => { 
  Model.resizeCanvasToDisplaySize();
  Object.keys(canvases).forEach((property) => {
    canvases[property].width = canvases[property].parentNode.getBoundingClientRect().width * 4 
    canvases[property].height = canvases[property].parentNode.getBoundingClientRect().height * 4;
  });
  overviewCanvas.width = overviewCanvas.parentNode.getBoundingClientRect().width * 4 ;
  //drawOverviewCanvas();
  drawOverviewCanvasRealtime(DataManager.getRealtimeData());
  updateCanvases(startRatio, endRatio, seekerPositionRatio);
  Model.resizeCanvasToDisplaySize();
  Model.renderOnce();
  const overviewRect = overviewCanvas.getBoundingClientRect();
  const overviewWidth = overviewRect.right - overviewRect.left;
  overviewSeeker.style.left = seekerRatio * (overviewWidth-1);
});

const makeEdgePositioner = (elementToMove, originalY, originalZoom) => {
  return (event) => {
    event.preventDefault();
    event.stopPropagation();
    const overviewRect = overviewCanvas.getBoundingClientRect();
    let sliderRect = elementToMove.getBoundingClientRect();
    const zoomRatio = Slider.mouseYToZoomLevel(event.clientY, originalY, originalZoom);
    elementToMove.style.width = (zoomRatio * 100) + '%';
    const canvasWidth = overviewRect.right - overviewRect.left;
    const sliderWidth = sliderRect.right - sliderRect.left;
    const sliderMidX = sliderWidth / 2;
    const ratio = Math.min(
      1,
      Math.max(
        0,
        (event.clientX - sliderMidX - overviewRect.left) / (canvasWidth)
      )
    );
    elementToMove.style.left = Math.min(((canvasWidth - sliderWidth)/canvasWidth) * 100, ratio * 100) + '%';
    sliderRect = elementToMove.getBoundingClientRect();
    startRatio = Math.max(0, (sliderRect.left - overviewRect.left) / (overviewRect.right - overviewRect.left));
    endRatio = Math.min(1, 1 - (overviewRect.right - sliderRect.right) / (overviewRect.right - overviewRect.left));
    updateCanvases(startRatio, endRatio, seekerPositionRatio);
  }
}

const getDistance = ([x1, y1], [x2, y2]) => Math.sqrt(
  Math.pow(x1 - x2, 2) +
  Math.pow(y1 - y2, 2)
);

const getMidpoint = (element) => {
  const rect = element.getBoundingClientRect();
  return [
    (rect.left + rect.right) / 2,
    (rect.top + rect.bottom) / 2,
  ];
}

const getDistanceToElement = (inputPoint, element) => getDistance(
  inputPoint, 
  getMidpoint(element),
);

const getNearestElement = ([x, y], elements) => {
  let nearestElement;
  let nearestElementDistance = Infinity;

  for (let i = 0; i < elements.length; i ++) {
    const element = elements[i];
    const distance = getDistanceToElement([x, y], element);
    if (distance < nearestElementDistance) {
      nearestElementDistance = distance;
      nearestElement = element;
    }
  }
  return nearestElement;
}

overviewCanvas.addEventListener('mousedown', (event) => {
  const nearestEdge = getNearestElement(
    [event.clientX, event.clientY], 
    [overviewSliderStart]
  );
  let sliderWindowRect = overviewSliderStart.getBoundingClientRect();
  let overviewRect = overviewCanvas.getBoundingClientRect();
  let sliderWindowWidth = sliderWindowRect.right - sliderWindowRect.left;
  let overviewWidth = overviewRect.right - overviewRect.left;
  const originalMouseY = event.clientY;
  const originalZoomLevel = sliderWindowWidth / overviewWidth;
  const positionNearestEdge = makeEdgePositioner(overviewSliderStart, originalMouseY, originalZoomLevel);
  positionNearestEdge(event);
  Slider.makeDragHandler(positionNearestEdge);
});

setupButtons();
const data = DataManager.createFakeData(nonTimeProperties, NUM_FAKE_DATA_POINTS);
const timeArray = DataManager.getTimeArrayFromData(data);
const minsAndMaxes = DataManager.getDataMinsAndMaxes(data);
let overviewPoints = DataManager.convertToSparseData(data, NUM_OVERVIEW_POINTS);
Model.loadAllGeometry();
Model.resizeCanvasToDisplaySize();
const canvases = createCanvases(sensorConfig);
updateCanvases(0.1, 1, 0);

Realtime.startRealtimeGathering();

let requestId = undefined;
let oldTimestamp = 0;
const sensorMax = 2120;
const sensorMin = 1580;
const sensorRange = sensorMax-sensorMin;
const angleRange = Math.PI;
const angleToSensorRatio = angleRange/sensorRange;
let sensorAngle = 0;


const simulate = (timestamp) => {
    if (oldTimestamp == 0) oldTimestamp = timestamp;
    const delta = (timestamp - oldTimestamp) * seekerSpeed;
    const overviewWidth = getElementWidth(overviewCanvas);
    timePassedSincePlay += delta;
    timeIndex = Simulation.getClosestIndex((timePassedSincePlay  / 1000), timeArray) + pausedIndex;
    seekerPositionRatio = Math.min(0.99, timeIndex / timeArray.length);
    const seekerData = getDataUnderSeeker(timeIndex, DataManager.getRealtimeData());
    //const frontLeftSuspensionAngle = seekerData[nonTimeProperties[0]][1];
    //const frontRightSuspensionAngle = seekerData[nonTimeProperties[1]][1];
    //const bodySwayAngle = seekerData[nonTimeProperties[2]][1];
    seekerPosition = seekerPositionRatio * (overviewWidth - 1);
    overviewSeeker.style.left = seekerPosition; 
    //Model.animate(frontLeftSuspensionAngle, frontRightSuspensionAngle, xAngle, yAngle);
    updateCanvases(startRatio, endRatio, seekerPositionRatio);
    drawOverviewCanvasRealtime(DataManager.getRealtimeData());
    oldTimestamp = timestamp;
    requestId = requestAnimationFrame(simulate);
    updateValueReadout(seekerData);
}

const stopSimulation = () => {
  const seekerData = getDataUnderSeeker(0, data);
  const frontLeftSuspensionAngle = seekerData[nonTimeProperties[0]][1];
  const frontRightSuspensionAngle = seekerData[nonTimeProperties[1]][1];
  const bodySwayAngle = seekerData[nonTimeProperties[2]][1];
  cancelAnimationFrame(requestId);
  overviewSeeker.style.left = 0;
  Model.animate(frontLeftSuspensionAngle, frontRightSuspensionAngle, bodySwayAngle);
  overviewSeeker.style.left = 0;
  updateCanvases(startRatio, endRatio, seekerPositionRatio);
  pausedIndex = 0;
}

const pauseSimulation = () => {
  pausedIndex = timeIndex;
  cancelAnimationFrame(requestId);
}
















