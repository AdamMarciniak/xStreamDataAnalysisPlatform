

const stackElement = document.getElementById('stack');
const ulElement = document.createElement("UL");
stackElement.appendChild(ulElement);
const sliderCanvas = document.createElement('canvas');
sliderCanvas.setAttribute('id','sliderCanvas');
const sliderCtx = sliderCanvas.getContext('2d');

const rawDataTotal = {}
const nonTimeProperties = ['velocity','acceleration','right Arm Angle','left Arm Angle','rear Stress','front Stress','1','2','4','5','6','hello','laura','data']

const timeArray = [];
let k = 1;
nonTimeProperties.forEach((property) => {
  k+=10;
  let rawData = [];
  for (let i = 0; i < 1000; i++){
    rawData.push([(2*i*Math.sin(i/k))]);
  };
  rawDataTotal[property] = rawData
});


for (let i = 0; i < 1000; i++){
  timeArray.push(i);
};

console.log(rawDataTotal);


const canvases = {};
nonTimeProperties.forEach((property) => {
  let liElement = document.createElement("LI");
  const newCanvas = document.createElement("canvas");
  const graphInfo = document.createElement("div");
  const graphTitle = document.createElement("h3");
  const valueReadout = document.createElement("h4");
  valueReadout.setAttribute('class','valueReadout')
  valueReadout.setAttribute('id', property + 'valueReadout')
  graphInfo.setAttribute('class', 'graphInfo');
  newCanvas.setAttribute("id", property);
  
  graphTitle.innerText = property.toUpperCase();
  valueReadout.innerText = "16733134.31";
  
  canvases[property] = newCanvas;
  
  graphInfo.appendChild(graphTitle);
  graphInfo.appendChild(valueReadout);

  liElement.appendChild(graphInfo);
  liElement.appendChild(canvases[property]);
  ulElement.appendChild(liElement);
  console.log(liElement.getBoundingClientRect().width);
  newCanvas.width = liElement.getBoundingClientRect().width;
  newCanvas.height = liElement.getBoundingClientRect().height ;
  sliderCanvas.width = liElement.getBoundingClientRect().width;
  sliderCanvas.height = ulElement.getBoundingClientRect().height;

});

//ulElement.appendChild(sliderCanvas);



const padding = 7;
const paddingLeft = 40;

const updateCanvases = () =>

{



  nonTimeProperties.forEach((property) => {

    const canvas  = canvases[property];
    const ctx = canvas.getContext("2d");


    const canvasMaxX = canvas.width ;
    const canvasMaxY = canvas.height - padding;
    const canvasMinX = 40;
    const canvasMinY = padding;

    scaleToCanvas = (input,inMin,inMax,outMin,outMax) => {
      const zeroToOne = (input - inMin) / (inMax - inMin);
      output = outMin + zeroToOne*(outMax - outMin);
      return output;
    };

    const dataYs = rawDataTotal[property];
    const dataXs = timeArray;

    const xMin = Math.min(...dataXs);
    const xMax = Math.max(...dataXs);
    const yMin = Math.min(...dataYs);
    const yMax = Math.max(...dataYs);


    const joinedData =[];
    for(let i=0;i<rawDataTotal[property].length;i++){
      joinedData.push([timeArray[i],rawDataTotal[property][i]]);
    }

    const scaledData = joinedData.map(([x, y]) => [
      scaleToCanvas(x, xMin, xMax, canvasMinX, canvasMaxX),
      scaleToCanvas(y, yMin, yMax, canvasMinY, canvasMaxY)
    ]);

    ctx.strokeStyle = "#FF8484";
    ctx.beginPath();
    ctx.moveTo(...scaledData[0]);
    scaledData.slice(1).forEach(point => ctx.lineTo(...point));
    
    ctx.stroke();
    ctx.beginPath();

  
    ctx.fillStyle = '#858585';
    let topTickPositionY = canvasMinY + padding;
    let middleTickPositionY = (canvasMaxY + canvasMinY) / 2 + padding / 2;
    let bottomTickPositionY = canvasMaxY;

    let topTickValue = yMax.toFixed(1);
    let middleTickValue = ((yMax + yMin) / 2).toFixed(1);
    let bottomTickValue = yMin.toFixed(1);
    
    if (middleTickValue == -0.0){
      middleTickValue = +0;
    }

    console.log(middleTickValue);

    ctx.textAlign = 'right';
    ctx.fillText(topTickValue, paddingLeft - 10, topTickPositionY);
    ctx.fillText(middleTickValue, paddingLeft - 10, middleTickPositionY);
    ctx.fillText(bottomTickValue, paddingLeft - 10, bottomTickPositionY);
    
  });
};

updateCanvases();

window.addEventListener('resize', () => { 

  console.log(canvases);

  Object.keys(canvases).forEach((property) => {
    canvases[property].width = canvases[property].parentNode.getBoundingClientRect().width;
    canvases[property].height = canvases[property].parentNode.getBoundingClientRect().height;
  });

  updateCanvases();

  
});




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







