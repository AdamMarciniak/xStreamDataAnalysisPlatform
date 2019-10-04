

const canvas  = document.getElementById('graph');
const slider  = document.getElementById('slider');


const ctx = canvas.getContext('2d');
const sliderCtx = slider.getContext('2d');

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

sliderCtx.beginPath()
sliderCtx.moveTo(canvasMaxX/2,canvasMinY);
sliderCtx.lineTo(canvasMaxX/2,canvasMaxY);
sliderCtx.stroke();


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

let mouseDown = 0;
document.body.onmousedown = function() { 
  ++mouseDown;
}
document.body.onmouseup = function() {
  --mouseDown;
}

console.log(data);

onmousemove = function(e){
	if (e.clientX < canvasMaxX && e.clientX > canvasMinX && e.clientY < canvasMaxY && e.clientY > canvasMinY && mouseDown==1){
		
	console.log("mouse location:", e.clientX, e.clientY)
	
	sliderCtx.clearRect(0, 0, canvas.width, canvas.height);
	sliderCtx.beginPath()
	sliderCtx.moveTo(e.clientX,canvasMinY);
	sliderCtx.lineTo(e.clientX,canvasMaxY);
	sliderCtx.stroke();
	

  var rect = canvas.getBoundingClientRect(), // abs. size of element
  scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
  scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  x = (e.clientX - rect.left) * scaleX;
  y = (e.clientY- rect.top) * scaleY;
	
  sliderCtx.font = "30px Arial";

  const inputSpaceX = scaleToCanvas(x,canvasMinX,canvasMaxX,xMin,xMax);
  
  const outputSpaceY = scaleToCanvas(data[Math.round(inputSpaceX)][1],yMin,yMax,canvasMinY,canvasMaxY);


  sliderCtx.beginPath()
	sliderCtx.arc(e.clientX, outputSpaceY, 5, 0, 2 * Math.PI);
  sliderCtx.fill();
	
	sliderCtx.fillText("X Val: " + (inputSpaceX.toFixed(0)) + "\n" +"Y Val: " +  Number(-data[Math.round(inputSpaceX)][1]).toFixed(2), e.clientX, 90);
	
	}
}







