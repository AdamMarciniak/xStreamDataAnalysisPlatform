

const canvas  = document.getElementById('graph');
const slider  = document.getElementById('slider');
const stack = document.getElementById('stack');


const ctx = canvas.getContext('2d');
const sliderCtx = slider.getContext('2d');
var inputSpaceX = 20;
const padding = 15;

const data = [];

for (let i=0; i<1000; i++){
  data.push([i, (Math.PI/7* Math.sin(i/50)) + Math.sin(i/5)/20]);
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

console.log(stack.offsetLeft);

onmousemove = function(e){
	if (e.clientX < canvasMaxX + canvas.offsetLeft && e.clientX > canvasMinX + canvas.offsetLeft && e.clientY < canvasMaxY + canvas.offsetTop && e.clientY > canvasMinY + canvas.offsetTop && mouseDown==1){
		
  console.log("mouse location:", e.clientX, e.clientY)
  
  const canvasX = e.clientX - canvas.offsetLeft;
  const canvasY = e.clientY - canvas.offsetTop;

	
	sliderCtx.clearRect(0, 0, canvas.width, canvas.height);
	sliderCtx.beginPath()
	sliderCtx.moveTo(canvasX ,canvasMinY );
	sliderCtx.lineTo(canvasX ,canvasMaxY );
	sliderCtx.stroke();
	

  var rect = canvas.getBoundingClientRect(), // abs. size of element
  scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
  scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  x = (canvasX - rect.left) * scaleX;
  y = (canvasY- rect.top) * scaleY;
	
  sliderCtx.font = "20px Arial";

  inputSpaceX = scaleToCanvas(x,canvasMinX - canvas.offsetLeft,canvasMaxX - canvas.offsetLeft,xMin,xMax);
  
  const outputSpaceY = scaleToCanvas(data[Math.round(inputSpaceX)][1],yMin,yMax,canvasMinY,canvasMaxY);


  sliderCtx.beginPath()
	sliderCtx.arc(canvasX, outputSpaceY, 5, 0, 2 * Math.PI);
  sliderCtx.fill();
	
	sliderCtx.fillText("Time: " + (inputSpaceX.toFixed(0)) + "\n" +"Angle: " +  Number(-data[Math.round(inputSpaceX)][1] * 180/Math.PI).toFixed(2)  + " deg", 20, 35);
	
	}
}







