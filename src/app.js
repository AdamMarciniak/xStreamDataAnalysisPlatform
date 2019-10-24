
import * as Slider from './modules/Slider.js';
import * as DataManager from './modules/DataManager.js';
import * as Model from './modules/Model.js';
import * as Simulation from './modules/Simulation.js';

const PADDING = 7;
const PADDING_LEFT = 40;
const NUM_OVERVIEW_POINTS = 2000;
const NUM_FAKE_DATA_POINTS = 5000;
const OVERVIEW_ROW_HEIGHT = 40;
let startRatio = 0;
let endRatio = 1;

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
  nonTimeProperties.forEach((property) => {
    dataUnderSeeker[property] = data[property][seekerIndex];
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
    pauseIndex = 0;
  });
};

const createCanvases = (nonTimeProperties) => {
  const canvases = {};
  nonTimeProperties.forEach((property) => {
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
    valueReadout.innerText = (-seekerData[property][1] * 45).toFixed(5);
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

const updateCanvases = (startRatio, endRatio, seekerPositionRatio) => {
  drawOverviewCanvas();


  let seekerToWindowRatio = 0;
  if (seekerPositionRatio > startRatio && seekerPositionRatio < endRatio){
    seekerToWindowRatio = (seekerPositionRatio - startRatio) / (endRatio - startRatio);
  }



  nonTimeProperties.forEach((property) => {
    const canvas  = canvases[property];
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const canvasMaxX = canvas.width;
    const canvasMaxY = canvas.height - PADDING;
    const canvasMinX = 4 * PADDING_LEFT;
    const canvasMinY = PADDING;
    const slicedData = [];
    const start = Math.floor(data[property].length * startRatio);
    const end = Math.floor(data[property].length * endRatio);

    for (let i = start; i < end; i++){
      slicedData[i-start] = data[property][i];
    }

    const scaledData = slicedData.map(([x, y]) => [
      scaleValues(x, slicedData[0][0], slicedData[slicedData.length - 1][0], canvasMinX, canvasMaxX),
      scaleValues(y, minsAndMaxes[property]['min'], minsAndMaxes[property]['max'], canvasMinY, canvasMaxY)
    ]);

    const seekerXPosition = seekerToWindowRatio * (canvasMaxX - canvasMinX) + PADDING_LEFT * 4;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ff8484';
    ctx.beginPath();
    ctx.moveTo(...scaledData[0]);
    scaledData.slice(1).forEach(point => ctx.lineTo(...point));
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
  drawOverviewCanvas();
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
const overviewPoints = DataManager.convertToSparseData(data, NUM_OVERVIEW_POINTS);
Model.loadAllGeometry();
Model.resizeCanvasToDisplaySize();
const canvases = createCanvases(nonTimeProperties);
updateCanvases(0.1, 1, 0);

let requestId = undefined;
let oldTimestamp = 0;
const simulate = (timestamp) => {
    if (oldTimestamp == 0) oldTimestamp = timestamp;
    const delta = (timestamp - oldTimestamp) * seekerSpeed;
    const overviewWidth = getElementWidth(overviewCanvas);
    timePassedSincePlay += delta;
    console.log(timePassedSincePlay);
    timeIndex = Simulation.getClosestIndex((timePassedSincePlay  / 1000), timeArray) + pausedIndex;
    seekerPositionRatio = Math.min(0.99, timeIndex / timeArray.length);
    console.log(timeArray[timeIndex]);
    const seekerData = getDataUnderSeeker(timeIndex, data);
    const frontLeftSuspensionAngle = seekerData[nonTimeProperties[0]][1];
    const frontRightSuspensionAngle = seekerData[nonTimeProperties[1]][1];
    const bodySwayAngle = seekerData[nonTimeProperties[2]][1];
    seekerPosition = seekerPositionRatio * (overviewWidth - 1);
    overviewSeeker.style.left = seekerPosition; 
    Model.animate(frontLeftSuspensionAngle, frontRightSuspensionAngle, bodySwayAngle);
    updateCanvases(startRatio, endRatio, seekerPositionRatio);
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












