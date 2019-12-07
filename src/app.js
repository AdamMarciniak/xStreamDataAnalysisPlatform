import * as Slider from './modules/Slider';
import * as DataManager from './modules/DataManager';
import * as Model from './modules/Model';
import * as Simulation from './modules/Simulation';
import * as DataVisualizer from './modules/DataVisualizer';
import { scaleValues } from './modules/Utils';
import startRealtimeGathering from './modules/Realtime';
import * as MapController from './modules/MapController';
import LogRocket from 'logrocket';

const mapData = [{ x: -122.2547275, y: 45.632601 }, { x: -122.2546309, y: 45.6326197 }, { x: -122.254529, y: 45.632631 }, { x: -122.2544324, y: 45.6326685 }, { x: -122.2543198, y: 45.632721 }, { x: -122.2542447, y: 45.632766 }, { x: -122.254132, y: 45.6328335 }, { x: -122.2540569, y: 45.6329085 }, { x: -122.2539604, y: 45.6329948 }, { x: -122.2538692, y: 45.6330773 }, { x: -122.2538263, y: 45.6331486 }, { x: -122.2537673, y: 45.6332499 }, { x: -122.2537136, y: 45.6333437 }, { x: -122.2536707, y: 45.6334449 }, { x: -122.2536707, y: 45.63349 }, { x: -122.2537297, y: 45.6335312 }, { x: -122.2538155, y: 45.6335462 }, { x: -122.2539228, y: 45.63352 }, { x: -122.2540194, y: 45.6334787 }, { x: -122.2541374, y: 45.6334262 }, { x: -122.2542554, y: 45.6333437 }, { x: -122.2543198, y: 45.6332837 }, { x: -122.2544003, y: 45.6332649 }, { x: -122.2544754, y: 45.6332536 }, { x: -122.2545397, y: 45.6332799 }, { x: -122.2545451, y: 45.6333324 }, { x: -122.2545451, y: 45.6334112 }, { x: -122.2545558, y: 45.6334712 }, { x: -122.2545773, y: 45.633535 }, { x: -122.2545612, y: 45.6335987 }, { x: -122.254411, y: 45.6338726 }, { x: -122.2543466, y: 45.6340376 }, { x: -122.2542554, y: 45.6341914 }, { x: -122.2542393, y: 45.6342439 }, { x: -122.2542071, y: 45.6343227 }, { x: -122.254191, y: 45.6343827 }, { x: -122.2541749, y: 45.634454 }, { x: -122.2540891, y: 45.6345965 }, { x: -122.2540194, y: 45.6347353 }, { x: -122.2539872, y: 45.6348216 }, { x: -122.2539765, y: 45.6348853 }, { x: -122.2539604, y: 45.6349566 }, { x: -122.2539443, y: 45.6350354 }, { x: -122.2539282, y: 45.6351441 }, { x: -122.2539282, y: 45.6352379 }, { x: -122.2539604, y: 45.6353767 }, { x: -122.2539818, y: 45.6354667 }, { x: -122.2539979, y: 45.6355718 }, { x: -122.2540247, y: 45.635688 }, { x: -122.2541159, y: 45.635733 }, { x: -122.2542232, y: 45.6357743 }, { x: -122.2543305, y: 45.6357743 }, { x: -122.2543895, y: 45.6357743 }, { x: -122.254529, y: 45.6357818 }, { x: -122.2546685, y: 45.6357893 }, { x: -122.2547758, y: 45.6357893 }, { x: -122.2549635, y: 45.6357968 }, { x: -122.2550333, y: 45.6357968 }, { x: -122.2551191, y: 45.635748 }, { x: -122.2551191, y: 45.6356618 }, { x: -122.2551137, y: 45.6356018 }, { x: -122.2551137, y: 45.635523 }, { x: -122.2551137, y: 45.6354742 }, { x: -122.2551244, y: 45.6354142 }, { x: -122.2551298, y: 45.6353429 }, { x: -122.2551298, y: 45.6352717 }, { x: -122.255103, y: 45.6352754 }, { x: -122.2550654, y: 45.6351967 }, { x: -122.2550923, y: 45.6350766 }, { x: -122.2550601, y: 45.6350204 }, { x: -122.2550493, y: 45.6349941 }, { x: -122.2550333, y: 45.6349453 }, { x: -122.2550118, y: 45.6348816 }, { x: -122.2550064, y: 45.6348178 }, { x: -122.2550011, y: 45.6346603 }, { x: -122.2549957, y: 45.634619 }, { x: -122.2549796, y: 45.6344952 }, { x: -122.2549742, y: 45.6344615 }, { x: -122.2549742, y: 45.6343865 }, { x: -122.2549742, y: 45.6343377 }, { x: -122.2549474, y: 45.6342477 }, { x: -122.2549367, y: 45.6341952 }, { x: -122.2549367, y: 45.6341351 }, { x: -122.2549367, y: 45.6341126 }, { x: -122.254926, y: 45.6340339 }, { x: -122.2549099, y: 45.6340038 }, { x: -122.2548509, y: 45.6339813 }, { x: -122.254824, y: 45.6339963 }, { x: -122.2548187, y: 45.6339888 }, { x: -122.2547597, y: 45.6340526 }, { x: -122.2547114, y: 45.6340789 }, { x: -122.2546685, y: 45.6340864 }, { x: -122.254647, y: 45.6341164 }, { x: -122.2545987, y: 45.6340489 }, { x: -122.2545826, y: 45.6339663 }, { x: -122.254647, y: 45.6338951 }, { x: -122.2546631, y: 45.6338388 }, { x: -122.2547436, y: 45.6337413 }, { x: -122.2547597, y: 45.6337 }, { x: -122.2547704, y: 45.6336438 }, { x: -122.2547919, y: 45.6335725 }, { x: -122.2548079, y: 45.633535 }, { x: -122.254824, y: 45.633505 }, { x: -122.2548616, y: 45.6333324 }, { x: -122.2548723, y: 45.6332574 }, { x: -122.2548831, y: 45.6331861 }, { x: -122.2549635, y: 45.6330923 }, { x: -122.2550011, y: 45.6330773 }, { x: -122.2551566, y: 45.6331561 }, { x: -122.2551996, y: 45.6331749 }, { x: -122.2551996, y: 45.6332799 }, { x: -122.2551888, y: 45.6333324 }, { x: -122.2551888, y: 45.6333999 }, { x: -122.2551781, y: 45.6334712 }, { x: -122.2551727, y: 45.63355 }, { x: -122.2551727, y: 45.6336137 }, { x: -122.2551835, y: 45.6336813 }, { x: -122.2552049, y: 45.633745 }, { x: -122.2552264, y: 45.6338013 }, { x: -122.2553015, y: 45.6338463 }, { x: -122.2552961, y: 45.6339438 }, { x: -122.2553337, y: 45.6340264 }, { x: -122.2553819, y: 45.6341164 }, { x: -122.2554249, y: 45.6342327 }, { x: -122.255457, y: 45.6342927 }, { x: -122.2555482, y: 45.6344052 }, { x: -122.2555643, y: 45.6344352 }, { x: -122.2556394, y: 45.6344915 }, { x: -122.2557145, y: 45.6345778 }, { x: -122.255913, y: 45.634694 }, { x: -122.2559559, y: 45.6348066 }, { x: -122.255972, y: 45.6348516 }, { x: -122.2560042, y: 45.6349979 }, { x: -122.2560042, y: 45.6350466 }, { x: -122.2559935, y: 45.6351179 }, { x: -122.2559774, y: 45.6352192 }, { x: -122.2559667, y: 45.6353467 }, { x: -122.2559613, y: 45.6353992 }, { x: -122.2559667, y: 45.6354555 }, { x: -122.2559667, y: 45.6355117 }, { x: -122.2559613, y: 45.6355868 }, { x: -122.2559667, y: 45.6356768 }, { x: -122.2559935, y: 45.6357068 }, { x: -122.2560686, y: 45.6357405 }, { x: -122.2562778, y: 45.6357443 }, { x: -122.2562885, y: 45.6357424 }, { x: -122.2562993, y: 45.6357405 }, { x: -122.25631, y: 45.6356805 }, { x: -122.2563207, y: 45.6355718 }, { x: -122.2563314, y: 45.6354555 }, { x: -122.2563261, y: 45.6353692 }, { x: -122.2563154, y: 45.6352904 }, { x: -122.2562939, y: 45.6351591 }, { x: -122.2562778, y: 45.6350654 }, { x: -122.2562724, y: 45.6350054 }, { x: -122.2562939, y: 45.6349829 }, { x: -122.2563314, y: 45.6348628 }, { x: -122.256369, y: 45.6347916 }, { x: -122.2563851, y: 45.6347575 }, { x: -122.256428, y: 45.6346978 }, { x: -122.2565407, y: 45.6345778 }, { x: -122.2565567, y: 45.634544 }, { x: -122.2565943, y: 45.6344802 }, { x: -122.2566587, y: 45.6344052 }, { x: -122.2566801, y: 45.6343639 }, { x: -122.2566855, y: 45.6343302 }, { x: -122.2566855, y: 45.6343002 }, { x: -122.2566748, y: 45.6342552 }, { x: -122.2566694, y: 45.6342139 }, { x: -122.2566479, y: 45.6341726 }, { x: -122.2565997, y: 45.6340939 }, { x: -122.256546, y: 45.6340376 }, { x: -122.2564173, y: 45.6339663 }, { x: -122.2562993, y: 45.6339176 }, { x: -122.2562402, y: 45.6339026 }, { x: -122.2560042, y: 45.6338538 }, { x: -122.2559023, y: 45.6338651 }, { x: -122.2558272, y: 45.6338726 }, { x: -122.255677, y: 45.6338801 }, { x: -122.2555804, y: 45.6338801 }, { x: -122.2555482, y: 45.6338538 }, { x: -122.2555321, y: 45.6337788 }, { x: -122.2555268, y: 45.6337263 }, { x: -122.2555643, y: 45.6336663 }, { x: -122.2558379, y: 45.6332686 }, { x: -122.2558755, y: 45.6332011 }, { x: -122.2559237, y: 45.6331449 }, { x: -122.2559613, y: 45.6330886 }, { x: -122.2559988, y: 45.6330061 }, { x: -122.256031, y: 45.632931 }, { x: -122.2560793, y: 45.6327773 }, { x: -122.2561008, y: 45.6326722 }, { x: -122.2559828, y: 45.6325597 }, { x: -122.2559345, y: 45.6325147 }, { x: -122.2558486, y: 45.6323834 }, { x: -122.2558433, y: 45.6322146 }, { x: -122.2558862, y: 45.6321921 }, { x: -122.2559935, y: 45.6321696 }, { x: -122.256133, y: 45.6321321 }, { x: -122.2562349, y: 45.6320946 }, { x: -122.2562885, y: 45.6320308 }, { x: -122.2563207, y: 45.6319895 }, { x: -122.2562832, y: 45.6319708 }, { x: -122.2560954, y: 45.6319858 }, { x: -122.25609, y: 45.6319933 }, { x: -122.2560525, y: 45.632012 }, { x: -122.2560149, y: 45.6320308 }, { x: -122.2559291, y: 45.632057 }, { x: -122.2558379, y: 45.6320758 }, { x: -122.2557896, y: 45.6320758 }, { x: -122.2557467, y: 45.632072 }, { x: -122.2556877, y: 45.6320495 }, { x: -122.2556502, y: 45.6319895 }, { x: -122.255736, y: 45.631832 }, { x: -122.2557843, y: 45.6317907 }, { x: -122.2558218, y: 45.6317307 }, { x: -122.2558326, y: 45.6316744 }, { x: -122.2557467, y: 45.6316294 }, { x: -122.2556823, y: 45.6316257 }, { x: -122.2555214, y: 45.6316782 }, { x: -122.2554463, y: 45.6317607 }, { x: -122.2553712, y: 45.6317982 }, { x: -122.2552532, y: 45.6318732 }, { x: -122.2552156, y: 45.6319182 }, { x: -122.2550762, y: 45.6320608 }, { x: -122.255044, y: 45.6321058 }, { x: -122.2550011, y: 45.6321658 }, { x: -122.2549635, y: 45.6322483 }, { x: -122.2549528, y: 45.6323159 }, { x: -122.2549528, y: 45.6324171 }, { x: -122.2549528, y: 45.6324884 }, { x: -122.2549528, y: 45.6325484 }, { x: -122.2548991, y: 45.6325822 }, { x: -122.254824, y: 45.6326085 }, { x: -122.2548187, y: 45.6326085 }, { x: -122.2547275, y: 45.632601 }];

