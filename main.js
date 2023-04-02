import "./style.css";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TextureLoader } from "three";

import Panel from "./Panel";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.setZ(4);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canv"),
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

const v1 = new THREE.Vector2(-2.5, -1.7);
const v2 = new THREE.Vector2(2.7, -1.2);
const v3 = new THREE.Vector2(3.0, 1.5);
const v4 = new THREE.Vector2(-3.0, 1.5);

const points = [v1, v2, v3, v4];
const panel = new Panel(points, 0.3)


function polyLine(vertices) {
  const positions = [];

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    positions.push(vertex.x, vertex.y, 0);
  }

  if (points.length > 0) {
    const firstVertex = vertices[0];
    positions.push(firstVertex.x, firstVertex.y, 0);
  }

  return positions;
}

const lineGeometry = new LineGeometry();
const lineGeometry2 = new LineGeometry();

//lineGeometry.setPositions(polyLine(poly.vertices));
//lineGeometry2.setPositions(polyLine(insetPoly.vertices));

const lineMaterial = new LineMaterial({
  color: "black",
  linewidth: 3, // Set the line thickness here
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  depthTest: false,
});
const line = new Line2(lineGeometry, lineMaterial);
const line2 = new Line2(lineGeometry2, lineMaterial);

const group = new THREE.Group();
group.add(line);
group.add(line2);
group.renderOrder = 2;


const manager = new THREE.LoadingManager();
let object1, object2;
manager.onLoad = function() {
  scene.add(object1);
  scene.add(object2);

  scene.add(panel);
  scene.add(group);

  animate();
};
const loader1 = new GLTFLoader(manager);
const loader2 = new TextureLoader(manager);
loader1.load('/silent_ash.glb', (gltf) => {
  object1 = gltf.scene;
  object1.traverse(function (child) {
    if (child.isMesh) {
      child.material.stencilWrite = true;
      child.material.stencilRef = 1;
      child.material.stencilFunc = THREE.EqualStencilFunc;
    }
  });
  object1.scale.set(2, 2, 2);
  object1.position.set(0, -2, 0);
});

loader2.load('/bg.png', (texture) => {
  texture.encoding = THREE.sRGBEncoding;
  var geometry3 = new THREE.PlaneGeometry(16, 9);
  var material = new THREE.MeshStandardMaterial({ map: texture });
  material.stencilWrite = true;
  material.stencilRef = 1;
  material.stencilFunc = THREE.EqualStencilFunc;
  object2 = new THREE.Mesh(geometry3, material);
  object2.position.set(0, 0, -7);
});



const light = new THREE.AmbientLight(0x404040, 5);
scene.add(light);



var rotationX = 0;
var rotationY = 0;
var maxRotationX = 0.1;
var maxRotationY = 0.1;
var offsetRotationX = 0;
var offsetRotationY = 0;
var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;
var easing = 0.01;

var rotationX2 = 0;
var rotationY2 = 0;
var maxRotationX2 = 0.1;
var maxRotationY2 = 0.1;
var offsetRotationX2 = 0;
var offsetRotationY2 = 0;
var easing2 = 0.02;

var positionX = 0;
var positionY = 0;
var maxPositionX = 1;
var maxPositionY = 1;

window.addEventListener("mousemove", onDocumentMouseMove, false);

function onDocumentMouseMove(event) {
  var distanceX = event.clientX - centerX;
  var distanceY = event.clientY - centerY;

  rotationX =
    map(
      distanceX,
      -centerX,
      centerX,
      -maxRotationX,
      maxRotationX - offsetRotationX
    ) + offsetRotationX;
  rotationY =
    map(
      distanceY,
      -centerY,
      centerY,
      -maxRotationY,
      maxRotationY - offsetRotationY
    ) + offsetRotationY;
  rotationX2 =
    map(distanceX, -centerX, centerX, -maxRotationX2, maxRotationX2) +
    offsetRotationX2;
  rotationY2 =
    map(distanceY, -centerY, centerY, -maxRotationY2, maxRotationY2) +
    offsetRotationY2;
  positionX = map(distanceX, -centerX, centerX, -maxPositionX, maxPositionX);
  positionY = map(distanceY, -centerY, centerY, -maxPositionY, maxPositionY);
}

function animate() {
  requestAnimationFrame(animate);
  //mesh.rotation.x = lerp(mesh.rotation.x, rotationY, easing);
  //mesh.rotation.y = lerp(mesh.rotation.y, rotationX, easing);
  //group.rotation.x = lerp(group.rotation.x, rotationY, easing);
  //group.rotation.y = lerp(group.rotation.y, rotationX, easing);
  //object3D.rotation.x = lerp(object3D.rotation.x, rotationY2, easing2);
  //object3D.rotation.y = lerp(object3D.rotation.y, rotationX2, easing2);
  //bg.position.x = lerp(bg.position.x, positionX, easing2)
  //bg.position.y = lerp(bg.position.y, positionY, easing2)
  renderer.render(scene, camera);
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

animate();
