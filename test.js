

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera ( 75, window.innerWidth
    / window.innerHeight, 0.1, 7000);



var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera, renderer.domElement);


const four = new VectorFourBar;


let output;
let coupler;
let transmission;

const link1 = 223.9;
const link2 = 419.1;
const link3 = 168.37;
const link4 = 619.71;
angle = (75 * (Math.PI/180));

output = four.outputAngle(link2, link3, link4, link1, angle);
coupler = four.couplerAngle(link2, link3, link4, link1, angle);
transmission = four.transmissionAngle(link2, link3, link4, link1, angle);







var geometry = new THREE.BoxGeometry( 1, 1, 1);
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh( geometry, material );
var scale = 1;

let topArm = new THREE.Mesh();
let botArm = new THREE.Mesh();
let knuckle = new THREE.Mesh();
let frame = new THREE.Mesh();

var loader = new THREE.STLLoader();
loader.load( 'topArm.stl', function ( geometry ) {
    topArm.geometry = geometry;
    topArm.material = material;
    topArm.scale.set(scale,scale,scale);
    
   
});


var loader = new THREE.STLLoader();
loader.load( 'bottomArm.stl', function ( geometry ) {
    botArm.geometry = geometry;
    botArm.material = material;
    botArm.scale.set(scale,scale,scale);
    
   
});


 loader.load( 'Knuckle.stl', function ( geometry ) {
    knuckle.geometry = geometry;
    knuckle.material = material;
    knuckle.scale.set(scale,scale,scale);
    
});

loader.load( 'frame.stl', function ( geometry ) {
    frame.geometry = geometry;
    frame.material = material;
    frame.scale.set(scale,scale,scale);
    
});


knuckle.position.set( 0, 0, 419.09);

knuckle.rotation.y = 3.14159/2;
frame.position.set(-559,-65,-187);
frame.rotation.y = Math.PI/2;
frame.rotateX(+0.2);


var group = new THREE.Group();
var mainGroup = new THREE.Group();
mainGroup.add(group);
mainGroup.add(frame);
mainGroup.add(botArm);
group.add(topArm);
group.add(knuckle);


var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );


scene.add(mainGroup);

botArm.position.set(0,-158.66,-157.99);

camera.position.z = 600;
controls.update();

var i = 0;
function animate() {
    requestAnimationFrame( animate );
    i += 0.04;
    

    mainGroup.rotation.z = 0.04*Math.sin(i+0.5);
    mainGroup.rotation.x = 0.02*Math.sin(i);
    mainGroup.rotation.y = 0.03*Math.sin(i - 0.23);
    mainGroup.position.y = 50*Math.sin(i);

  
    group.rotation.x = 0.1*Math.sin(i);
    
	//console.log((group.rotation.z + 3.14159/2)*180/3.14159);
	
	angle = ((group.rotation.x + 3.14159/2) + 45*3.14159/180);
	
	
	
	output = four.outputAngle(link2, link3, link4, link1, angle);
	coupler = four.couplerAngle(link2, link3, link4, link1, angle);
	transmission = four.transmissionAngle(link2, link3, link4, link1, angle);
	
    botArm.rotation.x = output.open - 3.14159/2 - 45*3.14159/180  ;
	
    knuckle.rotation.x =  -coupler.open + 50 * 3.14159 / 180 - group.rotation.x ;
    
	console.log(coupler.open* (180/Math.PI));
    console.log(output.open * (180/Math.PI));
    
    console.log(`Crossed output angle ${(output.crossed * (180/Math.PI))} \n`);
    console.log(`Open output angle ${(output.open * (180/Math.PI))} \n`);
    console.log(`Crossed coupler angle ${(coupler.crossed * (180/Math.PI))} \n`);
    console.log(`Open coupler angle, ${(coupler.open * (180/Math.PI))} \n`);
    
    //knuckle.rotation.z -= 0.1;
    controls.update();
    renderer.render( scene, camera );
}

animate();