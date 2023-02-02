import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Texture, Vector3 } from "three";

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
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

const basePlane = new THREE.PlaneGeometry(5, 5, 1);
var baseVectorArray = [];
var baseVertexPosArray = basePlane.attributes.position.array;
for (var i = 0; i < baseVertexPosArray.length; i += 3) {
  var x = baseVertexPosArray[i];
  var y = baseVertexPosArray[i + 1];
  var z = baseVertexPosArray[i + 2];
  baseVectorArray.push(new THREE.Vector3(x, y, z));
}

function createVector(offset, min) {
  var startVector = new THREE.Vector3(0, 0, 0);
  startVector.copy(offset);
  startVector.x = THREE.MathUtils.randFloat(
    baseVectorArray[0].x + min,
    baseVectorArray[1].x
  );
}

var startVector = new THREE.Vector3(0, 0, 0);
startVector.copy(baseVectorArray[0]);
startVector.x = THREE.MathUtils.randFloat(
  baseVectorArray[0].x,
  baseVectorArray[1].x
);
var endVector = new THREE.Vector3(0, 0, 0);
endVector.copy(baseVectorArray[3]);
endVector.x = THREE.MathUtils.randFloat(
  baseVectorArray[2].x,
  baseVectorArray[3].x
);

var startVector2 = new THREE.Vector3(0, 0, 0);
startVector2.copy(baseVectorArray[0]);
startVector2.y = THREE.MathUtils.randFloat(
  baseVectorArray[0].y,
  baseVectorArray[3].y
);
var endVector2 = new THREE.Vector3(0, 0, 0);
endVector2.copy(baseVectorArray[1]);
endVector2.y = THREE.MathUtils.randFloat(
  baseVectorArray[1].y,
  baseVectorArray[2].y
);

function lineLineIntersection(A, B, C, D) {
  // Line AB represented as a1x + b1y = c1
  var a1 = B.y - A.y;
  var b1 = A.x - B.x;
  var c1 = a1 * A.x + b1 * A.y;

  // Line CD represented as a2x + b2y = c2
  var a2 = D.y - C.y;
  var b2 = C.x - D.x;
  var c2 = a2 * C.x + b2 * C.y;

  var determinant = a1 * b2 - a2 * b1;

  if (determinant == 0) {
    // The lines are parallel. This is simplified
    // by returning a pair of FLT_MAX
    return new Point(Number.MAX_VALUE, Number.MAX_VALUE);
  } else {
    var x = (b2 * c1 - b1 * c2) / determinant;
    var y = (a1 * c2 - a2 * c1) / determinant;
    return new Vector3(x, y, 0);
  }
}
var intersection = lineLineIntersection(
  startVector,
  endVector,
  startVector2,
  endVector2
);

function createPanel(vertex1, vertex2, vertex3, vertex4) {
  const vertices = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);

  vertices[0] = vertex1.x;
  vertices[1] = vertex1.y;
  vertices[2] = vertex1.z;

  vertices[3] = vertex2.x;
  vertices[4] = vertex2.y;
  vertices[5] = vertex2.z;

  vertices[6] = vertex3.x;
  vertices[7] = vertex3.y;
  vertices[8] = vertex3.z;

  vertices[9] = vertex4.x;
  vertices[10] = vertex4.y;
  vertices[11] = vertex4.z;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    color: "red",
    wireframe: false,
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

createPanel(baseVectorArray[0], startVector, intersection, startVector2);
createPanel(startVector, baseVectorArray[1], endVector2, intersection);
createPanel(startVector2, intersection, endVector, baseVectorArray[2]);
createPanel(intersection, endVector2, baseVectorArray[3], endVector);

const lineMat = new THREE.LineBasicMaterial({
  color: 0x0000ff,
});

function randomLine() {
  var startVector = new THREE.Vector3(0, 0, 0);
  startVector.copy(baseVectorArray[0]);
  startVector.x = THREE.MathUtils.randFloat(
    baseVectorArray[0].x,
    baseVectorArray[1].x
  );
  var endVector = new THREE.Vector3(0, 0, 0);
  endVector.copy(baseVectorArray[3]);
  endVector.x = THREE.MathUtils.randFloat(
    baseVectorArray[2].x,
    baseVectorArray[3].x
  );

  const points = [];
  points.push(startVector);
  points.push(endVector);
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeo, lineMat);
  scene.add(line);
}

const points = [];
points.push(startVector);
points.push(endVector);
const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(lineGeo, lineMat);
scene.add(line);

const points2 = [];
points2.push(startVector2);
points2.push(endVector2);
const lineGeo2 = new THREE.BufferGeometry().setFromPoints(points2);
const line2 = new THREE.Line(lineGeo2, lineMat);
scene.add(line2);

/** 
const geometry = new THREE.PlaneGeometry(4,2.25);
const material = new THREE.MeshBasicMaterial({color: 'white'});
material.depthWrite = false;
material.stencilWrite = true;
material.stencilRef = 1;
material.stencilFunc = THREE.AlwaysStencilFunc;
material.stencilZPass = THREE.ReplaceStencilOp;
const plane = new THREE.Mesh(geometry,material);
scene.add(plane)


let object3D;
const loader = new GLTFLoader()
loader.load( '/silent_ash.glb', function ( gltf ) {
  object3D = gltf.scene;
  object3D.traverse(function (child) {
    if (child.isMesh) {
      child.material.stencilWrite = true;
      child.material.stencilRef = 1;
      child.material.stencilFunc = THREE.EqualStencilFunc;
    }
  });
  object3D.scale.set(2,2,2)
  object3D.position.set(0,-2,0)
  scene.add(gltf.scene)
});

const light = new THREE.AmbientLight( 0x404040 , 5);
scene.add( light );

var bg;
var geometry3 = new THREE.PlaneGeometry(16, 9);
var textureLoader = new THREE.TextureLoader();
textureLoader.load("/bg.png", function (texture) {
  texture.encoding = THREE.sRGBEncoding;
  var material = new THREE.MeshStandardMaterial({map: texture});
  material.stencilWrite = true;
  material.stencilRef = 1;
  material.stencilFunc = THREE.EqualStencilFunc;
  bg = new THREE.Mesh(geometry3, material);
  bg.position.set(0, 0, -7);
  scene.add(bg);
});

var rotationX = 0;
var rotationY = 0;
var maxRotationX = 0.3;
var maxRotationY = 0.5;
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

function onDocumentMouseMove( event ) {
  var distanceX = event.clientX - centerX;
  var distanceY = event.clientY - centerY;

  rotationX = map(distanceX, -centerX, centerX, -maxRotationX, maxRotationX - offsetRotationX) + offsetRotationX;
  rotationY = map(distanceY, -centerY, centerY, -maxRotationY, maxRotationY - offsetRotationY) + offsetRotationY;
  rotationX2 = map(distanceX, -centerX, centerX, -maxRotationX2, maxRotationX2) + offsetRotationX2;
  rotationY2 = map(distanceY, -centerY, centerY, -maxRotationY2, maxRotationY2) + offsetRotationY2;
  positionX = map(distanceX, -centerX, centerX, -maxPositionX, maxPositionX);
  positionY = map(distanceY, -centerY, centerY, -maxPositionY, maxPositionY);
}

*/

function animate() {
  requestAnimationFrame(animate);
  //plane.rotation.x = lerp(plane.rotation.x, rotationY, easing);
  //plane.rotation.y = lerp(plane.rotation.y, rotationX, easing);
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
