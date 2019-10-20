import * as THREE from 'three';
import { OrbitControls } from './modules/OrbitControls.js';
import { STLLoader } from './modules/STLLoader.js';
import FourBar from './modules/vectorFourBar.js'



const PADDING = 7;
const PADDING_LEFT = 40;
const NUM_OVERVIEW_POINTS = 500;
const SAMPLE_PERIOD_SECONDS = 0.01;
const NUM_FAKE_DATA_POINTS = 10000;
const OVERVIEW_ROW_HEIGHT = 40;
let startRatio = 0;
let endRatio = 1;

const nonTimeProperties = ['Right Arm Angle', 'Left Arm Angle', 'Body Sway'];

const stackElement = document.getElementById('stack');
const ulElement = document.createElement('ul');
stackElement.appendChild(ulElement);
const sliderCanvas = document.createElement('canvas');
sliderCanvas.setAttribute('id','sliderCanvas');
const sliderCtx = sliderCanvas.getContext('2d');
const overviewCanvas = document.getElementById('graphOverview');
const overviewCanvasCtx = overviewCanvas.getContext('2d');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const speedButton = document.getElementById('speedButton');
const overviewSliderStart = document.getElementById('overviewSliderStart');
const overviewSliderEnd = document.getElementById('overviewSliderEnd');
const overviewSeeker = document.getElementById('overviewSeeker');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 7000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('modelCanvas'), antialias: true });

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}



const getElementWidth = (element) => {
  const elementRect = element.getBoundingClientRect();
  return elementRect.right - elementRect.left;
}

let overviewWidthOld = getElementWidth(overviewCanvas);

let playRequest;
let seekerSpeed = 1;
let animateState = 0;


const getDataUnderSeeker = () => {
  const dataUnderSeeker = {};
  nonTimeProperties.forEach((property) => {
    
    const seekIndex = Math.floor(allPropertyPoints[property].length * seekerRatio);
    dataUnderSeeker[property] = allPropertyPoints[property][seekIndex];
  });
  return dataUnderSeeker;
}

let leftAngle = 0;
let rightAngle = 0;
let seekIndex = 0;
let bodySway = 0;


let seekerPosition = 0;
let seekerRatio = 0;
const animateSeeker = () => {
  seekerPosition += seekerSpeed * 0.1;
  const overviewWidth = getElementWidth(overviewCanvas);
  seekerRatio = Math.min(1,seekerPosition / overviewWidthOld);
  if (seekerRatio < .997) {
    overviewSeeker.style.left = seekerRatio * overviewWidth;

    const seekerData = getDataUnderSeeker();
    updateValueReadout(seekerData);
    leftAngle = seekerData[nonTimeProperties[0]][1];
    rightAngle = seekerData[nonTimeProperties[1]][1];
    bodySway = seekerData[nonTimeProperties[2]][1];



  }
  else {
    cancelAnimationFrame(playRequest);
  }
};


const performAnimation = () => {
  playRequest = requestAnimationFrame(performAnimation)
  animateSeeker();
}

const scaleValues = (input, inMin, inMax, outMin, outMax) => {
  return outMin + ((input - inMin) / (inMax - inMin)) * (outMax - outMin);
};

const setupButtons = () => {
  let playState = 0;
  const speedOptions = [1, 2, 4, 10];
  let speedState = 0;
  seekerSpeed = speedOptions[speedState];
  pauseButton.addEventListener('click', function () {
    if (playState == 1) {
      pauseButton.className = 'activeButton';
      playButton.classList.remove('activeButton');
      playState = 0;
      cancelAnimationFrame(playRequest) 

    }
  });
  speedButton.addEventListener('click', function () {
    if (speedState < speedOptions.length - 1) {
      speedState += 1;
      seekerSpeed = speedOptions[speedState];
      speedButton.innerText = seekerSpeed + ' X';
    }
    else {
      speedState = 0;
      let speed = speedOptions[speedState];
      speedButton.innerText = seekerSpeed + ' X';
    }
  });
  playButton.addEventListener('click', function () {
    if (playState == 0) {
      playButton.className = 'activeButton';
      playState = 1;
      pauseButton.classList.remove('activeButton');
      animateState = 1;
      requestAnimationFrame(performAnimation)

    }
  });
  stopButton.addEventListener('click', function () {
    animateState = 0;
    pauseButton.classList.remove('activeButton');
    playButton.classList.remove('activeButton');
    playState = 0;
    cancelAnimationFrame(playRequest) 
    seekerPosition = 0;
    overviewSeeker.style.left = seekerPosition

  });
};



