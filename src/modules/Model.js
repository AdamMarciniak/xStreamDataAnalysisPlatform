import * as THREE from 'three';
import { OrbitControls } from './OrbitControls';
import { STLLoader } from './STLLoader';
import FourBar from './vectorFourBar';
import { scaleValues } from './Utils';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 7000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('modelCanvas'), antialias: true });

const Four = new FourBar();
const controls = new OrbitControls(camera, renderer.domElement);
const link1Length = 223.9;
const link2Length = 419.1;
const link3Length = 168.37;
const link4Length = 619.71;
const scale = 1;

const masterGroup = new THREE.Group();
const suspensionGroupLeft = new THREE.Group();
const suspensionGroupRight = new THREE.Group();
const armTopKnuckleGroupLeft = new THREE.Group();
const armTopKnuckleGroupRight = new THREE.Group();
const knuckleWheelGroupLeft = new THREE.Group();
const knuckleWheelGroupRight = new THREE.Group();

const partNames = [
  'topArmRight',
  'topArmLeft',
  'botArmRight',
  'botArmLeft',
  'knuckleLeft',
  'knuckleRight',
  'wheelRight',
  'wheelLeft',
  'frame',
];

const parts = {};

partNames.forEach((name) => {
  parts[name] = new THREE.Mesh();
});

document.getElementById('modelCanvas').style.visibility = 'hidden';

const loader = new STLLoader();

export const renderOnce = () => {
  renderer.render(scene, camera);
};

export const resizeCanvasToDisplaySize = () => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
};

const applyMaterials = () => {
  const mat = new THREE.MeshPhongMaterial({ color: 0x606060 });
  Object.keys(parts).forEach((key) => {
    parts[key].material = mat;
  });
};

const scaleGeometries = () => {
  parts.topArmLeft.scale.set(scale, scale, scale);
  parts.topArmRight.scale.set(scale, scale, scale);
  parts.botArmRight.scale.set(scale, scale, scale);
  parts.botArmLeft.scale.set(scale, scale, scale);
  parts.wheelRight.scale.set(5.5, 5.5, 3.6);
  parts.wheelLeft.scale.set(5.5, 5.5, 3.6);
  parts.knuckleLeft.scale.set(scale, scale, scale);
  parts.knuckleRight.scale.set(scale, scale, scale);
  parts.frame.scale.set(scale, scale, scale);
};

const renderSetup = () => {

  document.body.appendChild(renderer.domElement);
  scene.background = new THREE.Color(0xE5E5E5);
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 1, 1).normalize();
  scene.add(light);

  applyMaterials();
  scaleGeometries();

  knuckleWheelGroupRight.add(parts.knuckleRight);
  knuckleWheelGroupLeft.add(parts.knuckleLeft);

  knuckleWheelGroupRight.add(parts.wheelRight);
  knuckleWheelGroupLeft.add(parts.wheelLeft);

  parts.wheelRight.rotateZ(Math.PI / 2);
  parts.wheelLeft.rotateZ(Math.PI / 2);

  parts.wheelRight.position.set(-220, -95, 0);
  parts.wheelLeft.position.set(-220, -95, 0);

  parts.wheelLeft.rotateX(Math.PI / 2);
  parts.wheelRight.rotateX(Math.PI / 2);

  parts.botArmRight.position.set(0, -158.66, -157.99);
  parts.botArmLeft.position.set(0, -158.66, -157.99);

  knuckleWheelGroupRight.position.set(0, 0, 419.09);
  knuckleWheelGroupLeft.position.set(0, 0, 419.09);

  knuckleWheelGroupRight.rotation.y = 3.14159 / 2;
  knuckleWheelGroupLeft.rotation.y = 3.14159 / 2;

  parts.frame.position.set(-559, -65, -187);
  parts.frame.rotation.y = Math.PI / 2;
  parts.frame.rotateX(+0.2);

  armTopKnuckleGroupLeft.add(parts.topArmLeft);
  armTopKnuckleGroupRight.add(parts.topArmRight);

  armTopKnuckleGroupLeft.add(knuckleWheelGroupLeft);
  armTopKnuckleGroupRight.add(knuckleWheelGroupRight);

  suspensionGroupRight.add(armTopKnuckleGroupRight);
  suspensionGroupLeft.add(armTopKnuckleGroupLeft);

  suspensionGroupRight.add(parts.botArmRight);
  suspensionGroupLeft.add(parts.botArmLeft);

  suspensionGroupLeft.position.set(0, 0, -370);
  suspensionGroupLeft.rotateY(Math.PI);

  masterGroup.add(parts.frame);
  masterGroup.add(suspensionGroupRight);
  masterGroup.add(suspensionGroupLeft);

  scene.add(masterGroup);
  masterGroup.position.set(800, 0, 0);

  camera.position.set(1700, 1000, 1200);
  controls.update();

  masterGroup.rotation.z = 0.2;

  resizeCanvasToDisplaySize();
  controls.update();
  controls.addEventListener('change', renderOnce);
  renderer.render(scene, camera);
  document.querySelector('.modelLoadingWrapper').style.visibility = 'hidden';
  document.getElementById('modelCanvas').style.visibility = 'visible';


};

