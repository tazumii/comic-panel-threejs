import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Panel from "./panel";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import SkeletonLoader from "./skeletonLoader";
import * as TWEEN from "@tweenjs/tween.js";

let camera, scene, renderer, clock;
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.setZ(5);

scene = new THREE.Scene();

const container = document.getElementById( 'container' );
renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.LinearEncoding;
container.appendChild( renderer.domElement );

clock = new THREE.Clock();



const v1 = new THREE.Vector2(-3, -1);
const v2 = new THREE.Vector2(1.5, -1);
const v3 = new THREE.Vector2(2, 1);
const v4 = new THREE.Vector2(-2, 1);


const points = [v1, v2, v3, v4];


const skel = new SkeletonLoader(points);
scene.add(skel);


window.onresize = function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

};


const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {

};

let object1;
let panel;

const g1 = new THREE.Group();
g1.scale.set(0, 0, 0);

let textas;
manager.onLoad = function () {
  scene.add(g1);
  skel.visible = false;
  const scaleTween = new TWEEN.Tween(g1.scale)
    .to({ x: 1, y: 1, z: 1 }, 800) // Scale to 100% over 2 seconds
    .easing(TWEEN.Easing.Quadratic.Out) // Use quadratic easing for smoother transition
    .onUpdate(() => {
      g1.scale.set(g1.scale.x, g1.scale.y, g1.scale.z);
    })
    .start();

  animate();
};

function getRandomArrayElement(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

const pictureUrls = ["/p1.png", "/p2.png"];

const loader1 = new THREE.TextureLoader(manager);
loader1.load(getRandomArrayElement(pictureUrls), (texture) => {
  panel = new Panel(points, 0.1);

  texture.encoding = THREE.LinearEncoding;
  var geometry3 = new THREE.PlaneGeometry(16, 9);
  var material = new THREE.MeshStandardMaterial({ map: texture });
  material.stencilWrite = true;
  material.stencilRef = 1;
  material.stencilFunc = THREE.EqualStencilFunc;
  object1 = new THREE.Mesh(geometry3, material);
  object1.position.set(0, 0, -7);

  g1.add(object1);
  g1.add(panel);
});

const loader2 = new FontLoader(manager);
loader2.load("/Bangers_Regular.json", (font) => {
  const text = "Mean-Variance Optimization";
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xf8f8f8 });

  const startPoint = new THREE.Vector3(v4.x, v4.y, 0);
  const endPoint = new THREE.Vector3(v3.x, v3.y, 0);

  const textGeometry = new TextGeometry(text, {
    font: font,
    size: 0.2,
    height: 0.01,
  });

  textas = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text at the midpoint of the diagonal line
  const midPoint = new THREE.Vector3(v4.x, v4.y + 0.1, 0);
  textas.position.copy(midPoint);

  // Rotate the text to be parallel to the diagonal line
  const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
  const angle = Math.atan2(direction.y, direction.x);
  textas.rotation.z = angle;
  g1.add(textas);
});

const light = new THREE.AmbientLight(0x404040, 5);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);

  skel.update(clock);

  renderer.render(scene, camera);

  TWEEN.update();
}
animate();
