

const canvas  = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const padding = 15;

const data = [];

for (let i=0; i<1000; i++){
  data.push([i, 24 - (37.6 * Math.sin(i/100))]);
}

const canvasMaxX = canvas.width - padding;
const canvasMaxY = canvas.height - padding;
const canvasMinX = padding;
const canvasMinY = padding;

function scaleToCanvas(input,inMin,inMax,outMin,outMax){

  const zeroToOne = (input - inMin) / (inMax - inMin);
  output = outMin + zeroToOne*(outMax - outMin);

  return output;
}

const dataXs = data.map(([x, y]) => x);
const dataYs = data.map(([x, y]) => y);

const xMin = Math.min(...dataXs);
const xMax = Math.max(...dataXs);
const yMin = Math.min(...dataYs);
const yMax = Math.max(...dataYs);


const scaledData = data.map(([x, y]) => [
  scaleToCanvas(x, xMin, xMax, canvasMinX, canvasMaxX),
  scaleToCanvas(y, yMin, yMax, canvasMinY, canvasMaxY)
]);



ctx.beginPath()
ctx.moveTo(...scaledData[0])
scaledData.slice(1).forEach(point => ctx.lineTo(...point));
ctx.stroke();