const loadTopArm = () => new Promise((resolve) => loader.load('./../../stl/topArm.stl', resolve));
const loadBottomArm = () => new Promise((resolve) => loader.load('./../../stl/BottomArm.stl', resolve));
const loadWheel = () => new Promise((resolve) => loader.load('./../../stl/wheel.stl', resolve));
const loadKnuckle = () => new Promise((resolve) => loader.load('./../../stl/knuckle.stl', resolve));
const loadFrame = () => new Promise((resolve) => loader.load('./../../stl/Frame.stl', resolve));

export const loadAllGeometry = () => {
  const promises = [
    loadTopArm(),
    loadBottomArm(),
    loadWheel(),
    loadKnuckle(),
    loadFrame(),
  ];

  return Promise.all(promises).then(([topArm, botArm, wheel, frontKnuckle, frame]) => {
    parts.topArmLeft.geometry = topArm;
    parts.topArmRight.geometry = topArm;
    parts.botArmLeft.geometry = botArm;
    parts.botArmRight.geometry = botArm;
    parts.wheelLeft.geometry = wheel;
    parts.wheelRight.geometry = wheel;
    parts.knuckleLeft.geometry = frontKnuckle;
    parts.knuckleRight.geometry = frontKnuckle;
    parts.frame.geometry = frame;
    console.log('All STL Loaded!');
    renderSetup();
  });
};

export const animate = (left, right) => {
  armTopKnuckleGroupLeft.rotation.x = scaleValues(left, 0, 100, Math.PI/4, -Math.PI/7);
  armTopKnuckleGroupRight.rotation.x = scaleValues(right, 0, 100, Math.PI/4, -Math.PI/7);

  const angleLeft = ((armTopKnuckleGroupLeft.rotation.x + Math.PI / 2.0)
   + 45.0 * (Math.PI / 180.0));
  const angleRight = ((armTopKnuckleGroupRight.rotation.x + Math.PI / 2.0)
    + 45 * (Math.PI / 180));

  const outputLeft = Four.outputAngle(link2Length, link3Length, link4Length,
    link1Length, angleLeft);
  const outputRight = Four.outputAngle(link2Length, link3Length, link4Length,
    link1Length, angleRight);
  const couplerLeft = Four.couplerAngle(link2Length, link3Length, link4Length,
    link1Length, angleLeft);
  const couplerRight = Four.couplerAngle(link2Length, link3Length, link4Length,
    link1Length, angleRight);

  parts.botArmLeft.rotation.x = outputLeft.open - Math.PI / 2 - 45 * (Math.PI / 180);
  parts.botArmRight.rotation.x = outputRight.open - Math.PI / 2 - 45 * (Math.PI / 180);
  knuckleWheelGroupLeft.rotation.x = -couplerLeft.open
   + 50 * (Math.PI / 180) - armTopKnuckleGroupLeft.rotation.x;
  knuckleWheelGroupRight.rotation.x = -couplerRight.open
   + 50 * (Math.PI / 180) - armTopKnuckleGroupRight.rotation.x;

  parts.wheelRight.rotation.x += 0.1;
  parts.wheelLeft.rotation.x += -0.1;

  controls.update();
  renderer.render(scene, camera);
};
