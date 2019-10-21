import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js';
import FourBar from './vectorFourBar.js'


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 7000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('modelCanvas'), antialias: true });
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(0xE5E5E5);
const material = new THREE.MeshPhongMaterial({ color: 0x606060 });
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 1, 1).normalize();
scene.add(light);

const Four = new FourBar;
const controls = new OrbitControls(camera, renderer.domElement);
const link1Length  = 223.9;
const link2Length  = 419.1;
const link3Length  = 168.37;
const link4Length  = 619.71;
const scale = 1;

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

loader.load('./../../stl/topArm.stl', function (geometry) {
  topArmLeft.geometry = geometry;
  topArmLeft.material = material;
  topArmLeft.scale.set(scale, scale, scale);
  topArmRight.geometry = geometry;
  topArmRight.material = material;
  topArmRight.scale.set(scale, scale, scale);
});

loader.load('./../../stl/BottomArm.stl', function (geometry) {
  botArmLeft.geometry = geometry;
  botArmLeft.material = material;
  botArmLeft.scale.set(scale, scale, scale);
  botArmRight.geometry = geometry;
  botArmRight.material = material;
  botArmRight.scale.set(scale, scale, scale);
});

loader.load('./../../stl/wheel.stl', function (geometry) {
  wheelLeft.geometry = geometry;
  wheelLeft.material = material;
  wheelLeft.scale.set(5.5, 5.5, 4.25);
  wheelRight.geometry = geometry;
  wheelRight.material = material;
  wheelRight.scale.set(5.5, 5.5, 4.25);
});

loader.load('./../../stl/knuckle.stl', function (geometry) {
  knuckleLeft.geometry = geometry;
  knuckleLeft.material = material;
  knuckleLeft.scale.set(scale, scale, scale);
  knuckleRight.geometry = geometry;
  knuckleRight.material = material;
  knuckleRight.scale.set(scale, scale, scale);
});

loader.load('./../../stl/Frame.stl', function (geometry) {
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

export function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

resizeCanvasToDisplaySize
controls.update();
renderer.render(scene, camera);



function animate(left, right, sway) {

  masterGroup.rotation.x = -sway * 0.1;
  armTopKnuckleGroupLeft.rotation.x = left;
  armTopKnuckleGroupRight.rotation.x = right;

  let angleLeft = ((armTopKnuckleGroupLeft.rotation.x + 3.14159 / 2) + 45 * 3.14159 / 180);
  let outputLeft = Four.outputAngle(link2Length , link3Length , link4Length , link1Length , angleLeft);
  let couplerLeft = Four.couplerAngle(link2Length , link3Length , link4Length , link1Length , angleLeft);

  let angleRight = ((armTopKnuckleGroupRight.rotation.x + 3.14159 / 2) + 45 * 3.14159 / 180);
 
  let outputRight = Four.outputAngle(link2Length , link3Length , link4Length , link1Length , angleRight);
  let couplerRight = Four.couplerAngle(link2Length , link3Length , link4Length , link1Length , angleRight);

  botArmLeft.rotation.x = outputLeft.open - 3.14159 / 2 - 45 * 3.14159 / 180;
  knuckleWheelGroupLeft.rotation.x = -couplerLeft.open + 50 * 3.14159 / 180 - armTopKnuckleGroupLeft.rotation.x;

  botArmRight.rotation.x = outputRight.open - 3.14159 / 2 - 45 * 3.14159 / 180;
  knuckleWheelGroupRight.rotation.x = -couplerRight.open + 50 * 3.14159 / 180 - armTopKnuckleGroupRight.rotation.x;
  controls.update();
  renderer.render(scene, camera);
}

export {animate}