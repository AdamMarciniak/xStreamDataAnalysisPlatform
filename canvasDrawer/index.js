const canvas = document.querySelector("canvas");
const resultsButton = document.querySelector("button");
const outputBox = document.querySelector("div");

console.log(canvas);

const maxYRange = 100;
const minYRange = 0;
const maxXRange = 10;
const minXRange = 0;

const scaleData = (input, minIn, maxIn, minOut, maxOut) => {
  const ratio = (input - minIn) / (maxIn - minIn);
  return ratio * (maxOut - minOut) + minOut;
};

const convertAllData = data => {
  const convertedData = [];
  Object.keys(data).forEach(xVal => {
    const scaledX = scaleData(xVal, 0, canvas.width, minXRange, maxXRange);
    const scaledY = scaleData(
      data[xVal],
      canvas.height,
      0,
      minYRange,
      maxYRange
    );
    convertedData.push([scaledX, scaledY]);
  });

  let textOut = "";

  convertedData.forEach(point => {
    textOut += "\n" + [point[0].toFixed(2), point[1].toFixed(2)];
  });

  outputBox.innerText = textOut;
};

canvas.style.width = canvas.width;
canvas.style.height = canvas.height;

ctx = canvas.getContext("2d");
ctx.strokeStyle = "#FF0000";

const data = {};

let canvasRect = canvas.getBoundingClientRect();
let drawing = false;
document.addEventListener("resize", () => {
  canvasRect = canvas.getBoundingClientRect();
});

let mouseDown = 0;
const downListener = () => {
  mouseDown = 1;
  document.addEventListener("mousemove", moveListener);
  document.addEventListener("mouseup", upListener);
};

let point1x = 0;
let point2x = 0;
let point1y = 0;
let point2y = 0;

let firstFlag = true;

const moveListener = event => {
  const canvasLeft = canvasRect.left;
  const canvasTop = canvasRect.top;
  const canvasWidth = canvasRect.width;
  const canvasHeight = canvasRect.height;
  const xPos = event.clientX;
  const yPos = event.clientY;

  if (mouseDown && xPos > canvasLeft && xPos < canvasLeft + canvasWidth) {
    drawing = true;
    const canvasXPoint = xPos - canvasLeft;
    let canvasYPoint = yPos - canvasTop;

    if (canvasYPoint > canvas.height - 3.5) {
      canvasYPoint = canvas.height;
    }

    if (canvasYPoint < 0) {
      canvasYPoint = 0;
    }

    data[canvasXPoint] = canvasYPoint;

    if (firstFlag === true) {
      point1y = canvasYPoint;
      point1x = canvasXPoint;
      firstFlag = false;
    }

    point2x = canvasXPoint;
    point2y = canvasYPoint;

    const slope = (point1y - point2y) / (point1x - point2x);

    if (point2x - point1x < 1) {
      for (let i = 1; i < Math.abs(point2x - point1x); i += 1) {
        data[canvasXPoint + i] = i * slope + point2y;
      }
    }

    if (point2x - point1x > 1) {
      for (let i = 1; i < Math.abs(point2x - point1x); i += 1) {
        data[canvasXPoint - i] = -i * slope + point2y;
      }
    }

    point1y = canvasYPoint;
    point1x = canvasXPoint;
  }
};

const upListener = () => {
  mouseDown = 0;
  drawing = false;
  document.removeEventListener("mousemove", moveListener);
  document.removeEventListener("mouseup", upListener);
};

document.addEventListener("mousedown", downListener);

const render = () => {
  if (drawing) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    Object.keys(data).forEach(xVal => {
      if (xVal >= 0) {
        ctx.lineTo(xVal, data[xVal]);
      }
    });
    ctx.stroke();
  }

  requestAnimationFrame(render);
};
render();

resultsButton.addEventListener("click", () => {
  outputBox.value = null;
  convertAllData(data);
});
