const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera ( 75, window.innerWidth
    / window.innerHeight, 0.1, 7000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new THREE.OrbitControls( camera, renderer.domElement);

const four = new VectorFourBar;
let output;
let coupler;
let transmission;

const link1 = 223.9; 
const link2 = 419.1;
const link3 = 168.37;
const link4 = 619.71;

var scale = 1;

var material = new THREE.MeshNormalMaterial();

let topArm = new THREE.Mesh();
let botArm = new THREE.Mesh();
let knuckle = new THREE.Mesh();
let frame = new THREE.Mesh();

var group = new THREE.Group();
var mainGroup = new THREE.Group();

var loader = new THREE.STLLoader();
loader.load( '/stl/topArm.stl', function ( geometry ) {
    topArm.geometry = geometry;
    topArm.material = material;
    topArm.scale.set(scale,scale,scale);
});

var loader = new THREE.STLLoader();
loader.load( '/stl/bottomArm.stl', function ( geometry ) {
    botArm.geometry = geometry;
    botArm.material = material;
    botArm.scale.set(scale,scale,scale);   
});

 loader.load( '/stl/Knuckle.stl', function ( geometry ) {
    knuckle.geometry = geometry;
    knuckle.material = material;
    knuckle.scale.set(scale,scale,scale);   
});

loader.load( '/stl/frame.stl', function ( geometry ) {
    frame.geometry = geometry;
    frame.material = material;
    frame.scale.set(scale,scale,scale); 
});

botArm.position.set(0,-158.66,-157.99);
knuckle.position.set( 0, 0, 419.09);
knuckle.rotation.y = 3.14159/2;
frame.position.set(-559,-65,-187);
frame.rotation.y = Math.PI/2;
frame.rotateX(+0.2);

mainGroup.add(group);
mainGroup.add(frame);
mainGroup.add(botArm);
group.add(topArm);
group.add(knuckle);

scene.add(mainGroup);

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
    
	angle = ((group.rotation.x + 3.14159/2) + 45*3.14159/180);
	output = four.outputAngle(link2, link3, link4, link1, angle);
	coupler = four.couplerAngle(link2, link3, link4, link1, angle);
	
    botArm.rotation.x = output.open - 3.14159/2 - 45*3.14159/180  ;
    knuckle.rotation.x =  -coupler.open + 50 * 3.14159 / 180 - group.rotation.x ;
    
    controls.update();
    renderer.render( scene, camera );
}

animate();