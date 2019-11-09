import { scaleValues } from './Utils';

const templateContent = document.querySelector('#dataVisualizerTemplate').content;
const vislualizerListElement = document.querySelector('#sensorList');
const getValueReadoutElement = (dataVisualizer) => dataVisualizer.querySelector('h4');
const getTitleElement = (dataVisualizer) => dataVisualizer.querySelector('h3');
const getRenderingContext = (dataVisualizer) => dataVisualizer.querySelector('canvas').getContext('2d');
const getCanvas = (dataVisualizer) => dataVisualizer.querySelector('canvas');

const PADDING = 10;
const PADDING_LEFT = 40;

let listItemRect;
const dataVisualizers = {};

export const updateValueReadout = (property, value) => {
  const valueElement = getValueReadoutElement(dataVisualizers[property]);
  valueElement.innerText = value.toFixed(5);
};

export const scaleCanvases = () => {
  Object.keys(dataVisualizers).forEach((key) => {
    const canvas = getCanvas(dataVisualizers[key]);
    canvas.style.width = canvas.parentElement.getBoundingClientRect().width - PADDING_LEFT;
    canvas.style.height = canvas.parentElement.getBoundingClientRect().height;

    canvas.width = canvas.parentElement.getBoundingClientRect().width * 4;
    canvas.height = canvas.parentElement.getBoundingClientRect().height * 4;
  });
};

export const getCanvasStyleRect = () => {
  let canvas;
  Object.keys(dataVisualizers).forEach((key) => {
    canvas = getCanvas(dataVisualizers[key]);
  });
  return [canvas.style.width, canvas.style.height];
};

export const getCanvasRect = () => {
  let canvas;
  Object.keys(dataVisualizers).forEach((key) => {
    canvas = getCanvas(dataVisualizers[key]);
  });
  return [canvas.width, canvas.height];
};


const createDataVisualizer = (title) => {
  const visualizer = document.importNode(templateContent, true).children[0];
  getTitleElement(visualizer).innerText = title.toUpperCase();
  return visualizer;
};

export const createDataVisualizers = (config) => {
  Object.keys(config).forEach((property) => {
    const visualizer = createDataVisualizer(config[property].title);
    dataVisualizers[property] = visualizer;
    vislualizerListElement.appendChild(dataVisualizers[property]);
  });
  scaleCanvases();
};

export const getListItemRect = () => listItemRect;


export const updatedataVisualizers = (arrayStartRatio, arrayEndRatio, seekerRatio, data, dataLength) => {
  let seekerToWindowRatio = 0;
  if (seekerRatio > arrayStartRatio && seekerRatio < arrayEndRatio) {
    seekerToWindowRatio = (seekerRatio - arrayStartRatio) / (arrayEndRatio - arrayStartRatio);
  }
  Object.keys(dataVisualizers).forEach((key) => {
    const canvas = getCanvas(dataVisualizers[key]);
    const ctx = getRenderingContext(dataVisualizers[key]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const canvasMaxX = canvas.width;
    const canvasMaxY = canvas.height - PADDING;
    const canvasMinX = 0;
    const canvasMinY = PADDING;
    const start = Math.floor(dataLength * arrayStartRatio);
    const end = Math.floor(dataLength * arrayEndRatio);

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

    let interval = 1;
    if ((end - start) > 8000) {
      interval = 20;
    } else if ((end - start) > 4000) {
      interval = 10;
    } else if ((end - start) > 2000) {
      interval = 4;
    }

    for (let i = start; i < end; i += interval) {
      ctx.lineTo(scaleValues(data[key].x[i],
        data[key].x[start],
        data[key].x[end - 1],
        canvasMinX,
        canvasMaxX),

      canvas.height - scaleValues(data[key].y[i],
        data[key].min,
        data[key].max,
        canvasMinY,
        canvasMaxY));
    }
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d9d9d9';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    if (seekerToWindowRatio !== 0) {
      ctx.beginPath();
      ctx.moveTo(seekerXPosition, canvasMaxY);
      ctx.lineTo(seekerXPosition, canvasMinY);
      ctx.stroke();
    }
  });
};