LogRocket.init('p3pydi/xstream');

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
let mapCount = 0;
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
  const frontLeftSuspensionAngle = DataManager.getLatestYValue(0);
  const frontRightSuspensionAngle = DataManager.getLatestYValue(1);
  seekerPosition = seekerPositionRatio * (overviewWidth - 1);
  seekerPosition = 0;
  overviewSeeker.style.left = seekerPosition;
 
  Model.animate(frontLeftSuspensionAngle, frontRightSuspensionAngle);

  seekerPositionRatio = 0;

  DataVisualizer.updatedataVisualizers(startRatio,
    endRatio,
    seekerPositionRatio,
    DataManager.getRealtimeData(),
    DataManager.getDataLength());

  //drawOverviewCanvasRealtime(DataManager.getRealtimeData());
  oldTimestamp = timestamp;

  if (i % 100 === 0) {
    mapCount += 1;
    if (mapCount === mapData.length - 1) {
      mapCount = 0;
    }
    MapController.addLineCoordinates(mapData[mapCount].x, mapData[mapCount].y);
    MapController.updateMapMarker(mapData[mapCount].x, mapData[mapCount].y);
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
  //drawOverviewCanvasRealtime(DataManager.getRealtimeData());
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

overviewCanvas.addEventListener('pointerdown', (event) => {
  document.querySelector('body').setAttribute('style', 'touch-action: none');
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