const createFakeRawData = (nonTimeProperties,numDataPoints) => {
  const timeArray = [];
  const allRawData = {};
  let rawData = {};
  let k = 1;
  const createFakeData = nonTimeProperties.forEach((property) => {
    k += 10;
    let time = [];
    let yValues = [];
    for (let i = 0; i < numDataPoints; i++){
      timeArray[i] = ((SAMPLE_PERIOD_SECONDS * i));
      yValues[i] = (0.5 * Math.sin(i / 100 - Math.PI/2 * k)  ); 
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
  for (const key of keys){
    allPropertyPoints[key] = [];
    for (let i = 0; i < allRawData['yValues'][key].length; i++){
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
      for(let i = 0; i < allPropertyPoints[key].length; i++){
        yValues.push(allPropertyPoints[key][i][1]);
        xValues.push(allPropertyPoints[key][i][0]);
      }
    minsAndMaxes[key] = { 'min': getMin(yValues), 'max': getMax(yValues)};
    minsAndMaxes['time'] = { 'min': getMin(xValues), 'max': getMax(xValues)};
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
      for (let i = 0; i < allPropertyPoints[key].length / (includeEveryNth ); i ++){
        
        reducedPoints[key][i] = allPropertyPoints[key][i * includeEveryNth];
      }
    }
    else {
      reducedPoints[key] = allPropertyPoints[key];
    }
  }
  return reducedPoints;
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
    valueReadout.innerText = "y: " + seekerData[property][1].toFixed(2);
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

const updateCanvases = (startRatio,endRatio) => {
  drawOverviewCanvas();
  nonTimeProperties.forEach((property) => {

    const canvas  = canvases[property];
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const canvasMaxX = canvas.width;
    const canvasMaxY = canvas.height - PADDING;
    const canvasMinX = 4 * PADDING_LEFT;
    const canvasMinY = PADDING;

    const slicedData = [];

    const start = Math.floor(allPropertyPoints[property].length * startRatio);
    const end = Math.floor(allPropertyPoints[property].length * endRatio);

    
    for (let i = start; i < end; i++){
      slicedData[i-start] = allPropertyPoints[property][i];
    }

    const scaledData = slicedData.map(([x, y]) => [
      scaleValues(x, slicedData[0][0], slicedData[slicedData.length - 1][0], canvasMinX, canvasMaxX),
      scaleValues(y, minsAndMaxes[property]['min'], minsAndMaxes[property]['max'], canvasMinY, canvasMaxY)
    ]);

   
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ff8484';
    ctx.beginPath();
    ctx.moveTo(...scaledData[0]);
    scaledData.slice(1).forEach(point => ctx.lineTo(...point));
    ctx.stroke();
   
    let topTickPositionY = canvasMinY + PADDING;
    let middleTickPositionY = (canvasMaxY + canvasMinY) / 2 + PADDING / 2;
    let bottomTickPositionY = canvasMaxY;

    let topTickValue = minsAndMaxes[property]['max'].toFixed(1);
    let middleTickValue = ((minsAndMaxes[property]['max'] + minsAndMaxes[property]['min']) / 2).toFixed(1);
    let bottomTickValue = minsAndMaxes[property]['min'].toFixed(1);

    ctx.beginPath();
    ctx.fillStyle = '#858585';
    ctx.font = '35px Roboto'
    ctx.textAlign = 'right';
    ctx.fillText(topTickValue,4* PADDING_LEFT - 10, topTickPositionY);
    ctx.fillText(middleTickValue, 4*PADDING_LEFT - 10, middleTickPositionY);
    ctx.fillText(bottomTickValue, 4*PADDING_LEFT - 10, bottomTickPositionY);
  });
};

window.addEventListener('resize', () => { 
  Object.keys(canvases).forEach((property) => {
    canvases[property].width = canvases[property].parentNode.getBoundingClientRect().width * 4 
    canvases[property].height = canvases[property].parentNode.getBoundingClientRect().height * 4;
  });
  overviewCanvas.width = overviewCanvas.parentNode.getBoundingClientRect().width * 4 ;
  drawOverviewCanvas();
  updateCanvases(startRatio, endRatio);

  const overviewRect = overviewCanvas.getBoundingClientRect();
  const overviewWidth = overviewRect.right - overviewRect.left;
  overviewSeeker.style.left = seekerRatio * (overviewWidth-1);
});

const mouseYToZoomLevel = (newY, originalY, originalZoom) => {

  const yDistance = originalY - newY;
  const zoomRatio = 0.002;
  let zoomLevel = originalZoom + (yDistance * zoomRatio) ;
  

  zoomLevel = Math.min(1,Math.max(0.02,zoomLevel));

  return zoomLevel;
};


const makeEdgePositioner = (elementToMove, originalY, originalZoom) => {
  return (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = overviewCanvas.getBoundingClientRect();
    
    const zoomRatio = mouseYToZoomLevel(event.clientY, originalY, originalZoom);
    elementToMove.style.width = (zoomRatio * 100) + '%';

    const leftSideOfCanvas = rect.left;
    const rightSideOfCanvas = rect.right;
    const canvasWidth = rightSideOfCanvas - leftSideOfCanvas;
    const sliderRect = elementToMove.getBoundingClientRect();
    const sliderWidth = sliderRect.right - sliderRect.left;
    const sliderMidX = sliderWidth / 2;
    const ratio = Math.min(
      1,
      Math.max(
        0,
        (event.clientX - sliderMidX  - leftSideOfCanvas) / (canvasWidth)
      )
    );
    const leftMove = Math.min(((canvasWidth - sliderWidth)/canvasWidth) * 100, ratio * 100) + '%';

    elementToMove.style.left = leftMove;
    const newSliderRect = elementToMove.getBoundingClientRect();

    startRatio = Math.max(0, (newSliderRect.left - rect.left) / (rect.right - rect.left));
    endRatio = Math.min(1, 1 - (rect.right - newSliderRect.right) / (rect.right - rect.left));
    updateCanvases(startRatio, endRatio);

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


const makeDragHandler = (onMouseMove) => {
  const removeWindowListeners = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', removeWindowListeners);


  }
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', removeWindowListeners);
}

overviewCanvas.addEventListener('mousedown', (event) => {
  console.log('down');

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
  makeDragHandler(positionNearestEdge);
});

let overviewMouseX = 0;


setupButtons();
const allRawData = createFakeRawData(nonTimeProperties, NUM_FAKE_DATA_POINTS);
const allPropertyPoints = convertDataToPointPairs(allRawData);
const minsAndMaxes = getDataMinsAndMaxes(allPropertyPoints);
const overviewPoints = convertToSparseData(allPropertyPoints, NUM_OVERVIEW_POINTS);
const canvases = createCanvases(nonTimeProperties);
updateCanvases(0.1, 1);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
scene.background = new THREE.Color(0xE5E5E5);

const four = new FourBar;
let outputRight;
let couplerRight;
let outputLeft;
let couplerLeft;

const link1 = 223.9;
const link2 = 419.1;
const link3 = 168.37;
const link4 = 619.71;

const scale = 1;

const material = new THREE.MeshPhongMaterial({ color: 0x606060 });

var light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 1, 1).normalize();
scene.add(light);

const masterGroup = new THREE.Group();
const suspensionGroupLeft = new THREE.Group();
const suspensionGroupRight = new THREE.Group();
const armTopKnuckleGroupLeft = new THREE.Group();
const armTopKnuckleGroupRight = new THREE.Group();
const knuckleWheelGroupLeft = new THREE.Group();
const knuckleWheelGroupRight = new THREE.Group();
const topArmRight = new THREE.Mesh();
const topArmLeft = new THREE.Mesh();
const botArmRight = new THREE.Mesh();
const botArmLeft = new THREE.Mesh();
const knuckleRight = new THREE.Mesh();
const knuckleLeft = new THREE.Mesh();
const wheelRight = new THREE.Mesh();
const wheelLeft = new THREE.Mesh();

let frame = new THREE.Mesh();
let loader = new STLLoader();

loader.load('/stl/topArm.stl', function (geometry) {
  topArmLeft.geometry = geometry;
  topArmLeft.material = material;
  topArmLeft.scale.set(scale, scale, scale);
  topArmRight.geometry = geometry;
  topArmRight.material = material;
  topArmRight.scale.set(scale, scale, scale);
});


loader.load('/stl/BottomArm.stl', function (geometry) {
  botArmLeft.geometry = geometry;
  botArmLeft.material = material;
  botArmLeft.scale.set(scale, scale, scale);
  botArmRight.geometry = geometry;
  botArmRight.material = material;
  botArmRight.scale.set(scale, scale, scale);
});

loader.load('/stl/wheel.stl', function (geometry) {
  wheelLeft.geometry = geometry;
  wheelLeft.material = material;
  wheelLeft.scale.set(5.5, 5.5, 4.25);
  wheelRight.geometry = geometry;
  wheelRight.material = material;
  wheelRight.scale.set(5.5, 5.5, 4.25);
});

loader.load('/stl/knuckle.stl', function (geometry) {
  knuckleLeft.geometry = geometry;
  knuckleLeft.material = material;
  knuckleLeft.scale.set(scale, scale, scale);
  knuckleRight.geometry = geometry;
  knuckleRight.material = material;
  knuckleRight.scale.set(scale, scale, scale);
});

loader.load('/stl/Frame.stl', function (geometry) {
  frame.geometry = geometry;
  frame.material = material;
  frame.scale.set(scale, scale, scale);
});

knuckleWheelGroupRight.add(knuckleRight);
knuckleWheelGroupLeft.add(knuckleLeft);

knuckleWheelGroupRight.add(wheelRight);
knuckleWheelGroupLeft.add(wheelLeft);

wheelRight.rotateZ(Math.PI / 2);
wheelLeft.rotateZ(Math.PI / 2);

wheelRight.position.set(-220, -95, 0);
wheelLeft.position.set(-220, -95, 0);

wheelLeft.rotateX(Math.PI / 2);
wheelRight.rotateX(Math.PI / 2);

botArmRight.position.set(0, -158.66, -157.99);
botArmLeft.position.set(0, -158.66, -157.99);

knuckleWheelGroupRight.position.set(0, 0, 419.09);
knuckleWheelGroupLeft.position.set(0, 0, 419.09);

knuckleWheelGroupRight.rotation.y = 3.14159 / 2;
knuckleWheelGroupLeft.rotation.y = 3.14159 / 2;

frame.position.set(-559, -65, -187);
frame.rotation.y = Math.PI / 2;
frame.rotateX(+0.2);

armTopKnuckleGroupLeft.add(topArmLeft);
armTopKnuckleGroupRight.add(topArmRight);

armTopKnuckleGroupLeft.add(knuckleWheelGroupLeft)
armTopKnuckleGroupRight.add(knuckleWheelGroupRight)

suspensionGroupRight.add(armTopKnuckleGroupRight);
suspensionGroupLeft.add(armTopKnuckleGroupLeft);

suspensionGroupRight.add(botArmRight);
suspensionGroupLeft.add(botArmLeft);

suspensionGroupLeft.position.set(0, 0, -370);
suspensionGroupLeft.rotateY(Math.PI);

masterGroup.add(frame);
masterGroup.add(suspensionGroupRight);
masterGroup.add(suspensionGroupLeft);

scene.add(masterGroup);
masterGroup.position.set(800, 0, 0);

camera.position.set(1700, 1000, 1200);
controls.update();

masterGroup.rotation.z = 0.2;

resizeCanvasToDisplaySize
controls.update();
renderer.render(scene, camera);


function animateModel()  {

  requestAnimationFrame(animateModel);

  resizeCanvasToDisplaySize();
  
  //console.log(-data[Math.round(inputSpaceX)][1].toFixed(2));
  //masterGroup.rotation.z = bodySway * 0.01;
  masterGroup.rotation.x = -bodySway * 0.1;
  armTopKnuckleGroupLeft.rotation.x = leftAngle;
  armTopKnuckleGroupRight.rotation.x = rightAngle;


  
  let angleLeft = ((armTopKnuckleGroupLeft.rotation.x + 3.14159 / 2) + 45 * 3.14159 / 180);
  let outputLeft = four.outputAngle(link2, link3, link4, link1, angleLeft);
  let couplerLeft = four.couplerAngle(link2, link3, link4, link1, angleLeft);

  let angleRight = ((armTopKnuckleGroupRight.rotation.x + 3.14159 / 2) + 45 * 3.14159 / 180);
  let outputRight = four.outputAngle(link2, link3, link4, link1, angleRight);
  let couplerRight = four.couplerAngle(link2, link3, link4, link1, angleRight);

  botArmLeft.rotation.x = outputLeft.open - 3.14159 / 2 - 45 * 3.14159 / 180;
  knuckleWheelGroupLeft.rotation.x = -couplerLeft.open + 50 * 3.14159 / 180 - armTopKnuckleGroupLeft.rotation.x;
  //knuckleWheelGroupLeft.rotation.y = 0.4 * Math.sin(i) + Math.PI / 2;

  botArmRight.rotation.x = outputRight.open - 3.14159 / 2 - 45 * 3.14159 / 180;
  knuckleWheelGroupRight.rotation.x = -couplerRight.open + 50 * 3.14159 / 180 - armTopKnuckleGroupRight.rotation.x;
  //knuckleWheelGroupRight.rotation.y = 0.4 * Math.sin(i) + Math.PI / 2;

  wheelLeft.rotation.x = -3 * seekIndex;
  wheelRight.rotation.x = +3 * seekIndex;

  controls.update();
  renderer.render(scene, camera);

}

animateModel();








